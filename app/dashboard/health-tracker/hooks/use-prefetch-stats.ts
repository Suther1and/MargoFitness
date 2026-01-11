'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { addDays, format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
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

  // Prefetch соседних дней (только прошлые: -7...-1, 0)
  useEffect(() => {
    if (!userId || !enabled || !selectedDate) return

    const supabase = createClient()
    
    // Prefetch только прошлые дни + сегодня (будущие недоступны для пользователя)
    const daysToPreload = [-7, -6, -5, -4, -3, -2, -1, 0]
    
    daysToPreload.forEach(offset => {
      const targetDate = addDays(selectedDate, offset)
      const dateStr = format(targetDate, 'yyyy-MM-dd')
      const today = format(new Date(), 'yyyy-MM-dd')
      const isToday = dateStr === today
      
      // Prefetch в фоне
      queryClient.prefetchQuery({
        queryKey: ['diary-entry', userId, dateStr],
        queryFn: async () => {
          const { data, error } = await supabase
            .from('diary_entries')
            .select('*')
            .eq('user_id', userId)
            .eq('date', dateStr)
            .maybeSingle()
          
          if (error) {
            console.error('[Prefetch] Error:', error)
            return null
          }
          
          return data
        },
        staleTime: isToday ? 30 * 1000 : 15 * 60 * 1000,
      })
    })
  }, [userId, enabled, selectedDate, queryClient])

  // Prefetch overview stats при входе в dashboard
  useEffect(() => {
    if (!userId || !enabled) return

    const supabase = createClient()
    const dateRangeKey = serializeDateRange(dateRange)
    
    queryClient.prefetchQuery({
      queryKey: ['stats', 'overview', userId, dateRangeKey],
      queryFn: async () => {
        const startDate = format(dateRange.start, 'yyyy-MM-dd')
        const endDate = format(dateRange.end, 'yyyy-MM-dd')

        const { data: entries } = await supabase
          .from('diary_entries')
          .select('date, metrics, notes, habits_completed')
          .eq('user_id', userId)
          .gte('date', startDate)
          .lt('date', endDate)
          .order('date', { ascending: true })

        // Агрегация будет в use-overview-stats
        return entries
      },
      staleTime: 60 * 1000,
    })
  }, [userId, enabled, dateRange, settings, habits, queryClient])
}
