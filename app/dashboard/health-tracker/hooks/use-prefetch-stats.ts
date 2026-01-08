'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { 
  getWaterStats, 
  getStepsStats, 
  getWeightStats,
  getCaffeineStats,
  getSleepStats,
  getMoodStats,
  getNutritionStats,
  getHabitsStats,
  getNotesStats,
  getOverviewStatsAggregated
} from '@/lib/actions/health-stats'
import { DateRange, TrackerSettings, Habit } from '../types'
import { serializeDateRange } from '../utils/query-utils'

interface UsePrefetchStatsOptions {
  userId: string | null
  dateRange: DateRange
  enabled: boolean
  settings: TrackerSettings
  habits: Habit[]
}

/**
 * Хук для фоновой предзагрузки данных статистики
 * Загружает данные в кэш React Query сразу после инициализации трекера
 */
export function usePrefetchStats({ userId, dateRange, enabled, settings, habits }: UsePrefetchStatsOptions) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!enabled || !userId) return

    // Даем небольшую задержку для загрузки settings и habits
    const timer = setTimeout(() => {
      async function prefetchAllStats() {
        try {
          // Определяем, какие виджеты активны
          const activeWidgets = Object.entries(settings.widgets)
            .filter(([_, widget]) => widget.enabled)
            .map(([id]) => id)

          // Создаем массив промисов для параллельной загрузки
          const prefetchPromises: Promise<void>[] = []

          // Создаем стабильный ключ из dateRange
          const dateRangeKey = serializeDateRange(dateRange)

          // Предзагружаем данные обзора (всегда)
          prefetchPromises.push(
            queryClient.prefetchQuery({
              queryKey: ['stats', 'overview', userId, dateRangeKey],
              queryFn: () => getOverviewStatsAggregated(userId, dateRange, settings, habits),
              staleTime: 30 * 1000, // 30 секунд
            })
          )

        // Предзагружаем данные только для активных виджетов
        if (activeWidgets.includes('water')) {
          prefetchPromises.push(
            queryClient.prefetchQuery({
              queryKey: ['stats', 'water', userId, dateRangeKey],
              queryFn: () => getWaterStats(userId, dateRange),
              staleTime: 30 * 1000,
            })
          )
        }

        if (activeWidgets.includes('steps')) {
          prefetchPromises.push(
            queryClient.prefetchQuery({
              queryKey: ['stats', 'steps', userId, dateRangeKey],
              queryFn: () => getStepsStats(userId, dateRange),
              staleTime: 30 * 1000,
            })
          )
        }

        if (activeWidgets.includes('weight')) {
          prefetchPromises.push(
            queryClient.prefetchQuery({
              queryKey: ['stats', 'weight', userId, dateRangeKey],
              queryFn: () => getWeightStats(userId, dateRange),
              staleTime: 30 * 1000,
            })
          )
        }

        if (activeWidgets.includes('caffeine')) {
          prefetchPromises.push(
            queryClient.prefetchQuery({
              queryKey: ['stats', 'caffeine', userId, dateRangeKey],
              queryFn: () => getCaffeineStats(userId, dateRange),
              staleTime: 30 * 1000,
            })
          )
        }

        if (activeWidgets.includes('sleep')) {
          prefetchPromises.push(
            queryClient.prefetchQuery({
              queryKey: ['stats', 'sleep', userId, dateRangeKey],
              queryFn: () => getSleepStats(userId, dateRange),
              staleTime: 30 * 1000,
            })
          )
        }

        if (activeWidgets.includes('mood')) {
          prefetchPromises.push(
            queryClient.prefetchQuery({
              queryKey: ['stats', 'mood', userId, dateRangeKey],
              queryFn: () => getMoodStats(userId, dateRange),
              staleTime: 30 * 1000,
            })
          )
        }

        if (activeWidgets.includes('nutrition')) {
          prefetchPromises.push(
            queryClient.prefetchQuery({
              queryKey: ['stats', 'nutrition', userId, dateRangeKey],
              queryFn: () => getNutritionStats(userId, dateRange),
              staleTime: 30 * 1000,
            })
          )
        }

        // Всегда предзагружаем статистику привычек (если есть привычки)
        prefetchPromises.push(
          queryClient.prefetchQuery({
            queryKey: ['stats', 'habits', userId, dateRangeKey],
            queryFn: () => getHabitsStats(userId, dateRange),
            staleTime: 30 * 1000,
          })
        )

        // Предзагружаем заметки
        prefetchPromises.push(
          queryClient.prefetchQuery({
            queryKey: ['notes-stats', userId, dateRange.start.toISOString(), dateRange.end.toISOString()],
            queryFn: () => getNotesStats(userId, dateRange),
            staleTime: 30 * 1000,
          })
        )

        // Выполняем все предзагрузки параллельно
        await Promise.all(prefetchPromises)
        
        console.log('✅ Фоновая предзагрузка статистики завершена')
      } catch (error) {
        console.error('❌ Ошибка предзагрузки статистики:', error)
      }
    }

    // Запускаем предзагрузку
    prefetchAllStats()
    }, 500) // Задержка 500ms для загрузки settings и habits

    return () => clearTimeout(timer)
  }, [dateRange, enabled, userId, settings.widgets, habits, queryClient])
}
