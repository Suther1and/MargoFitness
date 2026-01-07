'use server'

import { createClient } from '@/lib/supabase/server'
import {
  Achievement,
  UserAchievement,
  AchievementWithStatus,
  AchievementStats,
  AchievementCategory,
} from '@/types/database'
import { revalidatePath } from 'next/cache'

// ============================================
// Получение данных
// ============================================

/**
 * Получить все достижения
 */
export async function getAllAchievements(): Promise<{
  success: boolean
  data?: Achievement[]
  error?: string
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching achievements:', error)
    return { success: false, error: 'Не удалось получить достижения' }
  }

  return { success: true, data }
}

/**
 * Получить полученные достижения пользователя
 */
export async function getUserAchievements(userId: string): Promise<{
  success: boolean
  data?: UserAchievement[]
  error?: string
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_achievements')
    .select('*')
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false })

  if (error) {
    console.error('Error fetching user achievements:', error)
    return { success: false, error: 'Не удалось получить достижения пользователя' }
  }

  return { success: true, data }
}

/**
 * Получить последние N достижений для виджета
 */
export async function getRecentAchievements(
  userId: string,
  limit: number = 3
): Promise<{
  success: boolean
  data?: AchievementWithStatus[]
  error?: string
}> {
  const supabase = await createClient()

  const { data: userAchievements, error: userError } = await supabase
    .from('user_achievements')
    .select('*, achievement:achievements(*)')
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false })
    .limit(limit)

  if (userError) {
    console.error('Error fetching recent achievements:', userError)
    return { success: false, error: 'Не удалось получить последние достижения' }
  }

  const data = userAchievements.map((ua: any) => ({
    ...ua.achievement,
    isUnlocked: true,
    unlockedAt: ua.unlocked_at,
  }))

  return { success: true, data }
}

/**
 * Получить все достижения со статусом разблокировки
 */
export async function getAllAchievementsWithStatus(userId: string): Promise<{
  success: boolean
  data?: AchievementWithStatus[]
  error?: string
}> {
  const supabase = await createClient()

  // Получаем все достижения
  const { data: allAchievements, error: achievementsError } = await supabase
    .from('achievements')
    .select('*')
    .order('sort_order', { ascending: true })

  if (achievementsError) {
    console.error('Error fetching all achievements:', achievementsError)
    return { success: false, error: 'Не удалось получить достижения' }
  }

  // Получаем полученные достижения пользователя
  const { data: userAchievements, error: userError } = await supabase
    .from('user_achievements')
    .select('*')
    .eq('user_id', userId)

  if (userError) {
    console.error('Error fetching user achievements:', userError)
    return { success: false, error: 'Не удалось получить достижения пользователя' }
  }

  // Создаем Map для быстрого поиска
  const unlockedMap = new Map(
    userAchievements.map(ua => [ua.achievement_id, ua.unlocked_at])
  )

  // Объединяем данные
  const data: AchievementWithStatus[] = allAchievements.map(achievement => ({
    ...achievement,
    isUnlocked: unlockedMap.has(achievement.id),
    unlockedAt: unlockedMap.get(achievement.id) || null,
  }))

  return { success: true, data }
}

/**
 * Получить статистику достижений
 */
export async function getAchievementStats(userId: string): Promise<{
  success: boolean
  data?: AchievementStats
  error?: string
}> {
  const supabase = await createClient()

  // Получаем общее количество достижений
  const { count: totalCount, error: totalError } = await supabase
    .from('achievements')
    .select('*', { count: 'exact', head: true })

  if (totalError) {
    console.error('Error counting achievements:', totalError)
    return { success: false, error: 'Не удалось получить статистику' }
  }

  // Получаем полученные достижения
  const { data: userAchievements, error: userError } = await supabase
    .from('user_achievements')
    .select('*')
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false })
    .limit(10)

  if (userError) {
    console.error('Error fetching user achievements:', userError)
    return { success: false, error: 'Не удалось получить статистику' }
  }

  const total = totalCount || 0
  const unlocked = userAchievements.length
  const percentage = total > 0 ? Math.round((unlocked / total) * 100) : 0

  return {
    success: true,
    data: {
      total,
      unlocked,
      percentage,
      recentUnlocked: userAchievements,
    },
  }
}

// ============================================
// Разблокировка достижений
// ============================================

/**
 * Разблокировать конкретное достижение (внутренняя функция)
 */
async function unlockAchievementInternal(
  userId: string,
  achievementId: string,
  supabase: any
): Promise<{
  success: boolean
  achievement?: Achievement
  reward?: number
  error?: string
}> {
  try {
    // Используем RPC функцию для безопасной разблокировки
    const { data: unlocked, error: rpcError } = await supabase.rpc(
      'unlock_achievement_for_user',
      {
        p_user_id: userId,
        p_achievement_id: achievementId,
      }
    )

    if (rpcError) {
      console.error('RPC error unlocking achievement:', rpcError)
      return { success: false, error: 'Ошибка при разблокировке достижения' }
    }

    // Если уже разблокировано
    if (!unlocked) {
      return { success: false, error: 'Достижение уже получено' }
    }

    // Получаем информацию о достижении
    const { data: achievement, error: achError } = await supabase
      .from('achievements')
      .select('*')
      .eq('id', achievementId)
      .single()

    if (achError || !achievement) {
      console.error('Error fetching achievement:', achError)
      return { success: false, error: 'Не удалось получить информацию о достижении' }
    }

    return {
      success: true,
      achievement,
      reward: achievement.reward_amount,
    }
  } catch (error) {
    console.error('Error in unlockAchievementInternal:', error)
    return { success: false, error: 'Ошибка при разблокировке достижения' }
  }
}

/**
 * Разблокировать достижение вручную (для админов)
 */
export async function unlockAchievement(
  userId: string,
  achievementId: string
): Promise<{
  success: boolean
  achievement?: Achievement
  reward?: number
  error?: string
}> {
  const supabase = await createClient()

  // Проверяем права админа
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Необходимо авторизоваться' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { success: false, error: 'Недостаточно прав' }
  }

  const result = await unlockAchievementInternal(userId, achievementId, supabase)

  if (result.success) {
    revalidatePath('/dashboard/health-tracker')
    revalidatePath('/dashboard/bonuses')
  }

  return result
}

// ============================================
// Проверка условий достижений
// ============================================

/**
 * Проверить и разблокировать все подходящие достижения
 */
export async function checkAndUnlockAchievements(userId: string): Promise<{
  success: boolean
  newAchievements?: Achievement[]
  error?: string
}> {
  const supabase = await createClient()

  try {
    const newAchievements: Achievement[] = []

    // Проверяем каждую категорию
    const streakResults = await checkStreakAchievements(userId, supabase)
    const metricResults = await checkMetricAchievements(userId, supabase)
    const habitResults = await checkHabitAchievements(userId, supabase)
    const weightResults = await checkWeightAchievements(userId, supabase)
    const consistencyResults = await checkConsistencyAchievements(userId, supabase)

    // Собираем все новые достижения
    const allResults = [
      ...streakResults,
      ...metricResults,
      ...habitResults,
      ...weightResults,
      ...consistencyResults,
    ]

    for (const achievementId of allResults) {
      const result = await unlockAchievementInternal(userId, achievementId, supabase)
      if (result.success && result.achievement) {
        newAchievements.push(result.achievement)
      }
    }

    if (newAchievements.length > 0) {
      revalidatePath('/dashboard/health-tracker')
      revalidatePath('/dashboard/bonuses')
    }

    return { success: true, newAchievements }
  } catch (error) {
    console.error('Error in checkAndUnlockAchievements:', error)
    return { success: false, error: 'Ошибка при проверке достижений' }
  }
}

// ============================================
// Проверщики условий по категориям
// ============================================

/**
 * Проверка достижений категории "Серии"
 */
async function checkStreakAchievements(
  userId: string,
  supabase: any
): Promise<string[]> {
  const achievementIds: string[] = []

  try {
    // Получаем настройки дневника для текущей серии
    const { data: settings } = await supabase
      .from('diary_settings')
      .select('streaks')
      .eq('user_id', userId)
      .single()

    if (!settings?.streaks?.current) {
      return achievementIds
    }

    const currentStreak = settings.streaks.current

    // Получаем достижения категории streaks, которые еще не получены
    const { data: achievements } = await supabase
      .from('achievements')
      .select('id, metadata')
      .eq('category', 'streaks')
      .not('id', 'in', `(SELECT achievement_id FROM user_achievements WHERE user_id = '${userId}')`)

    if (!achievements) {
      return achievementIds
    }

    // Проверяем условия
    for (const achievement of achievements) {
      const metadata = achievement.metadata as any
      if (metadata.type === 'streak_days' && currentStreak >= metadata.value) {
        achievementIds.push(achievement.id)
      }
    }
  } catch (error) {
    console.error('Error checking streak achievements:', error)
  }

  return achievementIds
}

/**
 * Проверка достижений категории "Метрики"
 */
async function checkMetricAchievements(
  userId: string,
  supabase: any
): Promise<string[]> {
  const achievementIds: string[] = []

  try {
    // Получаем последнюю запись дневника
    const { data: latestEntry } = await supabase
      .from('diary_entries')
      .select('metrics')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(1)
      .single()

    // Получаем все записи для подсчета общих значений
    const { data: allEntries } = await supabase
      .from('diary_entries')
      .select('metrics')
      .eq('user_id', userId)

    if (!latestEntry && !allEntries) {
      return achievementIds
    }

    const metrics = latestEntry?.metrics as any || {}
    
    // Подсчитываем общие значения
    let totalWater = 0
    let totalSteps = 0
    
    if (allEntries) {
      for (const entry of allEntries) {
        const m = entry.metrics as any
        totalWater += m?.water || 0
        totalSteps += m?.steps || 0
      }
    }

    // Получаем неполученные достижения категории metrics
    const { data: achievements } = await supabase
      .from('achievements')
      .select('id, metadata')
      .eq('category', 'metrics')
      .not('id', 'in', `(SELECT achievement_id FROM user_achievements WHERE user_id = '${userId}')`)

    if (!achievements) {
      return achievementIds
    }

    // Проверяем условия
    for (const achievement of achievements) {
      const metadata = achievement.metadata as any
      
      if (metadata.type === 'water_daily' && metrics.water >= metadata.value) {
        achievementIds.push(achievement.id)
      } else if (metadata.type === 'water_total' && totalWater >= metadata.value) {
        achievementIds.push(achievement.id)
      } else if (metadata.type === 'steps_daily' && metrics.steps >= metadata.value) {
        achievementIds.push(achievement.id)
      } else if (metadata.type === 'steps_total' && totalSteps >= metadata.value) {
        achievementIds.push(achievement.id)
      } else if (metadata.type === 'sleep_daily' && metrics.sleep >= metadata.value) {
        achievementIds.push(achievement.id)
      } else if (metadata.type === 'sleep_low' && metrics.sleep && metrics.sleep < metadata.value) {
        achievementIds.push(achievement.id)
      }
    }
  } catch (error) {
    console.error('Error checking metric achievements:', error)
  }

  return achievementIds
}

/**
 * Проверка достижений категории "Привычки"
 */
async function checkHabitAchievements(
  userId: string,
  supabase: any
): Promise<string[]> {
  const achievementIds: string[] = []

  try {
    // Получаем последнюю запись дневника с привычками
    const { data: latestEntry } = await supabase
      .from('diary_entries')
      .select('metrics')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(1)
      .single()

    if (!latestEntry) {
      return achievementIds
    }

    const metrics = latestEntry.metrics as any
    const habits = metrics?.habits || []

    // Получаем неполученные достижения категории habits
    const { data: achievements } = await supabase
      .from('achievements')
      .select('id, metadata')
      .eq('category', 'habits')
      .not('id', 'in', `(SELECT achievement_id FROM user_achievements WHERE user_id = '${userId}')`)

    if (!achievements) {
      return achievementIds
    }

    // Проверяем условия (упрощенная версия)
    for (const achievement of achievements) {
      const metadata = achievement.metadata as any
      
      if (metadata.type === 'habit_complete_any' && habits.length > 0) {
        achievementIds.push(achievement.id)
      }
    }
  } catch (error) {
    console.error('Error checking habit achievements:', error)
  }

  return achievementIds
}

/**
 * Проверка достижений категории "Вес"
 */
async function checkWeightAchievements(
  userId: string,
  supabase: any
): Promise<string[]> {
  const achievementIds: string[] = []

  try {
    // Получаем записи с весом
    const { data: weightEntries } = await supabase
      .from('diary_entries')
      .select('metrics, date')
      .eq('user_id', userId)
      .not('metrics->weight', 'is', null)
      .order('date', { ascending: false })

    if (!weightEntries || weightEntries.length === 0) {
      return achievementIds
    }

    // Получаем целевой вес из настроек
    const { data: settings } = await supabase
      .from('diary_settings')
      .select('goals')
      .eq('user_id', userId)
      .single()

    const goalWeight = settings?.goals?.weight

    // Получаем неполученные достижения категории weight
    const { data: achievements } = await supabase
      .from('achievements')
      .select('id, metadata')
      .eq('category', 'weight')
      .not('id', 'in', `(SELECT achievement_id FROM user_achievements WHERE user_id = '${userId}')`)

    if (!achievements) {
      return achievementIds
    }

    // Проверяем условия
    for (const achievement of achievements) {
      const metadata = achievement.metadata as any
      
      if (metadata.type === 'weight_recorded' && weightEntries.length >= metadata.value) {
        achievementIds.push(achievement.id)
      } else if (metadata.type === 'weight_goal_reached' && goalWeight) {
        const latestWeight = (weightEntries[0].metrics as any)?.weight
        if (latestWeight && Math.abs(latestWeight - goalWeight) <= 1) {
          achievementIds.push(achievement.id)
        }
      }
    }
  } catch (error) {
    console.error('Error checking weight achievements:', error)
  }

  return achievementIds
}

/**
 * Проверка достижений категории "Регулярность"
 */
async function checkConsistencyAchievements(
  userId: string,
  supabase: any
): Promise<string[]> {
  const achievementIds: string[] = []

  try {
    // Получаем все записи пользователя
    const { data: allEntries } = await supabase
      .from('diary_entries')
      .select('date')
      .eq('user_id', userId)

    if (!allEntries) {
      return achievementIds
    }

    const totalEntries = allEntries.length

    // Получаем записи за текущий месяц
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const { data: monthEntries } = await supabase
      .from('diary_entries')
      .select('date')
      .eq('user_id', userId)
      .gte('date', monthStart.toISOString().split('T')[0])

    const monthlyEntries = monthEntries?.length || 0

    // Получаем неполученные достижения категории consistency
    const { data: achievements } = await supabase
      .from('achievements')
      .select('id, metadata')
      .eq('category', 'consistency')
      .not('id', 'in', `(SELECT achievement_id FROM user_achievements WHERE user_id = '${userId}')`)

    if (!achievements) {
      return achievementIds
    }

    // Проверяем условия
    for (const achievement of achievements) {
      const metadata = achievement.metadata as any
      
      if (metadata.type === 'total_entries' && totalEntries >= metadata.value) {
        achievementIds.push(achievement.id)
      } else if (metadata.type === 'monthly_entries' && monthlyEntries >= metadata.value) {
        achievementIds.push(achievement.id)
      }
    }
  } catch (error) {
    console.error('Error checking consistency achievements:', error)
  }

  return achievementIds
}

