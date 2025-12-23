'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from './profile'
import { revalidatePath } from 'next/cache'
import type { Profile, ProfileUpdate } from '@/types/database'

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
 * Получить всех пользователей с фильтрацией
 */
export async function getAllUsers(filters?: {
  role?: string
  tier?: string
  status?: string
  search?: string
}): Promise<{ success: boolean; users?: Profile[]; error?: string }> {
  try {
    await checkAdmin()
    const supabase = await createClient()

    let query = supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    // Применяем фильтры
    if (filters?.role && filters.role !== 'all') {
      query = query.eq('role', filters.role)
    }
    if (filters?.tier && filters.tier !== 'all') {
      query = query.eq('subscription_tier', filters.tier)
    }
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('subscription_status', filters.status)
    }
    if (filters?.search) {
      query = query.ilike('email', `%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching users:', error)
      return { success: false, error: error.message }
    }

    return { success: true, users: data || [] }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Обновить профиль пользователя
 */
export async function updateUserProfile(
  userId: string,
  data: {
    role?: 'user' | 'admin'
    subscription_tier?: 'free' | 'basic' | 'pro' | 'elite'
    subscription_status?: 'active' | 'inactive' | 'canceled'
    subscription_expires_at?: string | null
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    await checkAdmin()
    const supabase = await createClient()

    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', userId)

    if (error) {
      console.error('Error updating user:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/users')
    revalidatePath('/admin')

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Получить статистику пользователей
 */
export async function getUsersStats(): Promise<{
  success: boolean
  stats?: {
    total: number
    admins: number
    activeSubscriptions: number
    tierCounts: Record<string, number>
  }
  error?: string
}> {
  try {
    await checkAdmin()
    const supabase = await createClient()

    const { data: users, error } = await supabase
      .from('profiles')
      .select('role, subscription_tier, subscription_status')

    if (error) {
      return { success: false, error: error.message }
    }

    const stats = {
      total: users.length,
      admins: users.filter(u => u.role === 'admin').length,
      activeSubscriptions: users.filter(u => u.subscription_status === 'active').length,
      tierCounts: {
        free: users.filter(u => u.subscription_tier === 'free').length,
        basic: users.filter(u => u.subscription_tier === 'basic').length,
        pro: users.filter(u => u.subscription_tier === 'pro').length,
        elite: users.filter(u => u.subscription_tier === 'elite').length,
      }
    }

    return { success: true, stats }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

