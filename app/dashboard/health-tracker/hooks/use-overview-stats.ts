'use client'

import { useQuery } from '@tanstack/react-query'
import { getOverviewStatsAggregated } from '@/lib/actions/health-stats'
import { DateRange, TrackerSettings, Habit, OverviewStats } from '../types'
import { serializeDateRange } from '../utils/query-utils'

interface UseOverviewStatsOptions {
  userId: string | null
  dateRange: DateRange
  settings: TrackerSettings
  habits: Habit[]
}

/**
 * Хук для получения агрегированной статистики обзора
 * Использует React Query для кеширования и автоматического обновления
 */
export function useOverviewStats({ 
  userId, 
  dateRange, 
  settings, 
  habits 
}: UseOverviewStatsOptions) {
  const dateRangeKey = serializeDateRange(dateRange)
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['stats', 'overview', userId, dateRangeKey],
    queryFn: async () => {
      if (!userId) return null
      return await getOverviewStatsAggregated(userId, dateRange, settings, habits)
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 секунд - данные обновляются чаще
  })

  return {
    data: data?.data as OverviewStats | null | undefined,
    isLoading,
    error
  }
}

