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

    console.log('[Achievements] Found achievements to check:', {
      streaks: streakResults.length,
      metrics: metricResults.length,
      habits: habitResults.length,
      weight: weightResults.length,
      consistency: consistencyResults.length,
    })

    // Собираем все новые достижения
    const allResults = [
      ...streakResults,
      ...metricResults,
      ...habitResults,
      ...weightResults,
      ...consistencyResults,
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

    // Получаем все записи для подсчета общих значений
    const { data: allEntries } = await supabase
      .from('diary_entries')
      .select('metrics')
      .eq('user_id', userId)

    if (!latestEntry && !allEntries) {
      console.log('[Achievements:Metrics] No diary entries found')
      return achievementIds
    }

    const metrics = latestEntry?.metrics as any || {}
    
    // Подсчитываем общие значения
    let totalWater = 0
    let totalSteps = 0
    let energyMaxCount = 0 // Количество раз с энергией 5/5
    
    if (allEntries) {
      for (const entry of allEntries) {
        const m = entry.metrics as any
        totalWater += m?.waterIntake || 0  // ИСПРАВЛЕНО: было water
        totalSteps += m?.steps || 0
        
        // Считаем записи с максимальной энергией
        if (m?.energyLevel === 5) {
          energyMaxCount++
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
    let totalCompletions = 0

    if (allEntries && activeHabitIds.length > 0) {
      for (const entry of allEntries) {
        const completed = entry.habits_completed as any
        if (!completed) continue

        // Считаем общее количество выполнений
        const completedCount = Object.values(completed).filter((v: any) => v === true).length
        totalCompletions += completedCount

        // Проверяем, все ли активные привычки выполнены в этот день
        const allActiveCompleted = activeHabitIds.every((habitId: string) => completed[habitId] === true)
        if (allActiveCompleted) {
          daysWithAllHabitsCompleted++
        }
      }
    }

    console.log('[Achievements:Habits] Days with all habits completed:', daysWithAllHabitsCompleted)
    console.log('[Achievements:Habits] Total completions:', totalCompletions)

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
      } else if (metadata.type === 'habits_all_streak' && daysWithAllHabitsCompleted >= metadata.value) {
        console.log('[Achievements:Habits] ✅ Habits all streak (simplified):', achievement.id, `(${daysWithAllHabitsCompleted} >= ${metadata.value})`)
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

