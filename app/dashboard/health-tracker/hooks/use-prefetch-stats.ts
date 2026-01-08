'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { DateRange, TrackerSettings, Habit } from '../types'

interface UsePrefetchStatsOptions {
  userId: string | null
  dateRange: DateRange
  enabled: boolean
  settings: TrackerSettings
  habits: Habit[]
}

/**
 * Хук для фоновой предзагрузки данных статистики
 * 
 * ОТКЛЮЧЕН: так как используется staleTime: 0 и refetchOnMount: 'always',
 * prefetch не имеет смысла - данные всегда перезагружаются при открытии статистики
 */
export function usePrefetchStats({ userId, dateRange, enabled, settings, habits }: UsePrefetchStatsOptions) {
  // Prefetch отключен - используется refetchOnMount: 'always' в компонентах
  // Это гарантирует актуальность данных после каждого сохранения
}
