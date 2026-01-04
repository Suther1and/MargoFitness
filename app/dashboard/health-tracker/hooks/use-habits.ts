'use client'

import { useState, useEffect, useCallback } from 'react'
import { Habit } from '../types'

const STORAGE_KEY = 'health_tracker_habits'

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Загрузка из localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return

    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setHabits(JSON.parse(stored))
      } catch (error) {
        console.error('Error parsing habits:', error)
      }
    }
    setIsLoaded(true)
  }, [])

  // Сохранение в localStorage
  const saveHabits = useCallback((newHabits: Habit[]) => {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHabits))
    setHabits(newHabits)
  }, [])

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

