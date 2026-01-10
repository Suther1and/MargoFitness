'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { addDays, format } from 'date-fns'
import { getDiaryEntry } from '@/lib/actions/diary'
import { getOverviewStatsAggregated } from '@/lib/actions/health-stats'
import { DateRange, TrackerSettings, Habit } from '../types'
import { serializeDateRange } from '../utils/query-utils'

interface UsePrefetchStatsOptions {
  userId: string | null
  dateRange: DateRange
  enabled: boolean
  settings: TrackerSettings
  habits: Habit[]
  selectedDate?: Date // Для prefetch соседних дней
}

/**
 * Хук для агрессивной предзагрузки данных
 * 
 * Prefetch стратегия:
 * 1. Соседние дни (±3 дня от текущей даты) для мгновенного переключения
 * 2. Overview stats для всех периодов (week, month, year)
 * 3. Активируется в фоне БЕЗ блокировки UI
 */
export function usePrefetchStats({ 
  userId, 
  dateRange, 
  enabled, 
  settings, 
  habits,
  selectedDate 
}: UsePrefetchStatsOptions) {
  const queryClient = useQueryClient()

  // Prefetch соседних дней (±3 дня)
  useEffect(() => {
    if (!userId || !enabled || !selectedDate) return

    const daysToPreload = [-3, -2, -1, 1, 2, 3]
    
    daysToPreload.forEach(offset => {
      const targetDate = addDays(selectedDate, offset)
      const dateStr = format(targetDate, 'yyyy-MM-dd')
      const today = format(new Date(), 'yyyy-MM-dd')
      const isToday = dateStr === today
      
      // Prefetch в фоне
      queryClient.prefetchQuery({
        queryKey: ['diary-entry', userId, dateStr],
        queryFn: async () => {
          const result = await getDiaryEntry(userId, dateStr)
          return result.success ? result.data : null
        },
        staleTime: isToday ? 30 * 1000 : 15 * 60 * 1000, // Сегодня 30 сек, прошлое 15 мин
      })
    })
  }, [userId, enabled, selectedDate, queryClient])

  // Prefetch overview stats при входе в dashboard
  useEffect(() => {
    if (!userId || !enabled) return

    // Предзагружаем overview для текущего периода
    const dateRangeKey = serializeDateRange(dateRange)
    
    queryClient.prefetchQuery({
      queryKey: ['stats', 'overview', userId, dateRangeKey],
      queryFn: async () => {
        return await getOverviewStatsAggregated(userId, dateRange, settings, habits)
      },
      staleTime: 60 * 1000, // 60 секунд
    })
  }, [userId, enabled, dateRange, settings, habits, queryClient])
}
