'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from './profile'
import { revalidatePath } from 'next/cache'
import type { Profile, ProfileUpdate, UserBonus } from '@/types/database'

// Тип для пользователя с бонусной информацией
type ProfileWithBonuses = Profile & {
  user_bonuses?: UserBonus[] | null
  bonus_balance?: number
  cashback_level?: number
  total_spent_for_cashback?: number
}

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
  cashback_level?: string
  expired?: string
}): Promise<{ success: boolean; users?: ProfileWithBonuses[]; error?: string }> {
  try {
    await checkAdmin()
    const supabase = await createClient()

    // Оптимизированный запрос: получаем профили сразу с бонусами через join
    let profileQuery = supabase
      .from('profiles')
      .select('*, user_bonuses(balance, cashback_level, total_spent_for_cashback)')
      .order('created_at', { ascending: false })

    // Применяем фильтры
    if (filters?.role && filters.role !== 'all') {
      profileQuery = profileQuery.eq('role', filters.role as 'user' | 'admin')
    }
    if (filters?.tier && filters.tier !== 'all') {
      profileQuery = profileQuery.eq('subscription_tier', filters.tier as 'free' | 'basic' | 'pro' | 'elite')
    }
    if (filters?.status && filters.status !== 'all') {
      profileQuery = profileQuery.eq('subscription_status', filters.status as 'active' | 'inactive' | 'canceled')
    }
    
    // Фильтр по истекшим подпискам
    if (filters?.expired === 'true') {
      profileQuery = profileQuery
        .eq('subscription_status', 'active')
        .lt('subscription_expires_at', new Date().toISOString())
    } else if (filters?.expired === 'false') {
      profileQuery = profileQuery
        .eq('subscription_status', 'active')
        .gte('subscription_expires_at', new Date().toISOString())
    }

    if (filters?.search) {
      const searchTerm = filters.search.trim()
      if (searchTerm) {
        profileQuery = profileQuery.or(`email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
      }
    }

    const { data: profiles, error: profileError } = await profileQuery

    if (profileError) {
      console.error('Error fetching users:', JSON.stringify(profileError, null, 2))
      return { success: false, error: profileError.message }
    }

    if (!profiles || profiles.length === 0) {
      return { success: true, users: [] }
    }

    let usersWithBonuses: ProfileWithBonuses[] = profiles.map((user: any) => {
      const bonusData = Array.isArray(user.user_bonuses) ? user.user_bonuses[0] : user.user_bonuses
      return {
        ...user,
        bonus_balance: bonusData?.balance ?? 0,
        cashback_level: bonusData?.cashback_level ?? 1,
        total_spent_for_cashback: bonusData?.total_spent_for_cashback ?? 0,
      }
    })

    if (filters?.cashback_level && filters.cashback_level !== 'all') {
      const targetLevel = parseInt(filters.cashback_level)
      usersWithBonuses = usersWithBonuses.filter((user: any) => user.cashback_level === targetLevel)
    }

    return { success: true, users: usersWithBonuses }
  } catch (error: any) {
    console.error('SERVER ACTION ERROR (getAllUsers):', error)
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
    referral_level?: number
    phone?: string | null
    freeze_tokens_total?: number
    freeze_tokens_used?: number
    freeze_days_total?: number
    freeze_days_used?: number
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const adminProfile = await checkAdmin()
    const supabase = await createClient()

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        role: data.role,
        subscription_tier: data.subscription_tier,
        subscription_status: data.subscription_status,
        subscription_expires_at: data.subscription_expires_at,
        phone: data.phone,
        referral_level: data.referral_level,
        freeze_tokens_total: data.freeze_tokens_total,
        freeze_tokens_used: data.freeze_tokens_used,
        freeze_days_total: data.freeze_days_total,
        freeze_days_used: data.freeze_days_used,
      })
      .eq('id', userId)

    if (profileError) {
      console.error('Error updating user profile:', profileError)
      return { success: false, error: profileError.message }
    }

    if (data.bonus_balance !== undefined || data.cashback_level !== undefined) {
      if (data.bonus_balance !== undefined) {
        const { data: currentBonus, error: fetchError } = await supabase
          .from('user_bonuses')
          .select('balance')
          .eq('user_id', userId)
          .single()

        if (fetchError) {
          console.error('Error fetching current bonus:', fetchError)
          return { success: false, error: fetchError.message }
        }

        const oldBalance = currentBonus?.balance || 0
        const difference = data.bonus_balance - oldBalance

        if (difference !== 0) {
          const { error: txError } = await supabase
            .from('bonus_transactions')
            .insert({
              user_id: userId,
              amount: difference,
              type: 'admin_adjustment',
              description: difference > 0 
                ? `Начисление администратором (+${difference} шагов)` 
                : `Списание администратором (${difference} шагов)`,
              related_user_id: adminProfile.id,
              metadata: {
                admin_email: adminProfile.email,
                old_balance: oldBalance,
                new_balance: data.bonus_balance,
              },
            })

          if (txError) {
            console.error('Error creating bonus transaction:', txError)
            return { success: false, error: txError.message }
          }
        }
      }

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

    revalidatePath('/admin/users', 'page')
    return { success: true }
  } catch (error: any) {
    console.error('CRITICAL ERROR in updateUserProfile:', error)
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
    newToday: number
    newWeek: number
    activeSubscriptions: number
    tierCounts: Record<string, number>
  }
  error?: string
}> {
  try {
    await checkAdmin()
    const supabase = await createClient()

    const now = new Date()
    const todayStart = new Date(now.setHours(0, 0, 0, 0)).toISOString()
    const weekAgo = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString()

    const [
      { count: totalCount },
      { count: newTodayCount },
      { count: newWeekCount },
      { count: activeSubsCount },
      { data: freeCount },
      { data: basicCount },
      { data: proCount },
      { data: eliteCount }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active'),
      // Считаем тиры отдельно через head запросы, чтобы не выкачивать все данные
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_tier', 'free'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_tier', 'basic'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_tier', 'pro'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_tier', 'elite'),
    ])

    const tierCounts = {
      free: (freeCount as any)?.count || 0,
      basic: (basicCount as any)?.count || 0,
      pro: (proCount as any)?.count || 0,
      elite: (eliteCount as any)?.count || 0,
    }

    return { 
      success: true, 
      stats: {
        total: totalCount || 0,
        newToday: newTodayCount || 0,
        newWeek: newWeekCount || 0,
        activeSubscriptions: activeSubsCount || 0,
        tierCounts
      }
    }
  } catch (error: any) {
    console.error('Error in getUsersStats:', error)
    return { success: false, error: error.message }
  }
}
