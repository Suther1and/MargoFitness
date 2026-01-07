'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getDiarySettings, updateDiarySettings } from '@/lib/actions/diary'
import { WidgetId, TrackerSettings, UserParameters, WIDGET_CONFIGS } from '../types'

/**
 * Хук для управления настройками Health Tracker
 * 
 * Управляет состоянием виджетов (вкл/выкл, цели), параметрами пользователя
 * и сохраняет все в Supabase с optimistic updates.
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
  
  // Таймер для debounced сохранения
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pendingSettingsRef = useRef<TrackerSettings | null>(null)

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

  // Функция debounced сохранения в БД
  const scheduleSave = useCallback((newSettings: TrackerSettings) => {
    pendingSettingsRef.current = newSettings
    
    // Очищаем предыдущий таймер
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    // Устанавливаем новый таймер
    saveTimeoutRef.current = setTimeout(async () => {
      if (!userId || !pendingSettingsRef.current) return
      
      const dbSettings = appToDbSettings(pendingSettingsRef.current)
      await updateDiarySettings(userId, dbSettings)
      
      pendingSettingsRef.current = null
      saveTimeoutRef.current = null
    }, 500) // Уменьшил до 500ms для более быстрого сохранения
  }, [userId])

  // Принудительное сохранение
  const forceSave = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }
    
    if (userId && pendingSettingsRef.current) {
      const dbSettings = appToDbSettings(pendingSettingsRef.current)
      await updateDiarySettings(userId, dbSettings)
      pendingSettingsRef.current = null
    }
  }, [userId])

  // Принудительное сохранение перед уходом
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
        if (userId && pendingSettingsRef.current) {
          const dbSettings = appToDbSettings(pendingSettingsRef.current)
          // Синхронный запрос для гарантии сохранения
          navigator.sendBeacon(
            '/api/diary/settings',
            JSON.stringify({ userId, settings: dbSettings })
          )
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      forceSave()
    }
  }, [userId, forceSave])

  // Универсальная функция обновления настроек
  const updateSettings = useCallback((updater: (prev: TrackerSettings) => TrackerSettings) => {
    setSettings(prev => {
      const newSettings = updater(prev)
      scheduleSave(newSettings)
      return newSettings
    })
  }, [scheduleSave])

  // Сохранение настроек (для внешнего использования)
  const saveSettings = useCallback((newSettings: TrackerSettings) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(VISITED_KEY, 'true')
      setIsFirstVisit(false)
    }
    
    setSettings(newSettings)
    scheduleSave(newSettings)
  }, [scheduleSave])

  // Переключение виджета (вкл/выкл)
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

  // Обновление цели виджета
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

  // Отметить визит вручную
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
