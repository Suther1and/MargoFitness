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
 * 
 * ОТКЛЮЧЕН: так как используется staleTime: 0 для гарантии свежести данных,
 * prefetch не имеет смысла - данные всегда будут перезагружаться при монтировании
 */
export function usePrefetchStats({ userId, dateRange, enabled, settings, habits }: UsePrefetchStatsOptions) {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Prefetch отключен - используется refetchOnMount: 'always' в компонентах
    // Это гарантирует актуальность данных после каждого сохранения
    console.log('ℹ️ Prefetch отключен - данные загружаются при монтировании компонентов')
  }, [])
}
