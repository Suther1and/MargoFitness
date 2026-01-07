'use client'

import { useState, useEffect, useCallback } from 'react'
import { WidgetId, TrackerSettings, UserParameters, WIDGET_CONFIGS } from '../types'

/**
 * Хук для управления настройками Health Tracker
 * 
 * Управляет состоянием виджетов (вкл/выкл, цели), параметрами пользователя
 * (рост, вес, возраст, пол) и сохраняет все в localStorage с синхронизацией
 * между вкладками браузера.
 * 
 * @returns Объект с настройками и методами для их изменения
 * 
 * @example
 * ```tsx
 * const { settings, toggleWidget, updateGoal } = useTrackerSettings()
 * 
 * // Включить виджет воды
 * toggleWidget('water')
 * 
 * // Установить цель по воде
 * updateGoal('water', 2500)
 * ```
 */
const STORAGE_KEY = 'health_tracker_settings'
const VISITED_KEY = 'health_tracker_visited'

// Настройки по умолчанию
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

export function useTrackerSettings() {
  const [settings, setSettings] = useState<TrackerSettings>(() => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS

    const storedSettings = localStorage.getItem(STORAGE_KEY)
    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings) as TrackerSettings
        // Мержим сохраненные настройки с дефолтными, чтобы добавить новые виджеты
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          widgets: {
            ...DEFAULT_SETTINGS.widgets,
            ...parsed.widgets
          },
          userParams: {
            ...DEFAULT_SETTINGS.userParams,
            ...(parsed.userParams || {})
          }
        }
      } catch (error) {
        console.error('Ошибка парсинга настроек трекера:', error)
        return DEFAULT_SETTINGS
      }
    }
    return DEFAULT_SETTINGS
  })
  
  const [isFirstVisit, setIsFirstVisit] = useState(() => {
    if (typeof window === 'undefined') return false
    return !localStorage.getItem(VISITED_KEY)
  })
  
  const [isLoaded, setIsLoaded] = useState(false)

  // Отмечаем загрузку после монтирования
  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Слушаем изменения настроек (из того же окна и других вкладок)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as TrackerSettings
          setSettings({
            ...DEFAULT_SETTINGS,
            ...parsed,
            widgets: {
              ...DEFAULT_SETTINGS.widgets,
              ...parsed.widgets
            },
            userParams: {
              ...DEFAULT_SETTINGS.userParams,
              ...(parsed.userParams || {})
            }
          })
        } catch (error) {
          console.error('Ошибка парсинга настроек трекера:', error)
        }
      }
    }

    const handleCustomStorageChange = (e: CustomEvent) => {
      if (e.detail?.key === STORAGE_KEY && e.detail?.value) {
        try {
          const parsed = JSON.parse(e.detail.value) as TrackerSettings
          setSettings({
            ...DEFAULT_SETTINGS,
            ...parsed,
            widgets: {
              ...DEFAULT_SETTINGS.widgets,
              ...parsed.widgets
            },
            userParams: {
              ...DEFAULT_SETTINGS.userParams,
              ...(parsed.userParams || {})
            }
          })
        } catch (error) {
          console.error('Ошибка парсинга настроек трекера:', error)
        }
      }
    }

    // Проверяем актуальное значение при монтировании
    const checkCurrentValue = () => {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as TrackerSettings
          setSettings({
            ...DEFAULT_SETTINGS,
            ...parsed,
            widgets: {
              ...DEFAULT_SETTINGS.widgets,
              ...parsed.widgets
            },
            userParams: {
              ...DEFAULT_SETTINGS.userParams,
              ...(parsed.userParams || {})
            }
          })
        } catch (error) {
          console.error('Ошибка парсинга настроек трекера при монтировании:', error)
        }
      }
    }

    // Проверяем при монтировании
    checkCurrentValue()

    // Слушаем изменения из других вкладок
    window.addEventListener('storage', handleStorageChange)
    // Слушаем изменения из того же окна
    window.addEventListener('tracker-settings-changed' as any, handleCustomStorageChange as any)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('tracker-settings-changed' as any, handleCustomStorageChange as any)
    }
  }, [])

  // Сохранение настроек в localStorage
  const saveSettings = useCallback((newSettings: TrackerSettings) => {
    if (typeof window === 'undefined') return

    try {
      const serialized = JSON.stringify(newSettings)
      localStorage.setItem(STORAGE_KEY, serialized)
      localStorage.setItem(VISITED_KEY, 'true')
      setSettings(newSettings)
      setIsFirstVisit(false)
      
      // Отправляем событие для синхронизации в том же окне
      window.dispatchEvent(new CustomEvent('tracker-settings-changed', {
        detail: { key: STORAGE_KEY, value: serialized }
      }))
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

