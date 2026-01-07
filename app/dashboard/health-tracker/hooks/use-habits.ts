'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getDiarySettings, updateDiarySettings } from '@/lib/actions/diary'
import { Habit } from '../types'

/**
 * Хук для управления привычками в Health Tracker
 * 
 * Управляет CRUD операциями над привычками и сохраняет их в Supabase
 * с optimistic updates для мгновенного отклика UI.
 */
export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Таймер для debounced сохранения
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pendingHabitsRef = useRef<Habit[] | null>(null)

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

  // Функция debounced сохранения в БД
  const scheduleSave = useCallback((newHabits: Habit[]) => {
    pendingHabitsRef.current = newHabits
    
    // Очищаем предыдущий таймер
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    // Устанавливаем новый таймер
    saveTimeoutRef.current = setTimeout(async () => {
      if (!userId || !pendingHabitsRef.current) return
      
      await updateDiarySettings(userId, {
        habits: pendingHabitsRef.current as any
      })
      
      pendingHabitsRef.current = null
      saveTimeoutRef.current = null
    }, 500)
  }, [userId])

  // Принудительное сохранение
  const forceSave = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }
    
    if (userId && pendingHabitsRef.current) {
      await updateDiarySettings(userId, {
        habits: pendingHabitsRef.current as any
      })
      pendingHabitsRef.current = null
    }
  }, [userId])

  // Принудительное сохранение перед уходом
  useEffect(() => {
    const handleBeforeUnload = () => {
      forceSave()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      forceSave()
    }
  }, [forceSave])

  // Сохранение привычек (мгновенно в state + отложенно в БД)
  const saveHabits = useCallback((newHabits: Habit[]) => {
    setHabits(newHabits)
    scheduleSave(newHabits)
  }, [scheduleSave])

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
