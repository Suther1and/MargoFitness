'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getDiarySettings, updateDiarySettings } from '@/lib/actions/diary'
import { Habit } from '../types'

/**
 * Debounce функция
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T & { flush: () => void } {
  let timeout: NodeJS.Timeout | null = null
  let lastArgs: any[] | null = null

  const debouncedFn = function (...args: any[]) {
    lastArgs = args
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      func(...lastArgs!)
      timeout = null
      lastArgs = null
    }, wait)
  } as T & { flush: () => void }

  debouncedFn.flush = () => {
    if (timeout) {
      clearTimeout(timeout)
      if (lastArgs) func(...lastArgs)
      timeout = null
      lastArgs = null
    }
  }

  return debouncedFn
}

/**
 * Хук для управления привычками в Health Tracker
 * 
 * Управляет CRUD операциями над привычками и сохраняет их в Supabase
 * (в таблице diary_settings, поле habits).
 * 
 * @returns Массив привычек и методы для работы с ними
 * 
 * @example
 * ```tsx
 * const { habits, addHabit, updateHabit, deleteHabit } = useHabits()
 * 
 * // Добавить новую привычку
 * addHabit({ title: 'Зарядка', frequency: 7, time: 'morning', enabled: true })
 * 
 * // Обновить привычку
 * updateHabit('123', { streak: 5 })
 * ```
 */
export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Загрузка привычек из БД
  useEffect(() => {
    async function loadHabits() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setIsLoaded(true)
        return
      }
      
      setUserId(user.id)
      
      const result = await getDiarySettings(user.id)
      
      if (result.success && result.data) {
        const dbHabits = (result.data.habits as any) || []
        setHabits(dbHabits)
      }
      
      setIsLoaded(true)
    }
    
    loadHabits()
  }, [])

  // Функция сохранения в БД
  const saveToDb = useCallback(async (newHabits: Habit[]) => {
    if (!userId) return
    
    await updateDiarySettings(userId, {
      habits: newHabits as any
    })
  }, [userId])

  // Debounced версия сохранения
  const debouncedSave = useMemo(
    () => debounce(saveToDb, 1000),
    [saveToDb]
  )

  // Принудительное сохранение перед уходом
  useEffect(() => {
    const handleBeforeUnload = () => {
      debouncedSave.flush()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      debouncedSave.flush()
    }
  }, [debouncedSave])

  // Сохранение привычек (мгновенно в state + отложенно в БД)
  const saveHabits = useCallback((newHabits: Habit[]) => {
    setHabits(newHabits)
    debouncedSave(newHabits)
  }, [debouncedSave])

  // Добавить привычку
  const addHabit = useCallback((habit: Omit<Habit, 'id' | 'streak' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...habit,
      id: Date.now().toString(),
      streak: 0,
      createdAt: new Date().toISOString()
    }
    saveHabits([...habits, newHabit])
  }, [habits, saveHabits])

  // Обновить привычку
  const updateHabit = useCallback((id: string, updates: Partial<Habit>) => {
    const updated = habits.map(h => h.id === id ? { ...h, ...updates } : h)
    saveHabits(updated)
  }, [habits, saveHabits])

  // Удалить привычку
  const deleteHabit = useCallback((id: string) => {
    saveHabits(habits.filter(h => h.id !== id))
  }, [habits, saveHabits])

  return {
    habits,
    isLoaded,
    addHabit,
    updateHabit,
    deleteHabit
  }
}
