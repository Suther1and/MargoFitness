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
}): Promise<{ success: boolean; users?: any[]; error?: string }> {
  try {
    await checkAdmin()
    const supabase = await createClient()

    let query = supabase
      .from('profiles')
      .select(`
        *,
        user_bonuses (
          balance,
          cashback_level,
          total_spent_for_cashback
        )
      `)
      .order('created_at', { ascending: false })

    // Применяем фильтры
    if (filters?.role && filters.role !== 'all') {
      query = query.eq('role', filters.role as 'user' | 'admin')
    }
    if (filters?.tier && filters.tier !== 'all') {
      query = query.eq('subscription_tier', filters.tier as any)
    }
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('subscription_status', filters.status as any)
    }
    if (filters?.search) {
      query = query.ilike('email', `%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching users:', error)
      return { success: false, error: error.message }
    }

    // Приводим данные к плоскому формату
    const usersWithBonuses = data?.map(user => ({
      ...user,
      bonus_balance: user.user_bonuses?.[0]?.balance || 0,
      cashback_level: user.user_bonuses?.[0]?.cashback_level || 1,
      total_spent_for_cashback: user.user_bonuses?.[0]?.total_spent_for_cashback || 0,
    })) || []

    return { success: true, users: usersWithBonuses }
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
    bonus_balance?: number
    cashback_level?: number
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    await checkAdmin()
    const supabase = await createClient()

    // Обновляем профиль
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        role: data.role,
        subscription_tier: data.subscription_tier,
        subscription_status: data.subscription_status,
        subscription_expires_at: data.subscription_expires_at,
      })
      .eq('id', userId)

    if (profileError) {
      console.error('Error updating user profile:', profileError)
      return { success: false, error: profileError.message }
    }

    // Обновляем бонусы, если указаны
    if (data.bonus_balance !== undefined || data.cashback_level !== undefined) {
      const updateData: any = {}
      if (data.bonus_balance !== undefined) updateData.balance = data.bonus_balance
      if (data.cashback_level !== undefined) updateData.cashback_level = data.cashback_level

      const { error: bonusError } = await supabase
        .from('user_bonuses')
        .update(updateData)
        .eq('user_id', userId)

      if (bonusError) {
        console.error('Error updating user bonuses:', bonusError)
        return { success: false, error: bonusError.message }
      }
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

