'use server'

import { createClient } from '@/lib/supabase/server'
import {
  Achievement,
  UserAchievement,
  AchievementWithStatus,
  AchievementWithProgress,
  AchievementStats,
  AchievementCategory,
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
    const unlockedMap = new Map(userAchievements.map(ua => [ua.achievement_id, ua.unlocked_at]))

    // 2. Собираем данные для расчета прогресса (параллельно)
    const [
      statsRes,
      settingsRes,
      latestEntryRes,
      allCountRes,
      monthCountRes,
      profileRes,
      refsRes,
      weeklyRes,
      purchasesRes
    ] = await Promise.allSettled([
      supabase.rpc('get_user_metrics_stats', { p_user_id: userId }),
      supabase.from('diary_settings').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('diary_entries').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('diary_entries').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('diary_entries').select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]),
      supabase.from('profiles').select('full_name, phone, email, avatar_url, subscription_tier').eq('id', userId).maybeSingle(),
      supabase.from('referrals').select('status').eq('referrer_id', userId),
      supabase.from('diary_entries').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(7),
      supabase.from('user_purchases').select('product_id, products(duration_months)').eq('user_id', userId)
    ])

    // Извлекаем данные
    const metricsStats: any = (statsRes.status === 'fulfilled' && !statsRes.value.error) ? (statsRes.value.data?.[0] || {}) : {}
    const userSettings = (settingsRes.status === 'fulfilled' && !settingsRes.value.error) ? settingsRes.value.data : null
    const latestEntry = (latestEntryRes.status === 'fulfilled' && !latestEntryRes.value.error) ? latestEntryRes.value.data : null
    const allEntriesCount = (allCountRes.status === 'fulfilled' && !allCountRes.value.error) ? (allCountRes.value.count || 0) : 0
    const monthEntriesCount = (monthCountRes.status === 'fulfilled' && !monthCountRes.value.error) ? (monthCountRes.value.count || 0) : 0
    const userProfile = (profileRes.status === 'fulfilled' && !profileRes.value.error) ? profileRes.value.data : null
    const mentorRefs = (refsRes.status === 'fulfilled' && !refsRes.value.error) ? (refsRes.value.data || []) : []
    const weeklyEntries = (weeklyRes.status === 'fulfilled' && !weeklyRes.value.error) ? (weeklyRes.value.data || []) : []
    const allPurchases = (purchasesRes.status === 'fulfilled' && !purchasesRes.value.error) ? (purchasesRes.value.data || []) : []

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

    const tierLevels: Record<string, number> = { 'free': 0, 'basic': 1, 'pro': 2, 'elite': 3 }
    const currentTierLevel = tierLevels[userProfile?.subscription_tier || 'free'] || 0
    
    // 3. Расчет прогресса для каждого достижения
    const data: AchievementWithProgress[] = allAchievements.map(achievement => {
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
            case 'water_daily': currentValue = Number(currentMetrics?.waterIntake) || 0; break
            case 'water_total': currentValue = Number(metricsStats?.total_water) || 0; break
            case 'steps_daily': currentValue = Number(currentMetrics?.steps) || 0; break
            case 'steps_total': currentValue = Number(metricsStats?.total_steps) || 0; break
            case 'energy_max': currentValue = Number(metricsStats?.energy_max_count) || 0; break
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
              currentValue = fields.filter(f => f.done).length
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
              for (const entry of weeklyEntries) {
                if (isPerfectDay(entry, userSettings)) streak++
                else break
              }
              currentValue = streak
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
export async function checkAndUnlockAchievements(userId: string) {
  if (!userId) return { success: false }
  const supabase = await createClient()
  
  try {
    const { data: userAchievements } = await supabase.from('user_achievements').select('achievement_id').eq('user_id', userId)
    const unlockedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || [])
    
    const { data: allAchievements } = await supabase.from('achievements').select('*')
    const achievementsToCheck = allAchievements?.filter(a => !unlockedIds.has(a.id)) || []
    
    if (achievementsToCheck.length === 0) return { success: true, newAchievements: [] }

    // Получаем все нужные данные ОДНИМ паком (аналогично функции выше)
    const [stats, settings, latest, allCount, profile, refs, purchases, allEntries] = await Promise.all([
      supabase.rpc('get_user_metrics_stats', { p_user_id: userId }),
      supabase.from('diary_settings').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('diary_entries').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('diary_entries').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase.from('referrals').select('status').eq('referrer_id', userId),
      supabase.from('user_purchases').select('products(duration_months)').eq('user_id', userId),
      supabase.from('diary_entries').select('*').eq('user_id', userId).order('date', { ascending: false })
    ])

    const mStats: any = stats.data?.[0] || {}
    const uSettings = settings.data
    const uProfile = profile.data
    const uPurchases = purchases.data || []
    const uRefs = refs.data || []
    const uEntries = allEntries.data || []
    
    const newAchievements: Achievement[] = []

    for (const ach of achievementsToCheck) {
      const meta = ach.metadata as any
      let earned = false

      switch (meta.type) {
        case 'registration': earned = true; break
        case 'streak_days': earned = ((uSettings?.streaks as any)?.current || 0) >= meta.value; break
        case 'water_total': earned = (mStats.total_water || 0) >= meta.value; break
        case 'steps_total': earned = (mStats.total_steps || 0) >= meta.value; break
        case 'achievement_count': earned = unlockedIds.size >= (meta.value || allAchievements!.length - 1); break
        case 'referral_mentor': earned = uRefs.filter((r: any) => r.status === 'first_purchase_made').length >= (meta.value || 1); break
        case 'subscription_tier': 
          const levels: any = { 'free': 0, 'basic': 1, 'pro': 2, 'elite': 3 }
          earned = levels[uProfile?.subscription_tier || 'free'] >= levels[meta.value]; 
          break
        case 'subscription_duration': earned = uPurchases.some((p: any) => p.products?.duration_months >= meta.value); break
        case 'profile_complete':
          earned = !!(uProfile?.full_name && uProfile?.phone && uProfile?.avatar_url && (uSettings?.user_params as any)?.weight);
          break
        case 'weight_goal_reached':
          if ((uSettings?.goals as any)?.weight && uEntries.length > 0) {
            const cur = (uEntries[0].metrics as any)?.weight
            const start = (uEntries[uEntries.length-1].metrics as any)?.weight
            const goal = (uSettings?.goals as any)?.weight
            earned = start > goal ? cur <= goal : cur >= goal
          }
          break
      }

      if (earned) {
        const res = await unlockAchievementInternal(userId, ach.id, supabase)
        if (res.success && res.achievement) newAchievements.push(res.achievement)
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

    const counts = stats.reduce((acc: Record<string, number>, curr) => {
      acc[curr.achievement_id] = (acc[curr.achievement_id] || 0) + 1
      return acc
    }, {})

    const data = achievements.map(ach => ({
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
