'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { getDiaryEntry, upsertDiaryEntry } from '@/lib/actions/diary'
import { DailyMetrics } from '../types'
import { format } from 'date-fns'
import { useEffect, useState, useMemo, useRef } from 'react'

interface UseHealthDiaryOptions {
  userId: string | null
  selectedDate: Date
}

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error'

/**
 * Хук для работы с Health Diary с React Query
 * 
 * Использует optimistic updates для мгновенного отклика UI.
 * Данные кэшируются и переиспользуются между рендерами.
 */
export function useHealthDiary({ userId, selectedDate }: UseHealthDiaryOptions) {
  const queryClient = useQueryClient()
  const dateStr = format(selectedDate, 'yyyy-MM-dd')
  
  // Адаптивное кеширование: сегодня - короткий кеш, прошлое - долгий
  const isToday = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    return dateStr === today
  }, [dateStr])
  
  // Debounce timer для батчинга обновлений
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null)
  const pendingUpdatesRef = useRef<any>({})

  // Query для загрузки данных дня
  const { data: entryData, isLoading, isFetching } = useQuery({
    queryKey: ['diary-entry', userId, dateStr],
    queryFn: async () => {
      if (!userId) return null
      
      // Прямой вызов Supabase для быстрой загрузки (Server Actions медленные в dev)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('date', dateStr)
        .maybeSingle()
      
      if (error) {
        console.error('Error loading diary entry:', error)
        return null
      }
      return data
    },
    enabled: !!userId,
    staleTime: isToday ? 30 * 1000 : 15 * 60 * 1000, // Сегодня 30 сек, прошлое 15 мин
    gcTime: 30 * 60 * 1000, // 30 минут в памяти
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchInterval: isToday ? 30000 : false, // Сегодня - фоновое обновление каждые 30 сек
  })

  // Mutation для сохранения
  const saveMutation = useMutation({
    mutationFn: async (data: {
      metrics: any
      habitsCompleted?: any
      photoUrls?: string[]
    }) => {
      if (!userId) throw new Error('No user ID')
      return await upsertDiaryEntry(
        userId,
        dateStr,
        data.metrics,
        data.habitsCompleted,
        undefined,
        data.photoUrls
      )
    },
    onSuccess: (result) => {
      // Очищаем pending updates после успешного сохранения
      pendingUpdatesRef.current = {}
      
      // Если есть новые достижения - эмитим событие для toast
      if (result?.newAchievements && result.newAchievements.length > 0) {
        console.log('[useHealthDiary] New achievements unlocked:', result.newAchievements.length)
        // Эмитим событие - его поймает AchievementsChecker
        window.dispatchEvent(new CustomEvent('achievements-unlocked', { 
          detail: { achievements: result.newAchievements } 
        }))
      }
      
      // ГИБРИДНАЯ ИНВАЛИДАЦИЯ:
      // 1. Overview stats - синхронно (критичные данные, пользователь увидит сразу)
      queryClient.invalidateQueries({ 
        queryKey: ['stats', 'overview'],
        refetchType: 'active' // Загрузить сразу ~200-500ms задержка
      })
      
      // 2. Достижения - синхронно (если разблокированы новые)
      if (result?.newAchievements && result.newAchievements.length > 0) {
        queryClient.invalidateQueries({ 
          queryKey: ['achievements'],
          refetchType: 'active'
        })
      }
      
      // 3. Детальные stats - асинхронно (обновятся при открытии вкладки)
      queryClient.invalidateQueries({ 
        queryKey: ['stats', 'water'],
        refetchType: 'none' // Только пометить stale
      })
      queryClient.invalidateQueries({ 
        queryKey: ['stats', 'steps'],
        refetchType: 'none'
      })
      queryClient.invalidateQueries({ 
        queryKey: ['stats', 'weight'],
        refetchType: 'none'
      })
      queryClient.invalidateQueries({ 
        queryKey: ['stats', 'caffeine'],
        refetchType: 'none'
      })
      queryClient.invalidateQueries({ 
        queryKey: ['stats', 'sleep'],
        refetchType: 'none'
      })
      queryClient.invalidateQueries({ 
        queryKey: ['stats', 'mood'],
        refetchType: 'none'
      })
      queryClient.invalidateQueries({ 
        queryKey: ['stats', 'nutrition'],
        refetchType: 'none'
      })
    },
    onError: (error) => {
      console.error('Error saving diary entry:', error)
      // Не откатываем optimistic update - данные остаются в UI
      // Пользователь увидит ошибку в saveStatus
    },
  })

  // Функция для батчинга обновлений
  const scheduleSave = useMemo(() => {
    return (updates: any) => {
      // Мержим с pending updates И СРАЗУ обновляем ref для sendBeacon
      pendingUpdatesRef.current = {
        ...pendingUpdatesRef.current,
        ...updates
      }

      // Очищаем предыдущий таймер
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current)
      }

      // Устанавливаем новый таймер (1000ms для лучшего батчинга и производительности)
      updateTimerRef.current = setTimeout(() => {
        const dataToSave = pendingUpdatesRef.current
        
        saveMutation.mutate(dataToSave)
        // НЕ очищаем pendingUpdatesRef.current здесь - он будет очищен после успешного сохранения
      }, 1000) // 1000ms debounce - оптимальный баланс для батчинга без лагов
    }
  }, [saveMutation])

  // Мгновенное обновление метрики
  const updateMetric = (field: keyof DailyMetrics, value: any) => {
    // Optimistic update в кэше
    queryClient.setQueryData(['diary-entry', userId, dateStr], (old: any) => {
      const updated = {
        ...old,
        metrics: {
          ...(old?.metrics || {}),
          [field]: value
        }
      }
      return updated
    })

    // Получаем актуальные данные из кеша для сохранения
    const currentData = queryClient.getQueryData(['diary-entry', userId, dateStr]) as any
    
    // Запланировать сохранение
    scheduleSave({
      metrics: currentData?.metrics || {},
      habitsCompleted: currentData?.habits_completed,
      photoUrls: currentData?.photo_urls
    })
  }

  // Обновление нескольких метрик
  const updateMetrics = (updates: Partial<DailyMetrics>) => {
    queryClient.setQueryData(['diary-entry', userId, dateStr], (old: any) => ({
      ...old,
      metrics: {
        ...(old?.metrics || {}),
        ...updates
      }
    }))

    // Получаем актуальные данные из кеша для сохранения
    const currentData = queryClient.getQueryData(['diary-entry', userId, dateStr]) as any
    
    scheduleSave({
      metrics: currentData?.metrics || {},
      habitsCompleted: currentData?.habits_completed,
      photoUrls: currentData?.photo_urls
    })
  }


  // Переключение привычки
  const toggleHabit = (habitId: string, completed: boolean) => {
    // Optimistic update
    queryClient.setQueryData(['diary-entry', userId, dateStr], (old: any) => {
      const newHabitsCompleted = {
        ...(old?.habits_completed || {}),
        [habitId]: completed
      }
      return {
        ...old,
        habits_completed: newHabitsCompleted
      }
    })

    // Получаем актуальные данные из кеша для сохранения
    const currentData = queryClient.getQueryData(['diary-entry', userId, dateStr]) as any
    
    scheduleSave({
      metrics: (currentData?.metrics as Record<string, any>) || {},
      habitsCompleted: currentData?.habits_completed || {},
      photoUrls: currentData?.photo_urls || []
    })
    
    // ГИБРИДНАЯ ИНВАЛИДАЦИЯ для привычек:
    // Habits stats - синхронно (критичные данные для стриков)
    queryClient.invalidateQueries({ 
      queryKey: ['stats', 'habits'],
      refetchType: 'active'
    })
    // Overview - синхронно
    queryClient.invalidateQueries({ 
      queryKey: ['stats', 'overview'],
      refetchType: 'active'
    })
  }

  // Добавление фото
  const addPhotoUrl = (url: string) => {
    queryClient.setQueryData(['diary-entry', userId, dateStr], (old: any) => ({
      ...old,
      photo_urls: [...(old?.photo_urls || []), url]
    }))

    // Получаем актуальные данные из кеша для сохранения
    const currentData = queryClient.getQueryData(['diary-entry', userId, dateStr]) as any
    
    scheduleSave({
      metrics: currentData?.metrics || {},
      habitsCompleted: currentData?.habits_completed,
      photoUrls: currentData?.photo_urls || []
    })
  }

  // Удаление фото
  const removePhotoUrl = (url: string) => {
    queryClient.setQueryData(['diary-entry', userId, dateStr], (old: any) => ({
      ...old,
      photo_urls: (old?.photo_urls || []).filter((u: string) => u !== url)
    }))

    // Получаем актуальные данные из кеша для сохранения
    const currentData = queryClient.getQueryData(['diary-entry', userId, dateStr]) as any
    
    scheduleSave({
      metrics: currentData?.metrics || {},
      habitsCompleted: currentData?.habits_completed,
      photoUrls: currentData?.photo_urls || []
    })
  }

  // Принудительное сохранение
  const forceSave = () => {
    return new Promise<void>((resolve) => {
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current)
        updateTimerRef.current = null
      }
      
      if (Object.keys(pendingUpdatesRef.current).length > 0) {
        const dataToSave = pendingUpdatesRef.current
        pendingUpdatesRef.current = {}
        saveMutation.mutate(dataToSave, {
          onSettled: () => resolve()
        })
      } else {
        resolve()
      }
    })
  }

  // Сохранение перед уходом
  useEffect(() => {
    // Сохранение при закрытии/обновлении страницы через sendBeacon
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (Object.keys(pendingUpdatesRef.current).length > 0) {
        const dataToSave = {
          type: 'diary',
          data: {
            date: dateStr,
            ...pendingUpdatesRef.current
          }
        }
        
        // Используем sendBeacon для гарантированной отправки
        const blob = new Blob([JSON.stringify(dataToSave)], { type: 'application/json' })
        navigator.sendBeacon('/api/diary/save-sync', blob)
        
        pendingUpdatesRef.current = {}
      }
    }

    // Сохранение при потере фокуса (переключение вкладки)
    const handleVisibilityChange = () => {
      if (document.hidden && Object.keys(pendingUpdatesRef.current).length > 0) {
        forceSave()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      // При размонтировании НЕ вызываем forceSave - он асинхронный и может не успеть
      // Вместо этого полагаемся на синхронное сохранение при смене даты (см. ниже)
    }
  }, [userId, dateStr])

  // Синхронное сохранение при смене даты через sendBeacon
  useEffect(() => {
    // Cleanup при смене dateStr - сохраняем данные предыдущей даты
    return () => {
      if (Object.keys(pendingUpdatesRef.current).length > 0) {
        const dataToSave = {
          type: 'diary',
          data: {
            date: dateStr, // Сохраняем для ТЕКУЩЕЙ (старой) даты
            ...pendingUpdatesRef.current
          }
        }
        
        // Синхронное сохранение через sendBeacon
        const blob = new Blob([JSON.stringify(dataToSave)], { type: 'application/json' })
        navigator.sendBeacon('/api/diary/save-sync', blob)
        
        pendingUpdatesRef.current = {}
        
        // Очищаем таймер
        if (updateTimerRef.current) {
          clearTimeout(updateTimerRef.current)
          updateTimerRef.current = null
        }
      }
    }
  }, [dateStr]) // Зависимость только от dateStr - cleanup сработает при его изменении

  // Save status
  const saveStatus: SaveStatus = saveMutation.isPending
    ? 'saving'
    : saveMutation.isError
    ? 'error'
    : Object.keys(pendingUpdatesRef.current).length > 0
    ? 'unsaved'
    : 'saved'

  return {
    metrics: (entryData?.metrics as Record<string, any>) || {},
    photoUrls: (entryData as any)?.photo_urls || [],
    habitsCompleted: (entryData as any)?.habits_completed || {},
    isLoading,
    isFetching, // Для фоновых индикаторов
    saveStatus,
    updateMetric,
    updateMetrics,
    toggleHabit,
    addPhotoUrl,
    removePhotoUrl,
    forceSave
  }
}

