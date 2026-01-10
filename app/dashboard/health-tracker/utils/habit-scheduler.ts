import { Habit, DayOfWeek } from '../types'
import { startOfDay, isSameDay } from 'date-fns'

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
  
  // Обратная совместимость: если daysOfWeek не задан, показываем каждый день
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
 * Данные статистики для одной привычки
 */
export interface HabitStatsData {
  id: string
  name: string
  completed: number      // Сколько раз выполнена
  total: number         // Сколько раз должна была показаться
  streak: number        // Текущая серия выполнения
  maxStreak: number     // Максимальная серия
  scheduledDays: Date[] // Все даты когда должна была показаться
}

/**
 * Вспомогательная функция: проверяет, является ли запись первым запланированным днем
 */
function isFirstScheduledDay(
  sortedData: Array<{ date: string; habits_completed: Record<string, boolean> }>,
  currentIndex: number,
  habit: Habit
): boolean {
  if (currentIndex === 0) return true
  
  // Проверяем, был ли предыдущий день запланирован
  for (let i = currentIndex - 1; i >= 0; i--) {
    const prevDate = new Date(sortedData[i].date)
    if (shouldShowHabitOnDate(habit, prevDate)) {
      return false // Есть предыдущий запланированный день
    }
  }
  
  return true // Нет предыдущих запланированных дней
}

/**
 * Рассчитывает все метрики для привычки с учетом расписания
 */
export function calculateHabitStats(
  habit: Habit,
  rawData: Array<{ date: string; habits_completed: Record<string, boolean> | null }>
): HabitStatsData {
  // Сортируем данные от новых к старым
  const sortedData = [...rawData]
    .filter(entry => entry.habits_completed !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  
  let currentStreak = 0
  let maxStreak = 0
  let tempStreak = 0
  let totalCompleted = 0
  let totalScheduled = 0
  const scheduledDays: Date[] = []
  
  let foundFirstMissOrNonScheduled = false
  
  sortedData.forEach((entry, index) => {
    const entryDate = new Date(entry.date)
    
    // КРИТИЧНО: проверяем должна ли привычка показаться в этот день
    if (!shouldShowHabitOnDate(habit, entryDate)) {
      // День пропускается - не влияет на streak и статистику
      return
    }
    
    scheduledDays.push(entryDate)
    totalScheduled++
    
    const completed = entry.habits_completed?.[habit.id] === true
    
    if (completed) {
      totalCompleted++
      tempStreak++
      
      // Если это первый запланированный день или мы еще не нашли пропуск
      if (!foundFirstMissOrNonScheduled) {
        currentStreak = tempStreak
      }
      
      maxStreak = Math.max(maxStreak, tempStreak)
    } else {
      // Привычка должна была показаться, но не выполнена - прерываем streak
      if (!foundFirstMissOrNonScheduled) {
        foundFirstMissOrNonScheduled = true
        currentStreak = 0
      }
      tempStreak = 0
    }
  })
  
  return {
    id: habit.id,
    name: habit.title,
    completed: totalCompleted,
    total: totalScheduled,
    streak: currentStreak,
    maxStreak: maxStreak,
    scheduledDays: scheduledDays
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
