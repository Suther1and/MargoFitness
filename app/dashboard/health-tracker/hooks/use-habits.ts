'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { getDiarySettings, updateDiarySettings } from '@/lib/actions/diary'
import { Habit } from '../types'
import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import debounce from 'lodash.debounce'

export function useHabits(userId: string | null) {
  const queryClient = useQueryClient()
  
  // Ref для отслеживания pending привычек
  const pendingHabitsRef = useRef<Habit[] | null>(null)

  // Query для загрузки привычек (отдельный queryKey чтобы не конфликтовать с settings)
  const { data: habitsData, isLoading } = useQuery({
    queryKey: ['diary-habits', userId],
    queryFn: async () => {
      if (!userId) return null
      const result = await getDiarySettings(userId)
      if (result.success && result.data) {
        return (result.data.habits as any) || []
      }
      return []
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })

  // Mutation для обновления привычек
  const updateMutation = useMutation({
    mutationFn: async (newHabits: Habit[]) => {
      if (!userId) throw new Error('No user ID')
      return await updateDiarySettings(userId, { habits: newHabits as any })
    },
    onMutate: async (newHabits) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['diary-habits', userId] })
      
      const previous = queryClient.getQueryData(['diary-habits', userId])
      
      // Обновляем кэш
      queryClient.setQueryData(['diary-habits', userId], newHabits)
      
      return { previous }
    },
    onError: (err, newHabits, context) => {
      // Откат при ошибке
      if (context?.previous) {
        queryClient.setQueryData(['diary-habits', userId], context.previous)
      }
    },
    onSuccess: () => {
      // Очищаем pending после успешной отправки
      pendingHabitsRef.current = null
    }
  })

  // Debounced mutation для батчинга изменений привычек
  const debouncedMutate = useMemo(() => 
    debounce((newHabits: Habit[]) => {
      pendingHabitsRef.current = newHabits
      updateMutation.mutate(newHabits)
    }, 1000) // 1000ms для батчинга множественных изменений
  , [updateMutation.mutate])

  const habits: Habit[] = Array.isArray(habitsData) ? habitsData : []

  // Добавить привычку
  const addHabit = useCallback((habit: Omit<Habit, 'id' | 'streak' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...habit,
      id: Date.now().toString(),
      streak: 0,
      createdAt: new Date().toISOString()
    }
    const newHabits = [...habits, newHabit]
    
    // Optimistic update
    queryClient.setQueryData(['diary-habits', userId], newHabits)
    
    // Debounced save
    debouncedMutate(newHabits)
  }, [habits, userId, queryClient, debouncedMutate])

  // Обновить привычку
  const updateHabit = useCallback((id: string, updates: Partial<Habit>) => {
    const updated = habits.map(h => h.id === id ? { ...h, ...updates } : h)
    
    // Optimistic update
    queryClient.setQueryData(['diary-habits', userId], updated)
    
    // Debounced save
    debouncedMutate(updated)
  }, [habits, userId, queryClient, debouncedMutate])

  // Удалить привычку
  const deleteHabit = useCallback((id: string) => {
    const filtered = habits.filter(h => h.id !== id)
    
    // Optimistic update
    queryClient.setQueryData(['diary-habits', userId], filtered)
    
    // Debounced save
    debouncedMutate(filtered)
  }, [habits, userId, queryClient, debouncedMutate])

  // Автосохранение при закрытии страницы
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (pendingHabitsRef.current && userId) {
        const dataToSave = {
          type: 'settings',
          data: {
            settings: { habits: pendingHabitsRef.current }
          }
        }
        
        // Используем sendBeacon для гарантированной отправки
        const blob = new Blob([JSON.stringify(dataToSave)], { type: 'application/json' })
        navigator.sendBeacon('/api/diary/save-sync', blob)
        
        pendingHabitsRef.current = null
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden && pendingHabitsRef.current && userId) {
        // При потере фокуса отправляем обычным способом
        const habitsToSave = pendingHabitsRef.current
        pendingHabitsRef.current = null
        updateMutation.mutate(habitsToSave)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      // При размонтировании компонента сохраняем
      if (pendingHabitsRef.current && userId) {
        const habitsToSave = pendingHabitsRef.current
        pendingHabitsRef.current = null
        updateMutation.mutate(habitsToSave)
      }
    }
  }, [userId]) // Убрал updateMutation из зависимостей - он нестабильный!

  return {
    habits,
    isLoaded: !!userId && !isLoading && habitsData !== undefined,
    addHabit,
    updateHabit,
    deleteHabit
  }
}
