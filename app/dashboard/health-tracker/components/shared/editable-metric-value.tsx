'use client'

import { cn } from '@/lib/utils'
import { TYPOGRAPHY } from '../../constants'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

interface EditableMetricValueProps {
  value: number
  isEditing: boolean
  onEdit: () => void
  onChange: (value: string) => void
  onBlur: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
  unit?: string
  size?: 'small' | 'medium' | 'large' | 'xlarge'
  className?: string
  unitClassName?: string
  step?: string
  type?: 'number' | 'text'
  format?: (value: number) => string
  inputClassName?: string
  inputValue?: string
  autoShrink?: boolean // Авто-уменьшение шрифта для больших чисел
}

export function EditableMetricValue({
  value,
  isEditing,
  onEdit,
  onChange,
  onBlur,
  onKeyDown,
  unit,
  size = 'large',
  className,
  unitClassName,
  step = '1',
  type = 'number',
  format,
  inputClassName,
  inputValue,
  autoShrink = false,
}: EditableMetricValueProps) {
  const sizeClass = TYPOGRAPHY.value[size]
  const displayValue = format ? format(value) : value
  
  // Динамическое уменьшение шрифта для больших чисел
  const getDisplayClassName = () => {
    if (!autoShrink) return className
    
    const valueStr = displayValue.toString()
    const digitCount = valueStr.replace(/[^\d]/g, '').length
    
    if (digitCount >= 5) {
      return cn(className, 'text-2xl md:text-3xl')
    }
    if (digitCount === 4) {
      return cn(className, 'text-3xl md:text-4xl')
    }
    return className
  }
  
  const [prev, setPrev] = useState(value)
  const [direction, setDirection] = useState<1 | -1>(1)

  // Определение направления анимации при изменении значения
  useEffect(() => {
    if (value !== prev) {
      setDirection(value > prev ? 1 : -1)
      setPrev(value)
    }
  }, [value, prev])

  if (isEditing) {
    return (
      <input
        autoFocus
        type={type}
        step={step}
        className={cn(
          'bg-transparent text-white font-oswald outline-none',
          sizeClass,
          inputClassName,
          size === 'large' && 'w-24',
          size === 'xlarge' && 'w-28'
        )}
        value={inputValue !== undefined ? inputValue : value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
      />
    )
  }

  return (
    <div
      onClick={onEdit}
      className="flex items-baseline cursor-pointer hover:opacity-80 transition-opacity"
    >
      <div className="relative inline-block overflow-hidden h-fit">
        {/* Призрачный элемент для сохранения исходных размеров карточки */}
        <span className={cn('opacity-0 tabular-nums leading-none pointer-events-none select-none', sizeClass, getDisplayClassName())}>
          {displayValue}
        </span>
        
        <AnimatePresence initial={false}>
          <motion.span
            key={displayValue.toString()}
            initial={{ y: direction === 1 ? '100%' : '-100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: direction === 1 ? '-100%' : '100%', opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 35,
              mass: 0.5
            }}
            className={cn('absolute inset-0 text-white tabular-nums leading-none flex items-center', sizeClass, getDisplayClassName())}
          >
            {displayValue}
          </motion.span>
        </AnimatePresence>
      </div>
      {unit && (
        <span className={cn('ml-1 text-[10px] font-bold uppercase tracking-tighter', unitClassName)}>
          {unit}
        </span>
      )}
    </div>
  )
}

