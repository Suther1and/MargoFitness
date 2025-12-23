import { Database } from './supabase'

// ============================================
// Типы таблиц (Row)
// ============================================
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type UserPurchase = Database['public']['Tables']['user_purchases']['Row']
export type PaymentTransaction = Database['public']['Tables']['payment_transactions']['Row']
export type ContentWeek = Database['public']['Tables']['content_weeks']['Row']
export type WorkoutSession = Database['public']['Tables']['workout_sessions']['Row']
export type Exercise = Database['public']['Tables']['exercises']['Row']
export type UserWorkoutCompletion = Database['public']['Tables']['user_workout_completions']['Row']

// ============================================
// Типы для вставки (Insert)
// ============================================
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type UserPurchaseInsert = Database['public']['Tables']['user_purchases']['Insert']
export type PaymentTransactionInsert = Database['public']['Tables']['payment_transactions']['Insert']
export type ContentWeekInsert = Database['public']['Tables']['content_weeks']['Insert']
export type WorkoutSessionInsert = Database['public']['Tables']['workout_sessions']['Insert']
export type ExerciseInsert = Database['public']['Tables']['exercises']['Insert']
export type UserWorkoutCompletionInsert = Database['public']['Tables']['user_workout_completions']['Insert']

// ============================================
// Типы для обновления (Update)
// ============================================
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type ProductUpdate = Database['public']['Tables']['products']['Update']
export type UserPurchaseUpdate = Database['public']['Tables']['user_purchases']['Update']
export type PaymentTransactionUpdate = Database['public']['Tables']['payment_transactions']['Update']
export type ContentWeekUpdate = Database['public']['Tables']['content_weeks']['Update']
export type WorkoutSessionUpdate = Database['public']['Tables']['workout_sessions']['Update']
export type ExerciseUpdate = Database['public']['Tables']['exercises']['Update']
export type UserWorkoutCompletionUpdate = Database['public']['Tables']['user_workout_completions']['Update']

// ============================================
// ENUM типы
// ============================================
export type SubscriptionTier = Database['public']['Enums']['subscription_tier']
export type SubscriptionStatus = 'active' | 'inactive' | 'canceled'
export type UserRole = 'user' | 'admin'
export type ProductType = 'subscription_tier' | 'one_time_pack'

// ============================================
// Расширенные типы с дополнительной логикой
// ============================================

/** Тренировка с информацией о доступе */
export interface WorkoutSessionWithAccess extends WorkoutSession {
  hasAccess: boolean
  accessReason?: 'subscription' | 'locked'
  exercises?: Exercise[]
  isCompleted?: boolean
  userCompletion?: UserWorkoutCompletion | null
}

/** Неделя контента с тренировками */
export interface ContentWeekWithSessions extends ContentWeek {
  sessions: WorkoutSessionWithAccess[]
  isCurrent: boolean
}

/** Профиль с вычисляемыми полями */
export interface ProfileWithSubscription extends Profile {
  isSubscriptionActive: boolean
  daysUntilExpiration: number | null
}

/** Продукт с дополнительной информацией */
export interface ProductWithPurchase extends Product {
  isPurchased: boolean
  purchaseDate?: string
}

/** Упражнение с порядковым номером для отображения */
export interface ExerciseWithNumber extends Exercise {
  displayNumber: number
}

/** Завершение тренировки с названием тренировки */
export interface CompletionWithWorkout extends UserWorkoutCompletion {
  workout_title: string
  week_start_date: string
}

// ============================================
// Утилитарные типы
// ============================================

/** Маппинг уровней подписки на числа (для сравнения) */
export const TIER_LEVELS: Record<SubscriptionTier, number> = {
  free: 0,
  basic: 1,
  pro: 2,
  elite: 3,
}

/** Обратный маппинг: число -> уровень подписки */
export const TIER_NAMES: Record<number, SubscriptionTier> = {
  0: 'free',
  1: 'basic',
  2: 'pro',
  3: 'elite',
}

/** Утилита для сравнения уровней подписки */
export function compareTiers(userTier: SubscriptionTier, requiredTier: SubscriptionTier): boolean {
  return TIER_LEVELS[userTier] >= TIER_LEVELS[requiredTier]
}

/** Утилита для проверки истечения подписки */
export function isSubscriptionExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return true
  return new Date(expiresAt) < new Date()
}

/** Утилита для получения текущей недели */
export function getCurrentWeekRange(): { start: Date; end: Date } {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  monday.setHours(0, 0, 0, 0)
  
  const nextMonday = new Date(monday)
  nextMonday.setDate(monday.getDate() + 7)
  
  return { start: monday, end: nextMonday }
}
