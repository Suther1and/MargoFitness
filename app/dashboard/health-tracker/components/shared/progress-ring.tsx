'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { PROGRESS_RING, SIZES, ANIMATIONS } from '../../constants'

interface ProgressRingProps {
  percentage: number
  isDone?: boolean
  size?: 'small' | 'medium' | 'large'
  color?: string
  achievedColor?: string
  children?: React.ReactNode
  className?: string
}

export function ProgressRing({
  percentage,
  isDone = false,
  size = 'medium',
  color = '#3b82f6',
  achievedColor = '#10b981',
  children,
  className,
}: ProgressRingProps) {
  const config = size === 'small' ? PROGRESS_RING.small : PROGRESS_RING.medium
  const sizeClass = SIZES.progressRing[size]

  const strokeColor = isDone ? achievedColor : color
  const gradientId = `gradient-${size}-${isDone ? 'achieved' : 'progress'}`

  return (
    <div className={cn('relative flex-shrink-0 flex items-center justify-center', sizeClass, className)}>
      {/* Glow effect */}
      <motion.div
        {...(isDone ? ANIMATIONS.glowPulse : {})}
        className={cn(
          'absolute inset-2 blur-[24px] rounded-full transition-colors duration-1000',
          isDone ? 'bg-emerald-500/30' : 'bg-blue-500/15'
        )}
      />

      <svg className="w-full h-full -rotate-90 relative overflow-visible" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r={config.radius}
          className="stroke-white/5"
          strokeWidth={config.strokeWidth}
          fill="none"
        />

        {/* Progress circle */}
        <motion.circle
          cx="50"
          cy="50"
          r={config.radius}
          stroke={strokeColor}
          strokeWidth={config.strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDasharray: config.circumference, strokeDashoffset: config.circumference }}
          animate={{ strokeDashoffset: config.circumference - (config.circumference * percentage) / 100 }}
          transition={{ duration: 1.5, ease: 'circOut' }}
          style={{
            filter: isDone
              ? 'drop-shadow(0 0 12px rgba(16, 185, 129, 0.5))'
              : 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.4))',
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  )
}

