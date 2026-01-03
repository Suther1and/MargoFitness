'use client'

import { useMemo } from 'react'

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

