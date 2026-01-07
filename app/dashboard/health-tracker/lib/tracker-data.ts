/**
 * Data Layer для Health Tracker
 * 
 * Абстрактный слой для работы с данными трекера.
 * Сейчас использует моковые данные, но после интеграции с Supabase
 * нужно будет изменить только этот файл.
 */

import { DailyMetrics, MOCK_DATA, DateRange } from '../types'

/**
 * Получает метрики здоровья за конкретную дату
 * 
 * @param date - Дата для которой нужны метрики
 * @returns Promise с метриками за день
 * 
 * @todo Интеграция с Supabase: заменить на реальный запрос к БД
 * ```ts
 * const { data, error } = await supabase
 *   .from('daily_metrics')
 *   .select('*')
 *   .eq('date', date.toISOString().split('T')[0])
 *   .single()
 * ```
 */
export async function getMetricsForDate(date: Date): Promise<DailyMetrics> {
  // TODO: Реализовать запрос к Supabase
  // Пока возвращаем моковые данные
  return Promise.resolve({
    ...MOCK_DATA,
    date
  })
}

/**
 * Обновляет значение конкретной метрики
 * 
 * @param date - Дата метрики
 * @param metric - Название метрики (например, 'waterIntake', 'steps')
 * @param value - Новое значение
 * 
 * @todo Интеграция с Supabase: заменить на реальный UPDATE запрос
 * ```ts
 * const { error } = await supabase
 *   .from('daily_metrics')
 *   .update({ [metric]: value })
 *   .eq('date', date.toISOString().split('T')[0])
 *   .eq('user_id', userId)
 * ```
 */
export async function updateMetric(
  date: Date,
  metric: string,
  value: any
): Promise<void> {
  // TODO: Реализовать запрос к Supabase
  console.log(`[Mock] Updating metric: ${metric} = ${value} for date ${date.toISOString()}`)
  return Promise.resolve()
}

/**
 * Получает статистику за период
 * 
 * @param dateRange - Диапазон дат
 * @returns Promise с массивом метрик за период
 * 
 * @todo Интеграция с Supabase: заменить на реальный запрос с фильтрацией по датам
 * ```ts
 * const { data, error } = await supabase
 *   .from('daily_metrics')
 *   .select('*')
 *   .gte('date', dateRange.start.toISOString().split('T')[0])
 *   .lte('date', dateRange.end.toISOString().split('T')[0])
 *   .order('date', { ascending: true })
 * ```
 */
export async function getStatsForPeriod(
  dateRange: DateRange
): Promise<DailyMetrics[]> {
  // TODO: Реализовать запрос к Supabase
  // Пока генерируем моковые данные для периода
  const days = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24))
  const mockStats: DailyMetrics[] = []
  
  for (let i = 0; i <= days; i++) {
    const date = new Date(dateRange.start)
    date.setDate(date.getDate() + i)
    
    mockStats.push({
      ...MOCK_DATA,
      date,
      // Добавляем небольшую вариацию для демонстрации
      waterIntake: MOCK_DATA.waterIntake + Math.random() * 500 - 250,
      steps: Math.floor(MOCK_DATA.steps + Math.random() * 4000 - 2000),
      weight: MOCK_DATA.weight + (Math.random() * 2 - 1),
    })
  }
  
  return Promise.resolve(mockStats)
}

/**
 * Создает новую запись метрик для даты
 * 
 * @param date - Дата
 * @param metrics - Начальные значения метрик
 * 
 * @todo Интеграция с Supabase: заменить на INSERT запрос
 */
export async function createMetricsForDate(
  date: Date,
  metrics: Partial<DailyMetrics>
): Promise<DailyMetrics> {
  // TODO: Реализовать запрос к Supabase
  const newMetrics: DailyMetrics = {
    ...MOCK_DATA,
    ...metrics,
    date
  }
  
  console.log(`[Mock] Creating metrics for date ${date.toISOString()}`)
  return Promise.resolve(newMetrics)
}

/**
 * Обновляет несколько метрик одновременно
 * 
 * @param date - Дата
 * @param updates - Объект с обновлениями
 * 
 * @todo Интеграция с Supabase: использовать транзакцию или bulk update
 */
export async function updateMultipleMetrics(
  date: Date,
  updates: Partial<DailyMetrics>
): Promise<void> {
  // TODO: Реализовать запрос к Supabase
  console.log(`[Mock] Updating multiple metrics for date ${date.toISOString()}:`, updates)
  return Promise.resolve()
}

