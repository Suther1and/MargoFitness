'use client'

import { useState, useCallback } from 'react'

/**
 * Хук для управления редактируемыми числовыми значениями с инкрементом/декрементом
 * 
 * Используется в карточках метрик для удобного редактирования значений
 * (вода, шаги, вес и т.д.) через кнопки +/- или прямой ввод.
 * 
 * @example
 * ```tsx
 * const { isEditing, localValue, handleIncrement, handleDecrement, handleEdit } = 
 *   useEditableValue(waterIntake, { 
 *     onUpdate: (val) => setWaterIntake(val), 
 *     step: 250, 
 *     min: 0 
 *   })
 * ```
 */
interface UseEditableValueOptions {
  onUpdate: (value: number) => void
  step?: number
  min?: number
  max?: number
}

export function useEditableValue(
  initialValue: number,
  { onUpdate, step = 1, min = 0, max = Infinity }: UseEditableValueOptions
) {
  const [isEditing, setIsEditing] = useState(false)
  const [localValue, setLocalValue] = useState(initialValue)

  const handleIncrement = useCallback(() => {
    const newValue = Math.min(max, localValue + step)
    setLocalValue(newValue)
    onUpdate(newValue)
  }, [localValue, step, max, onUpdate])

  const handleDecrement = useCallback(() => {
    const newValue = Math.max(min, localValue - step)
    setLocalValue(newValue)
    onUpdate(newValue)
  }, [localValue, step, min, onUpdate])

  const handleEdit = useCallback(() => {
    setIsEditing(true)
  }, [])

  const handleChange = useCallback((value: number) => {
    setLocalValue(value)
  }, [])

  const handleBlur = useCallback(() => {
    setIsEditing(false)
    onUpdate(localValue)
  }, [localValue, onUpdate])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false)
      onUpdate(localValue)
    }
  }, [localValue, onUpdate])

  // Обновляем localValue когда меняется initialValue
  const updateValue = useCallback((newValue: number) => {
    setLocalValue(newValue)
  }, [])

  return {
    isEditing,
    localValue,
    handleIncrement,
    handleDecrement,
    handleEdit,
    handleChange,
    handleBlur,
    handleKeyDown,
    updateValue,
  }
}

