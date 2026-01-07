'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { getDiarySettings, updateDiarySettings } from '@/lib/actions/diary'
import { WidgetId, TrackerSettings, UserParameters, WIDGET_CONFIGS } from '../types'
import { useState, useEffect, useCallback } from 'react'

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
    notes: { enabled: false, goal: null, inDailyPlan: false },
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
  
  Object.keys(DEFAULT_SETTINGS.widgets).forEach(widgetId => {
    widgets[widgetId] = {
      enabled: enabledWidgets.includes(widgetId),
      goal: widgetGoals[widgetId] || null,
      inDailyPlan: widgetsInPlan.includes(widgetId)
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
  
  Object.entries(appSettings.widgets).forEach(([widgetId, widget]) => {
    if (widget.enabled) enabledWidgets.push(widgetId)
    if (widget.goal !== null) widgetGoals[widgetId] = widget.goal
    if (widget.inDailyPlan) widgetsInPlan.push(widgetId)
  })
  
  return {
    enabled_widgets: enabledWidgets,
    widget_goals: widgetGoals,
    widgets_in_daily_plan: widgetsInPlan,
    user_params: appSettings.userParams
  }
}

export function useTrackerSettings() {
  const [userId, setUserId] = useState<string | null>(null)
  const [isFirstVisit, setIsFirstVisit] = useState(() => {
    if (typeof window === 'undefined') return false
    return !localStorage.getItem(VISITED_KEY)
  })
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
      return await updateDiarySettings(userId, dbSettings)
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

  // Универсальная функция обновления
  const updateSettings = useCallback((updater: (prev: TrackerSettings) => TrackerSettings) => {
    const newSettings = updater(settings)
    updateMutation.mutate(newSettings)
  }, [settings, updateMutation])

  // Сохранение настроек
  const saveSettings = useCallback((newSettings: TrackerSettings) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(VISITED_KEY, 'true')
      setIsFirstVisit(false)
    }
    updateMutation.mutate(newSettings)
  }, [updateMutation])

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

  return {
    settings,
    isFirstVisit,
    isLoaded: !!userId && !isLoading && !!settingsData,
    saveSettings,
    toggleWidget,
    updateGoal,
    toggleInDailyPlan,
    updateUserParams,
    getSortedWidgets,
    markAsVisited,
  }
}
