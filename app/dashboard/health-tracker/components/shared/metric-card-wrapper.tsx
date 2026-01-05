'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { CARD_STYLES, SIZES } from '../../constants'

interface MetricCardWrapperProps {
  children: React.ReactNode
  height?: string
  isDone?: boolean
  baseColor?: string
  doneColor?: string
  className?: string
  glowColor?: string
  doneGlowColor?: string
}

export function MetricCardWrapper({
  children,
  height = 'h-[120px]',
  isDone = false,
  baseColor = 'border-white/10',
  doneColor = 'border-emerald-500/30',
  className,
  glowColor = 'bg-white/5',
  doneGlowColor = 'bg-emerald-500/10',
}: MetricCardWrapperProps) {
  return (
    <div
      className={cn(
        CARD_STYLES.base,
        CARD_STYLES.background,
        SIZES.card.borderRadius,
        SIZES.card.padding,
        height,
        isDone ? doneColor : baseColor,
        isDone && 'shadow-[0_0_20px_rgba(16,185,129,0.1)]',
        className
      )}
    >
      {/* Background glow */}
      <div
        className={cn(
          'absolute -top-24 -left-24 w-48 h-48 blur-[100px] rounded-full pointer-events-none transition-colors duration-1000',
          isDone ? doneGlowColor : glowColor
        )}
      />

      <div className="relative z-10 flex flex-col h-full">{children}</div>
    </div>
  )
}

