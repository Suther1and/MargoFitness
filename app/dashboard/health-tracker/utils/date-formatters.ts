import { format, differenceInDays } from 'date-fns'
import { ru } from 'date-fns/locale'
import { DateRange } from '../types'

/**
 * Форматирует диапазон дат для отображения в UI статистики
 * 
 * @param dateRange - Диапазон дат (start, end)
 * @returns Строка вида "7 дней, 1 янв - 8 янв"
 * 
 * @example
 * ```ts
 * getStatsPeriodLabel({ start: new Date('2024-01-01'), end: new Date('2024-01-07') })
 * // "7 дней, 1 янв - 7 янв"
 * ```
 */
export function getStatsPeriodLabel(dateRange: DateRange): string {
  const days = differenceInDays(dateRange.end, dateRange.start)
  const startStr = format(dateRange.start, 'd MMM', { locale: ru })
  const endStr = format(dateRange.end, 'd MMM', { locale: ru })
  
  return `${days} дней, ${startStr} - ${endStr}`
}

