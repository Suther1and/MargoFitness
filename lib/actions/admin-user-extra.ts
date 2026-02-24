'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentProfile } from './profile'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

/**
 * Проверка прав администратора
 */
async function checkAdmin() {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'admin') {
    throw new Error('Доступ запрещён')
  }
  return profile
}

/**
 * Логирование входа пользователя
 */
export async function logUserAuth(userId: string) {
  try {
    const supabase = createAdminClient()
    const headerList = await headers()
    
    // Получаем IP (учитываем прокси)
    const ip = headerList.get('x-forwarded-for')?.split(',')[0] || 
               headerList.get('x-real-ip') || 
               'unknown'
               
    const userAgent = headerList.get('user-agent') || ''
    
    // Определяем геолокацию через бесплатный API (ip-api.com)
    // Это работает независимо от хостинга
    let country = 'Unknown'
    let city = 'Unknown'
    
    try {
      if (ip !== 'unknown' && ip !== '127.0.0.1' && !ip.startsWith('192.168.')) {
        // Добавляем таймаут, чтобы внешний сервис не вешал сервер
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 2000) // 2 секунды максимум

        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city`, {
          signal: controller.signal
        })
        clearTimeout(timeoutId)
        
        const geoData = await geoRes.json()
        if (geoData.status === 'success') {
          country = geoData.country
          city = geoData.city
        }
      }
    } catch (e) {
      // Игнорируем ошибки гео, чтобы не ломать вход
      // console.error('Geo lookup failed:', e)
    }

    // Простой парсинг User Agent
    const isMobile = /Mobile|Android|iPhone/i.test(userAgent)
    const isTablet = /Tablet|iPad/i.test(userAgent)
    const deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop'
    
    let browser = 'Other'
    if (userAgent.includes('Chrome')) browser = 'Chrome'
    else if (userAgent.includes('Firefox')) browser = 'Firefox'
    else if (userAgent.includes('Safari')) browser = 'Safari'
    else if (userAgent.includes('Edge')) browser = 'Edge'
    
    let os = 'Other'
    if (userAgent.includes('Windows')) os = 'Windows'
    else if (userAgent.includes('Mac OS')) os = 'macOS'
    else if (userAgent.includes('Android')) os = 'Android'
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS'
    else if (userAgent.includes('Linux')) os = 'Linux'

    await supabase.from('auth_logs').insert({
      user_id: userId,
      ip_address: ip,
      user_agent: userAgent,
      country,
      city,
      device_type: deviceType,
      browser,
      os
    })

    // revalidatePath('/admin/users') // Удалено, так как вызывает ошибку при вызове во время рендеринга
    return { success: true }
  } catch (error) {
    console.error('Error logging auth:', error)
    return { success: false }
  }
}

/**
 * Получить логи авторизации пользователя
 */
export async function getUserAuthLogs(userId: string) {
  try {
    await checkAdmin()
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('auth_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error('Error fetching auth logs:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Получить заметки админа о пользователе
 */
export async function getAdminNotes(userId: string) {
  try {
    await checkAdmin()
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('admin_notes')
      .select(`
        *,
        admin:profiles!admin_id(full_name, email)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error('Error fetching admin notes:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Сохранить заметку админа
 */
export async function saveAdminNote(userId: string, content: string) {
  try {
    const admin = await checkAdmin()
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('admin_notes')
      .insert({
        user_id: userId,
        admin_id: admin.id,
        content: content.trim()
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/admin/users')
    return { success: true, data }
  } catch (error: any) {
    console.error('Error saving admin note:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Удалить заметку админа
 */
export async function deleteAdminNote(noteId: string) {
  try {
    await checkAdmin()
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('admin_notes')
      .delete()
      .eq('id', noteId)

    if (error) throw error

    revalidatePath('/admin/users')
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting admin note:', error)
    return { success: false, error: error.message }
  }
}
