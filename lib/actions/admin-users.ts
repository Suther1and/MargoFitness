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
}): Promise<{ success: boolean; users?: ProfileWithBonuses[]; error?: string }> {
  try {
    await checkAdmin()
    const supabase = await createClient()

    // Сначала получаем профили
    let profileQuery = supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    // Применяем фильтры
    if (filters?.role && filters.role !== 'all') {
      profileQuery = profileQuery.eq('role', filters.role as 'user' | 'admin')
    }
    if (filters?.tier && filters.tier !== 'all') {
      profileQuery = profileQuery.eq('subscription_tier', filters.tier as any)
    }
    if (filters?.status && filters.status !== 'all') {
      profileQuery = profileQuery.eq('subscription_status', filters.status as any)
    }
    if (filters?.search) {
      profileQuery = profileQuery.ilike('email', `%${filters.search}%`)
    }

    const { data: profiles, error: profileError } = await profileQuery

    if (profileError) {
      console.error('Error fetching users:', profileError)
      return { success: false, error: profileError.message }
    }

    // Получаем все бонусные счета с фильтром по уровню кешбека
    let bonusQuery = supabase
      .from('user_bonuses')
      .select('user_id, balance, cashback_level, total_spent_for_cashback')

    if (filters?.cashback_level && filters.cashback_level !== 'all') {
      bonusQuery = bonusQuery.eq('cashback_level', parseInt(filters.cashback_level))
    }

    const { data: bonuses, error: bonusError } = await bonusQuery

    if (bonusError) {
      console.error('Error fetching bonuses:', bonusError)
      // Не прерываем выполнение, просто логируем
    }

    // Создаем Map для быстрого доступа
    const bonusMap = new Map(
      bonuses?.map((b: any) => [b.user_id, b]) || []
    )

    // Объединяем данные
    let usersWithBonuses: ProfileWithBonuses[] = profiles?.map((user: any) => {
      const userBonuses = bonusMap.get(user.id)
      return {
        ...user,
        bonus_balance: userBonuses?.balance ?? 0,
        cashback_level: userBonuses?.cashback_level ?? 1,
        total_spent_for_cashback: userBonuses?.total_spent_for_cashback ?? 0,
      }
    }) || []

    // Если есть фильтр по уровню кешбека, фильтруем пользователей у которых нет бонусного счета
    if (filters?.cashback_level && filters.cashback_level !== 'all') {
      const targetLevel = parseInt(filters.cashback_level)
      usersWithBonuses = usersWithBonuses.filter((user: any) => user.cashback_level === targetLevel)
    }

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
    const adminProfile = await checkAdmin()
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
      // Если меняется баланс, создаем транзакцию
      if (data.bonus_balance !== undefined) {
        // Получаем текущий баланс
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

        // Создаем транзакцию только если есть изменение
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

      // Обновляем бонусный счет
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
    revalidatePath('/dashboard/bonuses')

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
      admins: users.filter((u: any) => u.role === 'admin').length,
      activeSubscriptions: users.filter((u: any) => u.subscription_status === 'active').length,
      tierCounts: {
        free: users.filter((u: any) => u.subscription_tier === 'free').length,
        basic: users.filter((u: any) => u.subscription_tier === 'basic').length,
        pro: users.filter((u: any) => u.subscription_tier === 'pro').length,
        elite: users.filter((u: any) => u.subscription_tier === 'elite').length,
      }
    }

    return { success: true, stats }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

