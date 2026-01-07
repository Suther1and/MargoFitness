'use client'

import { useState, useEffect, useCallback } from 'react'
import { Habit } from '../types'

const STORAGE_KEY = 'health_tracker_habits'

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>(() => {
    if (typeof window === 'undefined') return []
    
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (error) {
        console.error('Error parsing habits:', error)
        return []
      }
    }
    return []
  })
  const [isLoaded, setIsLoaded] = useState(false)

  // Отмечаем загрузку после монтирования
  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Слушаем изменения привычек (из того же окна и других вкладок)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setHabits(JSON.parse(e.newValue))
        } catch (error) {
          console.error('Error parsing habits:', error)
        }
      }
    }

    const handleCustomStorageChange = (e: CustomEvent) => {
      if (e.detail?.key === STORAGE_KEY && e.detail?.value) {
        try {
          setHabits(JSON.parse(e.detail.value))
        } catch (error) {
          console.error('Error parsing habits:', error)
        }
      }
    }

    // Слушаем изменения из других вкладок
    window.addEventListener('storage', handleStorageChange)
    // Слушаем изменения из того же окна
    window.addEventListener('habits-changed' as any, handleCustomStorageChange as any)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('habits-changed' as any, handleCustomStorageChange as any)
    }
  }, [])

  // Сохранение в localStorage
  const saveHabits = useCallback((newHabits: Habit[]) => {
    if (typeof window === 'undefined') return
    const serialized = JSON.stringify(newHabits)
    localStorage.setItem(STORAGE_KEY, serialized)
    setHabits(newHabits)
    
    // Отправляем событие для синхронизации в том же окне
    window.dispatchEvent(new CustomEvent('habits-changed', {
      detail: { key: STORAGE_KEY, value: serialized }
    }))
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

