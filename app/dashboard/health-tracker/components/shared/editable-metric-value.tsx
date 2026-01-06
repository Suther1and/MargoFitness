'use client'

import { cn } from '@/lib/utils'
import { TYPOGRAPHY } from '../../constants'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

interface EditableMetricValueProps {
  value: number
  isEditing: boolean
  onEdit: () => void
  onChange: (value: number) => void
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
}: EditableMetricValueProps) {
  const sizeClass = TYPOGRAPHY.value[size]
  const displayValue = format ? format(value) : value
  
  const [direction, setDirection] = useState<1 | -1>(1)
  const prevValue = useRef(value)

  useEffect(() => {
    if (value > prevValue.current) {
      setDirection(1)
    } else if (value < prevValue.current) {
      setDirection(-1)
    }
    prevValue.current = value
  }, [value])

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
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
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
        <span className={cn('opacity-0 tabular-nums leading-none pointer-events-none select-none', sizeClass, className)}>
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
            className={cn('absolute inset-0 text-white tabular-nums leading-none flex items-center', sizeClass, className)}
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

