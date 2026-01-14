/**
 * Типы метаданных для достижений
 * Используется для валидации условий разблокировки
 */

// ============================================
// СЕРИИ (Streaks)
// ============================================
export type StreakMetadata = {
  type: 'streak_days'
  value: number // Количество дней подряд
}

// ============================================
// МЕТРИКИ (Metrics)
// ============================================
export type WaterDailyMetadata = {
  type: 'water_daily'
  value: number // Миллилитры за день
}

export type WaterTotalMetadata = {
  type: 'water_total'
  value: number // Миллилитры всего
}

export type StepsDailyMetadata = {
  type: 'steps_daily'
  value: number // Шаги за день
}

export type StepsTotalMetadata = {
  type: 'steps_total'
  value: number // Шаги всего
}

export type SleepDailyMetadata = {
  type: 'sleep_daily'
  value: number // Часы сна
}

export type SleepLowMetadata = {
  type: 'sleep_low'
  value: number // Часы сна (меньше чем)
}

export type EnergyMaxMetadata = {
  type: 'energy_max'
  value: number // Количество раз с энергией 5/5
}

export type MoodGreatStreakMetadata = {
  type: 'mood_great_streak'
  value: number // Дни подряд с отличным настроением
}

// ============================================
// ПРИВЫЧКИ (Habits)
// ============================================
export type HabitCompleteAnyMetadata = {
  type: 'habit_complete_any'
  value: number // Хотя бы одна привычка выполнена
}

export type HabitsAllStreakMetadata = {
  type: 'habits_all_streak'
  value: number // Все привычки N дней подряд
}

export type HabitCompletionsMetadata = {
  type: 'habit_completions'
  value: number // Одна привычка выполнена N раз
}

export type HabitsCreatedMetadata = {
  type: 'habits_created'
  value: number // Создано N привычек
}

// ============================================
// ВЕС (Weight)
// ============================================
export type WeightRecordedMetadata = {
  type: 'weight_recorded'
  value: number // Записано N раз
}

export type WeightStreakMetadata = {
  type: 'weight_streak'
  value: number // Записывать вес N дней подряд
}

export type WeightGoalReachedMetadata = {
  type: 'weight_goal_reached'
  // value не нужно, проверяется достижение цели
}

export type WeightMaintainMetadata = {
  type: 'weight_maintain'
  value: number // Поддерживать целевой вес N дней
}

export type WeightDownStreakMetadata = {
  type: 'weight_down_streak'
  value: number // Записывать вес N раз подряд на понижение
}

// ============================================
// РЕГУЛЯРНОСТЬ (Consistency)
// ============================================
export type MonthlyEntriesMetadata = {
  type: 'monthly_entries'
  value: number // N записей в месяце
}

export type TotalEntriesMetadata = {
  type: 'total_entries'
  value: number // N записей всего
}

// ============================================
// СОЦИАЛЬНЫЕ (Social)
// ============================================
export type RegistrationMetadata = {
  type: 'registration'
  value: number // Сумма бонуса
}

export type ReferralJoinedMetadata = {
  type: 'referral_joined'
  value: number // Сумма бонуса
}

export type ReferralMentorMetadata = {
  type: 'referral_mentor'
  value: number // Сумма бонуса
}

export type AchievementCountMetadata = {
  type: 'achievement_count'
  value: number // Количество достижений (0 = все)
}

export type ProfileCompleteMetadata = {
  type: 'profile_complete'
  value: number // Сумма бонуса
}

export type SubscriptionTierMetadata = {
  type: 'subscription_tier'
  value: string // basic, pro, elite
}

export type SubscriptionDurationMetadata = {
  type: 'subscription_duration'
  value: number // Количество месяцев
}

// ============================================
// СПЕЦИАЛЬНЫЕ (Special)
// ============================================
export type PerfectDayMetadata = {
  type: 'perfect_day'
  // Все цели за день выполнены
}

export type PerfectStreakMetadata = {
  type: 'perfect_streak'
  value: number // Все цели N дней подряд
}

export type WaterGoalStreakMetadata = {
  type: 'water_goal_streak'
  value: number // Цель по воде N дней подряд
}

// ============================================
// ТРЕНИРОВКИ (Workouts - будущее)
// ============================================
export type WorkoutsCompletedMetadata = {
  type: 'workouts_completed'
  value: number // Завершено N тренировок
}

// ============================================
// ОБЪЕДИНЕННЫЙ ТИП
// ============================================
export type AchievementMetadata =
  | StreakMetadata
  | WaterDailyMetadata
  | WaterTotalMetadata
  | StepsDailyMetadata
  | StepsTotalMetadata
  | SleepDailyMetadata
  | SleepLowMetadata
  | EnergyMaxMetadata
  | MoodGreatStreakMetadata
  | HabitCompleteAnyMetadata
  | HabitsAllStreakMetadata
  | HabitCompletionsMetadata
  | HabitsCreatedMetadata
  | WeightRecordedMetadata
  | WeightStreakMetadata
  | WeightGoalReachedMetadata
  | WeightMaintainMetadata
  | WeightDownStreakMetadata
  | MonthlyEntriesMetadata
  | TotalEntriesMetadata
  | RegistrationMetadata
  | ReferralJoinedMetadata
  | ReferralMentorMetadata
  | AchievementCountMetadata
  | ProfileCompleteMetadata
  | SubscriptionTierMetadata
  | SubscriptionDurationMetadata
  | PerfectDayMetadata
  | PerfectStreakMetadata
  | WaterGoalStreakMetadata
  | WorkoutsCompletedMetadata

/**
 * Type guard для проверки типа метаданных
 */
export function isMetadataType<T extends AchievementMetadata['type']>(
  metadata: unknown,
  type: T
): metadata is Extract<AchievementMetadata, { type: T }> {
  return (
    typeof metadata === 'object' &&
    metadata !== null &&
    'type' in metadata &&
    metadata.type === type
  )
}

/**
 * Helper для безопасного получения значения метаданных
 */
export function getMetadataValue(metadata: AchievementMetadata): number | undefined {
  if ('value' in metadata) {
    return metadata.value
  }
  return undefined
}
