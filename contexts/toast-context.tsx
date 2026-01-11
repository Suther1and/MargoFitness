'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { Toast, ToastContextValue } from '@/types/toast'
import { Achievement } from '@/types/database'

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

const MAX_TOASTS = 3
const DEFAULT_DURATION = 5000
const ERROR_DURATION = 7000

/**
 * Toast Provider - управляет очередью уведомлений
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [queue, setQueue] = useState<Toast[]>([])

  // Обработка очереди - показываем максимум MAX_TOASTS одновременно
  useEffect(() => {
    if (toasts.length < MAX_TOASTS && queue.length > 0) {
      const [nextToast, ...restQueue] = queue
      setToasts(prev => [...prev, nextToast])
      setQueue(restQueue)
    }
  }, [toasts.length, queue.length])

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`
    const newToast: Toast = {
      id,
      ...toast,
      duration: toast.duration ?? DEFAULT_DURATION,
      priority: toast.priority ?? (toast.type === 'achievement' ? 2 : toast.type === 'error' ? 1 : 0),
    }

    // Если достигнут лимит, добавляем в очередь с учетом приоритета
    if (toasts.length >= MAX_TOASTS) {
      setQueue(prev => {
        const combined = [...prev, newToast]
        // Сортируем по приоритету (высший сначала)
        return combined.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
      })
    } else {
      setToasts(prev => {
        const combined = [...prev, newToast]
        // Сортируем по приоритету
        return combined.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
      })
    }

    // Автоудаление
    const duration = toast.type === 'error' ? ERROR_DURATION : (toast.duration ?? DEFAULT_DURATION)
    setTimeout(() => {
      dismissToast(id)
    }, duration)
  }, [toasts.length, dismissToast])

  const showAchievement = useCallback((achievement: Achievement) => {
    showToast({
      type: 'achievement',
      title: 'Достижение получено!',
      message: achievement.title,
      icon: achievement.icon,
      data: achievement,
      priority: 2, // Высший приоритет
    })
  }, [showToast])

  const showSuccess = useCallback((title: string, message: string) => {
    showToast({
      type: 'success',
      title,
      message,
      priority: 0,
    })
  }, [showToast])

  const showError = useCallback((title: string, message: string) => {
    showToast({
      type: 'error',
      title,
      message,
      priority: 1,
      duration: ERROR_DURATION,
    })
  }, [showToast])

  const showInfo = useCallback((title: string, message: string) => {
    showToast({
      type: 'info',
      title,
      message,
      priority: 0,
    })
  }, [showToast])

  const showWarning = useCallback((title: string, message: string) => {
    showToast({
      type: 'warning',
      title,
      message,
      priority: 0,
    })
  }, [showToast])

  const clearAll = useCallback(() => {
    setToasts([])
    setQueue([])
  }, [])

  const value: ToastContextValue = {
    toasts,
    showToast,
    showAchievement,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    dismissToast,
    clearAll,
  }

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

/**
 * Hook для использования toast в компонентах
 */
export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
