'use server'

import { createClient } from '@/lib/supabase/server'
import { DiarySettings, DiarySettingsInsert, DiarySettingsUpdate, DiaryEntry, ProgressPhoto, PhotoType, WeeklyPhotoSet, getWeekKey, getWeekLabel, getCurrentWeekKey } from '@/types/database'
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
  console.log(`[Diary Action] Starting getDiarySettings for ${userId}`)
  const supabase = await createClient()

  try {
    // Проверяем, существует ли таблица вообще
    const { error: tableCheckError } = await supabase
      .from('diary_settings')
      .select('user_id')
      .limit(1)
    
    if (tableCheckError) {
      logError('Table Check (diary_settings)', tableCheckError, userId)
      // Если таблицы нет, код ошибки 42P01
      if (tableCheckError.code === '42P01') {
        return { success: false, error: 'Таблица diary_settings не найдена. Пожалуйста, выполните SQL миграцию 022.' }
      }
    }

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
      // Используем any так как типы из миграции 022 не совпадают с сгенерированными
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
    const { data: existing } = await supabase
      .from('diary_settings')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()

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

    return { success: true, data: data as DiarySettings }
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

    // Проверяем достижения (фоново, не блокируем ответ)
    checkAndUnlockAchievements(userId).catch(err => {
      console.error('[Diary Action] Error checking achievements:', err)
    })

    return { success: true, data: data as DiaryEntry }
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
  formData: FormData
) {
  const supabase = await createClient()
  const file = formData.get('file') as File
  if (!file) return { success: false, error: 'No file provided' }

  try {
    // Получаем week_key для текущей недели
    const weekKey = getCurrentWeekKey()
    const fileName = `${userId}/${weekKey}_${photoType}_${Date.now()}.jpg`

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
      .eq('date', weekKey)
      .maybeSingle()

    // Создаем структуру weekly_photos
    const currentWeeklyPhotos = (entry as any)?.weekly_photos || { photos: {} }
    const updatedWeeklyPhotos = {
      ...currentWeeklyPhotos,
      week_key: weekKey,
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
        date: weekKey,
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
        weekKey,
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
    // Получаем все записи с weekly_photos
    const { data, error } = await supabase
      .from('diary_entries')
      .select('date, weekly_photos, metrics')
      .eq('user_id', userId)
      .not('weekly_photos', 'is', null)
      .order('date', { ascending: false })

    if (error) {
      logError('getProgressPhotos', error, userId)
      return { success: false, error: error.message }
    }

    // Преобразуем в WeeklyPhotoSet[]
    const weeklyPhotoSets: WeeklyPhotoSet[] = data.map((entry: any) => {
      const weeklyPhotos = entry.weekly_photos || {}
      const photos = weeklyPhotos.photos || {}
      
      return {
        week_key: entry.date,
        week_label: getWeekLabel(entry.date),
        photos: {
          front: photos.front || undefined,
          side: photos.side || undefined,
          back: photos.back || undefined
        },
        weight: entry.metrics?.weight || undefined,
        hasPhotos: !!(photos.front || photos.side || photos.back)
      }
    }).filter((set: WeeklyPhotoSet) => set.hasPhotos)

    return { success: true, data: weeklyPhotoSets }
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
      .select('date, weekly_photos, metrics')
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
          hasPhotos: false
        } 
      }
    }

    const weeklyPhotos = (entry as any).weekly_photos || {}
    const photos = weeklyPhotos.photos || {}

    const weeklyPhotoSet: WeeklyPhotoSet = {
      week_key: weekKey,
      week_label: getWeekLabel(weekKey),
      photos: {
        front: photos.front || undefined,
        side: photos.side || undefined,
        back: photos.back || undefined
      },
      weight: (entry as any).metrics?.weight || undefined,
      hasPhotos: !!(photos.front || photos.side || photos.back)
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
  formData: FormData
) {
  const weekKey = getCurrentWeekKey()
  
  // Сначала пытаемся удалить старое фото
  await deleteProgressPhoto(userId, weekKey, photoType)
  
  // Затем загружаем новое
  return uploadProgressPhoto(userId, photoType, formData)
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
        const weight = entry.metrics?.weight
        const photos = entry.weekly_photos?.photos || {}
        const hasPhotos = !!(photos.front || photos.side || photos.back)
        return weight && hasPhotos
      })
      .map((entry: any) => ({
        weekKey: entry.date,
        weight: entry.metrics.weight,
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
    const maxWeightEntry = entriesWithWeight.reduce((max, entry) => 
      entry.weight > max.weight ? entry : max
    )
    const minWeightEntry = entriesWithWeight.reduce((min, entry) => 
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
