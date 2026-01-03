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
export type UserBonus = Database['public']['Tables']['user_bonuses']['Row']
export type BonusTransaction = Database['public']['Tables']['bonus_transactions']['Row']
export type ReferralCode = Database['public']['Tables']['referral_codes']['Row']
export type Referral = Database['public']['Tables']['referrals']['Row']
export type PromoCode = Database['public']['Tables']['promo_codes']['Row']
export type DiarySettings = Database['public']['Tables']['diary_settings']['Row']
export type DiaryEntry = Database['public']['Tables']['diary_entries']['Row']
export type ProgressPhoto = Database['public']['Tables']['progress_photos']['Row']

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
export type UserBonusInsert = Database['public']['Tables']['user_bonuses']['Insert']
export type BonusTransactionInsert = Database['public']['Tables']['bonus_transactions']['Insert']
export type ReferralCodeInsert = Database['public']['Tables']['referral_codes']['Insert']
export type ReferralInsert = Database['public']['Tables']['referrals']['Insert']
export type PromoCodeInsert = Database['public']['Tables']['promo_codes']['Insert']
export type DiarySettingsInsert = Database['public']['Tables']['diary_settings']['Insert']
export type DiaryEntryInsert = Database['public']['Tables']['diary_entries']['Insert']
export type ProgressPhotoInsert = Database['public']['Tables']['progress_photos']['Insert']

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
export type UserBonusUpdate = Database['public']['Tables']['user_bonuses']['Update']
export type BonusTransactionUpdate = Database['public']['Tables']['bonus_transactions']['Update']
export type ReferralCodeUpdate = Database['public']['Tables']['referral_codes']['Update']
export type ReferralUpdate = Database['public']['Tables']['referrals']['Update']
export type PromoCodeUpdate = Database['public']['Tables']['promo_codes']['Update']
export type DiarySettingsUpdate = Database['public']['Tables']['diary_settings']['Update']
export type DiaryEntryUpdate = Database['public']['Tables']['diary_entries']['Update']
export type ProgressPhotoUpdate = Database['public']['Tables']['progress_photos']['Update']

// ============================================
// ENUM типы
// ============================================
export type SubscriptionTier = Database['public']['Enums']['subscription_tier']
export type SubscriptionStatus = 'active' | 'inactive' | 'canceled'
export type UserRole = 'user' | 'admin'
export type ProductType = 'subscription_tier' | 'one_time_pack'
export type BonusTransactionType = Database['public']['Enums']['bonus_transaction_type']
export type ReferralStatus = Database['public']['Enums']['referral_status']
export type PromoDiscountType = Database['public']['Enums']['promo_discount_type']

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

// ============================================
// Бонусная система: Уровни и константы
// ============================================

/** Уровни кешбека */
export interface CashbackLevel {
  level: number
  threshold: number
  percent: number
  name: string
  icon: string
  color: string
}

export const CASHBACK_LEVELS: CashbackLevel[] = [
  { level: 1, threshold: 0, percent: 3, name: 'Bronze', icon: '🥉', color: 'from-amber-700 to-amber-900' },
  { level: 2, threshold: 9999, percent: 5, name: 'Silver', icon: '🥈', color: 'from-gray-400 to-gray-600' },
  { level: 3, threshold: 49999, percent: 7, name: 'Gold', icon: '🥇', color: 'from-yellow-400 to-yellow-600' },
  { level: 4, threshold: 99999, percent: 10, name: 'Platinum', icon: '💎', color: 'from-purple-500 to-indigo-600' },
]

/** Уровни реферальной программы */
export interface ReferralLevel {
  level: number
  threshold: number
  percent: number
}

export const REFERRAL_LEVELS: ReferralLevel[] = [
  { level: 1, threshold: 0, percent: 3 },
  { level: 2, threshold: 100000, percent: 5 },
  { level: 3, threshold: 250000, percent: 7 },
  { level: 4, threshold: 500000, percent: 10 },
]

/** Константы бонусной системы */
export const BONUS_CONSTANTS = {
  WELCOME_BONUS: 250,              // Приветственный бонус
  REFERRAL_FIRST_BONUS: 500,       // За первого реферала
  REFERRED_USER_BONUS: 250,        // Бонус приглашенному
  MAX_BONUS_USAGE_PERCENT: 30,     // Максимум бонусов при оплате (30%)
  BONUS_TO_RUB_RATE: 1,            // 1 шаг = 1 рубль
} as const

/** Расчет уровня кешбека по сумме трат */
export function calculateCashbackLevel(lifetimeSpent: number): number {
  for (let i = CASHBACK_LEVELS.length - 1; i >= 0; i--) {
    if (lifetimeSpent >= CASHBACK_LEVELS[i].threshold) {
      return CASHBACK_LEVELS[i].level
    }
  }
  return 1
}

/** Расчет уровня реферальной программы */
export function calculateReferralLevel(totalReferralEarnings: number): number {
  for (let i = REFERRAL_LEVELS.length - 1; i >= 0; i--) {
    if (totalReferralEarnings >= REFERRAL_LEVELS[i].threshold) {
      return REFERRAL_LEVELS[i].level
    }
  }
  return 1
}

/** Получить данные уровня кешбека */
export function getCashbackLevelData(level: number): CashbackLevel {
  return CASHBACK_LEVELS.find(l => l.level === level) || CASHBACK_LEVELS[0]
}

/** Получить данные уровня реферальной программы */
export function getReferralLevelData(level: number): ReferralLevel {
  return REFERRAL_LEVELS.find(l => l.level === level) || REFERRAL_LEVELS[0]
}

/** Получить визуальные данные уровня реферальной программы */
export function getReferralLevelVisuals(level: number): {
  icon: string
  name: string
  color: string
} {
  const visuals = [
    { level: 1, icon: '🥉', name: 'Bronze', color: 'from-amber-700 to-amber-900' },
    { level: 2, icon: '🥈', name: 'Silver', color: 'from-gray-400 to-gray-600' },
    { level: 3, icon: '🥇', name: 'Gold', color: 'from-yellow-400 to-yellow-600' },
    { level: 4, icon: '💎', name: 'Platinum', color: 'from-purple-500 to-indigo-600' },
  ]
  return visuals.find(v => v.level === level) || visuals[0]
}

/** Расчет прогресса до следующего уровня */
export function calculateLevelProgress(currentAmount: number, isReferral: boolean = false): {
  currentLevel: number
  nextLevel: number | null
  currentThreshold: number
  nextThreshold: number | null
  progress: number
  remaining: number
} {
  const levels = isReferral ? REFERRAL_LEVELS : CASHBACK_LEVELS.map(l => ({ level: l.level, threshold: l.threshold, percent: l.percent }))
  
  let currentLevel = 1
  let currentThreshold = 0
  
  for (let i = levels.length - 1; i >= 0; i--) {
    if (currentAmount >= levels[i].threshold) {
      currentLevel = levels[i].level
      currentThreshold = levels[i].threshold
      break
    }
  }
  
  const nextLevelData = levels.find(l => l.level === currentLevel + 1)
  const nextThreshold = nextLevelData?.threshold || null
  
  let progress = 100
  let remaining = 0
  
  if (nextThreshold !== null) {
    const range = nextThreshold - currentThreshold
    const current = currentAmount - currentThreshold
    progress = Math.min(100, Math.floor((current / range) * 100))
    remaining = nextThreshold - currentAmount
  }
  
  return {
    currentLevel,
    nextLevel: nextLevelData?.level || null,
    currentThreshold,
    nextThreshold,
    progress,
    remaining,
  }
}
