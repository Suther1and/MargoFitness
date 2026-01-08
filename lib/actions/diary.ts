'use server'

import { createClient } from '@/lib/supabase/server'
import { DiarySettings, DiarySettingsInsert, DiarySettingsUpdate, DiaryEntry, ProgressPhoto } from '@/types/database'
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
 * Загрузка фото прогресса (теперь сохраняем в diary_entries)
 */
export async function uploadProgressPhoto(userId: string, date: string, formData: FormData) {
  const supabase = await createClient()
  const file = formData.get('file') as File
  if (!file) return { success: false, error: 'No file provided' }

  try {
    const fileName = `${userId}/${date}_${Date.now()}.jpg`

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

    // Для приватного хранилища создаем подписанную ссылку на 1 год
    const { data: signedData, error: signedError } = await supabase.storage
      .from('progress-photos')
      .createSignedUrl(fileName, 31536000) // 1 year

    if (signedError) {
      logError('uploadProgressPhoto (signedUrl)', signedError, userId)
      return { success: false, error: signedError.message }
    }

    // Получаем текущую запись дня
    const { data: entry } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle()

    const currentPhotoUrls = (entry as any)?.photo_urls || []
    const updatedPhotoUrls = [...currentPhotoUrls, signedData.signedUrl]

    // Обновляем запись дня с новым фото
    const { data, error } = await supabase
      .from('diary_entries')
      .upsert({
        user_id: userId,
        date,
        photo_urls: updatedPhotoUrls,
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

    return { success: true, data: { url: signedData.signedUrl, entry: data } }
  } catch (err: any) {
    console.error('[Diary Action Unexpected] uploadProgressPhoto:', err)
    return { success: false, error: err?.message || 'Internal Server Error' }
  }
}

/**
 * Получить фото прогресса (из diary_entries)
 */
export async function getProgressPhotos(userId: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('diary_entries')
      .select('date, photo_urls')
      .eq('user_id', userId)
      .not('photo_urls', 'is', null)
      .order('date', { ascending: false })

    if (error) {
      logError('getProgressPhotos', error, userId)
      return { success: false, error: error.message }
    }

    // Преобразуем в плоский список фото с датами
    const photos = data.flatMap((entry: any) => 
      (entry.photo_urls || []).map((url: string) => ({
        date: entry.date,
        url
      }))
    )

    return { success: true, data: photos }
  } catch (err: any) {
    console.error('[Diary Action Unexpected] getProgressPhotos:', err)
    return { success: false, error: err?.message || 'Internal Server Error' }
  }
}

/**
 * Удалить фото прогресса (из diary_entries)
 */
export async function deleteProgressPhoto(userId: string, date: string, photoUrl: string) {
  const supabase = await createClient()

  try {
    // Извлекаем путь из URL для удаления из Storage
    let path = null
    try {
      if (photoUrl.includes('progress-photos/')) {
        path = photoUrl.split('progress-photos/')[1]?.split('?')[0]
      }
    } catch (e) {}

    if (path) {
      await supabase.storage
        .from('progress-photos')
        .remove([path])
    }

    // Получаем текущие фото записи
    const { data: entry } = await supabase
      .from('diary_entries')
      .select('photo_urls')
      .eq('user_id', userId)
      .eq('date', date)
      .single()

    if (!entry) {
      return { success: false, error: 'Entry not found' }
    }

    // Удаляем URL из массива
    const updatedPhotoUrls = ((entry as any).photo_urls || []).filter((url: string) => url !== photoUrl)

    // Обновляем запись
    const { error } = await supabase
      .from('diary_entries')
      .update({ photo_urls: updatedPhotoUrls } as any)
      .eq('user_id', userId)
      .eq('date', date)

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
