'use server'

import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'

interface DateRange {
  start: Date
  end: Date
}

/**
 * Получить статистику за период для указанных метрик
 * 
 * @param userId - ID пользователя
 * @param dateRange - Диапазон дат (start включительно, end НЕ включительно)
 * @param metrics - Массив названий метрик для извлечения
 * @returns Массив объектов {date, metrics} за указанный период
 * 
 * @example
 * const stats = await getStatsForPeriod(userId, { start, end }, ['water', 'steps'])
 * // [{date: '2024-01-01', metrics: {water: 2000, steps: 8000}}, ...]
 */
export async function getStatsForPeriod(
  userId: string,
  dateRange: DateRange,
  metrics?: string[]
) {
  const supabase = await createClient()

  try {
    const startDate = format(dateRange.start, 'yyyy-MM-dd')
    const endDate = format(dateRange.end, 'yyyy-MM-dd')

    const { data, error } = await supabase
      .from('diary_entries')
      .select('date, metrics, notes, habits_completed')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lt('date', endDate) // Исключаем конечную дату (текущий день)
      .order('date', { ascending: true })

    if (error) {
      console.error('[Health Stats] Error fetching stats:', error)
      return { success: false, error: error.message, data: [] }
    }

    // Если указаны конкретные метрики, фильтруем их
    const processedData = data.map(entry => {
      if (metrics && metrics.length > 0) {
        const filteredMetrics: any = {}
        metrics.forEach(metric => {
          if (entry.metrics && entry.metrics[metric] !== undefined) {
            filteredMetrics[metric] = entry.metrics[metric]
          }
        })
        return {
          date: entry.date,
          metrics: filteredMetrics,
          notes: entry.notes,
          habits_completed: entry.habits_completed
        }
      }
      return entry
    })

    return { success: true, data: processedData }
  } catch (err: any) {
    console.error('[Health Stats Unexpected] getStatsForPeriod:', err)
    return { success: false, error: err?.message || 'Internal Server Error', data: [] }
  }
}

/**
 * Получить статистику по воде
 */
export async function getWaterStats(userId: string, dateRange: DateRange) {
  const result = await getStatsForPeriod(userId, dateRange, ['waterIntake'])
  
  if (!result.success) return result

  const waterData = result.data.map(entry => ({
    date: entry.date,
    water: entry.metrics?.waterIntake || 0
  }))

  return { success: true, data: waterData }
}

/**
 * Получить статистику по шагам
 */
export async function getStepsStats(userId: string, dateRange: DateRange) {
  const result = await getStatsForPeriod(userId, dateRange, ['steps'])
  
  if (!result.success) return result

  const stepsData = result.data.map(entry => ({
    date: entry.date,
    steps: entry.metrics?.steps || 0
  }))

  return { success: true, data: stepsData }
}

/**
 * Получить статистику по весу
 */
export async function getWeightStats(userId: string, dateRange: DateRange) {
  const result = await getStatsForPeriod(userId, dateRange, ['weight'])
  
  if (!result.success) return result

  const weightData = result.data.map(entry => ({
    date: entry.date,
    weight: entry.metrics?.weight || null
  })).filter(entry => entry.weight !== null)

  return { success: true, data: weightData }
}

/**
 * Получить статистику по кофеину
 */
export async function getCaffeineStats(userId: string, dateRange: DateRange) {
  const result = await getStatsForPeriod(userId, dateRange, ['caffeineIntake'])
  
  if (!result.success) return result

  const caffeineData = result.data.map(entry => ({
    date: entry.date,
    caffeine: entry.metrics?.caffeineIntake || 0
  }))

  return { success: true, data: caffeineData }
}

/**
 * Получить статистику по сну
 */
export async function getSleepStats(userId: string, dateRange: DateRange) {
  const result = await getStatsForPeriod(userId, dateRange, ['sleepHours'])
  
  if (!result.success) return result

  const sleepData = result.data.map(entry => ({
    date: entry.date,
    hours: entry.metrics?.sleepHours || 0
  }))

  return { success: true, data: sleepData }
}

/**
 * Получить статистику по настроению
 */
export async function getMoodStats(userId: string, dateRange: DateRange) {
  const result = await getStatsForPeriod(userId, dateRange, ['mood', 'energyLevel'])
  
  if (!result.success) return result

  const moodData = result.data.map(entry => ({
    date: entry.date,
    mood: entry.metrics?.mood || null,
    energy: entry.metrics?.energyLevel || null
  })).filter(entry => entry.mood !== null || entry.energy !== null)

  return { success: true, data: moodData }
}

/**
 * Получить статистику по питанию (калории + качество)
 */
export async function getNutritionStats(userId: string, dateRange: DateRange) {
  const result = await getStatsForPeriod(userId, dateRange, ['calories', 'foodQuality'])
  
  if (!result.success) return result

  const nutritionData = result.data.map(entry => ({
    date: entry.date,
    calories: entry.metrics?.calories || 0,
    foodQuality: entry.metrics?.foodQuality || null
  }))

  return { success: true, data: nutritionData }
}

/**
 * Получить статистику по привычкам
 */
export async function getHabitsStats(userId: string, dateRange: DateRange) {
  const result = await getStatsForPeriod(userId, dateRange)
  
  if (!result.success) return result

  const habitsData = result.data.map(entry => ({
    date: entry.date,
    habits_completed: entry.habits_completed || {}
  }))

  return { success: true, data: habitsData }
}

/**
 * Получить заметки за период
 */
export async function getNotesStats(userId: string, dateRange: DateRange) {
  const result = await getStatsForPeriod(userId, dateRange)
  
  if (!result.success) return result

  const notesData = result.data
    .filter(entry => entry.notes && entry.notes.trim() !== '')
    .map(entry => ({
      date: entry.date,
      notes: entry.notes,
      mood: entry.metrics?.mood || null
    }))

  return { success: true, data: notesData }
}

/**
 * Получить общую статистику (все метрики)
 */
export async function getOverallStats(userId: string, dateRange: DateRange) {
  return await getStatsForPeriod(userId, dateRange)
}

