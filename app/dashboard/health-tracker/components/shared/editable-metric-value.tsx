'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { TYPOGRAPHY } from '../../constants'

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
    <motion.div
      layout="position"
      onClick={onEdit}
      className="flex items-baseline cursor-pointer hover:opacity-80 transition-opacity"
    >
      <span className={cn('text-white tabular-nums leading-none', sizeClass, className)}>
        {displayValue}
      </span>
      {unit && (
        <span className={cn('ml-1 text-[10px] font-bold uppercase tracking-tighter', unitClassName)}>
          {unit}
        </span>
      )}
    </motion.div>
  )
}

