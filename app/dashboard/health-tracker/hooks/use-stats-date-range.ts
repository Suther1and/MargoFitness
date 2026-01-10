import { useState, useCallback } from 'react'
import { subDays } from 'date-fns'
import { PeriodType, DateRange } from '../types'

/**
 * Хук для управления диапазоном дат в статистике
 * 
 * Объединяет связанный state: периодType, dateRange и состояние диалога
 * 
 * @returns Объект с состоянием и методами управления
 * 
 * @example
 * ```tsx
 * const { periodType, dateRange, isDialogOpen, openDialog, closeDialog, setPeriod } = useStatsDateRange()
 * 
 * // Открыть диалог выбора периода
 * openDialog()
 * 
 * // Установить новый период
 * setPeriod('30d', { start: subDays(new Date(), 30), end: new Date() })
 * ```
 */
export function useStatsDateRange() {
  const today = new Date()
  today.setHours(23, 59, 59, 999) // Конец сегодняшнего дня
  
  const sevenDaysAgo = subDays(today, 6)
  sevenDaysAgo.setHours(0, 0, 0, 0) // Начало дня
  
  const [periodType, setPeriodType] = useState<PeriodType>('7d')
  const [dateRange, setDateRange] = useState<DateRange>({ 
    start: sevenDaysAgo, 
    end: today 
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const openDialog = useCallback(() => {
    setIsDialogOpen(true)
  }, [])

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false)
  }, [])

  const setPeriod = useCallback((newPeriodType: PeriodType, newDateRange: DateRange) => {
    setPeriodType(newPeriodType)
    setDateRange(newDateRange)
  }, [])

  return {
    periodType,
    dateRange,
    isDialogOpen,
    openDialog,
    closeDialog,
    setPeriod,
  }
}

