'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getDiarySettings, updateDiarySettings } from '@/lib/actions/diary'
import { WidgetId, TrackerSettings, UserParameters, WIDGET_CONFIGS } from '../types'

/**
 * Debounce функция
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T & { flush: () => void } {
  let timeout: NodeJS.Timeout | null = null
  let lastArgs: any[] | null = null

  const debouncedFn = function (...args: any[]) {
    lastArgs = args
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      func(...lastArgs!)
      timeout = null
      lastArgs = null
    }, wait)
  } as T & { flush: () => void }

  debouncedFn.flush = () => {
    if (timeout) {
      clearTimeout(timeout)
      if (lastArgs) func(...lastArgs)
      timeout = null
      lastArgs = null
    }
  }

  return debouncedFn
}

/**
 * Хук для управления настройками Health Tracker
 * 
 * Управляет состоянием виджетов (вкл/выкл, цели), параметрами пользователя
 * (рост, вес, возраст, пол) и сохраняет все в Supabase с debounce.
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

// Преобразование из формата БД в формат приложения
function dbToAppSettings(dbData: any): TrackerSettings {
  const widgets: any = {}
  
  // Преобразуем массивы и объекты БД в структуру виджетов
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
  const [settings, setSettings] = useState<TrackerSettings>(DEFAULT_SETTINGS)
  const [userId, setUserId] = useState<string | null>(null)
  const [isFirstVisit, setIsFirstVisit] = useState(() => {
    if (typeof window === 'undefined') return false
    return !localStorage.getItem(VISITED_KEY)
  })
  const [isLoaded, setIsLoaded] = useState(false)

  // Получаем userId и загружаем настройки
  useEffect(() => {
    async function loadSettings() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setIsLoaded(true)
        return
      }
      
      setUserId(user.id)
      
      const result = await getDiarySettings(user.id)
      
      if (result.success && result.data) {
        const appSettings = dbToAppSettings(result.data)
        setSettings(appSettings)
      }
      
      setIsLoaded(true)
    }
    
    loadSettings()
  }, [])

  // Функция сохранения в БД
  const saveToDb = useCallback(async (newSettings: TrackerSettings) => {
    if (!userId) return
    
    const dbSettings = appToDbSettings(newSettings)
    await updateDiarySettings(userId, dbSettings)
  }, [userId])

  // Debounced версия сохранения (1 сек после последнего изменения)
  const debouncedSave = useMemo(
    () => debounce(saveToDb, 1000),
    [saveToDb]
  )

  // Сохранение настроек (мгновенно в state + отложенно в БД)
  const saveSettings = useCallback((newSettings: TrackerSettings) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(VISITED_KEY, 'true')
      setIsFirstVisit(false)
    }
    
    setSettings(newSettings)
    debouncedSave(newSettings)
  }, [debouncedSave])

  // Принудительное сохранение перед уходом
  useEffect(() => {
    const handleBeforeUnload = () => {
      debouncedSave.flush()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      debouncedSave.flush()
    }
  }, [debouncedSave])

  // Переключение виджета (вкл/выкл)
  const toggleWidget = useCallback((widgetId: WidgetId) => {
    setSettings(prev => {
      const currentEnabled = prev.widgets[widgetId].enabled
      const newSettings = {
        ...prev,
        widgets: {
          ...prev.widgets,
          [widgetId]: {
            ...prev.widgets[widgetId],
            enabled: !currentEnabled,
          },
        },
      }
      debouncedSave(newSettings)
      return newSettings
    })
  }, [debouncedSave])

  // Обновление цели виджета
  const updateGoal = useCallback((widgetId: WidgetId, goal: number | null) => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        widgets: {
          ...prev.widgets,
          [widgetId]: {
            ...prev.widgets[widgetId],
            goal,
          },
        },
      }
      debouncedSave(newSettings)
      return newSettings
    })
  }, [debouncedSave])

  // Переключение "в план на день"
  const toggleInDailyPlan = useCallback((widgetId: WidgetId) => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        widgets: {
          ...prev.widgets,
          [widgetId]: {
            ...prev.widgets[widgetId],
            inDailyPlan: !prev.widgets[widgetId].inDailyPlan,
          },
        },
      }
      debouncedSave(newSettings)
      return newSettings
    })
  }, [debouncedSave])

  // Обновление параметров пользователя
  const updateUserParams = useCallback((params: Partial<UserParameters>) => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        userParams: {
          ...prev.userParams,
          ...params,
        },
      }
      debouncedSave(newSettings)
      return newSettings
    })
  }, [debouncedSave])

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
