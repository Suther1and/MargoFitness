'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/contexts/toast-context'
import { checkAndUnlockAchievements } from '@/lib/actions/achievements'
import { createClient } from '@/lib/supabase/client'
import type { Achievement } from '@/types/database'

/**
 * Компонент для проверки достижений при загрузке и после разблокировки
 * Должен быть внутри ToastProvider
 */
export function AchievementsChecker({ mounted }: { mounted: boolean }) {
  const { showAchievement } = useToast()
  const queryClient = useQueryClient()

  // Проверка при загрузке страницы
  useEffect(() => {
    async function checkAchievements() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) return

        const result = await checkAndUnlockAchievements(user.id)
        
        if (result.success && result.newAchievements && result.newAchievements.length > 0) {
          // Инвалидируем кэш достижений, чтобы виджеты обновились
          queryClient.invalidateQueries({ queryKey: ['achievements'] })

          // Показываем уведомления о новых достижениях
          result.newAchievements.forEach(achievement => {
            showAchievement(achievement)
          })
        }
      } catch (err) {
        console.error('[AchievementsChecker] Error checking achievements on load:', err)
      }
    }

    if (mounted) {
      checkAchievements()
    }
  }, [mounted, showAchievement, queryClient])

  // Слушаем события разблокировки достижений (после сохранения дневника)
  useEffect(() => {
    const handleAchievementsUnlocked = (event: CustomEvent<{ achievements: Achievement[] }>) => {
      console.log('[AchievementsChecker] Received achievements-unlocked event:', event.detail.achievements.length)
      
      // Инвалидируем кэш достижений, чтобы виджеты обновились
      queryClient.invalidateQueries({ queryKey: ['achievements'] })

      event.detail.achievements.forEach(achievement => {
        showAchievement(achievement)
      })
    }

    window.addEventListener('achievements-unlocked' as any, handleAchievementsUnlocked as any)
    
    return () => {
      window.removeEventListener('achievements-unlocked' as any, handleAchievementsUnlocked as any)
    }
  }, [showAchievement, queryClient])

  return null
}
