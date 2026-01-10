'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query'
import debounce from 'lodash.debounce'
import { createClient } from '@/lib/supabase/client'
import { getDiarySettings, updateDiarySettings } from '@/lib/actions/diary'
import { WidgetId, TrackerSettings, UserParameters, WIDGET_CONFIGS } from '../types'

const VISITED_KEY = 'health_tracker_visited'

const DEFAULT_SETTINGS: TrackerSettings = {
  widgets: {
    habits: { enabled: true, goal: null, inDailyPlan: true },
    water: { enabled: false, goal: null, inDailyPlan: false },
    steps: { enabled: false, goal: null, inDailyPlan: false },
    weight: { enabled: false, goal: null, inDailyPlan: false },
    caffeine: { enabled: false, goal: null, inDailyPlan: false },
    sleep: { enabled: false, goal: null, inDailyPlan: false },
    mood: { enabled: false, goal: null, inDailyPlan: false },
    nutrition: { enabled: false, goal: null, inDailyPlan: false },
    photos: { enabled: false, goal: null, inDailyPlan: false },
  },
  userParams: {
    height: null,
    weight: null,
    age: null,
    gender: null,
  },
}

// Преобразование из формата БД в формат приложения
function dbToAppSettings(dbData: any): TrackerSettings {
  const widgets: any = {}
  
  const enabledWidgets = dbData.enabled_widgets || []
  const widgetGoals = dbData.widget_goals || {}
  const widgetsInPlan = dbData.widgets_in_daily_plan || []
  const goals = dbData.goals || {} // JSONB поле goals для дополнительных настроек
  
  Object.keys(DEFAULT_SETTINGS.widgets).forEach(widgetId => {
    const baseWidget = {
      enabled: enabledWidgets.includes(widgetId),
      goal: widgetGoals[widgetId] || null,
      inDailyPlan: widgetsInPlan.includes(widgetId)
    }
    
    // Для nutrition добавляем nutritionGoalType из goals
    if (widgetId === 'nutrition' && goals.nutrition?.goalType) {
      widgets[widgetId] = {
        ...baseWidget,
        nutritionGoalType: goals.nutrition.goalType
      }
    } else {
      widgets[widgetId] = baseWidget
    }
  })
  
  return {
    widgets,
    userParams: dbData.user_params || DEFAULT_SETTINGS.userParams
  }
}

// Преобразование из формата приложения в формат БД
function appToDbSettings(appSettings: TrackerSettings) {
  const enabledWidgets: string[] = []
  const widgetGoals: Record<string, number> = {}
  const widgetsInPlan: string[] = []
  const goals: any = {}
  
  Object.entries(appSettings.widgets).forEach(([widgetId, widget]) => {
    if (widget.enabled) enabledWidgets.push(widgetId)
    if (widget.goal !== null) widgetGoals[widgetId] = widget.goal
    if (widget.inDailyPlan) widgetsInPlan.push(widgetId)
    
    // Для nutrition сохраняем дополнительное поле nutritionGoalType в goals
    if (widgetId === 'nutrition' && widget.nutritionGoalType) {
      goals.nutrition = {
        goal: widget.goal,
        goalType: widget.nutritionGoalType
      }
    }
  })
  
  return {
    enabled_widgets: enabledWidgets,
    widget_goals: widgetGoals,
    widgets_in_daily_plan: widgetsInPlan,
    user_params: appSettings.userParams,
    goals: Object.keys(goals).length > 0 ? goals : undefined
  }
}

export function useTrackerSettings(userId: string | null) {
  const [isFirstVisit, setIsFirstVisit] = useState(() => {
    if (typeof window === 'undefined') return false
    return !localStorage.getItem(VISITED_KEY)
  })
  const queryClient = useQueryClient()
  
  // Ref для отслеживания pending настроек
  const pendingSettingsRef = useRef<TrackerSettings | null>(null)
  // Ref для mutation функции
  const mutationRef = useRef<((settings: TrackerSettings) => void) | null>(null)

  // Query для загрузки настроек
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['diary-settings', userId],
    queryFn: async () => {
      if (!userId) return null
      const result = await getDiarySettings(userId)
      if (result.success && result.data) {
        return dbToAppSettings(result.data)
      }
      return DEFAULT_SETTINGS
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })

  // Mutation для обновления настроек
  const updateMutation = useMutation({
    mutationFn: async (newSettings: TrackerSettings) => {
      if (!userId) throw new Error('No user ID')
      const dbSettings = appToDbSettings(newSettings)
      // Приводим к any так как поля из миграции 022 не в сгенерированных типах
      return await updateDiarySettings(userId, dbSettings as any)
    },
    onMutate: async (newSettings) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['diary-settings', userId] })
      const previous = queryClient.getQueryData(['diary-settings', userId])
      queryClient.setQueryData(['diary-settings', userId], newSettings)
      return { previous }
    },
    onError: (err, newSettings, context) => {
      // Откат при ошибке
      if (context?.previous) {
        queryClient.setQueryData(['diary-settings', userId], context.previous)
      }
    },
  })

  const settings = settingsData || DEFAULT_SETTINGS

  // Обновляем ref при каждом рендере
  mutationRef.current = updateMutation.mutate

  // Debounced mutation для батчинга сохранений
  const debouncedMutate = useMemo(() => 
    debounce((newSettings: TrackerSettings) => {
      updateMutation.mutate(newSettings)
      // Очищаем после успешной отправки
      setTimeout(() => {
        if (pendingSettingsRef.current === newSettings) {
          pendingSettingsRef.current = null
        }
      }, 100)
    }, 1000) // Увеличен до 1000ms для лучшего батчинга
  , [updateMutation.mutate])

  // Универсальная функция обновления с queryClient.getQueryData
  const updateSettings = useCallback((updater: (prev: TrackerSettings) => TrackerSettings) => {
    // Получаем текущее значение из кэша React Query
    const currentSettings = queryClient.getQueryData<TrackerSettings>(['diary-settings', userId])
    if (!currentSettings) return
    
    const newSettings = updater(currentSettings)
    
    // Оптимистичное обновление UI
    queryClient.setQueryData(['diary-settings', userId], newSettings)
    
    // Отложенное сохранение в БД через debounce
    debouncedMutate(newSettings)
  }, [queryClient, userId, debouncedMutate])

  // Сохранение настроек с debounce
  const saveSettings = useCallback((newSettings: TrackerSettings) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(VISITED_KEY, 'true')
      setIsFirstVisit(false)
    }
    
    // Мгновенное обновление UI
    queryClient.setQueryData(['diary-settings', userId], newSettings)
    
    // Обновляем pending ref для sendBeacon
    pendingSettingsRef.current = newSettings
    
    // Отложенное сохранение в БД
    debouncedMutate(newSettings)
  }, [userId, queryClient, debouncedMutate, setIsFirstVisit])

  // Переключение виджета
  const toggleWidget = useCallback((widgetId: WidgetId) => {
    updateSettings(prev => ({
      ...prev,
      widgets: {
        ...prev.widgets,
        [widgetId]: {
          ...prev.widgets[widgetId],
          enabled: !prev.widgets[widgetId].enabled,
        },
      },
    }))
  }, [updateSettings])

  // Обновление цели
  const updateGoal = useCallback((widgetId: WidgetId, goal: number | null) => {
    updateSettings(prev => ({
      ...prev,
      widgets: {
        ...prev.widgets,
        [widgetId]: {
          ...prev.widgets[widgetId],
          goal,
        },
      },
    }))
  }, [updateSettings])

  // Переключение "в план на день"
  const toggleInDailyPlan = useCallback((widgetId: WidgetId) => {
    updateSettings(prev => ({
      ...prev,
      widgets: {
        ...prev.widgets,
        [widgetId]: {
          ...prev.widgets[widgetId],
          inDailyPlan: !prev.widgets[widgetId].inDailyPlan,
        },
      },
    }))
  }, [updateSettings])

  // Обновление параметров пользователя
  const updateUserParams = useCallback((params: Partial<UserParameters>) => {
    updateSettings(prev => ({
      ...prev,
      userParams: {
        ...prev.userParams,
        ...params,
      },
    }))
  }, [updateSettings])

  // Получение отсортированного списка виджетов
  const getSortedWidgets = useCallback(() => {
    const widgetIds = Object.keys(WIDGET_CONFIGS) as WidgetId[]
    
    return widgetIds.sort((a, b) => {
      const aEnabled = settings.widgets[a].enabled
      const bEnabled = settings.widgets[b].enabled
      
      if (aEnabled && !bEnabled) return -1
      if (!aEnabled && bEnabled) return 1
      return 0
    })
  }, [settings])

  // Отметить визит
  const markAsVisited = useCallback(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem(VISITED_KEY, 'true')
    setIsFirstVisit(false)
  }, [])

  // Автосохранение при закрытии страницы
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (pendingSettingsRef.current && userId) {
        const dataToSave = {
          type: 'settings',
          data: {
            settings: appToDbSettings(pendingSettingsRef.current)
          }
        }
        
        // Используем sendBeacon для гарантированной отправки
        const blob = new Blob([JSON.stringify(dataToSave)], { type: 'application/json' })
        navigator.sendBeacon('/api/diary/save-sync', blob)
        
        pendingSettingsRef.current = null
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden && pendingSettingsRef.current && userId && mutationRef.current) {
        // При потере фокуса отправляем обычным способом
        const settingsToSave = pendingSettingsRef.current
        pendingSettingsRef.current = null
        mutationRef.current(settingsToSave)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      // При размонтировании компонента сохраняем
      if (pendingSettingsRef.current && userId && mutationRef.current) {
        const settingsToSave = pendingSettingsRef.current
        pendingSettingsRef.current = null
        mutationRef.current(settingsToSave)
      }
    }
  }, [userId]) // Только userId в зависимостях, mutationRef используется через ref

  return {
    settings,
    isFirstVisit,
    isLoaded: !!userId && !isLoading,
    saveSettings,
    toggleWidget,
    updateGoal,
    toggleInDailyPlan,
    updateUserParams,
    getSortedWidgets,
    markAsVisited,
  }
}
