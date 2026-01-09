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
    const processedData = data.map((entry: any) => {
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

/**
 * Получить агрегированную статистику для обзора
 * Возвращает обработанные данные для всех карточек обзора с учетом граничных случаев
 */
export async function getOverviewStatsAggregated(
  userId: string,
  dateRange: DateRange,
  settings: any, // TrackerSettings
  habits: any[] // Habit[]
) {
  const result = await getStatsForPeriod(userId, dateRange)
  
  if (!result.success || !result.data || result.data.length === 0) {
    return {
      success: true,
      data: {
        weight: null,
        habits: null,
        steps: null,
        water: null,
        caffeine: null,
        sleep: null,
        nutrition: null,
        mood: null,
        notes: null,
        photos: null
      }
    }
  }

  const entries = result.data
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

      // Подсчитываем процент выполнения
      entriesWithHabits.forEach(entry => {
        const completed = Object.entries(entry.habits_completed || {})
          .filter(([id, val]) => val === true && activeHabits.some(h => h.id === id))
          .length
        totalCompleted += completed
        totalExpected += activeHabits.length
      })

      // Находим лучший streak
      activeHabits.forEach(habit => {
        if (habit.streak > maxStreak) {
          maxStreak = habit.streak
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
      
      // Качество питания (только дни где указано)
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
      let avgEnergy = null

      if (moodEntries.length > 0) {
        const totalMood = moodEntries.reduce((sum, e) => sum + (e.metrics.mood || 0), 0)
        avgMood = Number((totalMood / moodEntries.length).toFixed(1))
      }

      if (energyEntries.length > 0) {
        const totalEnergy = energyEntries.reduce((sum, e) => sum + (e.metrics.energyLevel || 0), 0)
        avgEnergy = Number((totalEnergy / energyEntries.length).toFixed(1))
      }

      moodStats = { avgMood, avgEnergy }
    }
  }

  // ========== ЗАМЕТКИ ==========
  let notesStats = null
  if (settings.widgets.notes?.enabled) {
    const notesEntries = entries.filter(e => e.notes && e.notes.trim() !== '')
    if (notesEntries.length > 0) {
      // Находим заметку с лучшими показателями (максимальный % выполнения привычек)
      let bestEntry = notesEntries[0]
      let bestScore = 0

      if (activeHabits.length > 0) {
        // Если есть привычки, ищем по максимальному проценту выполнения
        notesEntries.forEach(entry => {
          const completed = Object.entries(entry.habits_completed || {})
            .filter(([id, val]) => val === true && activeHabits.some(h => h.id === id))
            .length
          const score = activeHabits.length > 0 ? (completed / activeHabits.length) : 0
          if (score > bestScore) {
            bestScore = score
            bestEntry = entry
          }
        })
      } else {
        // Если нет привычек, берем по максимальному настроению
        notesEntries.forEach(entry => {
          const mood = entry.metrics?.mood || 0
          const energy = entry.metrics?.energyLevel || 0
          const score = mood + energy
          if (score > bestScore) {
            bestScore = score
            bestEntry = entry
          }
        })
      }

      notesStats = {
        content: bestEntry.notes || '',
        date: bestEntry.date,
        metricsSnapshot: bestEntry.metrics
      }
    }
  }

  // ========== ФОТО ==========
  let photosStats = null
  if (settings.widgets.photos?.enabled) {
    const { getProgressPhotos } = await import('./diary')
    const photosResult = await getProgressPhotos(userId)
    
    if (photosResult.success && photosResult.data && photosResult.data.length > 0) {
      // Фильтруем фото по диапазону дат
      const filteredPhotos = photosResult.data.filter((photo: any) => {
        const photoDate = new Date(photo.date)
        return photoDate >= dateRange.start && photoDate <= dateRange.end
      })
      
      if (filteredPhotos.length > 0) {
        // Сортируем по дате (старые первыми)
        const sorted = filteredPhotos.sort((a: any, b: any) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        )
        
        photosStats = {
          total: filteredPhotos.length,
          firstPhoto: sorted[0], // Самое старое фото
          lastPhoto: sorted[sorted.length - 1] // Самое новое фото
        }
      }
    }
  }

  return {
    success: true,
    data: {
      weight: weightStats,
      habits: habitsStats,
      steps: stepsStats,
      water: waterStats,
      caffeine: caffeineStats,
      sleep: sleepStats,
      nutrition: nutritionStats,
      mood: moodStats,
      notes: notesStats,
      photos: photosStats
    }
  }
}

