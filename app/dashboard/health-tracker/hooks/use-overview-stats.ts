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
  
  console.log('🔍 useOverviewStats queryKey:', ['stats', 'overview', userId, dateRangeKey])
  
  const { data, isLoading, error, dataUpdatedAt } = useQuery({
    queryKey: ['stats', 'overview', userId, dateRangeKey],
    queryFn: async () => {
      console.log('🔄 Загружаем данные обзора для периода:', dateRangeKey)
      if (!userId) return null
      const result = await getOverviewStatsAggregated(userId, dateRange, settings, habits)
      console.log('✅ Данные обзора загружены:', result)
      return result
    },
    enabled: !!userId,
    staleTime: 0, // Всегда считать данные устаревшими
    refetchOnMount: 'always', // Всегда перезагружать при монтировании
  })

  console.log('📊 Overview stats state:', { isLoading, dataUpdatedAt: new Date(dataUpdatedAt), hasData: !!data })

  return {
    data: data?.data as OverviewStats | null | undefined,
    isLoading,
    error
  }
}

