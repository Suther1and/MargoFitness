import { DateRange } from '../types'

/**
 * Создает стабильный ключ из DateRange для использования в React Query queryKey
 * Это предотвращает проблемы с кешированием из-за изменения ссылок на объекты
 */
export function serializeDateRange(dateRange: DateRange): string {
  return `${dateRange.start.toISOString()}-${dateRange.end.toISOString()}`
}

