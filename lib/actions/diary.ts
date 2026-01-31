'use server'

import { createClient } from '@/lib/supabase/server'
import { DiarySettings, DiarySettingsInsert, DiarySettingsUpdate, DiaryEntry, PhotoType, WeeklyPhotoSet, getWeekKey, getWeekLabel, getCurrentWeekKey } from '@/types/database'
import { revalidatePath } from 'next/cache'
import { checkAndUnlockAchievements } from './achievements'

/**
 * Вспомогательная функция для логирования ошибок
 */
function logError(context: string, error: any, userId?: string) {
  // Выводим ошибку максимально подробно в разных форматах
  console.error(`!!! [Diary Action Error] ${context} !!!`)
  console.error(`User ID: ${userId}`)
  console.error(`Error Object:`, error)
  console.error(`Error Stringified: ${JSON.stringify(error)}`)
  
  if (error?.message) console.error(`Message: ${error.message}`)
  if (error?.code) console.error(`Code: ${error.code}`)
}

/**
 * Получить настройки дневника пользователя
 */
export async function getDiarySettings(userId: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('diary_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      logError('getDiarySettings query', error, userId)
      return { success: false, error: error.message }
    }

    if (!data) {
      console.log(`[Diary Action] No settings found for ${userId}, creating defaults...`)
      const defaultSettings: any = {
        user_id: userId,
        enabled_widgets: [],
        widget_goals: {},
        widgets_in_daily_plan: [],
        user_params: { height: null, weight: null, age: null, gender: null },
        habits: [],
        streaks: { current: 0, longest: 0, last_entry_date: null }
      }

      const { data: newData, error: insertError } = await supabase
        .from('diary_settings')
        .insert(defaultSettings)
        .select()
        .single()

      if (insertError) {
        logError('createDefaultSettings', insertError, userId)
        return { success: false, error: insertError.message }
      }

      return { success: true, data: newData as DiarySettings }
    }

    return { success: true, data: data as DiarySettings }
  } catch (err: any) {
    console.error('[Diary Action Unexpected] getDiarySettings:', err)
    return { success: false, error: err?.message || 'Internal Server Error' }
  }
}

/**
 * Обновить настройки дневника с поддержкой частичного обновления
 */
export async function updateDiarySettings(userId: string, settings: DiarySettingsUpdate) {
  const supabase = await createClient()

  try {
    // Сначала проверяем, существуют ли настройки
    const { data: existing, error: fetchError } = await supabase
      .from('diary_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (fetchError) {
      logError('fetchExistingSettings', fetchError, userId)
      return { success: false, error: fetchError.message }
    }

    // ЗАЩИТА: Если мы пытаемся сохранить пустые виджеты или параметры, но в базе они были — это ошибка
    if (existing) {
      const existingAny = existing as any
      const settingsAny = settings as any
      const isOverwritingWidgets = 
        Array.isArray(existingAny.enabled_widgets) && 
        existingAny.enabled_widgets.length > 0 && 
        Array.isArray(settingsAny.enabled_widgets) && 
        settingsAny.enabled_widgets.length === 0

      const isOverwritingParams = 
        existing.user_params && 
        typeof existing.user_params === 'object' && 
        (existing.user_params as any).height && 
        settings.user_params && 
        !(settings.user_params as any).height

      if (isOverwritingWidgets || isOverwritingParams) {
        console.warn(`[Diary Action] PROTECTED: Attempted to overwrite populated settings with empty data for ${userId}. Aborting update.`, {
          isOverwritingWidgets,
          isOverwritingParams
        })
        return { success: true, data: existing as DiarySettings }
      }
    }

    // Если настроек нет, создаем с дефолтными значениями
    if (!existing) {
      // Используем any так как типы из миграции 022 не совпадают с сгенерированными
      const defaultSettings: any = {
        user_id: userId,
        enabled_widgets: [],
        widget_goals: {},
        widgets_in_daily_plan: [],
        user_params: { height: null, weight: null, age: null, gender: null },
        habits: [],
        streaks: { current: 0, longest: 0, last_entry_date: null },
        ...settings
      }

      const { data, error } = await supabase
        .from('diary_settings')
        .insert(defaultSettings)
        .select()
        .single()

      if (error) {
        logError('createDiarySettings', error, userId)
        return { success: false, error: error.message }
      }

      revalidatePath('/dashboard')
      revalidatePath('/dashboard/health-tracker')
      return { success: true, data: data as DiarySettings }
    }

    // Обновляем существующие настройки
    console.log(`[Diary Action] Updating settings for ${userId}:`, {
      updatingHabits: !!(settings as any).habits,
      habitsCount: (settings as any).habits?.length
    })

    const { data, error } = await supabase
      .from('diary_settings')
      .update(settings)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      logError('updateDiarySettings', error, userId)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/health-tracker')

    // Сразу проверяем достижения, так как изменение целей может разблокировать их
    let newAchievements: any[] = []
    try {
      const achievementsResult = await checkAndUnlockAchievements(userId)
      if (achievementsResult.success && achievementsResult.newAchievements) {
        newAchievements = achievementsResult.newAchievements
        console.log('[Diary Action] Unlocked achievements after settings update:', newAchievements.length)
      }
    } catch (err) {
      console.error('[Diary Action] Error checking achievements after settings update:', err)
    }

    return { 
      success: true, 
      data: data as DiarySettings,
      newAchievements 
    }
  } catch (err: any) {
    console.error('[Diary Action Unexpected] updateDiarySettings:', err)
    return { success: false, error: err?.message || 'Internal Server Error' }
  }
}

/**
 * Получить записи дневника за период
 */
export async function getDiaryEntries(userId: string, startDate: string, endDate: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })

    if (error) {
      logError('getDiaryEntries', error, userId)
      return { success: false, error: error.message }
    }

    return { success: true, data: data as DiaryEntry[] }
  } catch (err: any) {
    console.error('[Diary Action Unexpected] getDiaryEntries:', err)
    return { success: false, error: err?.message || 'Internal Server Error' }
  }
}

/**
 * Получить запись дневника за конкретный день
 */
export async function getDiaryEntry(userId: string, date: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle()

    if (error) {
      logError('getDiaryEntry', error, userId)
      return { success: false, error: error.message }
    }

    return { success: true, data: data as DiaryEntry | null }
  } catch (err: any) {
    console.error('[Diary Action Unexpected] getDiaryEntry:', err)
    return { success: false, error: err?.message || 'Internal Server Error' }
  }
}

/**
 * Сохранить или обновить запись в дневнике
 */
export async function upsertDiaryEntry(
  userId: string, 
  date: string, 
  metrics: any, 
  habitsCompleted?: any,
  notes?: string,
  photoUrls?: string[]
) {
  const supabase = await createClient()

  try {
    const entryData: any = {
      user_id: userId,
      date,
      metrics,
      updated_at: new Date().toISOString()
    }

    if (habitsCompleted !== undefined) entryData.habits_completed = habitsCompleted
    if (notes !== undefined) entryData.notes = notes
    if (photoUrls !== undefined) entryData.photo_urls = photoUrls

    const { data, error } = await supabase
      .from('diary_entries')
      .upsert(entryData, {
        onConflict: 'user_id,date'
      })
      .select()
      .single()

    if (error) {
      logError('upsertDiaryEntry', error, userId)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/health-tracker')

    // Обновляем стрики через SQL функцию
    await (supabase as any).rpc('update_diary_streaks', {
      p_user_id: userId,
      p_entry_date: date
    })

    // Проверяем достижения и возвращаем новые
    let newAchievements: any[] = []
    try {
      const achievementsResult = await checkAndUnlockAchievements(userId)
      if (achievementsResult.success && achievementsResult.newAchievements) {
        newAchievements = achievementsResult.newAchievements
        console.log('[Diary Action] Unlocked achievements:', newAchievements.length)
      }
    } catch (err) {
      console.error('[Diary Action] Error checking achievements:', err)
    }

    return { 
      success: true, 
      data: data as DiaryEntry,
      newAchievements // Возвращаем новые достижения клиенту
    }
  } catch (err: any) {
    console.error('[Diary Action Unexpected] upsertDiaryEntry:', err)
    return { success: false, error: err?.message || 'Internal Server Error' }
  }
}

/**
 * Загрузка фото прогресса с типом позы (недельная система)
 */
export async function uploadProgressPhoto(
  userId: string, 
  photoType: PhotoType, 
  formData: FormData,
  weekKey?: string // Опциональный параметр для указания недели
) {
  const supabase = await createClient()
  const file = formData.get('file') as File
  if (!file) return { success: false, error: 'No file provided' }

  try {
    // Получаем week_key (используем переданный или текущую неделю)
    const targetWeekKey = weekKey || getCurrentWeekKey()
    const fileName = `${userId}/${targetWeekKey}_${photoType}_${Date.now()}.jpg`

    // Загружаем в storage
    const { error: uploadError } = await supabase.storage
      .from('progress-photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      logError('uploadProgressPhoto (storage)', uploadError, userId)
      return { success: false, error: uploadError.message }
    }

    // Создаем signed URL на 1 год
    const { data: signedData, error: signedError } = await supabase.storage
      .from('progress-photos')
      .createSignedUrl(fileName, 31536000)

    if (signedError) {
      logError('uploadProgressPhoto (signedUrl)', signedError, userId)
      return { success: false, error: signedError.message }
    }

    // Получаем существующую запись за эту неделю
    const { data: entry } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', targetWeekKey)
      .maybeSingle()

    // Создаем структуру weekly_photos
    const currentWeeklyPhotos = (entry as any)?.weekly_photos || { photos: {} }
    const updatedWeeklyPhotos = {
      ...currentWeeklyPhotos,
      week_key: targetWeekKey,
      photos: {
        ...currentWeeklyPhotos.photos,
        [photoType]: {
          url: signedData.signedUrl,
          type: photoType,
          uploaded_at: new Date().toISOString()
        }
      }
    }

    // Сохраняем в diary_entries с ключом = week_key (понедельник недели)
    const { data, error } = await supabase
      .from('diary_entries')
      .upsert({
        user_id: userId,
        date: targetWeekKey,
        weekly_photos: updatedWeeklyPhotos,
        metrics: (entry as any)?.metrics || {},
        updated_at: new Date().toISOString()
      } as any, {
        onConflict: 'user_id,date'
      })
      .select()
      .single()

    if (error) {
      logError('uploadProgressPhoto (db update)', error, userId)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/health-tracker')

    return { 
      success: true, 
      data: { 
        url: signedData.signedUrl, 
        photoType, 
        weekKey: targetWeekKey,
        entry: data 
      } 
    }
  } catch (err: any) {
    console.error('[Diary Action Unexpected] uploadProgressPhoto:', err)
    return { success: false, error: err?.message || 'Internal Server Error' }
  }
}

/**
 * Получить фото прогресса (недельная структура)
 */
export async function getProgressPhotos(userId: string) {
  const supabase = await createClient()

  try {
    // Получаем все записи с weekly_photos или weekly_measurements
    const { data, error } = await supabase
      .from('diary_entries')
      .select('date, weekly_photos, weekly_measurements, metrics')
      .eq('user_id', userId)
      .or('weekly_photos.not.is.null,weekly_measurements.not.is.null')
      .order('date', { ascending: false })

    if (error) {
      logError('getProgressPhotos', error, userId)
      return { success: false, error: error.message }
    }

    // Для каждой недели получаем вес из любой записи за эту неделю
    // Оптимизация: получаем все записи за период одним запросом
    const allRelevantEntries = await supabase
      .from('diary_entries')
      .select('date, metrics')
      .eq('user_id', userId)
      .not('metrics->weight', 'is', null)

    const weightMap = new Map()
    allRelevantEntries.data?.forEach((entry: any) => {
      const date = entry.date
      // Группируем по неделям (понедельникам)
      // Нам нужен последний вес в неделе
      const d = new Date(date)
      const day = d.getDay()
      const diff = d.getDate() - day + (day === 0 ? -6 : 1)
      const monday = new Date(d.setDate(diff)).toISOString().split('T')[0]
      
      const current = weightMap.get(monday)
      if (!current || date > current.date) {
        weightMap.set(monday, { date, weight: entry.metrics.weight })
      }
    })

    const weeklyPhotoSets: WeeklyPhotoSet[] = data.map((entry: any) => {
      const weeklyPhotos = entry.weekly_photos || {}
      const photos = weeklyPhotos.photos || {}
      const weeklyMeasurements = entry.weekly_measurements || {}
      const weekKey = entry.date
      
      const weight = weightMap.get(weekKey)?.weight
      
      return {
        week_key: weekKey,
        week_label: getWeekLabel(weekKey),
        photos: {
          front: photos.front || undefined,
          side: photos.side || undefined,
          back: photos.back || undefined
        },
        measurements: weeklyMeasurements.chest || weeklyMeasurements.waist || weeklyMeasurements.hips 
          ? weeklyMeasurements 
          : undefined,
        weight,
        hasPhotos: !!(photos.front || photos.side || photos.back),
        hasMeasurements: !!(weeklyMeasurements.chest || weeklyMeasurements.waist || weeklyMeasurements.hips)
      }
    })

    return { success: true, data: weeklyPhotoSets.filter((set: any) => set.hasPhotos || set.hasMeasurements) }
  } catch (err: any) {
    console.error('[Diary Action Unexpected] getProgressPhotos:', err)
    return { success: false, error: err?.message || 'Internal Server Error' }
  }
}

/**
 * Получить фото за конкретную неделю
 */
export async function getWeekPhotos(userId: string, weekKey: string) {
  const supabase = await createClient()

  try {
    const { data: entry, error } = await supabase
      .from('diary_entries')
      .select('date, weekly_photos, weekly_measurements, metrics')
      .eq('user_id', userId)
      .eq('date', weekKey)
      .maybeSingle()

    if (error) {
      logError('getWeekPhotos', error, userId)
      return { success: false, error: error.message }
    }

    if (!entry) {
      return { 
        success: true, 
        data: {
          week_key: weekKey,
          week_label: getWeekLabel(weekKey),
          photos: {},
          hasPhotos: false,
          hasMeasurements: false
        } 
      }
    }

    const weeklyPhotos = (entry as any).weekly_photos || {}
    const photos = weeklyPhotos.photos || {}
    const weeklyMeasurements = (entry as any).weekly_measurements || {}

    // Вычисляем диапазон недели для поиска веса
    const [year, month, day] = weekKey.split('-').map(Number)
    const weekStart = new Date(year, month - 1, day)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    
    // Форматируем даты для SQL запроса
    const startStr = weekKey
    const endYear = weekEnd.getFullYear()
    const endMonth = String(weekEnd.getMonth() + 1).padStart(2, '0')
    const endDay = String(weekEnd.getDate()).padStart(2, '0')
    const endStr = `${endYear}-${endMonth}-${endDay}`
    
    // Получаем последний вес за эту неделю
    const { data: weekEntries } = await supabase
      .from('diary_entries')
      .select('metrics')
      .eq('user_id', userId)
      .gte('date', startStr)
      .lte('date', endStr)
      .not('metrics->weight', 'is', null)
      .order('date', { ascending: false })
      .limit(1)
    
    const weight = (weekEntries?.[0]?.metrics as any)?.weight || undefined

    const weeklyPhotoSet: WeeklyPhotoSet = {
      week_key: weekKey,
      week_label: getWeekLabel(weekKey),
      photos: {
        front: photos.front || undefined,
        side: photos.side || undefined,
        back: photos.back || undefined
      },
      measurements: weeklyMeasurements.chest || weeklyMeasurements.waist || weeklyMeasurements.hips 
        ? weeklyMeasurements 
        : undefined,
      weight,
      hasPhotos: !!(photos.front || photos.side || photos.back),
      hasMeasurements: !!(weeklyMeasurements.chest || weeklyMeasurements.waist || weeklyMeasurements.hips)
    }

    return { success: true, data: weeklyPhotoSet }
  } catch (err: any) {
    console.error('[Diary Action Unexpected] getWeekPhotos:', err)
    return { success: false, error: err?.message || 'Internal Server Error' }
  }
}

/**
 * Получить фото текущей недели
 */
export async function getCurrentWeekPhotos(userId: string) {
  const weekKey = getCurrentWeekKey()
  return getWeekPhotos(userId, weekKey)
}

/**
 * Удалить фото прогресса (недельная структура)
 */
export async function deleteProgressPhoto(
  userId: string, 
  weekKey: string, 
  photoType: PhotoType
) {
  const supabase = await createClient()

  try {
    // Получаем текущую запись
    const { data: entry } = await supabase
      .from('diary_entries')
      .select('weekly_photos')
      .eq('user_id', userId)
      .eq('date', weekKey)
      .maybeSingle()

    if (!entry) {
      return { success: false, error: 'Entry not found' }
    }

    const weeklyPhotos = (entry as any).weekly_photos || {}
    const photos = weeklyPhotos.photos || {}
    const photoToDelete = photos[photoType]

    if (!photoToDelete) {
      return { success: false, error: 'Photo not found' }
    }

    // Удаляем из storage
    let path = null
    try {
      if (photoToDelete.url.includes('progress-photos/')) {
        path = photoToDelete.url.split('progress-photos/')[1]?.split('?')[0]
      }
    } catch (e) {
      console.error('Error parsing photo path:', e)
    }

    if (path) {
      await supabase.storage
        .from('progress-photos')
        .remove([path])
    }

    // Удаляем фото из структуры
    const updatedPhotos = { ...photos }
    delete updatedPhotos[photoType]

    const updatedWeeklyPhotos = {
      ...weeklyPhotos,
      photos: updatedPhotos
    }

    // Обновляем запись
    const { error } = await supabase
      .from('diary_entries')
      .update({ weekly_photos: updatedWeeklyPhotos } as any)
      .eq('user_id', userId)
      .eq('date', weekKey)

    if (error) {
      logError('deleteProgressPhoto', error, userId)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/health-tracker')

    return { success: true }
  } catch (err: any) {
    console.error('[Diary Action Unexpected] deleteProgressPhoto:', err)
    return { success: false, error: err?.message || 'Internal Server Error' }
  }
}

/**
 * Заменить фото (удалить старое + загрузить новое)
 */
export async function updateProgressPhoto(
  userId: string,
  photoType: PhotoType,
  formData: FormData,
  weekKey?: string
) {
  const targetWeekKey = weekKey || getCurrentWeekKey()
  
  // Сначала пытаемся удалить старое фото
  await deleteProgressPhoto(userId, targetWeekKey, photoType)
  
  // Затем загружаем новое
  return uploadProgressPhoto(userId, photoType, formData, targetWeekKey)
}

/**
 * Получить фото для сравнения (максимальный вес vs минимальный вес)
 */
export async function getComparisonPhotos(userId: string, startDate: string, endDate: string) {
  const supabase = await createClient()

  try {
    // Получаем все записи за период с фото и весом
    const { data, error } = await supabase
      .from('diary_entries')
      .select('date, weekly_photos, metrics')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .not('weekly_photos', 'is', null)
      .order('date', { ascending: true })

    if (error) {
      logError('getComparisonPhotos', error, userId)
      return { success: false, error: error.message }
    }

    // Фильтруем записи с весом и хотя бы одним фото
    const entriesWithWeight = data
      .filter((entry: any) => {
        const weight = (entry.metrics as any)?.weight
        const photos = entry.weekly_photos?.photos || {}
        const hasPhotos = !!(photos.front || photos.side || photos.back)
        return weight && hasPhotos
      })
      .map((entry: any) => ({
        weekKey: entry.date,
        weight: (entry.metrics as any).weight,
        photos: entry.weekly_photos.photos
      }))

    if (entriesWithWeight.length < 2) {
      return { 
        success: true, 
        data: null, 
        message: 'Недостаточно данных для сравнения'
      }
    }

    // Находим неделю с максимальным и минимальным весом
    const maxWeightEntry = entriesWithWeight.reduce((max: any, entry: any) => 
      entry.weight > max.weight ? entry : max
    )
    const minWeightEntry = entriesWithWeight.reduce((min: any, entry: any) => 
      entry.weight < min.weight ? entry : min
    )

    // Проверяем разницу в весе
    const weightDiff = maxWeightEntry.weight - minWeightEntry.weight
    if (weightDiff < 1) {
      return { 
        success: true, 
        data: null, 
        message: 'Недостаточная разница в весе для сравнения'
      }
    }

    // Выбираем приоритетное фото (front > side > back)
    const getPhoto = (photos: any) => {
      return photos.front || photos.side || photos.back || null
    }

    const beforePhoto = getPhoto(maxWeightEntry.photos)
    const afterPhoto = getPhoto(minWeightEntry.photos)

    if (!beforePhoto || !afterPhoto) {
      return { 
        success: true, 
        data: null, 
        message: 'Не удалось найти подходящие фото'
      }
    }

    const comparisonData = {
      before: {
        photo: beforePhoto,
        week_key: maxWeightEntry.weekKey,
        week_label: getWeekLabel(maxWeightEntry.weekKey),
        weight: maxWeightEntry.weight
      },
      after: {
        photo: afterPhoto,
        week_key: minWeightEntry.weekKey,
        week_label: getWeekLabel(minWeightEntry.weekKey),
        weight: minWeightEntry.weight
      },
      weightDifference: weightDiff
    }

    return { success: true, data: comparisonData }
  } catch (err: any) {
    console.error('[Diary Action Unexpected] getComparisonPhotos:', err)
    return { success: false, error: err?.message || 'Internal Server Error' }
  }
}

/**
 * Обновить замеры тела за неделю
 */
export async function updateWeeklyMeasurements(
  userId: string,
  weekKey: string,
  measurements: { chest?: number; waist?: number; hips?: number }
) {
  const supabase = await createClient()

  try {
    // Получаем существующую запись за эту неделю
    const { data: entry } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', weekKey)
      .maybeSingle()

    // Подготавливаем данные замеров (удаляем undefined значения)
    const cleanMeasurements: any = {}
    if (measurements.chest !== undefined) cleanMeasurements.chest = measurements.chest
    if (measurements.waist !== undefined) cleanMeasurements.waist = measurements.waist
    if (measurements.hips !== undefined) cleanMeasurements.hips = measurements.hips

    // Если есть хотя бы один замер, сохраняем
    const weeklyMeasurements = Object.keys(cleanMeasurements).length > 0 ? cleanMeasurements : null

    // Сохраняем в diary_entries с ключом = week_key (понедельник недели)
    const { data, error } = await supabase
      .from('diary_entries')
      .upsert({
        user_id: userId,
        date: weekKey,
        weekly_measurements: weeklyMeasurements,
        weekly_photos: (entry as any)?.weekly_photos || null,
        metrics: (entry as any)?.metrics || {},
        updated_at: new Date().toISOString()
      } as any, {
        onConflict: 'user_id,date'
      })
      .select()
      .single()

    if (error) {
      logError('updateWeeklyMeasurements', error, userId)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/health-tracker')

    return { 
      success: true, 
      data: { 
        weekKey, 
        measurements: weeklyMeasurements,
        entry: data 
      } 
    }
  } catch (err: any) {
    console.error('[Diary Action Unexpected] updateWeeklyMeasurements:', err)
    return { success: false, error: err?.message || 'Internal Server Error' }
  }
}

