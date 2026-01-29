import {
  Profile,
  WorkoutSession,
  ContentWeek,
  SubscriptionTier,
  compareTiers,
  isSubscriptionExpired,
  TIER_LEVELS,
} from '@/types/database'

/**
 * GATEKEEPER - Главная логика контроля доступа
 * 
 * Новая модель: недельный контент
 * - Каждый понедельник открываются новые тренировки
 * - Старые тренировки становятся недоступны
 * - Доступ зависит от уровня подписки
 */

export interface AccessCheckResult {
  hasAccess: boolean
  reason: 'subscription' | 'locked'
  message: string
}

/**
 * Проверка доступа к тренировке
 */
export function checkWorkoutAccess(
  workout: WorkoutSession,
  profile: Profile | null,
  currentWeek: ContentWeek | null
): AccessCheckResult {
  // Случай 1: Пользователь не авторизован
  if (!profile) {
    return {
      hasAccess: false,
      reason: 'locked',
      message: 'Войдите, чтобы получить доступ к тренировке',
    }
  }

  // Случай 2: Тренировка не из текущей недели
  if (!currentWeek || workout.week_id !== currentWeek.id) {
    return {
      hasAccess: false,
      reason: 'locked',
      message: 'Эта тренировка больше не доступна',
    }
  }

  // Случай 3: Неделя не опубликована
  if (!currentWeek.is_published && profile.role !== 'admin') {
    return {
      hasAccess: false,
      reason: 'locked',
      message: 'Эта неделя еще не открыта',
    }
  }

  // Случай 4: Free tier пользователи видят контент, но не имеют доступа
  if (profile.subscription_tier === 'free') {
    return {
      hasAccess: false,
      reason: 'subscription',
      message: `Требуется подписка ${getTierDisplayName(workout.required_tier)} или выше`,
    }
  }

  // Случай 5: Проверка подписки
  if (profile.subscription_status !== 'active') {
    return {
      hasAccess: false,
      reason: 'locked',
      message: 'Требуется активная подписка',
    }
  }

  // Случай 6: Проверка истечения подписки
  if (isSubscriptionExpired(profile.subscription_expires_at)) {
    return {
      hasAccess: false,
      reason: 'locked',
      message: 'Ваша подписка истекла',
    }
  }

  // Случай 7: Проверка уровня подписки
  const userTier = profile.subscription_tier
  const requiredTier = workout.required_tier

  if (compareTiers(userTier, requiredTier)) {
    return {
      hasAccess: true,
      reason: 'subscription',
      message: `Доступно по подписке ${getTierDisplayName(userTier)}`,
    }
  } else {
    return {
      hasAccess: false,
      reason: 'subscription',
      message: `Требуется подписка ${getTierDisplayName(requiredTier)} или выше`,
    }
  }
}

/**
 * Проверка активности подписки
 */
export function isSubscriptionActive(profile: Profile): boolean {
  if (profile.subscription_status !== 'active') {
    return false
  }

  return !isSubscriptionExpired(profile.subscription_expires_at)
}

/**
 * Получить количество дней до истечения подписки
 */
export function getDaysUntilExpiration(profile: Profile): number | null {
  if (!profile.subscription_expires_at) {
    return null
  }

  const expirationDate = new Date(profile.subscription_expires_at)
  const now = new Date()
  const diffTime = expirationDate.getTime() - now.getTime()
  // Используем Math.round для честного отображения (округляем до ближайшего дня)
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

  return diffDays > 0 ? diffDays : 0
}

/**
 * Получить отображаемое название тира
 */
export function getTierDisplayName(tier: SubscriptionTier): string {
  const tierNames: Record<SubscriptionTier, string> = {
    free: 'Free',
    basic: 'Basic',
    pro: 'Pro',
    elite: 'Elite',
  }
  return tierNames[tier] || 'Unknown'
}

/**
 * Получить цвет бейджа для тира
 */
export function getTierColor(tier: SubscriptionTier): string {
  const tierColors: Record<SubscriptionTier, string> = {
    free: 'gray',
    basic: 'blue',
    pro: 'purple',
    elite: 'gold',
  }
  return tierColors[tier] || 'gray'
}

/**
 * Проверка, является ли пользователь админом
 */
export function isAdmin(profile: Profile | null): boolean {
  return profile?.role === 'admin'
}

/**
 * Проверка, попадает ли дата в диапазон недели
 */
export function isDateInWeek(date: Date, week: ContentWeek): boolean {
  const startDate = new Date(week.start_date)
  const endDate = new Date(week.end_date)
  return date >= startDate && date < endDate
}

/**
 * Получить текущую неделю из списка недель
 */
export function getCurrentWeek(weeks: ContentWeek[], profile?: Profile | null): ContentWeek | null {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  return weeks.find(week => {
    const isInRange = isDateInWeek(today, week)
    if (profile?.role === 'admin') return isInRange
    return week.is_published && isInRange
  }) || null
}

/**
 * Фильтрация тренировок по доступу пользователя
 */
export function filterAccessibleWorkouts(
  workouts: WorkoutSession[],
  profile: Profile | null,
  currentWeek: ContentWeek | null
): WorkoutSession[] {
  return workouts.filter(workout => {
    const access = checkWorkoutAccess(workout, profile, currentWeek)
    return access.hasAccess
  })
}

/**
 * Получить максимальный номер тренировки, доступной пользователю
 * - Basic: 2 тренировки (session_number 1, 2)
 * - Pro: 3 тренировки (session_number 1, 2, 3)
 * - Elite: 3 тренировки (session_number 1, 2, 3)
 */
export function getMaxSessionNumber(tier: SubscriptionTier): number {
  const maxSessions: Record<SubscriptionTier, number> = {
    free: 0,
    basic: 2,
    pro: 3,
    elite: 3,
  }
  return maxSessions[tier] || 0
}

/**
 * Получить список доступных номеров тренировок для тира
 */
export function getAccessibleSessionNumbers(tier: SubscriptionTier): number[] {
  const max = getMaxSessionNumber(tier)
  return Array.from({ length: max }, (_, i) => i + 1)
}
