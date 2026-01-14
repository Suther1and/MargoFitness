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
    .select('id, title, description, category, is_secret, reward_amount, icon, icon_url, color_class, metadata, sort_order, created_at')
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
    .select('*, achievement:achievements(id, title, description, category, is_secret, reward_amount, icon, icon_url, color_class, metadata, sort_order, created_at)')
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
 * Получить все достижения со статусом разблокировки и прогрессом
 */
export async function getAllAchievementsWithStatus(userId: string): Promise<{
  success: boolean
  data?: AchievementWithProgress[]
  error?: string
}> {
  const supabase = await createClient()

  try {
    // 1. Получаем все достижения
    const { data: allAchievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('id, title, description, category, is_secret, reward_amount, icon, icon_url, color_class, metadata, sort_order, created_at')
      .order('sort_order', { ascending: true })

    if (achievementsError) {
      console.error('Error fetching all achievements:', achievementsError)
      return { success: false, error: 'Не удалось получить достижения' }
    }

    // 2. Получаем полученные достижения пользователя
    const { data: userAchievements, error: userError } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)

    if (userError) {
      console.error('Error fetching user achievements:', userError)
      return { success: false, error: 'Не удалось получить достижения пользователя' }
    }

    const unlockedMap = new Map(
      userAchievements.map(ua => [ua.achievement_id, ua.unlocked_at])
    )

    // 3. Собираем данные для расчета прогресса
    // Используем отдельные запросы с обработкой ошибок для каждого
    const [
      statsRes,
      settingsRes,
      latestEntryRes,
      allEntriesRes,
      monthEntriesRes,
      profileRes
    ] = await Promise.all([
      supabase.rpc('get_user_metrics_stats', { p_user_id: userId }),
      supabase.from('diary_settings').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('diary_entries').select('metrics, habits_completed').eq('user_id', userId).order('date', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('diary_entries').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('diary_entries').select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]),
      supabase.from('profiles').select('full_name, phone, email, avatar_url, subscription_tier').eq('id', userId).maybeSingle()
    ])

    // Логируем ошибки если они есть
    if (statsRes.error) console.error('[Achievements] Stats error:', statsRes.error)
    if (settingsRes.error) console.error('[Achievements] Settings error:', settingsRes.error)
    if (profileRes.error) console.error('[Achievements] Profile error:', profileRes.error)

    const metricsStats = statsRes.data?.[0] || { total_water: 0, total_steps: 0, energy_max_count: 0 }
    const settings = settingsRes.data
    const profile = profileRes.data
    const latestEntry = latestEntryRes.data
    const currentMetrics = latestEntry?.metrics as any || {}
    const habitsCompleted = latestEntry?.habits_completed as any || {}
    const currentStreak = settings?.streaks?.current || 0
    const totalEntries = allEntriesRes.count || 0
    const monthlyEntries = monthEntriesRes.count || 0

    const tierLevels: Record<string, number> = { 'free': 0, 'basic': 1, 'pro': 2, 'elite': 3 }
    const currentTierLevel = tierLevels[profile?.subscription_tier || 'free'] || 0
    
    // 4. Объединяем данные и считаем прогресс
    const data: AchievementWithProgress[] = allAchievements.map(achievement => {
      const isUnlocked = unlockedMap.has(achievement.id)
      const unlockedAt = unlockedMap.get(achievement.id) || null
      const metadata = achievement.metadata as any
      
      let currentValue = 0
      let targetValue = metadata?.value || 0
      let progressData: any = null

      if (!isUnlocked && metadata) {
        switch (metadata.type) {
          case 'streak_days':
            currentValue = currentStreak
            break
          case 'water_daily':
            currentValue = currentMetrics.waterIntake || 0
            break
          case 'water_total':
            currentValue = metricsStats.total_water
            break
          case 'steps_daily':
            currentValue = currentMetrics.steps || 0
            break
          case 'steps_total':
            currentValue = metricsStats.total_steps
            break
          case 'energy_max':
            currentValue = metricsStats.energy_max_count
            break
          case 'total_entries':
            currentValue = totalEntries
            break
          case 'monthly_entries':
            currentValue = monthlyEntries
            break
          case 'habits_created':
            currentValue = settings?.habits?.length || 0
            break
          case 'habit_complete_any':
            currentValue = Object.values(habitsCompleted).some(v => v === true) ? 1 : 0
            targetValue = 1
            break
          case 'achievement_count':
            currentValue = unlockedMap.size
            if (targetValue === 0) targetValue = allAchievements.length
            break
          case 'profile_complete':
            const fields = [
              { label: 'Имя', done: !!profile?.full_name },
              { label: 'Телефон', done: !!profile?.phone },
              { label: 'Почта', done: !!profile?.email },
              { label: 'Аватар', done: !!profile?.avatar_url },
              { label: 'Вес', done: !!settings?.user_params?.weight },
              { label: 'Рост', done: !!settings?.user_params?.height },
              { label: 'Возраст', done: !!settings?.user_params?.age },
            ]
            currentValue = fields.filter(f => f.done).length
            targetValue = fields.length
            progressData = { fields }
            break
          case 'subscription_tier':
            currentValue = currentTierLevel
            targetValue = tierLevels[metadata.value] || 0
            break
          case 'weight_goal_reached':
            currentValue = 0 // Бинарная цель
            targetValue = 1
            break
          case 'registration':
            currentValue = 1
            targetValue = 1
            break
        }
      }

      // Если разблокировано, прогресс 100%
      if (isUnlocked) {
        currentValue = targetValue
      }

      const progress = targetValue > 0 ? Math.min(100, Math.round((currentValue / targetValue) * 100)) : 0

      return {
        ...achievement,
        isUnlocked,
        unlockedAt,
        currentValue,
        targetValue,
        progress,
        progressData
      }
    })

    return { success: true, data }
  } catch (error) {
    console.error('Error in getAllAchievementsWithStatus:', error)
    return { success: false, error: 'Ошибка при расчете прогресса достижений' }
  }
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
      .select('id, title, description, category, is_secret, reward_amount, icon, icon_url, color_class, metadata, sort_order, created_at')
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
    console.log('[Achievements] Checking achievements for user:', userId)
    
    const newAchievements: Achievement[] = []

    // КРИТИЧЕСКИ ВАЖНО: Получаем уже полученные достижения ОДИН РАз
    const { data: userAchievements, error: userAchError } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId)

    if (userAchError) {
      console.error('[Achievements] Error fetching user achievements:', userAchError)
      return { success: false, error: 'Ошибка при получении достижений пользователя' }
    }

    const unlockedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || [])
    console.log('[Achievements] Already unlocked:', unlockedIds.size, 'achievements')

    // Проверяем каждую категорию, передавая Set полученных ID
    const streakResults = await checkStreakAchievements(userId, supabase, unlockedIds)
    const metricResults = await checkMetricAchievements(userId, supabase, unlockedIds)
    const habitResults = await checkHabitAchievements(userId, supabase, unlockedIds)
    const weightResults = await checkWeightAchievements(userId, supabase, unlockedIds)
    const consistencyResults = await checkConsistencyAchievements(userId, supabase, unlockedIds)
    const specialResults = await checkSpecialAchievements(userId, supabase, unlockedIds)
    const socialResults = await checkSocialAchievements(userId, supabase, unlockedIds)

    console.log('[Achievements] Found achievements to check:', {
      streaks: streakResults.length,
      metrics: metricResults.length,
      habits: habitResults.length,
      weight: weightResults.length,
      consistency: consistencyResults.length,
      special: specialResults.length,
      social: socialResults.length,
    })

    // Собираем все новые достижения
    const allResults = [
      ...streakResults,
      ...metricResults,
      ...habitResults,
      ...weightResults,
      ...consistencyResults,
      ...specialResults,
      ...socialResults,
    ]

    console.log('[Achievements] Total achievements to unlock:', allResults.length)

    for (const achievementId of allResults) {
      const result = await unlockAchievementInternal(userId, achievementId, supabase)
      if (result.success && result.achievement) {
        console.log('[Achievements] ✅ Unlocked:', result.achievement.title)
        newAchievements.push(result.achievement)
      } else if (!result.success) {
        console.log('[Achievements] ❌ Failed to unlock:', achievementId, result.error)
      }
    }

    if (newAchievements.length > 0) {
      console.log('[Achievements] 🎉 Total new achievements:', newAchievements.length)
      revalidatePath('/dashboard/health-tracker')
      revalidatePath('/dashboard/bonuses')
    } else {
      console.log('[Achievements] No new achievements earned')
    }

    return { success: true, newAchievements }
  } catch (error) {
    console.error('[Achievements] Error in checkAndUnlockAchievements:', error)
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
  supabase: any,
  unlockedIds: Set<string>
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
      console.log('[Achievements:Streaks] No current streak found')
      return achievementIds
    }

    const currentStreak = settings.streaks.current
    console.log('[Achievements:Streaks] Current streak:', currentStreak)

    // Получаем ВСЕ достижения категории streaks
    const { data: allAchievements, error: achError } = await supabase
      .from('achievements')
      .select('id, metadata')
      .eq('category', 'streaks')

    if (achError || !allAchievements) {
      console.error('[Achievements:Streaks] Error fetching achievements:', achError)
      return achievementIds
    }

    // Фильтруем уже полученные в JavaScript
    const achievements = allAchievements.filter((a: { id: string }) => !unlockedIds.has(a.id))
    console.log('[Achievements:Streaks] Checking', achievements.length, 'achievements')

    // Проверяем условия
    for (const achievement of achievements) {
      const metadata = achievement.metadata as any
      if (metadata.type === 'streak_days' && currentStreak >= metadata.value) {
        console.log('[Achievements:Streaks] ✅ Earned:', achievement.id, `(${currentStreak}>=${metadata.value})`)
        achievementIds.push(achievement.id)
      }
    }
  } catch (error) {
    console.error('[Achievements:Streaks] Error checking streak achievements:', error)
  }

  return achievementIds
}

/**
 * Проверка достижений категории "Метрики"
 */
async function checkMetricAchievements(
  userId: string,
  supabase: any,
  unlockedIds: Set<string>
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

    // Используем RPC для эффективного подсчета суммарных метрик
    const { data: stats, error: statsError } = await supabase.rpc('get_user_metrics_stats', {
      p_user_id: userId
    })

    if (statsError) {
      console.error('[Achievements:Metrics] Error calling get_user_metrics_stats RPC:', statsError)
    }

    const metrics = latestEntry?.metrics as any || {}
    
    // Подсчитываем общие значения (с фолбеком на случай если RPC не сработал)
    let totalWater = stats?.[0]?.total_water || 0
    let totalSteps = stats?.[0]?.total_steps || 0
    let energyMaxCount = stats?.[0]?.energy_max_count || 0

    // Если RPC вернул null/ошибку, считаем по старинке (фолбек для надежности)
    if (statsError || !stats || stats.length === 0) {
      const { data: allEntries } = await supabase
        .from('diary_entries')
        .select('metrics')
        .eq('user_id', userId)

      if (allEntries) {
        totalWater = 0
        totalSteps = 0
        energyMaxCount = 0
        for (const entry of allEntries) {
          const m = entry.metrics as any
          totalWater += m?.waterIntake || 0
          totalSteps += m?.steps || 0
          if (m?.energyLevel === 5) energyMaxCount++
        }
      }
    }

    console.log('[Achievements:Metrics] Latest:', {
      waterIntake: metrics.waterIntake,
      steps: metrics.steps,
      sleepHours: metrics.sleepHours
    }, 'Total water:', totalWater, 'Total steps:', totalSteps, 'Energy max count:', energyMaxCount)

    // Получаем ВСЕ достижения категории metrics
    const { data: allAchievements, error: achError } = await supabase
      .from('achievements')
      .select('id, metadata')
      .eq('category', 'metrics')

    if (achError || !allAchievements) {
      console.error('[Achievements:Metrics] Error fetching achievements:', achError)
      return achievementIds
    }

    // Фильтруем уже полученные
    const achievements = allAchievements.filter((a: { id: string }) => !unlockedIds.has(a.id))
    console.log('[Achievements:Metrics] Checking', achievements.length, 'achievements')

    // Проверяем условия
    for (const achievement of achievements) {
      const metadata = achievement.metadata as any
      
      if (metadata.type === 'water_daily') {
        const currentWater = metrics.waterIntake || 0  // ИСПРАВЛЕНО: было metrics.water
        const requiredWater = metadata.value
        console.log('[Achievements:Metrics] 💧 Water daily check:', {
          achievementId: achievement.id,
          current: currentWater,
          required: requiredWater,
          passed: currentWater >= requiredWater
        })
        if (currentWater >= requiredWater) {
          console.log('[Achievements:Metrics] ✅ Water daily earned:', achievement.id)
          achievementIds.push(achievement.id)
        }
      } else if (metadata.type === 'water_total' && totalWater >= metadata.value) {
        console.log('[Achievements:Metrics] ✅ Water total:', achievement.id)
        achievementIds.push(achievement.id)
      } else if (metadata.type === 'steps_daily') {
        const currentSteps = metrics.steps || 0
        const requiredSteps = metadata.value
        console.log('[Achievements:Metrics] 👟 Steps daily check:', {
          achievementId: achievement.id,
          current: currentSteps,
          required: requiredSteps,
          passed: currentSteps >= requiredSteps
        })
        if (currentSteps >= requiredSteps) {
          console.log('[Achievements:Metrics] ✅ Steps daily earned:', achievement.id)
          achievementIds.push(achievement.id)
        }
      } else if (metadata.type === 'steps_total' && totalSteps >= metadata.value) {
        console.log('[Achievements:Metrics] ✅ Steps total:', achievement.id)
        achievementIds.push(achievement.id)
      } else if (metadata.type === 'sleep_daily' && metrics.sleepHours >= metadata.value) {
        console.log('[Achievements:Metrics] ✅ Sleep daily:', achievement.id, `(${metrics.sleepHours}h >= ${metadata.value}h)`)
        achievementIds.push(achievement.id)
      } else if (metadata.type === 'sleep_low' && metrics.sleepHours && metrics.sleepHours < metadata.value) {
        console.log('[Achievements:Metrics] ✅ Sleep low:', achievement.id, `(${metrics.sleepHours}h < ${metadata.value}h)`)
        achievementIds.push(achievement.id)
      } else if (metadata.type === 'sleep_streak') {
        // Проверяем серию дней с достаточным сном
        const streakDays = metadata.value
        const requiredSleepHours = 8 // Для "Неделя сна"
        
        // Получаем последние N+5 дней для проверки серии
        const { data: recentSleepEntries } = await supabase
          .from('diary_entries')
          .select('date, metrics')
          .eq('user_id', userId)
          .not('metrics->sleepHours', 'is', null)
          .order('date', { ascending: false })
          .limit(streakDays + 5)
        
        if (recentSleepEntries && recentSleepEntries.length >= streakDays) {
          let currentStreak = 0
          let maxStreak = 0
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          
          // Сортируем по дате убывания
          const sortedEntries = [...recentSleepEntries].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          
          // Проверяем серию начиная с последнего дня
          for (let i = 0; i < sortedEntries.length; i++) {
            const entry = sortedEntries[i]
            const entryDate = new Date(entry.date)
            entryDate.setHours(0, 0, 0, 0)
            
            const expectedDate = new Date(today)
            expectedDate.setDate(today.getDate() - i)
            expectedDate.setHours(0, 0, 0, 0)
            
            const sleepHours = (entry.metrics as any)?.sleepHours || 0
            
            if (entryDate.getTime() === expectedDate.getTime() && sleepHours >= requiredSleepHours) {
              currentStreak++
              maxStreak = Math.max(maxStreak, currentStreak)
            } else if (entryDate.getTime() !== expectedDate.getTime()) {
              break
            } else {
              break
            }
          }
          
          console.log('[Achievements:Metrics] 😴 Sleep streak check:', {
            achievementId: achievement.id,
            required: streakDays,
            currentStreak,
            maxStreak
          })
          
          if (currentStreak >= streakDays || maxStreak >= streakDays) {
            console.log('[Achievements:Metrics] ✅ Sleep streak:', achievement.id)
            achievementIds.push(achievement.id)
          }
        }
      } else if (metadata.type === 'energy_max' && energyMaxCount >= metadata.value) {
        console.log('[Achievements:Metrics] ✅ Energy max:', achievement.id, `(${energyMaxCount} >= ${metadata.value})`)
        achievementIds.push(achievement.id)
      } else if (metadata.type === 'water_goal_streak') {
        // Проверяем серию дней с достижением цели по воде
        const streakDays = metadata.value
        
        // Получаем цель по воде из настроек
        const { data: waterSettings } = await supabase
          .from('diary_settings')
          .select('widget_goals')
          .eq('user_id', userId)
          .single()
        
        const waterGoal = waterSettings?.widget_goals?.water || 2500
        
        // Получаем последние N+5 дней для проверки серии
        const { data: recentWaterEntries } = await supabase
          .from('diary_entries')
          .select('date, metrics')
          .eq('user_id', userId)
          .not('metrics->waterIntake', 'is', null)
          .order('date', { ascending: false })
          .limit(streakDays + 5)
        
        if (recentWaterEntries && recentWaterEntries.length >= streakDays) {
          let currentStreak = 0
          let maxStreak = 0
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          
          const sortedEntries = [...recentWaterEntries].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          
          for (let i = 0; i < sortedEntries.length; i++) {
            const entry = sortedEntries[i]
            const entryDate = new Date(entry.date)
            entryDate.setHours(0, 0, 0, 0)
            
            const expectedDate = new Date(today)
            expectedDate.setDate(today.getDate() - i)
            expectedDate.setHours(0, 0, 0, 0)
            
            const waterIntake = (entry.metrics as any)?.waterIntake || 0
            
            if (entryDate.getTime() === expectedDate.getTime() && waterIntake >= waterGoal) {
              currentStreak++
              maxStreak = Math.max(maxStreak, currentStreak)
            } else if (entryDate.getTime() !== expectedDate.getTime()) {
              break
            } else {
              break
            }
          }
          
          console.log('[Achievements:Metrics] 💦 Water goal streak check:', {
            achievementId: achievement.id,
            required: streakDays,
            goal: waterGoal,
            currentStreak,
            maxStreak
          })
          
          if (currentStreak >= streakDays || maxStreak >= streakDays) {
            console.log('[Achievements:Metrics] ✅ Water goal streak:', achievement.id)
            achievementIds.push(achievement.id)
          }
        }
      } else if (metadata.type === 'mood_great_streak') {
        // Проверяем серию дней с отличным настроением (5/5)
        const streakDays = metadata.value
        
        // Получаем последние N+5 дней для проверки серии
        const { data: recentMoodEntries } = await supabase
          .from('diary_entries')
          .select('date, metrics')
          .eq('user_id', userId)
          .not('metrics->mood', 'is', null)
          .order('date', { ascending: false })
          .limit(streakDays + 5)
        
        if (recentMoodEntries && recentMoodEntries.length >= streakDays) {
          let currentStreak = 0
          let maxStreak = 0
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          
          const sortedEntries = [...recentMoodEntries].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          
          for (let i = 0; i < sortedEntries.length; i++) {
            const entry = sortedEntries[i]
            const entryDate = new Date(entry.date)
            entryDate.setHours(0, 0, 0, 0)
            
            const expectedDate = new Date(today)
            expectedDate.setDate(today.getDate() - i)
            expectedDate.setHours(0, 0, 0, 0)
            
            const mood = (entry.metrics as any)?.mood || 0
            
            if (entryDate.getTime() === expectedDate.getTime() && mood === 5) {
              currentStreak++
              maxStreak = Math.max(maxStreak, currentStreak)
            } else if (entryDate.getTime() !== expectedDate.getTime()) {
              break
            } else {
              break
            }
          }
          
          console.log('[Achievements:Metrics] 😊 Mood great streak check:', {
            achievementId: achievement.id,
            required: streakDays,
            currentStreak,
            maxStreak
          })
          
          if (currentStreak >= streakDays || maxStreak >= streakDays) {
            console.log('[Achievements:Metrics] ✅ Mood great streak:', achievement.id)
            achievementIds.push(achievement.id)
          }
        }
      }
    }
  } catch (error) {
    console.error('[Achievements:Metrics] Error checking metric achievements:', error)
  }

  return achievementIds
}

/**
 * Проверка достижений категории "Привычки"
 */
async function checkHabitAchievements(
  userId: string,
  supabase: any,
  unlockedIds: Set<string>
): Promise<string[]> {
  const achievementIds: string[] = []

  try {
    // Получаем последнюю запись дневника с habits_completed
    const { data: latestEntry } = await supabase
      .from('diary_entries')
      .select('habits_completed')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(1)
      .single()

    if (!latestEntry) {
      console.log('[Achievements:Habits] No diary entries found')
      return achievementIds
    }

    const habitsCompleted = latestEntry.habits_completed as any
    console.log('[Achievements:Habits] Habits completed:', habitsCompleted)
    
    // Проверяем, есть ли хотя бы одна завершённая привычка
    const hasAnyCompleted = habitsCompleted && Object.values(habitsCompleted).some((v: any) => v === true)
    console.log('[Achievements:Habits] Has any completed:', hasAnyCompleted)

    // Получаем настройки привычек
    const { data: settings } = await supabase
      .from('diary_settings')
      .select('habits')
      .eq('user_id', userId)
      .single()

    const habitsCreated = settings?.habits?.length || 0
    const activeHabitIds = (settings?.habits || [])
      .filter((h: any) => h.enabled)
      .map((h: any) => h.id)
    
    console.log('[Achievements:Habits] Total habits created:', habitsCreated)
    console.log('[Achievements:Habits] Active habit IDs:', activeHabitIds)

    // Получаем все записи дневника с habits_completed для подсчёта статистики
    const { data: allEntries } = await supabase
      .from('diary_entries')
      .select('date, habits_completed')
      .eq('user_id', userId)
      .not('habits_completed', 'is', null)
      .order('date', { ascending: false })

    // Подсчитываем статистику
    let daysWithAllHabitsCompleted = 0
    let maxHabitsStreak = 0
    let currentHabitsStreak = 0
    let totalCompletions = 0

    if (allEntries && activeHabitIds.length > 0) {
      // Сортируем записи по дате от новых к старым
      const sortedEntries = [...allEntries].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )

      for (let i = 0; i < sortedEntries.length; i++) {
        const entry = sortedEntries[i]
        const completed = entry.habits_completed as any
        if (!completed) continue

        // Считаем общее количество выполнений
        const completedCount = Object.values(completed).filter((v: any) => v === true).length
        totalCompletions += completedCount

        // Проверяем, все ли активные привычки выполнены в этот день
        const allActiveCompleted = activeHabitIds.every((habitId: string) => completed[habitId] === true)
        
        if (allActiveCompleted) {
          daysWithAllHabitsCompleted++
          
          // Проверка на серию подряд
          if (i === 0 || isConsecutiveDates(sortedEntries[i-1].date, entry.date)) {
            currentHabitsStreak++
            maxHabitsStreak = Math.max(maxHabitsStreak, currentHabitsStreak)
          } else {
            currentHabitsStreak = 1
            maxHabitsStreak = Math.max(maxHabitsStreak, currentHabitsStreak)
          }
        } else {
          currentHabitsStreak = 0
        }
      }
    }

    console.log('[Achievements:Habits] Stats:', {
      totalCompletions,
      daysWithAllHabitsCompleted,
      maxHabitsStreak
    })

    // Получаем ВСЕ достижения категории habits
    const { data: allAchievements, error: achError } = await supabase
      .from('achievements')
      .select('id, metadata')
      .eq('category', 'habits')

    if (achError || !allAchievements) {
      console.error('[Achievements:Habits] Error fetching achievements:', achError)
      return achievementIds
    }

    // Фильтруем уже полученные
    const achievements = allAchievements.filter((a: { id: string }) => !unlockedIds.has(a.id))
    console.log('[Achievements:Habits] Checking', achievements.length, 'achievements')

    // Проверяем условия
    for (const achievement of achievements) {
      const metadata = achievement.metadata as any
      
      if (metadata.type === 'habit_complete_any' && hasAnyCompleted) {
        console.log('[Achievements:Habits] ✅ Habit complete any:', achievement.id)
        achievementIds.push(achievement.id)
      } else if (metadata.type === 'habits_created' && habitsCreated >= metadata.value) {
        console.log('[Achievements:Habits] ✅ Habits created:', achievement.id, `(${habitsCreated} >= ${metadata.value})`)
        achievementIds.push(achievement.id)
      } else if (metadata.type === 'habits_all_streak' && maxHabitsStreak >= metadata.value) {
        console.log('[Achievements:Habits] ✅ Habits all streak:', achievement.id, `(${maxHabitsStreak} >= ${metadata.value})`)
        achievementIds.push(achievement.id)
      } else if (metadata.type === 'habit_completions' && totalCompletions >= metadata.value) {
        console.log('[Achievements:Habits] ✅ Habit completions:', achievement.id, `(${totalCompletions} >= ${metadata.value})`)
        achievementIds.push(achievement.id)
      }
    }
  } catch (error) {
    console.error('[Achievements:Habits] Error checking habit achievements:', error)
  }

  return achievementIds
}

/**
 * Проверка достижений категории "Вес"
 */
async function checkWeightAchievements(
  userId: string,
  supabase: any,
  unlockedIds: Set<string>
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
      console.log('[Achievements:Weight] No weight entries found')
      return achievementIds
    }

    console.log('[Achievements:Weight] Found', weightEntries.length, 'weight entries')

    // Получаем целевой вес из настроек
    const { data: settings } = await supabase
      .from('diary_settings')
      .select('goals')
      .eq('user_id', userId)
      .single()

    const goalWeight = settings?.goals?.weight

    // Получаем ВСЕ достижения категории weight
    const { data: allAchievements, error: achError } = await supabase
      .from('achievements')
      .select('id, metadata')
      .eq('category', 'weight')

    if (achError || !allAchievements) {
      console.error('[Achievements:Weight] Error fetching achievements:', achError)
      return achievementIds
    }

    // Фильтруем уже полученные
    const achievements = allAchievements.filter((a: { id: string }) => !unlockedIds.has(a.id))
    console.log('[Achievements:Weight] Checking', achievements.length, 'achievements')

    // Проверяем условия
    for (const achievement of achievements) {
      const metadata = achievement.metadata as any
      
      if (metadata.type === 'weight_recorded' && weightEntries.length >= metadata.value) {
        console.log('[Achievements:Weight] ✅ Weight recorded:', achievement.id, `(${weightEntries.length} >= ${metadata.value})`)
        achievementIds.push(achievement.id)
      } else if (metadata.type === 'weight_streak') {
        // Проверяем серию записей веса
        const streakDays = metadata.value
        let currentStreak = 0
        let maxStreak = 0
        
        // Сортируем даты по убыванию
        const sortedEntries = [...weightEntries].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        
        // Проверяем непрерывность с последнего дня
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        for (let i = 0; i < sortedEntries.length; i++) {
          const entryDate = new Date(sortedEntries[i].date)
          entryDate.setHours(0, 0, 0, 0)
          
          const expectedDate = new Date(today)
          expectedDate.setDate(today.getDate() - i)
          expectedDate.setHours(0, 0, 0, 0)
          
          if (entryDate.getTime() === expectedDate.getTime()) {
            currentStreak++
            maxStreak = Math.max(maxStreak, currentStreak)
          } else {
            break
          }
        }
        
        console.log('[Achievements:Weight] Weight streak check:', {
          achievementId: achievement.id,
          required: streakDays,
          currentStreak,
          maxStreak
        })
        
        if (currentStreak >= streakDays || maxStreak >= streakDays) {
          console.log('[Achievements:Weight] ✅ Weight streak:', achievement.id)
          achievementIds.push(achievement.id)
        }
      } else if (metadata.type === 'weight_goal_reached') {
        // Проверяем, достигнут ли целевой вес
        if (goalWeight && weightEntries.length > 0) {
          const latestWeight = (weightEntries[0].metrics as any)?.weight
          
          // Проверяем текущий вес относительно цели
          // Мы считаем цель достигнутой, если текущий вес равен или "лучше" целевого
          // (меньше цели при похудении, больше при наборе)
          const startingWeight = (weightEntries[weightEntries.length - 1].metrics as any)?.weight
          const isLosing = startingWeight > goalWeight
          
          const reached = isLosing ? latestWeight <= goalWeight : latestWeight >= goalWeight
          
          if (reached) {
            console.log('[Achievements:Weight] ✅ Weight goal reached:', achievement.id, { latestWeight, goalWeight })
            achievementIds.push(achievement.id)
          }
        }
      } else if (metadata.type === 'weight_down_streak') {
        // Проверяем тренд на снижение веса N раз подряд
        const requiredStreak = metadata.value
        
        // Берем последние записи с весом (необязательно подряд по дням, а именно записи)
        const sortedEntries = [...weightEntries].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )

        if (sortedEntries.length >= requiredStreak) {
          let currentTrend = 1 // Первая запись всегда начало тренда
          
          for (let i = 0; i < sortedEntries.length - 1; i++) {
            const currentWeight = (sortedEntries[i].metrics as any)?.weight
            const nextWeight = (sortedEntries[i + 1].metrics as any)?.weight
            
            if (currentWeight !== undefined && nextWeight !== undefined && currentWeight <= nextWeight) {
              currentTrend++
              if (currentTrend >= requiredStreak) break
            } else {
              break // Тренд прерван
            }
          }

          console.log('[Achievements:Weight] Weight down trend check:', {
            achievementId: achievement.id,
            required: requiredStreak,
            currentTrend
          })

          if (currentTrend >= requiredStreak) {
            console.log('[Achievements:Weight] ✅ Weight down trend earned:', achievement.id)
            achievementIds.push(achievement.id)
          }
        }
      }
    }
  } catch (error) {
    console.error('[Achievements:Weight] Error checking weight achievements:', error)
  }

  return achievementIds
}

/**
 * Проверка достижений категории "Регулярность"
 */
async function checkConsistencyAchievements(
  userId: string,
  supabase: any,
  unlockedIds: Set<string>
): Promise<string[]> {
  const achievementIds: string[] = []

  try {
    // Получаем все записи пользователя
    const { data: allEntries } = await supabase
      .from('diary_entries')
      .select('date')
      .eq('user_id', userId)

    if (!allEntries) {
      console.log('[Achievements:Consistency] No diary entries found')
      return achievementIds
    }

    const totalEntries = allEntries.length
    console.log('[Achievements:Consistency] Total entries:', totalEntries)

    // Получаем записи за текущий месяц
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const { data: monthEntries } = await supabase
      .from('diary_entries')
      .select('date')
      .eq('user_id', userId)
      .gte('date', monthStart.toISOString().split('T')[0])

    const monthlyEntries = monthEntries?.length || 0
    console.log('[Achievements:Consistency] Monthly entries:', monthlyEntries)

    // Получаем ВСЕ достижения категории consistency
    const { data: allAchievements, error: achError } = await supabase
      .from('achievements')
      .select('id, metadata')
      .eq('category', 'consistency')

    if (achError || !allAchievements) {
      console.error('[Achievements:Consistency] Error fetching achievements:', achError)
      return achievementIds
    }

    // Фильтруем уже полученные
    const achievements = allAchievements.filter((a: { id: string }) => !unlockedIds.has(a.id))
    console.log('[Achievements:Consistency] Checking', achievements.length, 'achievements')

    // Проверяем условия
    for (const achievement of achievements) {
      const metadata = achievement.metadata as any
      
      if (metadata.type === 'total_entries' && totalEntries >= metadata.value) {
        console.log('[Achievements:Consistency] ✅ Total entries:', achievement.id, `(${totalEntries}>=${metadata.value})`)
        achievementIds.push(achievement.id)
      } else if (metadata.type === 'monthly_entries' && monthlyEntries >= metadata.value) {
        console.log('[Achievements:Consistency] ✅ Monthly entries:', achievement.id, `(${monthlyEntries}>=${metadata.value})`)
        achievementIds.push(achievement.id)
      }
    }
  } catch (error) {
    console.error('[Achievements:Consistency] Error checking consistency achievements:', error)
  }

  return achievementIds
}

/**
 * Проверка специальных достижений (Идеальный день, Перфекционист)
 */
async function checkSpecialAchievements(
  userId: string,
  supabase: any,
  unlockedIds: Set<string>
): Promise<string[]> {
  const achievementIds: string[] = []

  try {
    // Получаем ВСЕ специальные достижения
    const { data: allAchievements, error: achError } = await supabase
      .from('achievements')
      .select('id, metadata')
      .or('metadata->>type.eq.perfect_day,metadata->>type.eq.perfect_streak')

    if (achError || !allAchievements) return achievementIds

    // Фильтруем уже полученные
    const achievements = allAchievements.filter((a: { id: string }) => !unlockedIds.has(a.id))
    if (achievements.length === 0) return achievementIds

    // Получаем настройки пользователя из БД
    const { data: dbSettings } = await supabase
      .from('diary_settings')
      .select('enabled_widgets, widget_goals, widgets_in_daily_plan, goals, habits')
      .eq('user_id', userId)
      .single()

    if (!dbSettings) return achievementIds

    // Мапим БД формат в удобный формат настроек (аналог useTrackerSettings)
    const enabledWidgets = dbSettings.enabled_widgets || []
    const widgetGoals = dbSettings.widget_goals || {}
    const widgetsInPlan = dbSettings.widgets_in_daily_plan || []
    const customGoals = dbSettings.goals || {}
    const habits = dbSettings.habits || []

    const activeHabitIds = habits
      .filter((h: any) => h.enabled)
      .map((h: any) => h.id)

    // Вспомогательная функция для проверки достижения цели по питанию (аналог из UI)
    const isNutritionSuccess = (current: number, goal: number, goalType: string) => {
      const percentage = (current / goal) * 100;
      if (goalType === 'loss') return percentage >= 80 && percentage <= 100;
      if (goalType === 'maintain') return percentage >= 90 && percentage <= 110;
      if (goalType === 'gain') return percentage >= 100 && percentage <= 120;
      return false;
    };

    // Функция для проверки "Идеальности" конкретного дня
    const isPerfectDay = (entry: any) => {
      if (!entry) return false
      
      const metrics = entry.metrics || {}
      const habitsCompleted = entry.habits_completed || {}
      
      // 1. Проверка всех метрик из плана на день
      for (const id of widgetsInPlan) {
        if (id === 'habits' || id === 'photos' || id === 'mood') continue
        
        const goal = widgetGoals[id]
        if (!goal) continue

        const current = id === 'water' ? metrics.waterIntake :
                        id === 'steps' ? metrics.steps :
                        id === 'sleep' ? metrics.sleepHours :
                        id === 'caffeine' ? metrics.caffeineIntake :
                        id === 'nutrition' ? metrics.calories :
                        id === 'weight' ? metrics.weight : undefined

        // ВАЖНО: Если в старой записи вообще нет этой метрики (current === undefined), 
        // значит виджет тогда не использовался. Не считаем это провалом "идеальности".
        if (current === undefined) continue

        if (id === 'caffeine') {
          if (current > goal) return false 
        } else if (id === 'nutrition') {
          const goalType = customGoals.nutrition?.goalType || 'maintain'
          if (!isNutritionSuccess(current, goal, goalType)) return false
        } else {
          if (current < goal) return false 
        }
      }
      
      // 2. Проверка привычек
      // Проверяем только те привычки, которые:
      // а) Активны сейчас
      // б) Присутствовали в записи на тот момент (чтобы не ломать старые "идеальные дни" новыми привычками)
      const habitsToCheck = activeHabitIds.filter((id: string) => id in habitsCompleted)
      
      if (habitsToCheck.length > 0) {
        const allHabitsDone = habitsToCheck.every((id: string) => habitsCompleted[id] === true)
        if (!allHabitsDone) return false
      }
      
      // Должна быть хоть какая-то зафиксированная активность, иначе "пустой" день будет идеальным
      const hasAnyActivity = (metrics.waterIntake !== undefined) || (metrics.steps !== undefined) || 
                             (metrics.calories !== undefined) || (metrics.sleepHours !== undefined) ||
                             (Object.keys(habitsCompleted).length > 0)
                             
      if (!hasAnyActivity) return false

      return true
    }

    // Получаем последние записи для проверки
    const { data: recentEntries } = await supabase
      .from('diary_entries')
      .select('date, metrics, habits_completed')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(15) 

    if (!recentEntries || recentEntries.length === 0) return achievementIds

    const isConsecutive = isConsecutiveDates

    const todayPerfect = isPerfectDay(recentEntries[0])

    for (const achievement of achievements) {
      const metadata = achievement.metadata as any

      if (metadata.type === 'perfect_day' && todayPerfect) {
        console.log('[Achievements:Special] ✅ Perfect day earned:', achievement.id)
        achievementIds.push(achievement.id)
      } else if (metadata.type === 'perfect_streak') {
        const requiredStreak = metadata.value || 7
        let currentStreak = 0
        
        for (let i = 0; i < recentEntries.length; i++) {
          if (isPerfectDay(recentEntries[i])) {
            currentStreak++
            if (currentStreak >= requiredStreak) break
            
            // Если есть следующая запись, проверяем на непрерывность
            if (recentEntries[i+1]) {
              if (!isConsecutive(recentEntries[i].date, recentEntries[i+1].date)) {
                break
              }
            } else if (currentStreak < requiredStreak) {
              // Записей больше нет, а цель не достигнута
              break
            }
          } else {
            break
          }
        }
        
        if (currentStreak >= requiredStreak) {
          console.log('[Achievements:Special] ✅ Perfect streak earned:', achievement.id)
          achievementIds.push(achievement.id)
        }
      }
    }

  } catch (error) {
    console.error('[Achievements:Special] Error checking special achievements:', error)
  }

  return achievementIds
}

/**
 * Проверка социальных достижений и мета-достижений
 */
async function checkSocialAchievements(
  userId: string,
  supabase: any,
  unlockedIds: Set<string>
): Promise<string[]> {
  const achievementIds: string[] = []

  try {
    // Получаем ВСЕ социальные и мета достижения
    const { data: allAchievements, error: achError } = await supabase
      .from('achievements')
      .select('id, metadata')
      .or('category.eq.social,metadata->>type.eq.achievement_count,metadata->>type.eq.profile_complete,metadata->>type.eq.subscription_tier')

    if (achError || !allAchievements) return achievementIds

    // Фильтруем уже полученные
    const achievements = allAchievements.filter((a: { id: string }) => !unlockedIds.has(a.id))
    if (achievements.length === 0) return achievementIds

    // Нам понадобятся данные профиля и настроек для новых проверок
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, phone, email, avatar_url, subscription_tier')
      .eq('id', userId)
      .single()

    const { data: diarySettings } = await supabase
      .from('diary_settings')
      .select('user_params')
      .eq('user_id', userId)
      .single()

    for (const achievement of achievements) {
      const metadata = achievement.metadata as any

      if (metadata.type === 'registration') {
        achievementIds.push(achievement.id)
      } else if (metadata.type === 'profile_complete') {
        // Проверка заполнения всех данных
        const hasBasicInfo = profile?.full_name && profile?.phone && profile?.email && profile?.avatar_url
        const params = diarySettings?.user_params || {}
        const hasHealthParams = params.height && params.weight && params.age
        
        if (hasBasicInfo && hasHealthParams) {
          achievementIds.push(achievement.id)
        }
      } else if (metadata.type === 'subscription_tier') {
        // Проверка уровня подписки (накопительная логика)
        const tiers = ['free', 'basic', 'pro', 'elite']
        const requiredTier = metadata.value // basic, pro, elite
        const userTierIndex = tiers.indexOf(profile?.subscription_tier || 'free')
        const requiredTierIndex = tiers.indexOf(requiredTier)
        
        // Если текущий уровень пользователя равен или выше требуемого
        if (userTierIndex >= requiredTierIndex && requiredTierIndex > 0) {
          achievementIds.push(achievement.id)
        }
      } else if (metadata.type === 'referral_joined') {
        // Проверяем, пришел ли пользователь по рефералке или использовал ли промокод
        const { count: refCount } = await supabase
          .from('referrals')
          .select('*', { count: 'exact', head: true })
          .eq('referred_id', userId)

        // Ищем транзакции оплат, где использовался промокод (в метаданных)
        const { data: payments } = await supabase
          .from('payment_transactions')
          .select('metadata')
          .eq('user_id', userId)
          .eq('status', 'succeeded')

        const hasUsedPromo = payments?.some((p: any) => p.metadata?.promo_code_id)
        
        if ((refCount || 0) > 0 || hasUsedPromo) {
          achievementIds.push(achievement.id)
        }
      } else if (metadata.type === 'referral_mentor') {
        // Проверяем, есть ли хоть один реферал с совершенной покупкой
        const { count: mentorCount } = await supabase
          .from('referrals')
          .select('*', { count: 'exact', head: true })
          .eq('referrer_id', userId)
          .eq('status', 'first_purchase_made')

        if ((mentorCount || 0) > 0) {
          achievementIds.push(achievement.id)
        }
      } else if (metadata.type === 'achievement_count') {
        const requiredCount = metadata.value
        const currentUnlockedCount = unlockedIds.size

        if (requiredCount === 0) {
          // "Коллекционер" - все достижения
          const { count: totalAchCount } = await supabase
            .from('achievements')
            .select('*', { count: 'exact', head: true })
          
          // -1 так как само достижение "Коллекционер" еще не получено
          if (currentUnlockedCount >= (totalAchCount || 1) - 1) {
            achievementIds.push(achievement.id)
          }
        } else if (currentUnlockedCount >= requiredCount) {
          achievementIds.push(achievement.id)
        }
      }
    }
  } catch (error) {
    console.error('[Achievements:Social] Error checking social achievements:', error)
  }

  return achievementIds
}


