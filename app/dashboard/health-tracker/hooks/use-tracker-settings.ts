'use client'

import { useState, useEffect, useCallback } from 'react'
import { WidgetId, TrackerSettings, WidgetSettings, UserParameters, WIDGET_CONFIGS } from '../types'

const STORAGE_KEY = 'health_tracker_settings'
const VISITED_KEY = 'health_tracker_visited'

// Настройки по умолчанию
const DEFAULT_SETTINGS: TrackerSettings = {
  widgets: {
    water: { enabled: false, goal: null, inDailyPlan: false },
    steps: { enabled: false, goal: null, inDailyPlan: false },
    weight: { enabled: false, goal: null, inDailyPlan: false },
    caffeine: { enabled: false, goal: null, inDailyPlan: false },
    sleep: { enabled: false, goal: null, inDailyPlan: false },
    mood: { enabled: false, goal: null, inDailyPlan: false },
    nutrition: { enabled: false, goal: null, inDailyPlan: false },
  },
  userParams: {
    height: null,
    weight: null,
    age: null,
  },
}

export function useTrackerSettings() {
  const [settings, setSettings] = useState<TrackerSettings>(DEFAULT_SETTINGS)
  const [isFirstVisit, setIsFirstVisit] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Загрузка настроек из localStorage при монтировании
  useEffect(() => {
    if (typeof window === 'undefined') return

    const storedSettings = localStorage.getItem(STORAGE_KEY)
    const hasVisited = localStorage.getItem(VISITED_KEY)

    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings) as TrackerSettings
        setSettings(parsed)
      } catch (error) {
        console.error('Ошибка парсинга настроек трекера:', error)
        setSettings(DEFAULT_SETTINGS)
      }
    }

    setIsFirstVisit(!hasVisited)
    setIsLoaded(true)
  }, [])

  // Сохранение настроек в localStorage
  const saveSettings = useCallback((newSettings: TrackerSettings) => {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings))
      localStorage.setItem(VISITED_KEY, 'true')
      setSettings(newSettings)
      setIsFirstVisit(false)
    } catch (error) {
      console.error('Ошибка сохранения настроек трекера:', error)
    }
  }, [])

  // Переключение виджета (вкл/выкл)
  const toggleWidget = useCallback((widgetId: WidgetId) => {
    setSettings(prev => {
      const currentEnabled = prev.widgets[widgetId].enabled
      return {
        ...prev,
        widgets: {
          ...prev.widgets,
          [widgetId]: {
            ...prev.widgets[widgetId],
            enabled: !currentEnabled,
          },
        },
      }
    })
  }, [])

  // Обновление цели виджета
  const updateGoal = useCallback((widgetId: WidgetId, goal: number | null) => {
    setSettings(prev => ({
      ...prev,
      widgets: {
        ...prev.widgets,
        [widgetId]: {
          ...prev.widgets[widgetId],
          goal,
        },
      },
    }))
  }, [])

  // Переключение "в план на день"
  const toggleInDailyPlan = useCallback((widgetId: WidgetId) => {
    setSettings(prev => ({
      ...prev,
      widgets: {
        ...prev.widgets,
        [widgetId]: {
          ...prev.widgets[widgetId],
          inDailyPlan: !prev.widgets[widgetId].inDailyPlan,
        },
      },
    }))
  }, [])

  // Обновление параметров пользователя
  const updateUserParams = useCallback((params: Partial<UserParameters>) => {
    setSettings(prev => ({
      ...prev,
      userParams: {
        ...prev.userParams,
        ...params,
      },
    }))
  }, [])

  // Получение отсортированного списка виджетов (активные наверху)
  const getSortedWidgets = useCallback(() => {
    const widgetIds = Object.keys(WIDGET_CONFIGS) as WidgetId[]
    
    return widgetIds.sort((a, b) => {
      const aEnabled = settings.widgets[a].enabled
      const bEnabled = settings.widgets[b].enabled
      
      // Активные виджеты наверху
      if (aEnabled && !bEnabled) return -1
      if (!aEnabled && bEnabled) return 1
      return 0
    })
  }, [settings])

  // Отметить визит вручную (для баннера)
  const markAsVisited = useCallback(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem(VISITED_KEY, 'true')
    setIsFirstVisit(false)
  }, [])

  return {
    settings,
    isFirstVisit,
    isLoaded,
    saveSettings,
    toggleWidget,
    updateGoal,
    toggleInDailyPlan,
    updateUserParams,
    getSortedWidgets,
    markAsVisited,
  }
}

