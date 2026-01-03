'use server'

import { createClient } from '@/lib/supabase/server'
import { DiarySettings, DiarySettingsInsert, DiarySettingsUpdate, DiaryEntry, ProgressPhoto } from '@/types/database'
import { revalidatePath } from 'next/cache'

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
        return { success: false, error: 'Таблица diary_settings не найдена. Пожалуйста, выполните SQL миграцию.' }
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
      const defaultSettings: DiarySettingsInsert = {
        user_id: userId,
        enabled_metrics: ['weight', 'steps', 'water', 'calories', 'mood'],
        goals: {},
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
 * Обновить настройки дневника
 */
export async function updateDiarySettings(userId: string, settings: DiarySettingsUpdate) {
  const supabase = await createClient()

  try {
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
 * Сохранить или обновить запись в дневнике
 */
export async function upsertDiaryEntry(userId: string, date: string, metrics: any, notes?: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('diary_entries')
      .upsert({
        user_id: userId,
        date,
        metrics,
        notes,
        updated_at: new Date().toISOString()
      }, {
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

    // Обновляем стрики
    await updateStreaks(userId, date)

    return { success: true, data: data as DiaryEntry }
  } catch (err: any) {
    console.error('[Diary Action Unexpected] upsertDiaryEntry:', err)
    return { success: false, error: err?.message || 'Internal Server Error' }
  }
}

/**
 * Обновление стриков пользователя
 */
async function updateStreaks(userId: string, entryDate: string) {
  const supabase = await createClient()
  
  try {
    const { data: settings } = await supabase
      .from('diary_settings')
      .select('streaks')
      .eq('user_id', userId)
      .single()
      
    if (!settings) return

    const streaks = (settings.streaks as any) || { current: 0, longest: 0, last_entry_date: null }
    const lastDate = streaks.last_entry_date
    
    if (lastDate === entryDate) return
    
    const today = new Date(entryDate)
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    
    let newCurrent = 1
    if (lastDate === yesterdayStr) {
      newCurrent = (streaks.current || 0) + 1
    }
    
    const newLongest = Math.max(newCurrent, streaks.longest || 0)
    
    await supabase
      .from('diary_settings')
      .update({
        streaks: {
          current: newCurrent,
          longest: newLongest,
          last_entry_date: entryDate
        }
      })
      .eq('user_id', userId)
  } catch (err) {
    console.error('[Diary Action Unexpected] updateStreaks:', err)
  }
}

/**
 * Загрузка фото прогресса
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

    const { data, error } = await supabase
      .from('progress_photos')
      .insert({
        user_id: userId,
        date,
        image_url: signedData.signedUrl
      })
      .select()
      .single()

    if (error) {
      logError('uploadProgressPhoto (db insert)', error, userId)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/health-tracker')

    return { success: true, data: data as ProgressPhoto }
  } catch (err: any) {
    console.error('[Diary Action Unexpected] uploadProgressPhoto:', err)
    return { success: false, error: err?.message || 'Internal Server Error' }
  }
}

/**
 * Получить фото прогресса
 */
export async function getProgressPhotos(userId: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('progress_photos')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) {
      logError('getProgressPhotos', error, userId)
      return { success: false, error: error.message }
    }

    return { success: true, data: data as ProgressPhoto[] }
  } catch (err: any) {
    console.error('[Diary Action Unexpected] getProgressPhotos:', err)
    return { success: false, error: err?.message || 'Internal Server Error' }
  }
}

/**
 * Удалить фото прогресса
 */
export async function deleteProgressPhoto(userId: string, photoId: string, imageUrl: string) {
  const supabase = await createClient()

  try {
    // Извлекаем путь из URL
    let path = null
    try {
      if (imageUrl.includes('progress-photos/')) {
        path = imageUrl.split('progress-photos/')[1]?.split('?')[0]
      }
    } catch (e) {}

    if (path) {
      await supabase.storage
        .from('progress-photos')
        .remove([path])
    }

    const { error } = await supabase
      .from('progress_photos')
      .delete()
      .eq('id', photoId)
      .eq('user_id', userId)

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
