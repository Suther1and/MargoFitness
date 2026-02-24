'use server'

import { createClient } from '@/lib/supabase/server'
import {
  Achievement,
  UserAchievement,
  AchievementWithStatus,
  AchievementWithProgress,
  AchievementStats,
  AchievementCategory,
  TIER_LEVELS,
} from '@/types/database'
import { revalidatePath } from 'next/cache'

// ============================================
// Получение данных и Прогресс для UI
// ============================================

/**
 * Получить все достижения со статусом разблокировки и прогрессом
 */
export async function getAllAchievementsWithStatus(userId: string): Promise<{
  success: boolean
  data?: AchievementWithProgress[]
  error?: string
}> {
  if (!userId) return { success: false, error: 'ID пользователя не указан' }
  
  const supabase = await createClient()

  try {
    // 1. Получаем все достижения и достижения пользователя
    const [achRes, userAchRes] = await Promise.all([
      supabase.from('achievements').select('*').order('sort_order', { ascending: true }),
      supabase.from('user_achievements').select('*').eq('user_id', userId)
    ])

    if (achRes.error) throw new Error(`Fetch achievements error: ${achRes.error.message}`)
    if (userAchRes.error) throw new Error(`Fetch user achievements error: ${userAchRes.error.message}`)

    const allAchievements = achRes.data || []
    const userAchievements = userAchRes.data || []
    const unlockedMap = new Map((userAchievements as UserAchievement[]).map((ua: any) => [ua.achievement_id, ua.unlocked_at]))

    // 2. Собираем данные для расчета прогресса (параллельно)
    const queries: Record<string, any> = {
      metricsStats: supabase.rpc('get_user_metrics_stats', { p_user_id: userId }),
      userSettings: supabase.from('diary_settings').select('*').eq('user_id', userId).maybeSingle(),
      latestEntry: supabase.from('diary_entries').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(1).maybeSingle(),
      allEntriesCount: supabase.from('diary_entries').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      monthEntriesCount: supabase.from('diary_entries').select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]),
      userProfile: supabase.from('profiles').select('full_name, phone, email, avatar_url, subscription_tier').eq('id', userId).maybeSingle(),
      mentorRefs: supabase.from('referrals').select('status').eq('referrer_id', userId),
      recentEntries: supabase.from('diary_entries').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(31),
      allPurchases: supabase.from('user_purchases').select('product_id, products(duration_months)').eq('user_id', userId),
      isReferredData: supabase.from('referrals').select('id').eq('referred_id', userId).maybeSingle(),
      promoTransactions: supabase.from('payment_transactions').select('metadata').eq('user_id', userId).eq('status', 'succeeded'),
      firstEntry: supabase.from('diary_entries').select('*').eq('user_id', userId).order('date', { ascending: true }).limit(1).maybeSingle()
    }

    const queryKeys = Object.keys(queries)
    const resultsArray = await Promise.allSettled(Object.values(queries))
    
    const results: Record<string, any> = {}
    queryKeys.forEach((key, i) => {
      const res = resultsArray[i]
      if (res.status === 'fulfilled' && !res.value.error) {
        results[key] = res.value.data
        if (res.value.count !== undefined) results[key + 'Count'] = res.value.count
      } else {
        results[key] = null
        if (res.status === 'rejected') console.error(`[Achievements] Query ${key} rejected:`, res.reason)
      }
    })

    const metricsStats: any = (results.metricsStats?.[0] || {})
    const userSettings = results.userSettings
    const latestEntry = results.latestEntry
    const allEntriesCount = results.allEntriesCountCount || 0
    const monthEntriesCount = results.monthEntriesCountCount || 0
    const userProfile = results.userProfile
    const mentorRefs = results.mentorRefs || []
    const recentEntries: any[] = results.recentEntries || []
    const allPurchases = results.allPurchases || []
    const isReferredData = results.isReferredData
    const promoTransactions = results.promoTransactions || []
    const firstEntry = results.firstEntry

    // Проверка условий
    const isReferred = !!isReferredData
    const hasUsedPromo = Array.isArray(promoTransactions) && promoTransactions.some((tx: any) => {
      const meta = tx.metadata
      return meta && (meta.promo_code_id || meta.promoCodeId || meta.promo_code || meta.promoCode)
    })

    const currentMetrics = latestEntry?.metrics as any || {}
    const habitsCompleted = latestEntry?.habits_completed as any || {}
    const currentStreak = (userSettings?.streaks as any)?.current || 0
    
    // Вспомогательная функция для "Идеальности"
    const isPerfectDay = (entry: any, dbSettings: any) => {
      if (!entry || !dbSettings) return false
      try {
        const m = entry.metrics || {}
        const hc = entry.habits_completed || {}
        const widgetsInPlan = dbSettings.widgets_in_daily_plan || []
        const widgetGoals = dbSettings.widget_goals || {}
        const habitsList = dbSettings.habits || []
        const activeHabitIds = habitsList.filter((h: any) => h.enabled).map((h: any) => h.id)
        
        for (const id of widgetsInPlan) {
          if (id === 'habits' || id === 'photos' || id === 'mood') continue
          const goal = widgetGoals[id]
          if (!goal) continue
          const val = id === 'water' ? m.waterIntake : id === 'steps' ? m.steps : id === 'sleep' ? m.sleepHours : undefined
          if (val === undefined || val < goal) return false 
        }
        const habitsToCheck = activeHabitIds.filter((id: string) => id in hc)
        if (habitsToCheck.length > 0 && !habitsToCheck.every((id: string) => hc[id] === true)) return false
        return true
      } catch { return false }
    }

    const currentTierLevel = TIER_LEVELS[userProfile?.subscription_tier || 'free'] || 0
    
    // 3. Расчет прогресса для каждого достижения
    const data: AchievementWithProgress[] = (allAchievements as Achievement[]).map((achievement: any) => {
      try {
        const isUnlocked = unlockedMap.has(achievement.id)
        const unlockedAt = unlockedMap.get(achievement.id) || null
        let metadata = achievement.metadata as any
        if (typeof metadata === 'string') metadata = JSON.parse(metadata)
        
        let currentValue = 0
        let targetValue = Number(metadata?.value) || 0
        let progressData: any = null

        if (!isUnlocked && metadata && metadata.type) {
          switch (metadata.type) {
            case 'streak_days':
              currentValue = currentStreak
              break
            case 'referral_joined':
              currentValue = (isReferred || hasUsedPromo) ? 1 : 0
              targetValue = 1
              break
            case 'water_daily': 
              const wVal = Number(currentMetrics?.waterIntake) || 0
              currentValue = (wVal >= targetValue) ? targetValue : (wVal * 1000 >= targetValue ? wVal * 1000 : wVal)
              break
            case 'water_total': currentValue = Number(metricsStats?.total_water) || 0; break
            case 'steps_daily': currentValue = Number(currentMetrics?.steps) || 0; break
            case 'steps_total': currentValue = Number(metricsStats?.total_steps) || 0; break
            case 'mood_great_streak':
              let moodStreak = 0
              for (const entry of recentEntries) {
                if ((entry.metrics as any)?.mood === 'great' || (entry.metrics as any)?.mood >= 4) moodStreak++
                else break
              }
              currentValue = moodStreak
              break
            case 'water_goal_streak':
              let waterGoalStreak = 0
              const wGoal = (userSettings?.widget_goals as any)?.water || 2000
              for (const entry of recentEntries) {
                const val = Number((entry.metrics as any)?.waterIntake) || 0
                if (val >= wGoal || val * 1000 >= wGoal) waterGoalStreak++
                else break
              }
              currentValue = waterGoalStreak
              break
            case 'weight_maintain':
              let wMaintainStreak = 0
              const tWeight = (userSettings?.goals as any)?.weight
              if (tWeight) {
                for (const entry of recentEntries) {
                  const cW = Number((entry.metrics as any)?.weight) || 0
                  if (Math.abs(cW - tWeight) <= 0.5) wMaintainStreak++
                  else break
                }
              }
              currentValue = wMaintainStreak
              break
            case 'sleep_low': 
              currentValue = Number(currentMetrics?.sleepHours) || 0; break
            case 'sleep_high': 
            case 'sleep_daily':
              currentValue = Number(currentMetrics?.sleepHours) || 0; break
            case 'sleep_streak':
              let sStreak = 0
              const sleepThreshold = metadata.value_extra || 8
              for (const entry of recentEntries) {
                if ((entry.metrics as any)?.sleepHours >= sleepThreshold) sStreak++
                else break
              }
              currentValue = sStreak
              break
            case 'habit_complete_any':
              currentValue = Object.values(habitsCompleted || {}).some(v => v === true) ? 1 : 0
              targetValue = 1
              break
            case 'weight_recorded':
              currentValue = (Number(currentMetrics?.weight) || 0) > 0 ? 1 : 0
              targetValue = 1
              break
            case 'weight_streak':
              let wStreak = 0
              for (const entry of recentEntries) {
                if ((entry.metrics as any)?.weight > 0) wStreak++
                else break
              }
              currentValue = wStreak
              break
            case 'habits_all_streak':
              let hStreak = 0
              const hList = userSettings?.habits || []
              const activeHIds = hList.filter((h: any) => h.enabled).map((h: any) => h.id)
              if (activeHIds.length > 0) {
                for (const entry of recentEntries) {
                  const hc = entry.habits_completed || {}
                  if (activeHIds.every((id: string) => hc[id] === true)) hStreak++
                  else break
                }
              }
              currentValue = hStreak
              break
            case 'habits_created': 
            case 'habits_count':
              const hCount = (userSettings?.habits || []).length
              currentValue = hCount
              break
            case 'habit_completions':
              currentValue = Number(metricsStats?.total_habit_completions) || 0; break
            case 'energy_max':
              currentValue = Number(metricsStats?.energy_max_count) || 0; break
            case 'energy_max_count':
              currentValue = Number(metricsStats?.energy_max_count) || 0; break
            case 'total_entries': currentValue = allEntriesCount; break
            case 'monthly_entries': currentValue = monthEntriesCount; break
            case 'achievement_count':
              currentValue = unlockedMap.size
              if (targetValue === 0) targetValue = allAchievements.length - 1
              break
            case 'referral_mentor':
              const successfulRefs = mentorRefs.filter((r: any) => r.status === 'first_purchase_made').length
              currentValue = successfulRefs
              break
            case 'profile_complete':
              const fields = [
                { label: 'Имя', done: !!userProfile?.full_name },
                { label: 'Телефон', done: !!userProfile?.phone },
                { label: 'Почта', done: !!userProfile?.email },
                { label: 'Аватар', done: !!userProfile?.avatar_url },
                { label: 'Вес', done: !!(userSettings?.user_params as any)?.weight },
                { label: 'Рост', done: !!(userSettings?.user_params as any)?.height },
                { label: 'Возраст', done: !!(userSettings?.user_params as any)?.age },
              ]
              currentValue = fields.filter((f: any) => f.done).length
              targetValue = 7
              progressData = { fields }
              break
            case 'subscription_tier':
              currentValue = currentTierLevel
              targetValue = tierLevels[metadata.value] || 0
              break
            case 'subscription_duration':
              const maxMonths = allPurchases.reduce((max: number, p: any) => 
                Math.max(max, p.products?.duration_months || 0), 0)
              currentValue = maxMonths
              break
            case 'perfect_day':
              currentValue = isPerfectDay(latestEntry, userSettings) ? 1 : 0
              targetValue = 1
              break
            case 'perfect_streak':
              let streak = 0
              for (const entry of recentEntries) {
                if (isPerfectDay(entry, userSettings)) streak++
                else break
              }
              currentValue = streak
              break
            case 'weight_goal_reached':
              if ((userSettings?.goals as any)?.weight && latestEntry && firstEntry) {
                const cur = Number((latestEntry.metrics as any)?.weight) || 0
                // Для старта берем вес из параметров профиля ИЛИ из самой первой записи
                const start = Number((userSettings?.user_params as any)?.weight) || Number((firstEntry.metrics as any)?.weight) || 0
                const goal = Number((userSettings?.goals as any)?.weight) || 0
                
                if (cur > 0 && start > 0 && goal > 0) {
                  // Если цель была сбросить вес: start > goal
                  // Если цель была набрать вес: start < goal
                  const isSuccess = start > goal ? cur <= goal : cur >= goal
                  currentValue = isSuccess ? 1 : 0
                  targetValue = 1
                }
              }
              break
          }
        }

        if (isUnlocked) currentValue = targetValue
        const progress = targetValue > 0 ? Math.min(100, Math.round((currentValue / targetValue) * 100)) : 0

        return { ...achievement, isUnlocked, unlockedAt, currentValue, targetValue, progress, progressData }
      } catch (err) {
        return { ...achievement, isUnlocked: unlockedMap.has(achievement.id), unlockedAt: unlockedMap.get(achievement.id) || null, currentValue: 0, targetValue: 0, progress: 0 }
      }
    })

    return { success: true, data }
  } catch (error: any) {
    console.error('[Achievements] CRITICAL ERROR:', error.message || error)
    return { success: false, error: 'Ошибка при расчете достижений' }
  }
}

// ============================================
// Логика разблокировки
// ============================================

/**
 * Вспомогательная функция для последовательных дат
 */
const isConsecutiveDates = (d1Str: string, d2Str: string) => {
  const d1 = new Date(d1Str); d1.setHours(0,0,0,0)
  const d2 = new Date(d2Str); d2.setHours(0,0,0,0)
  return Math.abs(d1.getTime() - d2.getTime()) <= 86400000 * 1.5
}

async function unlockAchievementInternal(userId: string, achievementId: string, supabase: any) {
  try {
    const { data: unlocked, error: rpcError } = await supabase.rpc('unlock_achievement_for_user', { p_user_id: userId, p_achievement_id: achievementId })
    if (rpcError || !unlocked) return { success: false }
    const { data: achievement } = await supabase.from('achievements').select('*').eq('id', achievementId).single()
    return { success: true, achievement }
  } catch { return { success: false } }
}

/**
 * ГЛАВНАЯ ФУНКЦИЯ: Проверить и разблокировать достижения
 */
export async function checkAndUnlockAchievements(userId: string, supabaseClient?: any) {
  if (!userId) return { success: false }
  
  // Используем переданный клиент (например, с service role) или создаем новый
  const supabase = supabaseClient || await createClient()
  
  try {
    const { data: userAchievements } = await supabase.from('user_achievements').select('achievement_id').eq('user_id', userId)
    const unlockedIds = new Set((userAchievements as { achievement_id: string }[] | null)?.map((ua: any) => ua.achievement_id) || [])
    
    const { data: allAchievements } = await supabase.from('achievements').select('*')
    const achievementsToCheck = (allAchievements as Achievement[] | null)?.filter((a: any) => !unlockedIds.has(a.id)) || []
    
    if (achievementsToCheck.length === 0) return { success: true, newAchievements: [] }

    // 2. Собираем данные для расчета прогресса (параллельно)
    const queries: Record<string, any> = {
      metricsStats: supabase.rpc('get_user_metrics_stats', { p_user_id: userId }),
      userSettings: supabase.from('diary_settings').select('*').eq('user_id', userId).maybeSingle(),
      latestEntry: supabase.from('diary_entries').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(1).maybeSingle(),
      allEntriesCount: supabase.from('diary_entries').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      userProfile: supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      uRefs: supabase.from('referrals').select('status').eq('referrer_id', userId),
      uPurchases: supabase.from('user_purchases').select('products(duration_months)').eq('user_id', userId),
      firstEntry: supabase.from('diary_entries').select('*').eq('user_id', userId).order('date', { ascending: true }).limit(1).maybeSingle(),
      referredRecord: supabase.from('referrals').select('id, referrer_id, status').eq('referred_id', userId).maybeSingle(),
      promoTransactions: supabase.from('payment_transactions').select('metadata').eq('user_id', userId).eq('status', 'succeeded'),
      recentEntries: supabase.from('diary_entries').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(31)
    }

    const queryKeys = Object.keys(queries)
    const resultsArray = await Promise.allSettled(Object.values(queries))
    
    const results: Record<string, any> = {}
    queryKeys.forEach((key, i) => {
      const res = resultsArray[i]
      if (res.status === 'fulfilled' && !res.value.error) {
        results[key] = res.value.data
        if (res.value.count !== undefined) results[key + 'Count'] = res.value.count
      } else {
        results[key] = null
        if (res.status === 'rejected') console.error(`[Achievements] Query ${key} rejected:`, res.reason)
      }
    })

    const mStats: any = (results.metricsStats?.[0] || {})
    const uSettings: any = results.userSettings
    const latestEntry: any = results.latestEntry
    const allEntriesCount = results.allEntriesCountCount || 0
    const uProfile: any = results.userProfile
    const uRefs = results.uRefs || []
    const uPurchases = results.uPurchases || []
    const firstEntry: any = results.firstEntry
    const referredRecord = results.referredRecord
    const promoTransactions = results.promoTransactions || []
    const recentEntries: any[] = results.recentEntries || []
    
    // Проверка условий
    // Fallback: проверяем метаданные профиля, если записи в referrals еще нет
    const hasRefMetadata = uProfile?.raw_user_meta_data?.ref_code || uProfile?.user_metadata?.ref_code
    const isReferred = !!referredRecord || !!hasRefMetadata
    
    const hasUsedPromo = Array.isArray(promoTransactions) && promoTransactions.some((tx: any) => {
      const meta = tx.metadata
      return meta && (meta.promo_code_id || meta.promoCodeId || meta.promo_code || meta.promoCode || meta.promo_code_code)
    })

    const currentMetrics = latestEntry?.metrics as any || {}
    const habitsCompleted = latestEntry?.habits_completed as any || {}
    const habitsList = Array.isArray(uSettings?.habits) ? uSettings.habits : []
    
    // Вспомогательная функция для "Идеальности"
    const isPerfectDayInternal = (entry: any, dbSettings: any) => {
      if (!entry || !dbSettings) return false
      try {
        const m = entry.metrics || {}
        const hc = entry.habits_completed || {}
        const widgetsInPlan = dbSettings.widgets_in_daily_plan || []
        const widgetGoals = dbSettings.widget_goals || {}
        const habits = dbSettings.habits || []
        const activeHabitIds = habits.filter((h: any) => h.enabled).map((h: any) => h.id)
        
        for (const id of widgetsInPlan) {
          if (id === 'habits' || id === 'photos' || id === 'mood') continue
          const goal = widgetGoals[id]
          if (!goal) continue
          const val = id === 'water' ? m.waterIntake : id === 'steps' ? m.steps : id === 'sleep' ? m.sleepHours : undefined
          if (val === undefined || val < goal) return false 
        }
        const habitsToCheck = activeHabitIds.filter((id: string) => id in hc)
        if (habitsToCheck.length > 0 && !habitsToCheck.every((id: string) => hc[id] === true)) return false
        return true
      } catch { return false }
    }

    console.log(`[Achievements] DEBUG for ${userId}:`, {
      isReferred,
      hasUsedPromo,
      habitsCount: habitsList.length,
      waterToday: currentMetrics?.waterIntake,
      sleepToday: currentMetrics?.sleepHours,
      energyToday: currentMetrics?.energyLevel,
      weight: currentMetrics?.weight,
      recentEntries: recentEntries.length,
      habitCompletions: mStats.total_habit_completions
    })
    
    const newAchievements: Achievement[] = []

    for (const ach of achievementsToCheck) {
      try {
        let metadata = ach.metadata as any
        if (typeof metadata === 'string') {
          try { metadata = JSON.parse(metadata) } catch { continue }
        }
        
        if (!metadata || !metadata.type) continue
        
        let earned = false
        const targetVal = Number(metadata.value) || 0

        switch (metadata.type) {
          case 'registration': earned = true; break
          case 'referral_joined': earned = !!(isReferred || hasUsedPromo); break
          case 'streak_days': earned = ((uSettings?.streaks as any)?.current || 0) >= targetVal; break
          case 'water_total': earned = (mStats.total_water || 0) >= targetVal; break
          case 'steps_total': earned = (mStats.total_steps || 0) >= targetVal; break
          case 'water_daily': 
            const waterVal = Number(currentMetrics?.waterIntake) || 0
            earned = (waterVal >= targetVal) || (waterVal * 1000 >= targetVal); 
            break
          case 'steps_daily': earned = (Number(currentMetrics?.steps) || 0) >= targetVal; break
          case 'mood_great_streak':
            let mStreak = 0
            for (const entry of recentEntries) {
              if ((entry.metrics as any)?.mood === 'great' || (entry.metrics as any)?.mood >= 4) mStreak++
              else break
            }
            earned = mStreak >= targetVal
            break
          case 'water_goal_streak':
            let wgStreak = 0
            const waterGoal = (uSettings?.widget_goals as any)?.water || 2000
            for (const entry of recentEntries) {
              const val = Number((entry.metrics as any)?.waterIntake) || 0
              if (val >= waterGoal || val * 1000 >= waterGoal) wgStreak++
              else break
            }
            earned = wgStreak >= targetVal
            break
          case 'weight_maintain':
            let wmStreak = 0
            const targetWeight = (uSettings?.goals as any)?.weight
            if (targetWeight) {
              for (const entry of recentEntries) {
                const curW = Number((entry.metrics as any)?.weight) || 0
                // Допускаем погрешность в 0.5 кг для удержания
                if (Math.abs(curW - targetWeight) <= 0.5) wmStreak++
                else break
              }
            }
            earned = wmStreak >= targetVal
            break
          case 'sleep_low': 
            const sLow = Number(currentMetrics?.sleepHours) || 0
            earned = sLow > 0 && sLow <= targetVal; 
            break
          case 'sleep_high': 
          case 'sleep_daily':
            earned = (Number(currentMetrics?.sleepHours) || 0) >= targetVal; 
            break
          case 'sleep_streak':
            let sStreak = 0
            for (const entry of recentEntries) {
              if ((entry.metrics as any)?.sleepHours >= (metadata.value_extra || 8)) sStreak++
              else break
            }
            earned = sStreak >= targetVal
            break
          case 'habit_complete_any':
            earned = Object.values(habitsCompleted || {}).some(v => v === true);
            break
          case 'weight_recorded':
            earned = (Number(currentMetrics?.weight) || 0) > 0;
            break
          case 'weight_streak':
            let wStreak = 0
            for (const entry of recentEntries) {
              if ((entry.metrics as any)?.weight > 0) wStreak++
              else break
            }
            earned = wStreak >= targetVal
            break
          case 'habits_all_streak':
            let hStreak = 0
            const activeHIds = habitsList.filter((h: any) => h.enabled).map((h: any) => h.id)
            if (activeHIds.length > 0) {
              for (const entry of recentEntries) {
                const hc = entry.habits_completed || {}
                if (activeHIds.every((id: string) => hc[id] === true)) hStreak++
                else break
              }
            }
            earned = hStreak >= targetVal
            break
          case 'habits_created': 
          case 'habits_count':
            earned = habitsList.length >= targetVal; 
            break
          case 'habit_completions':
            earned = (mStats.total_habit_completions || 0) >= targetVal;
            break
          case 'energy_max':
            earned = (mStats.energy_max_count || 0) >= targetVal;
            break
          case 'achievement_count': earned = unlockedIds.size >= (targetVal || allAchievements!.length - 1); break
          case 'referral_mentor': earned = uRefs.filter((r: any) => r.status === 'first_purchase_made').length >= (targetVal || 1); break
          case 'subscription_tier': {
            const currentTier = uProfile?.subscription_tier || 'free'
            earned = (TIER_LEVELS[currentTier] ?? 0) >= (TIER_LEVELS[metadata.value] ?? 0)
            break
          }
          case 'subscription_duration': earned = uPurchases.some((p: any) => p.products?.duration_months >= targetVal); break
          case 'profile_complete':
            earned = !!(uProfile?.full_name && uProfile?.phone && uProfile?.avatar_url && (uSettings?.user_params as any)?.weight);
            break
          case 'perfect_day': earned = isPerfectDayInternal(latestEntry, uSettings); break
            case 'weight_goal_reached':
              if ((uSettings?.goals as any)?.weight && latestEntry && firstEntry) {
                const cur = Number((latestEntry.metrics as any)?.weight) || 0
                const start = Number((uSettings?.user_params as any)?.weight) || Number((firstEntry.metrics as any)?.weight) || 0
                const goal = Number((uSettings?.goals as any)?.weight) || 0
                
                if (cur > 0 && start > 0 && goal > 0) {
                  earned = start > goal ? cur <= goal : cur >= goal
                }
              }
              break
          case 'total_entries':
            earned = allEntriesCount >= targetVal;
            break
        }

        if (earned) {
          const res = await unlockAchievementInternal(userId, ach.id, supabase)
          if (res.success && res.achievement) newAchievements.push(res.achievement)
        }
      } catch (achErr) {
        console.error(`[Achievements] Error checking achievement ${ach.id}:`, achErr)
        continue
      }
    }

    if (newAchievements.length > 0) {
      revalidatePath('/dashboard/health-tracker')
      revalidatePath('/dashboard/bonuses')
    }

    return { success: true, newAchievements }
  } catch (err) {
    console.error('[Achievements] Check error:', err)
    return { success: false }
  }
}

export async function getAchievementStats(userId: string) {
  const supabase = await createClient()
  const [totalRes, userRes] = await Promise.all([
    supabase.from('achievements').select('*', { count: 'exact', head: true }),
    supabase.from('user_achievements').select('*').eq('user_id', userId).order('unlocked_at', { ascending: false }).limit(10)
  ])
  const total = totalRes.count || 0
  const unlocked = userRes.data?.length || 0
  return { success: true, data: { total, unlocked, percentage: total > 0 ? Math.round((unlocked / total) * 100) : 0, recentUnlocked: userRes.data || [] } }
}

/**
 * Получить все достижения с глобальной статистикой (для админа)
 */
export async function getAdminAchievements() {
  const supabase = await createClient()
  
  // Проверка прав админа
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { success: false, error: 'Not authorized' }

  try {
    // Получаем все достижения
    const { data: achievements, error: achError } = await supabase
      .from('achievements')
      .select('*')
      .order('sort_order', { ascending: true })

    if (achError) throw achError

    // Получаем количество пользователей для каждого достижения
    const { data: stats, error: statsError } = await supabase
      .from('user_achievements')
      .select('achievement_id')

    if (statsError) throw statsError

    const counts = (stats as any[] | null)?.reduce((acc: Record<string, number>, curr: any) => {
      acc[curr.achievement_id] = (acc[curr.achievement_id] || 0) + 1
      return acc
    }, {}) || {}

    const data = (achievements as Achievement[]).map((ach: any) => ({
      ...ach,
      userCount: counts[ach.id] || 0
    }))

    return { success: true, data }
  } catch (error: any) {
    console.error('[Admin Achievements] Error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Обновить данные достижения (для админа)
 */
export async function updateAchievementAdmin(achievementId: string, updates: {
  title?: string
  reward_amount?: number | null
  description?: string
}) {
  const supabase = await createClient()
  
  // Проверка прав админа
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { success: false, error: 'Not authorized' }

  try {
    const { error } = await supabase
      .from('achievements')
      .update(updates)
      .eq('id', achievementId)

    if (error) throw error

    revalidatePath('/admin/achievements')
    revalidatePath('/dashboard/health-tracker')
    
    return { success: true }
  } catch (error: any) {
    console.error('[Admin Update Achievement] Error:', error)
    return { success: false, error: error.message }
  }
}

export async function unlockAchievement(userId: string, achievementId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { success: false }
  const result = await unlockAchievementInternal(userId, achievementId, supabase)
  if (result.success) revalidatePath('/dashboard/health-tracker')
  return result
}
