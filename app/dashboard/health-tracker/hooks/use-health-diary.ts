'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getDiaryEntry, upsertDiaryEntry } from '@/lib/actions/diary'
import { DailyMetrics } from '../types'
import { format } from 'date-fns'

/**
 * Debounce функция
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T & { flush: () => void; cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null
  let lastArgs: any[] | null = null
  let lastThis: any = null

  const debouncedFn = function (this: any, ...args: any[]) {
    lastArgs = args
    lastThis = this

    if (timeout) clearTimeout(timeout)

    timeout = setTimeout(() => {
      func.apply(lastThis, lastArgs!)
      timeout = null
      lastArgs = null
    }, wait)
  } as T & { flush: () => void; cancel: () => void }

  debouncedFn.flush = () => {
    if (timeout) {
      clearTimeout(timeout)
      if (lastArgs) {
        func.apply(lastThis, lastArgs)
      }
      timeout = null
      lastArgs = null
    }
  }

  debouncedFn.cancel = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
      lastArgs = null
    }
  }

  return debouncedFn
}

interface UseHealthDiaryOptions {
  selectedDate: Date
}

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error'

/**
 * Хук для работы с Health Diary
 * 
 * Обеспечивает мгновенное обновление UI (optimistic updates) и отложенное 
 * сохранение в БД с помощью debounce. Автоматически загружает данные при 
 * изменении даты и сохраняет перед закрытием окна.
 * 
 * @example
 * ```tsx
 * const { metrics, updateMetric, saveStatus, isLoading } = useHealthDiary({ selectedDate })
 * 
 * // Обновить метрику - UI обновится мгновенно, сохранение через 2 сек
 * updateMetric('waterIntake', 1500)
 * ```
 */
export function useHealthDiary({ selectedDate }: UseHealthDiaryOptions) {
  const [metrics, setMetrics] = useState<Partial<DailyMetrics>>({})
  const [notes, setNotes] = useState<string>('')
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [habitsCompleted, setHabitsCompleted] = useState<Record<string, boolean>>({})
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const dateStr = format(selectedDate, 'yyyy-MM-dd')
  
  // Кэш для быстрого переключения между днями
  const cacheRef = useRef<Map<string, {
    metrics: Partial<DailyMetrics>
    notes: string
    photoUrls: string[]
    habitsCompleted: Record<string, boolean>
  }>>(new Map())

  // Получаем userId при монтировании
  useEffect(() => {
    async function getUserId() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
    }
    getUserId()
  }, [])

  // Загрузка данных при изменении даты
  useEffect(() => {
    if (!userId) return

    async function loadData() {
      // Проверяем кэш
      const cached = cacheRef.current.get(dateStr)
      if (cached) {
        setMetrics(cached.metrics)
        setNotes(cached.notes)
        setPhotoUrls(cached.photoUrls)
        setHabitsCompleted(cached.habitsCompleted)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      
      try {
        const result = await getDiaryEntry(userId, dateStr)
        
        if (result.success && result.data) {
          const entry = result.data
          setMetrics(entry.metrics || {})
          setNotes(entry.notes || '')
          setPhotoUrls(entry.photo_urls || [])
          setHabitsCompleted(entry.habits_completed || {})
          
          // Сохраняем в кэш
          cacheRef.current.set(dateStr, {
            metrics: entry.metrics || {},
            notes: entry.notes || '',
            photoUrls: entry.photo_urls || [],
            habitsCompleted: entry.habits_completed || {}
          })
        } else {
          // Нет данных за этот день - устанавливаем пустое состояние
          setMetrics({})
          setNotes('')
          setPhotoUrls([])
          setHabitsCompleted({})
        }
      } catch (error) {
        console.error('Error loading diary entry:', error)
        setSaveStatus('error')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [dateStr, userId])

  // Функция сохранения в БД
  const saveToDb = useCallback(async () => {
    if (!userId) return

    setSaveStatus('saving')
    
    try {
      const result = await upsertDiaryEntry(
        userId,
        dateStr,
        metrics,
        habitsCompleted,
        notes,
        photoUrls
      )

      if (result.success) {
        setSaveStatus('saved')
        
        // Обновляем кэш
        cacheRef.current.set(dateStr, {
          metrics,
          notes,
          photoUrls,
          habitsCompleted
        })
      } else {
        console.error('Error saving diary entry:', result.error)
        setSaveStatus('error')
      }
    } catch (error) {
      console.error('Error saving diary entry:', error)
      setSaveStatus('error')
    }
  }, [userId, dateStr, metrics, notes, photoUrls, habitsCompleted])

  // Debounced версия сохранения (2 сек после последнего изменения)
  const debouncedSave = useMemo(
    () => debounce(saveToDb, 2000),
    [saveToDb]
  )

  // Мгновенное обновление метрики + отложенное сохранение
  const updateMetric = useCallback((field: keyof DailyMetrics, value: any) => {
    setMetrics(prev => ({ ...prev, [field]: value }))
    setSaveStatus('unsaved')
    debouncedSave()
  }, [debouncedSave])

  // Обновление нескольких метрик одновременно
  const updateMetrics = useCallback((updates: Partial<DailyMetrics>) => {
    setMetrics(prev => ({ ...prev, ...updates }))
    setSaveStatus('unsaved')
    debouncedSave()
  }, [debouncedSave])

  // Обновление заметок
  const updateNotes = useCallback((newNotes: string) => {
    setNotes(newNotes)
    setSaveStatus('unsaved')
    debouncedSave()
  }, [debouncedSave])

  // Обновление привычки
  const toggleHabit = useCallback((habitId: string, completed: boolean) => {
    setHabitsCompleted(prev => ({ ...prev, [habitId]: completed }))
    setSaveStatus('unsaved')
    debouncedSave()
  }, [debouncedSave])

  // Добавление фото
  const addPhotoUrl = useCallback((url: string) => {
    setPhotoUrls(prev => [...prev, url])
    setSaveStatus('unsaved')
    debouncedSave()
  }, [debouncedSave])

  // Удаление фото
  const removePhotoUrl = useCallback((url: string) => {
    setPhotoUrls(prev => prev.filter(u => u !== url))
    setSaveStatus('unsaved')
    debouncedSave()
  }, [debouncedSave])

  // Принудительное сохранение
  const forceSave = useCallback(() => {
    debouncedSave.flush()
  }, [debouncedSave])

  // Принудительное сохранение перед закрытием окна
  useEffect(() => {
    const handleBeforeUnload = () => {
      debouncedSave.flush()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      // Сохраняем при размонтировании компонента
      debouncedSave.flush()
    }
  }, [debouncedSave])

  return {
    metrics,
    notes,
    photoUrls,
    habitsCompleted,
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

