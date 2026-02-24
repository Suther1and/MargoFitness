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

    // Сначала получаем профили
    let profileQuery = supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url, role, subscription_tier, subscription_status, subscription_expires_at, created_at')
      .order('created_at', { ascending: false })

    // Применяем фильтры
    if (filters?.role && filters.role !== 'all') {
      profileQuery = profileQuery.eq('role', filters.role)
    }
    if (filters?.tier && filters.tier !== 'all') {
      profileQuery = profileQuery.eq('subscription_tier', filters.tier)
    }
    if (filters?.status && filters.status !== 'all') {
      profileQuery = profileQuery.eq('subscription_status', filters.status)
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
      console.error('Error fetching users:', {
        code: profileError.code,
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint
      })
      return { success: false, error: profileError.message }
    }

    if (!profiles || profiles.length === 0) {
      return { success: true, users: [] }
    }

    const userIds = profiles.map(p => p.id)
    const { data: bonuses, error: bonusError } = await supabase
      .from('user_bonuses')
      .select('user_id, balance, cashback_level, total_spent_for_cashback')
      .in('user_id', userIds)

    if (bonusError) {
      console.error('Error fetching bonuses:', bonusError)
    }

    const bonusMap = new Map(
      bonuses?.map((b: any) => [b.user_id, b]) || []
    )

    let usersWithBonuses: ProfileWithBonuses[] = profiles.map((user: any) => {
      const userBonuses = bonusMap.get(user.id)
      return {
        ...user,
        bonus_balance: userBonuses?.balance ?? 0,
        cashback_level: userBonuses?.cashback_level ?? 1,
        total_spent_for_cashback: userBonuses?.total_spent_for_cashback ?? 0,
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

    // Используем параллельные запросы count вместо загрузки всех данных
    const now = new Date()
    const todayStart = new Date(now.setHours(0, 0, 0, 0)).toISOString()
    const weekAgo = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString()

    const [
      { count: totalCount },
      { count: newTodayCount },
      { count: newWeekCount },
      { count: activeSubsCount },
      { data: tiersData }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active'),
      supabase.from('profiles').select('subscription_tier')
    ])

    const tierCounts = {
      free: tiersData?.filter(u => u.subscription_tier === 'free').length || 0,
      basic: tiersData?.filter(u => u.subscription_tier === 'basic').length || 0,
      pro: tiersData?.filter(u => u.subscription_tier === 'pro').length || 0,
      elite: tiersData?.filter(u => u.subscription_tier === 'elite').length || 0,
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
