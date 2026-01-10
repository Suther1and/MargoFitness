import { Habit, DayOfWeek } from '../types'

/**
 * Конвертирует Date в строку дня недели
 */
export function getDayOfWeek(date: Date): DayOfWeek {
  const dayNum = date.getDay() // 0 = воскресенье, 1 = понедельник, ..., 6 = суббота
  
  const mapping: Record<number, DayOfWeek> = {
    0: 'sun',
    1: 'mon',
    2: 'tue',
    3: 'wed',
    4: 'thu',
    5: 'fri',
    6: 'sat'
  }
  
  return mapping[dayNum]
}

/**
 * Проверяет, должна ли привычка показаться в указанную дату
 */
export function shouldShowHabitOnDate(habit: Habit, date: Date): boolean {
  if (!habit.enabled) return false
  
  // Если массив не задан или пустой, считаем что привычка ежедневная
  if (!habit.daysOfWeek || habit.daysOfWeek.length === 0) {
    return true
  }
  
  const dayOfWeek = getDayOfWeek(date)
  return habit.daysOfWeek.includes(dayOfWeek)
}

/**
 * Фильтрует привычки для конкретной даты
 */
export function getActiveHabitsForDate(habits: Habit[], date: Date): Habit[] {
  return habits.filter(habit => shouldShowHabitOnDate(habit, date))
}

/**
 * Упрощенный расчет текущего стрика для привычки
 * 
 * Алгоритм:
 * 1. Идем от сегодня к прошлому
 * 2. Для каждого дня проверяем: должна ли привычка показаться
 * 3. Если должна И выполнена → стрик++
 * 4. Если должна НО НЕ выполнена → СТОП, возвращаем стрик
 * 5. Если не должна → пропускаем день
 * 
 * @param habit - Привычка для расчета
 * @param diaryEntries - Записи дневника (отсортированные от новых к старым)
 * @param today - Текущая дата для расчета
 * @returns Текущий стрик (количество выполненных подряд запланированных дней)
 */
export function calculateCurrentStreak(
  habit: Habit,
  diaryEntries: Array<{ date: string; habits_completed: Record<string, boolean> | null }>,
  today: Date = new Date()
): number {
  let streak = 0
  
  // Сортируем от новых к старым
  const sortedEntries = [...diaryEntries]
    .filter(entry => entry.habits_completed !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  
  // Проходим по записям от сегодня к прошлому
  for (const entry of sortedEntries) {
    const entryDate = new Date(entry.date)
    
    // Пропускаем будущие даты
    if (entryDate > today) continue
    
    // Проверяем, должна ли привычка показаться в этот день
    if (!shouldShowHabitOnDate(habit, entryDate)) {
      // День не запланирован - пропускаем, не влияет на стрик
      continue
    }
    
    // День запланирован - проверяем выполнение
    const completed = entry.habits_completed?.[habit.id] === true
    
    if (completed) {
      // Выполнено - увеличиваем стрик
      streak++
    } else {
      // Не выполнено - прерываем подсчет
      break
    }
  }
  
  return streak
}

/**
 * Данные статистики для одной привычки (упрощенные)
 */
export interface HabitStatsData {
  id: string
  name: string
  completed: number      // Сколько раз выполнена
  total: number         // Сколько раз должна была показаться
  streak: number        // Текущая серия выполнения
  maxStreak: number     // Максимальная серия за весь период
}

/**
 * Рассчитывает статистику для привычки с учетом расписания (упрощенная версия)
 */
export function calculateHabitStats(
  habit: Habit,
  rawData: Array<{ date: string; habits_completed: Record<string, boolean> | null }>,
  today: Date = new Date()
): HabitStatsData {
  let totalCompleted = 0
  let totalScheduled = 0
  let maxStreak = 0
  let tempStreak = 0
  
  // Сортируем данные от старых к новым для правильного подсчета maxStreak
  const sortedData = [...rawData]
    .filter(entry => entry.habits_completed !== null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  sortedData.forEach(entry => {
    const entryDate = new Date(entry.date)
    
    // Проверяем, должна ли привычка показаться в этот день
    if (!shouldShowHabitOnDate(habit, entryDate)) {
      return // День не запланирован - пропускаем
    }
    
    totalScheduled++
    const completed = entry.habits_completed?.[habit.id] === true
    
    if (completed) {
      totalCompleted++
      tempStreak++
      maxStreak = Math.max(maxStreak, tempStreak)
    } else {
      tempStreak = 0 // Сбрасываем временный стрик при пропуске
    }
  })
  
  // Рассчитываем текущий стрик
  const currentStreak = calculateCurrentStreak(habit, rawData, today)
  
  return {
    id: habit.id,
    name: habit.title,
    completed: totalCompleted,
    total: totalScheduled,
    streak: currentStreak,
    maxStreak: Math.max(maxStreak, currentStreak) // Убеждаемся что текущий стрик учтен
  }
}

/**
 * Рассчитывает средний процент выполнения всех привычек по дням
 */
export function calculateAverageCompletion(
  habits: Habit[],
  rawData: Array<{ date: string; habits_completed: Record<string, boolean> | null }>
): number {
  const activeHabits = habits.filter(h => h.enabled)
  
  if (activeHabits.length === 0) return 0
  
  const dailyCompletions: number[] = []
  
  rawData.forEach(entry => {
    if (!entry.habits_completed) return
    
    const date = new Date(entry.date)
    const scheduledHabits = activeHabits.filter(h => shouldShowHabitOnDate(h, date))
    
    if (scheduledHabits.length === 0) return // Нет привычек в этот день
    
    const completedCount = scheduledHabits.filter(h =>
      entry.habits_completed?.[h.id] === true
    ).length
    
    const dayCompletion = (completedCount / scheduledHabits.length) * 100
    dailyCompletions.push(dayCompletion)
  })
  
  if (dailyCompletions.length === 0) return 0
  
  return Math.round(
    dailyCompletions.reduce((sum, val) => sum + val, 0) / dailyCompletions.length
  )
}

/**
 * Анализ выполнения в будни vs выходные
 */
export function analyzeWeekendPerformance(
  habits: Habit[],
  rawData: Array<{ date: string; habits_completed: Record<string, boolean> | null }>
): {
  weekdayCompletion: number
  weekendCompletion: number
  weekendDrop: number
} {
  const activeHabits = habits.filter(h => h.enabled)
  
  if (activeHabits.length === 0) {
    return { weekdayCompletion: 0, weekendCompletion: 0, weekendDrop: 0 }
  }
  
  const weekdayData: number[] = []
  const weekendData: number[] = []
  
  rawData.forEach(entry => {
    if (!entry.habits_completed) return
    
    const date = new Date(entry.date)
    const dayOfWeek = date.getDay() // 0 = вс, 6 = сб
    
    const scheduledHabits = activeHabits.filter(h => shouldShowHabitOnDate(h, date))
    
    if (scheduledHabits.length === 0) return
    
    const completedCount = scheduledHabits.filter(h =>
      entry.habits_completed?.[h.id] === true
    ).length
    
    const completionPercent = Math.round(
      (completedCount / scheduledHabits.length) * 100
    )
    
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weekendData.push(completionPercent)
    } else {
      weekdayData.push(completionPercent)
    }
  })
  
  const weekdayCompletion = weekdayData.length > 0
    ? Math.round(weekdayData.reduce((s, v) => s + v, 0) / weekdayData.length)
    : 0
  
  const weekendCompletion = weekendData.length > 0
    ? Math.round(weekendData.reduce((s, v) => s + v, 0) / weekendData.length)
    : 0
  
  const weekendDrop = weekdayCompletion > 0
    ? Math.round(((weekdayCompletion - weekendCompletion) / weekdayCompletion) * 100)
    : 0
  
  return {
    weekdayCompletion,
    weekendCompletion,
    weekendDrop
  }
}
