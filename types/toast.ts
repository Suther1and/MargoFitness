import { ReactNode } from 'react'
import { Achievement } from './database'

/**
 * Типы toast-уведомлений
 */
export type ToastType = 'achievement' | 'success' | 'error' | 'info' | 'warning'

/**
 * Варианты для типов toast
 */
export type ToastVariant = 'achievement' | 'success' | 'error' | 'info' | 'warning'

/**
 * Структура toast-уведомления
 */
export interface Toast {
  id: string
  type: ToastType
  title: string
  message: string
  icon?: string | ReactNode
  duration?: number
  data?: any // Для достижений - Achievement объект
  priority?: number // 0 = низкий, 1 = средний, 2 = высокий (достижения)
}

/**
 * Контекст значения для toast
 */
export interface ToastContextValue {
  toasts: Toast[]
  showToast: (toast: Omit<Toast, 'id'>) => void
  showAchievement: (achievement: Achievement) => void
  showSuccess: (title: string, message: string) => void
  showError: (title: string, message: string) => void
  showInfo: (title: string, message: string) => void
  showWarning: (title: string, message: string) => void
  dismissToast: (id: string) => void
  clearAll: () => void
}

/**
 * Опции для создания toast
 */
export interface ToastOptions {
  title: string
  message: string
  type?: ToastType
  icon?: string | ReactNode
  duration?: number
  data?: any
}
