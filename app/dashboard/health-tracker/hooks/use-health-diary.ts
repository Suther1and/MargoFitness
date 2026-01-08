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
  
  // Debounce timer для батчинга обновлений
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null)
  const pendingUpdatesRef = useRef<any>({})

  // Query для загрузки данных дня
  const { data: entryData, isLoading } = useQuery({
    queryKey: ['diary-entry', userId, dateStr],
    queryFn: async () => {
      if (!userId) return null
      const result = await getDiaryEntry(userId, dateStr)
      return result.success ? result.data : null
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 минут
  })

  // Mutation для сохранения
  const saveMutation = useMutation({
    mutationFn: async (data: {
      metrics: any
      notes?: string
      habitsCompleted?: any
      photoUrls?: string[]
    }) => {
      if (!userId) throw new Error('No user ID')
      return await upsertDiaryEntry(
        userId,
        dateStr,
        data.metrics,
        data.habitsCompleted,
        data.notes,
        data.photoUrls
      )
    },
    onSuccess: () => {
      console.log('✅ Данные сохранены в БД, обновляем статистику...')
      
      // Получаем все ключи из кэша для отладки
      const queryCache = queryClient.getQueryCache()
      const allQueries = queryCache.getAll()
      const statsQueries = allQueries.filter(q => 
        q.queryKey[0] === 'stats'
      )
      console.log('📦 Найдено запросов статистики в кэше:', statsQueries.length)
      statsQueries.forEach(q => {
        console.log('  - queryKey:', q.queryKey, 'state:', q.state.status)
      })
      
      // Инвалидируем весь кеш статистики
      queryClient.invalidateQueries({ 
        queryKey: ['stats'],
        refetchType: 'active' // Перезапрашиваем активные
      })
      
      console.log('📊 Инвалидация статистики завершена')
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
      // Мержим с pending updates
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
        pendingUpdatesRef.current = {}
        
        saveMutation.mutate(dataToSave)
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

    // Запланировать сохранение
    scheduleSave({
      metrics: {
        ...(entryData?.metrics || {}),
        [field]: value
      },
      notes: entryData?.notes,
      habitsCompleted: entryData?.habits_completed,
      photoUrls: entryData?.photo_urls
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

    scheduleSave({
      metrics: {
        ...(entryData?.metrics || {}),
        ...updates
      },
      notes: entryData?.notes,
      habitsCompleted: entryData?.habits_completed,
      photoUrls: entryData?.photo_urls
    })
  }

  // Обновление заметок
  const updateNotes = (newNotes: string) => {
    queryClient.setQueryData(['diary-entry', userId, dateStr], (old: any) => ({
      ...old,
      notes: newNotes
    }))

    scheduleSave({
      metrics: entryData?.metrics || {},
      notes: newNotes,
      habitsCompleted: entryData?.habits_completed,
      photoUrls: entryData?.photo_urls
    })
  }

  // Переключение привычки
  const toggleHabit = (habitId: string, completed: boolean) => {
    queryClient.setQueryData(['diary-entry', userId, dateStr], (old: any) => ({
      ...old,
      habits_completed: {
        ...(old?.habits_completed || {}),
        [habitId]: completed
      }
    }))

    scheduleSave({
      metrics: entryData?.metrics || {},
      notes: entryData?.notes,
      habitsCompleted: {
        ...(entryData?.habits_completed || {}),
        [habitId]: completed
      },
      photoUrls: entryData?.photo_urls
    })
  }

  // Добавление фото
  const addPhotoUrl = (url: string) => {
    queryClient.setQueryData(['diary-entry', userId, dateStr], (old: any) => ({
      ...old,
      photo_urls: [...(old?.photo_urls || []), url]
    }))

    scheduleSave({
      metrics: entryData?.metrics || {},
      notes: entryData?.notes,
      habitsCompleted: entryData?.habits_completed,
      photoUrls: [...(entryData?.photo_urls || []), url]
    })
  }

  // Удаление фото
  const removePhotoUrl = (url: string) => {
    queryClient.setQueryData(['diary-entry', userId, dateStr], (old: any) => ({
      ...old,
      photo_urls: (old?.photo_urls || []).filter((u: string) => u !== url)
    }))

    scheduleSave({
      metrics: entryData?.metrics || {},
      notes: entryData?.notes,
      habitsCompleted: entryData?.habits_completed,
      photoUrls: (entryData?.photo_urls || []).filter((u: string) => u !== url)
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
        console.log('💾 Принудительное сохранение данных:', dataToSave)
        saveMutation.mutate(dataToSave, {
          onSettled: () => {
            console.log('✅ Сохранение завершено')
            resolve()
          }
        })
      } else {
        console.log('ℹ️ Нет данных для сохранения')
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
      // При размонтировании компонента сохраняем оставшиеся данные
      forceSave()
    }
  }, [userId, dateStr])

  // Save status
  const saveStatus: SaveStatus = saveMutation.isPending
    ? 'saving'
    : saveMutation.isError
    ? 'error'
    : Object.keys(pendingUpdatesRef.current).length > 0
    ? 'unsaved'
    : 'saved'

  return {
    metrics: entryData?.metrics || {},
    notes: entryData?.notes || '',
    photoUrls: entryData?.photo_urls || [],
    habitsCompleted: entryData?.habits_completed || {},
    isLoading,
    saveStatus,
    updateMetric,
    updateMetrics,
    updateNotes,
    toggleHabit,
    addPhotoUrl,
    removePhotoUrl,
    forceSave
  }
}

