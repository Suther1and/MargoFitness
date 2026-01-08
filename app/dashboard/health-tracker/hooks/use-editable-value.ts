'use client'

import { useState, useCallback, useEffect } from 'react'

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
  maxValue?: number // Максимальное значение для ввода
  decimalPlaces?: number // Количество знаков после запятой (0 = целые числа)
}

export function useEditableValue(
  initialValue: number,
  { onUpdate, step = 1, min = 0, max = Infinity, maxValue = Infinity, decimalPlaces }: UseEditableValueOptions
) {
  const [isEditing, setIsEditing] = useState(false)
  const [localValue, setLocalValue] = useState(initialValue)
  const [inputValue, setInputValue] = useState(initialValue.toString())

  // Синхронизация с внешними изменениями (смена даты, обновление из БД)
  useEffect(() => {
    if (!isEditing) {
      setLocalValue(initialValue)
      setInputValue(initialValue.toString())
    }
  }, [initialValue, isEditing])

  // Стабильные колбэки с использованием функциональных updates
  const handleIncrement = useCallback(() => {
    setLocalValue(prev => {
      const newValue = Math.min(max, prev + step)
      onUpdate(newValue)
      return newValue
    })
  }, [step, max, onUpdate])

  const handleDecrement = useCallback(() => {
    setLocalValue(prev => {
      const newValue = Math.max(min, prev - step)
      onUpdate(newValue)
      return newValue
    })
  }, [step, min, onUpdate])

  const handleEdit = useCallback(() => {
    setIsEditing(true)
    // Очистить поле, если значение равно 0 (удаление ведущего нуля)
    if (localValue === 0) {
      setInputValue('')
    } else {
      setInputValue(localValue.toString())
    }
  }, [localValue])

  const handleChange = useCallback((rawValue: string) => {
    // Сохраняем исходное значение для корректного отображения в input
    setInputValue(rawValue)
    
    // Валидация и парсинг
    let numValue: number
    
    if (rawValue === '' || rawValue === '-') {
      numValue = 0
    } else if (decimalPlaces === 0) {
      // Только целые числа
      numValue = parseInt(rawValue) || 0
    } else {
      // Дробные числа
      numValue = parseFloat(rawValue) || 0
    }
    
    // Применение ограничений
    numValue = Math.max(min, Math.min(maxValue, numValue))
    
    // Применение знаков после запятой при необходимости
    if (decimalPlaces !== undefined && decimalPlaces >= 0) {
      numValue = parseFloat(numValue.toFixed(decimalPlaces))
    }
    
    setLocalValue(numValue)
  }, [min, maxValue, decimalPlaces])

  const handleBlur = useCallback(() => {
    setIsEditing(false)
    // Если поле пустое, вернуть к 0
    if (inputValue === '' || inputValue === '-') {
      setLocalValue(0)
      setInputValue('0')
      onUpdate(0)
    } else {
      onUpdate(localValue)
    }
  }, [localValue, inputValue, onUpdate])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false)
      // Если поле пустое, вернуть к 0
      if (inputValue === '' || inputValue === '-') {
        setLocalValue(0)
        setInputValue('0')
        onUpdate(0)
      } else {
        onUpdate(localValue)
      }
    }
  }, [localValue, inputValue, onUpdate])

  return {
    isEditing,
    localValue,
    inputValue,
    handleIncrement,
    handleDecrement,
    handleEdit,
    handleChange,
    handleBlur,
    handleKeyDown,
  }
}

