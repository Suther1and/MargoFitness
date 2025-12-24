'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface UpdateProfileData {
  full_name?: string
  phone?: string
  email?: string
}

/**
 * Обновление профиля пользователя
 */
export async function updateUserProfile(data: UpdateProfileData) {
  try {
    const supabase = await createClient()
    
    // Получаем текущего пользователя
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { 
        success: false, 
        error: 'Пользователь не авторизован' 
      }
    }

    // Проверяем, является ли это Telegram аккаунтом
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, telegram_id')
      .eq('id', user.id)
      .single()

    const isTelegramAccount = !!profile?.telegram_id
    const hasTelegramEmail = profile?.email?.includes('@telegram.local')

    // Валидация: если пользователь вводит email для Telegram аккаунта, проверяем формат
    if (isTelegramAccount && hasTelegramEmail && data.email) {
      // Простая валидация email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.email)) {
        return {
          success: false,
          error: 'Неверный формат email'
        }
      }

      // Проверяем что email не занят другим пользователем
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', data.email)
        .neq('id', user.id)
        .single()

      if (existingProfile) {
        return {
          success: false,
          error: 'Этот email уже используется'
        }
      }
    }

    // Обновляем профиль
    // Для Telegram аккаунтов: обновляем email ТОЛЬКО в profiles (в auth.users остается telegram_*@telegram.local для входа)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: data.full_name,
        phone: data.phone,
        email: data.email,  // Обновляем в profiles для отображения
        profile_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating profile:', updateError)
      return { 
        success: false, 
        error: 'Ошибка при обновлении профиля' 
      }
    }

    revalidatePath('/dashboard')
    
    return { 
      success: true,
      message: 'Профиль успешно обновлен' 
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { 
      success: false, 
      error: 'Неожиданная ошибка' 
    }
  }
}

/**
 * Загрузка аватара пользователя
 */
export async function uploadUserAvatar(formData: FormData) {
  try {
    const supabase = await createClient()
    
    // Получаем текущего пользователя
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { 
        success: false, 
        error: 'Пользователь не авторизован' 
      }
    }

    const file = formData.get('avatar') as File
    
    if (!file || !file.size) {
      return { 
        success: false, 
        error: 'Файл не выбран' 
      }
    }

    // Проверяем тип файла
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return { 
        success: false, 
        error: 'Неподдерживаемый формат файла. Используйте JPG, PNG или WEBP' 
      }
    }

    // Проверяем размер файла (макс 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return { 
        success: false, 
        error: 'Файл слишком большой. Максимальный размер: 5MB' 
      }
    }

    // Генерируем уникальное имя файла
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`

    // Удаляем старый аватар если есть
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single()

    if (profile?.avatar_url) {
      // Извлекаем путь из URL
      const oldPath = profile.avatar_url.split('/avatars/')[1]
      if (oldPath) {
        await supabase.storage
          .from('avatars')
          .remove([oldPath])
      }
    }

    // Загружаем новый файл
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      return { 
        success: false, 
        error: 'Ошибка при загрузке файла' 
      }
    }

    // Получаем публичный URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    // Обновляем профиль с новым URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating profile:', updateError)
      return { 
        success: false, 
        error: 'Ошибка при обновлении профиля' 
      }
    }

    revalidatePath('/dashboard')
    
    return { 
      success: true,
      avatarUrl: publicUrl,
      message: 'Аватар успешно загружен' 
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { 
      success: false, 
      error: 'Неожиданная ошибка' 
    }
  }
}

/**
 * Удаление аватара пользователя
 */
export async function deleteUserAvatar() {
  try {
    const supabase = await createClient()
    
    // Получаем текущего пользователя
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { 
        success: false, 
        error: 'Пользователь не авторизован' 
      }
    }

    // Получаем текущий аватар
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single()

    if (profile?.avatar_url) {
      // Проверяем что это не OAuth аватар (они начинаются с https://lh3.googleusercontent.com)
      if (profile.avatar_url.includes('supabase.co/storage')) {
        // Извлекаем путь из URL
        const path = profile.avatar_url.split('/avatars/')[1]
        if (path) {
          await supabase.storage
            .from('avatars')
            .remove([path])
        }
      }
    }

    // Обновляем профиль, удаляя URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        avatar_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating profile:', updateError)
      return { 
        success: false, 
        error: 'Ошибка при обновлении профиля' 
      }
    }

    revalidatePath('/dashboard')
    
    return { 
      success: true,
      message: 'Аватар успешно удален' 
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { 
      success: false, 
      error: 'Неожиданная ошибка' 
    }
  }
}

