'use client'

import { useMemo } from 'react'

/**
 * Хук для расчета прогресса выполнения цели
 * 
 * Вычисляет процент выполнения, статус достижения цели,
 * остаток до цели и превышение лимита.
 * 
 * @example
 * ```tsx
 * const { percentage, isDone, remaining } = useGoalProgress({ 
 *   current: 1500, 
 *   goal: 2000 
 * })
 * // percentage: 75, isDone: false, remaining: 500
 * ```
 */
interface UseGoalProgressOptions {
  current: number
  goal: number
  reverseGoal?: boolean // Для случаев когда меньше = лучше (например, вес)
}

export function useGoalProgress({ current, goal, reverseGoal = false }: UseGoalProgressOptions) {
  const percentage = useMemo(() => {
    return Math.min(Math.round((current / goal) * 100), 100)
  }, [current, goal])

  const isDone = useMemo(() => {
    return reverseGoal ? current <= goal : current >= goal
  }, [current, goal, reverseGoal])

  const remaining = useMemo(() => {
    return Math.max(0, goal - current)
  }, [current, goal])

  const isOverLimit = useMemo(() => {
    return current > goal
  }, [current, goal])

  return {
    percentage,
    isDone,
    remaining,
    isOverLimit,
  }
}

