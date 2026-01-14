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

    // 2. Собираем данные для расчета прогресса (параллельно и безопасно)
    const [
      statsRes,
      settingsRes,
      latestEntryRes,
      allCountRes,
      monthCountRes,
      profileRes,
      refsRes,
      weeklyRes
    ] = await Promise.allSettled([
      supabase.rpc('get_user_metrics_stats', { p_user_id: userId }),
      supabase.from('diary_settings').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('diary_entries').select('metrics, habits_completed').eq('user_id', userId).order('date', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('diary_entries').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('diary_entries').select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]),
      supabase.from('profiles').select('full_name, phone, email, avatar_url, subscription_tier').eq('id', userId).maybeSingle(),
      supabase.from('referrals').select('status').eq('referrer_id', userId).limit(5),
      supabase.from('diary_entries').select('date, metrics, habits_completed').eq('user_id', userId).order('date', { ascending: false }).limit(7)
    ])

    // Извлекаем данные с фолбеками
    const metricsStats = (statsRes.status === 'fulfilled' && !statsRes.value.error) ? (statsRes.value.data?.[0] || {}) : {}
    const userSettings = (settingsRes.status === 'fulfilled' && !settingsRes.value.error) ? settingsRes.value.data : null
    const latestEntry = (latestEntryRes.status === 'fulfilled' && !latestEntryRes.value.error) ? latestEntryRes.value.data : null
    const allEntriesCount = (allCountRes.status === 'fulfilled' && !allCountRes.value.error) ? (allCountRes.value.count || 0) : 0
    const monthEntriesCount = (monthCountRes.status === 'fulfilled' && !monthCountRes.value.error) ? (monthCountRes.value.count || 0) : 0
    const userProfile = (profileRes.status === 'fulfilled' && !profileRes.value.error) ? profileRes.value.data : null
    const mentorRefs = (refsRes.status === 'fulfilled' && !refsRes.value.error) ? (refsRes.value.data || []) : []
    const weeklyEntries = (weeklyRes.status === 'fulfilled' && !weeklyRes.value.error) ? (weeklyRes.value.data || []) : []

    const currentMetrics = latestEntry?.metrics as any || {}
    const habitsCompleted = latestEntry?.habits_completed as any || {}
    const currentStreak = userSettings?.streaks?.current || 0
    
    // Вспомогательная функция для проверки "Идеальности" дня
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
              if (targetValue === 7) {
                const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
                const fields = days.map((label, idx) => ({ label, done: !!weeklyEntries[idx] })).reverse()
                currentValue = fields.filter(f => f.done).length
                targetValue = 7
                progressData = { fields }
              } else {
                currentValue = currentStreak
              }
              break
            case 'water_daily': currentValue = Number(currentMetrics?.waterIntake) || 0; break
            case 'water_total': currentValue = Number(metricsStats?.total_water) || 0; break
            case 'steps_daily': currentValue = Number(currentMetrics?.steps) || 0; break
            case 'steps_total': currentValue = Number(metricsStats?.total_steps) || 0; break
            case 'energy_max': currentValue = Number(metricsStats?.energy_max_count) || 0; break
            case 'total_entries': currentValue = allEntriesCount; break
            case 'monthly_entries': currentValue = monthEntriesCount; break
            case 'habits_created': currentValue = userSettings?.habits?.length || 0; break
            case 'habit_complete_any': 
              currentValue = Object.values(habitsCompleted || {}).some(v => v === true) ? 1 : 0
              targetValue = 1
              break
            case 'achievement_count':
              currentValue = unlockedMap.size
              if (targetValue === 0) targetValue = allAchievements.length
              break
            case 'referral_mentor':
              const hasRefs = mentorRefs.length > 0
              const hasPurchased = mentorRefs.some((r: any) => r.status === 'first_purchase_made')
              const mentorFields = [
                { label: 'Код использован', done: hasRefs },
                { label: 'Друг зарегистрирован', done: hasRefs }, 
                { label: 'Первая покупка друга', done: hasPurchased },
              ]
              currentValue = mentorFields.filter(f => f.done).length
              targetValue = 3
              progressData = { fields: mentorFields }
              break
            case 'profile_complete':
              const fields = [
                { label: 'Имя', done: !!userProfile?.full_name },
                { label: 'Телефон', done: !!userProfile?.phone },
                { label: 'Почта', done: !!userProfile?.email },
                { label: 'Аватар', done: !!userProfile?.avatar_url },
                { label: 'Вес', done: !!userSettings?.user_params?.weight },
                { label: 'Рост', done: !!userSettings?.user_params?.height },
                { label: 'Возраст', done: !!userSettings?.user_params?.age },
              ]
              currentValue = fields.filter(f => f.done).length
              targetValue = 7
              progressData = { fields }
              break
            case 'perfect_streak':
              if (targetValue === 7) {
                const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
                const fields = days.map((label, idx) => ({ label, done: isPerfectDay(weeklyEntries[idx], userSettings) })).reverse()
                currentValue = fields.filter(f => f.done).length
                targetValue = 7
                progressData = { fields }
              } else {
                currentValue = currentStreak
              }
              break
            case 'subscription_tier':
              currentValue = currentTierLevel
              targetValue = tierLevels[metadata.value] || 0
              break
            case 'weight_goal_reached':
              currentValue = 0; targetValue = 1; break
            case 'registration':
              currentValue = 1; targetValue = 1; break
          }
        }

        if (isUnlocked) currentValue = targetValue
        const progress = targetValue > 0 ? Math.min(100, Math.round((currentValue / targetValue) * 100)) : 0

        return { ...achievement, isUnlocked, unlockedAt, currentValue, targetValue, progress, progressData }
      } catch (err) {
        console.error(`[Achievements] Error processing ${achievement.id}:`, err)
        return { ...achievement, isUnlocked: unlockedMap.has(achievement.id), unlockedAt: unlockedMap.get(achievement.id) || null, currentValue: 0, targetValue: 0, progress: 0 }
      }
    })

    return { success: true, data }
  } catch (error: any) {
    console.error('[Achievements] CRITICAL ERROR:', error.message || error)
    return { success: false, error: 'Ошибка при расчете достижений' }
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
  const [totalRes, userRes] = await Promise.all([
    supabase.from('achievements').select('*', { count: 'exact', head: true }),
    supabase.from('user_achievements').select('*').eq('user_id', userId).order('unlocked_at', { ascending: false }).limit(10)
  ])

  if (totalRes.error || userRes.error) return { success: false, error: 'Ошибка получения статистики' }

  const total = totalRes.count || 0
  const unlocked = userRes.data?.length || 0
  const percentage = total > 0 ? Math.round((unlocked / total) * 100) : 0

  return {
    success: true,
    data: { total, unlocked, percentage, recentUnlocked: userRes.data || [] },
  }
}

// ============================================
// Базовая логика разблокировки (без изменений)
// ============================================

async function unlockAchievementInternal(userId: string, achievementId: string, supabase: any) {
  try {
    const { data: unlocked, error: rpcError } = await supabase.rpc('unlock_achievement_for_user', { p_user_id: userId, p_achievement_id: achievementId })
    if (rpcError || !unlocked) return { success: false }
    const { data: achievement } = await supabase.from('achievements').select('*').eq('id', achievementId).single()
    return { success: true, achievement }
  } catch { return { success: false } }
}

export async function unlockAchievement(userId: string, achievementId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Авторизуйтесь' }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { success: false, error: 'Нет прав' }
  const result = await unlockAchievementInternal(userId, achievementId, supabase)
  if (result.success) { revalidatePath('/dashboard/health-tracker'); revalidatePath('/dashboard/bonuses') }
  return result
}

export async function checkAndUnlockAchievements(userId: string) {
  const supabase = await createClient()
  try {
    const { data: userAchievements } = await supabase.from('user_achievements').select('achievement_id').eq('user_id', userId)
    const unlockedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || [])
    
    // Простые заглушки для проверки (полная логика в миграциях/RPC)
    // Здесь можно вызывать специфичные функции check... если они нужны на стороне TS
    return { success: true, newAchievements: [] }
  } catch { return { success: false } }
}
