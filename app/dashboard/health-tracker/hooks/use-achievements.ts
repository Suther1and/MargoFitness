'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { AchievementWithStatus } from '@/types/database'

/**
 * Хук для получения последних N достижений
 * Использует прямой вызов Supabase вместо Server Action для скорости
 */
export function useRecentAchievements(userId: string | null, limit: number = 3) {
  return useQuery({
    queryKey: ['achievements', 'recent', userId, limit],
    queryFn: async (): Promise<AchievementWithStatus[]> => {
      if (!userId) return []
      
      const supabase = createClient()
      
      const { data: userAchievements, error } = await supabase
        .from('user_achievements')
        .select('*, achievement:achievements(*)')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false })
        .limit(limit)
      
      if (error) {
        console.error('[useRecentAchievements] Error:', error)
        throw new Error('Не удалось получить последние достижения')
      }
      
      const data = userAchievements.map((ua: any) => ({
        ...ua.achievement,
        isUnlocked: true,
        unlockedAt: ua.unlocked_at,
      }))
      
      return data
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 минуты - достижения не меняются так часто
    gcTime: 30 * 60 * 1000, // 30 минут
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
}

/**
 * Хук для получения статистики достижений
 */
export function useAchievementStats(userId: string | null) {
  return useQuery({
    queryKey: ['achievements', 'stats', userId],
    queryFn: async () => {
      if (!userId) return null
      
      const supabase = createClient()
      
      // Получаем общее количество достижений
      const { count: totalCount, error: totalError } = await supabase
        .from('achievements')
        .select('*', { count: 'exact', head: true })
      
      if (totalError) {
        console.error('[useAchievementStats] Error counting:', totalError)
        throw new Error('Не удалось получить статистику')
      }
      
      // Получаем полученные достижения
      const { count: unlockedCount, error: unlockedError } = await supabase
        .from('user_achievements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
      
      if (unlockedError) {
        console.error('[useAchievementStats] Error counting unlocked:', unlockedError)
        throw new Error('Не удалось получить статистику')
      }
      
      const total = totalCount || 0
      const unlocked = unlockedCount || 0
      const percentage = total > 0 ? Math.round((unlocked / total) * 100) : 0
      
      return {
        total,
        unlocked,
        percentage,
      }
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 минуты
    gcTime: 30 * 60 * 1000, // 30 минут
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
}

/**
 * Хук для получения всех достижений со статусом
 */
export function useAllAchievements(userId: string | null) {
  return useQuery({
    queryKey: ['achievements', 'all', userId],
    queryFn: async (): Promise<AchievementWithStatus[]> => {
      if (!userId) return []
      
      const supabase = createClient()
      
      // Получаем все достижения и полученные достижения параллельно
      const [{ data: allAchievements, error: achievementsError }, { data: userAchievements, error: userError }] = await Promise.all([
        supabase
          .from('achievements')
          .select('*')
          .order('sort_order', { ascending: true }),
        supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', userId)
      ])
      
      if (achievementsError) {
        console.error('[useAllAchievements] Error fetching achievements:', achievementsError)
        throw new Error('Не удалось получить достижения')
      }
      
      if (userError) {
        console.error('[useAllAchievements] Error fetching user achievements:', userError)
        throw new Error('Не удалось получить достижения пользователя')
      }
      
      // Создаем Map для быстрого поиска
      const unlockedMap = new Map(
        (userAchievements || []).map(ua => [ua.achievement_id, ua.unlocked_at])
      )
      
      // Объединяем данные
      const data: AchievementWithStatus[] = (allAchievements || []).map(achievement => ({
        ...achievement,
        isUnlocked: unlockedMap.has(achievement.id),
        unlockedAt: unlockedMap.get(achievement.id) || null,
      }))
      
      return data
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 минуты
    gcTime: 30 * 60 * 1000, // 30 минут
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
}
