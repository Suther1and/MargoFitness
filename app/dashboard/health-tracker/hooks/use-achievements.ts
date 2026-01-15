'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { AchievementWithStatus, AchievementWithProgress } from '@/types/database'
import { getAllAchievementsWithStatus } from '@/lib/actions/achievements'

/**
 * Хук для получения последних N достижений
 * Использует прямой вызов Supabase вместо Server Action для скорости
 */
export function useRecentAchievements(userId: string | null, limit: number = 3) {
  return useQuery({
    queryKey: ['achievements', 'recent', userId, limit, 'v4'], // v4 для инвалидации после обновления цветов
    queryFn: async (): Promise<AchievementWithStatus[]> => {
      if (!userId) return []
      
      const supabase = createClient()
      
      const { data: userAchievements, error } = await supabase
        .from('user_achievements')
        .select('*, achievement:achievements(id, title, description, category, is_secret, reward_amount, icon, icon_url, color_class, metadata, sort_order, created_at)')
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
 * Хук для получения всех достижений со статусом и прогрессом
 */
export function useAllAchievements(userId: string | null) {
  return useQuery({
    queryKey: ['achievements', 'all', userId, 'v5'], // v5 для инвалидации
    queryFn: async (): Promise<AchievementWithProgress[]> => {
      if (!userId) return []
      
      const result = await getAllAchievementsWithStatus(userId)
      
      if (!result.success || !result.data) {
        console.error('[useAllAchievements] Error:', result.error)
        throw new Error(result.error || 'Не удалось получить достижения')
      }
      
      return result.data
    },
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 минута
    gcTime: 5 * 60 * 1000,
    refetchOnMount: true, // Нам нужен свежий прогресс при открытии
    refetchOnWindowFocus: false,
  })
}
