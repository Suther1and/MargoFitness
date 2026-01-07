'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { getDiarySettings, updateDiarySettings } from '@/lib/actions/diary'
import { Habit } from '../types'
import { useState, useEffect, useCallback } from 'react'

export function useHabits() {
  const [userId, setUserId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  // Получаем userId
  useEffect(() => {
    async function getUserId() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
    }
    getUserId()
  }, [])

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
  })

  const habits: Habit[] = Array.isArray(habitsData) ? habitsData : []

  // Добавить привычку
  const addHabit = useCallback((habit: Omit<Habit, 'id' | 'streak' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...habit,
      id: Date.now().toString(),
      streak: 0,
      createdAt: new Date().toISOString()
    }
    updateMutation.mutate([...habits, newHabit])
  }, [habits, updateMutation])

  // Обновить привычку
  const updateHabit = useCallback((id: string, updates: Partial<Habit>) => {
    const updated = habits.map(h => h.id === id ? { ...h, ...updates } : h)
    updateMutation.mutate(updated)
  }, [habits, updateMutation])

  // Удалить привычку
  const deleteHabit = useCallback((id: string) => {
    updateMutation.mutate(habits.filter(h => h.id !== id))
  }, [habits, updateMutation])

  return {
    habits,
    isLoaded: !!userId && !isLoading && habitsData !== undefined,
    addHabit,
    updateHabit,
    deleteHabit
  }
}
