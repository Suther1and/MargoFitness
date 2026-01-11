'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { DateRange, TrackerSettings, Habit, OverviewStats } from '../types'
import { serializeDateRange } from '../utils/query-utils'

interface UseOverviewStatsOptions {
  userId: string | null
  dateRange: DateRange
  settings: TrackerSettings
  habits: Habit[]
}

/**
 * Агрегация данных на клиенте (перенесено с сервера для скорости)
 */
function aggregateOverviewStats(
  entries: any[],
  settings: TrackerSettings,
  habits: Habit[],
  dateRange: DateRange
): OverviewStats {
  const activeHabits = habits.filter(h => h.enabled)
  
  // Вычисляем период для отображения
  const periodDays = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24))
  const periodLabel = periodDays <= 7 ? `${periodDays} ${periodDays === 1 ? 'день' : periodDays < 5 ? 'дня' : 'дней'}` 
    : periodDays <= 30 ? `${periodDays} ${periodDays === 1 ? 'день' : periodDays < 5 ? 'дня' : 'дней'}`
    : periodDays <= 180 ? `${Math.round(periodDays / 30)} ${Math.round(periodDays / 30) === 1 ? 'месяц' : Math.round(periodDays / 30) < 5 ? 'месяца' : 'месяцев'}`
    : `${Math.round(periodDays / 365)} ${Math.round(periodDays / 365) === 1 ? 'год' : 'года'}`

  // ========== ВЕС ==========
  let weightStats = null
  if (settings.widgets.weight?.enabled) {
    const weightEntries = entries.filter(e => e.metrics?.weight != null && e.metrics.weight > 0)
    if (weightEntries.length > 0) {
      const startWeight = weightEntries[0].metrics.weight
      const currentWeight = weightEntries[weightEntries.length - 1].metrics.weight
      const change = currentWeight - startWeight
      weightStats = {
        start: startWeight,
        current: currentWeight,
        change: Number(change.toFixed(1)),
        period: periodLabel
      }
    }
  }

  // ========== ПРИВЫЧКИ ==========
  let habitsStats = null
  if (activeHabits.length > 0) {
    const entriesWithHabits = entries.filter(e => e.habits_completed && Object.keys(e.habits_completed).length > 0)
    if (entriesWithHabits.length > 0) {
      let totalCompleted = 0
      let totalExpected = 0
      let maxStreak = 0
      let bestHabitName = activeHabits[0]?.title || 'Привычка'

      entriesWithHabits.forEach(entry => {
        const completed = Object.entries(entry.habits_completed || {})
          .filter(([id, val]) => val === true && activeHabits.some(h => h.id === id))
          .length
        totalCompleted += completed
        totalExpected += activeHabits.length
      })

      activeHabits.forEach(habit => {
        const currentStreak = habit.maxStreak || 0
        if (currentStreak > maxStreak) {
          maxStreak = currentStreak
          bestHabitName = habit.title
        }
      })

      const completionRate = totalExpected > 0 ? Math.round((totalCompleted / totalExpected) * 100) : 0

      habitsStats = {
        completionRate,
        bestStreak: maxStreak,
        habitName: bestHabitName
      }
    }
  }

  // ========== ШАГИ ==========
  let stepsStats = null
  if (settings.widgets.steps?.enabled) {
    const stepsEntries = entries.filter(e => e.metrics?.steps != null && e.metrics.steps > 0)
    if (stepsEntries.length > 0) {
      const totalSteps = stepsEntries.reduce((sum, e) => sum + (e.metrics.steps || 0), 0)
      const average = Math.round(totalSteps / stepsEntries.length)
      const goal = settings.widgets.steps?.goal || 10000
      const percentage = Math.round((average / goal) * 100)
      stepsStats = {
        average,
        goal,
        percentage,
        daysWithData: stepsEntries.length
      }
    }
  }

  // ========== ВОДА ==========
  let waterStats = null
  if (settings.widgets.water?.enabled) {
    const waterEntries = entries.filter(e => e.metrics?.waterIntake != null && e.metrics.waterIntake > 0)
    if (waterEntries.length > 0) {
      const totalWater = waterEntries.reduce((sum, e) => sum + (e.metrics.waterIntake || 0), 0)
      const average = Math.round(totalWater / waterEntries.length)
      const goal = settings.widgets.water?.goal || 2500
      const percentage = Math.round((average / goal) * 100)
      waterStats = {
        average,
        goal,
        percentage,
        daysWithData: waterEntries.length
      }
    }
  }

  // ========== КОФЕИН ==========
  let caffeineStats = null
  if (settings.widgets.caffeine?.enabled) {
    const caffeineEntries = entries.filter(e => e.metrics?.caffeineIntake != null && e.metrics.caffeineIntake > 0)
    if (caffeineEntries.length > 0) {
      const totalCaffeine = caffeineEntries.reduce((sum, e) => sum + (e.metrics.caffeineIntake || 0), 0)
      const average = Number((totalCaffeine / caffeineEntries.length).toFixed(1))
      caffeineStats = {
        average,
        daysWithData: caffeineEntries.length
      }
    }
  }

  // ========== СОН ==========
  let sleepStats = null
  if (settings.widgets.sleep?.enabled) {
    const sleepEntries = entries.filter(e => e.metrics?.sleepHours != null && e.metrics.sleepHours > 0)
    if (sleepEntries.length > 0) {
      const totalSleep = sleepEntries.reduce((sum, e) => sum + (e.metrics.sleepHours || 0), 0)
      const average = Number((totalSleep / sleepEntries.length).toFixed(1))
      const goal = settings.widgets.sleep?.goal || 8
      const percentage = Math.round((average / goal) * 100)
      sleepStats = {
        average,
        goal,
        percentage,
        daysWithData: sleepEntries.length
      }
    }
  }

  // ========== ПИТАНИЕ ==========
  let nutritionStats = null
  if (settings.widgets.nutrition?.enabled) {
    const nutritionEntries = entries.filter(e => e.metrics?.calories != null && e.metrics.calories > 0)
    if (nutritionEntries.length > 0) {
      const totalCalories = nutritionEntries.reduce((sum, e) => sum + (e.metrics.calories || 0), 0)
      const avgCalories = Math.round(totalCalories / nutritionEntries.length)
      
      const qualityEntries = entries.filter(e => e.metrics?.foodQuality != null && e.metrics.foodQuality > 0)
      let avgQuality = null
      if (qualityEntries.length > 0) {
        const totalQuality = qualityEntries.reduce((sum, e) => sum + (e.metrics.foodQuality || 0), 0)
        avgQuality = Number((totalQuality / qualityEntries.length).toFixed(1))
      }

      const goal = settings.widgets.nutrition?.goal || 2000
      nutritionStats = {
        avgCalories,
        avgQuality,
        goal
      }
    }
  }

  // ========== НАСТРОЕНИЕ/ЭНЕРГИЯ ==========
  let moodStats = null
  if (settings.widgets.mood?.enabled) {
    const moodEntries = entries.filter(e => e.metrics?.mood != null && e.metrics.mood > 0)
    const energyEntries = entries.filter(e => e.metrics?.energyLevel != null && e.metrics.energyLevel > 0)
    
    if (moodEntries.length > 0 || energyEntries.length > 0) {
      let avgMood = null
      if (moodEntries.length > 0) {
        const totalMood = moodEntries.reduce((sum, e) => sum + (e.metrics.mood || 0), 0)
        avgMood = Number((totalMood / moodEntries.length).toFixed(1))
      }

      let avgEnergy = null
      if (energyEntries.length > 0) {
        const totalEnergy = energyEntries.reduce((sum, e) => sum + (e.metrics.energyLevel || 0), 0)
        avgEnergy = Number((totalEnergy / energyEntries.length).toFixed(1))
      }

      moodStats = {
        avgMood,
        avgEnergy
      }
    }
  }

  // ========== ЗАМЕТКИ ========== (не в OverviewStats)
  // const notesEntries = entries.filter(e => e.notes && e.notes.trim() !== '')

  // ========== ФОТО ==========
  const photosStats = null // Фото загружаются отдельным хуком

  return {
    weight: weightStats,
    habits: habitsStats,
    steps: stepsStats,
    water: waterStats,
    caffeine: caffeineStats,
    sleep: sleepStats,
    nutrition: nutritionStats,
    mood: moodStats,
    photos: photosStats
  }
}

/**
 * Хук для получения агрегированной статистики обзора
 * Использует прямой вызов Supabase вместо Server Action для скорости
 */
export function useOverviewStats({ 
  userId, 
  dateRange, 
  settings, 
  habits 
}: UseOverviewStatsOptions) {
  const dateRangeKey = serializeDateRange(dateRange)
  
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['stats', 'overview', userId, dateRangeKey],
    queryFn: async (): Promise<OverviewStats | null> => {
      if (!userId) return null
      
      const supabase = createClient()
      const startDate = format(dateRange.start, 'yyyy-MM-dd')
      const endDate = format(dateRange.end, 'yyyy-MM-dd')

      const { data: entries, error } = await supabase
        .from('diary_entries')
        .select('date, metrics, notes, habits_completed')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lt('date', endDate)
        .order('date', { ascending: true })

      if (error) {
        console.error('[useOverviewStats] Error:', error)
        throw new Error('Не удалось получить статистику')
      }

      if (!entries || entries.length === 0) {
        return {
          weight: null,
          habits: null,
          steps: null,
          water: null,
          caffeine: null,
          sleep: null,
          nutrition: null,
          mood: null,
          photos: null
        }
      }

      // Агрегация на клиенте!
      return aggregateOverviewStats(entries, settings, habits, dateRange)
    },
    enabled: !!userId,
    staleTime: 60 * 1000, // 60 секунд
    gcTime: 30 * 60 * 1000, // 30 минут в памяти
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })

  return {
    data,
    isLoading,
    isFetching,
    error
  }
}

