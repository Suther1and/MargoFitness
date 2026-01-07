'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { LucideIcon, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ANIMATIONS, SIZES } from '../../constants'

interface AchievementBadgeProps {
  isDone: boolean
  icon: LucideIcon
  doneText?: string
  progressText?: string
  iconColor?: string
  doneIconColor?: string
  iconBg?: string
  doneIconBg?: string
  className?: string
}

export function AchievementBadge({
  isDone,
  icon: Icon,
  doneText = 'ЦЕЛЬ ДОСТИГНУТА',
  progressText,
  iconColor = 'text-blue-400',
  doneIconColor = 'text-emerald-400',
  iconBg = 'bg-blue-500/10',
  doneIconBg = 'bg-emerald-500/20',
  className,
}: AchievementBadgeProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <AnimatePresence mode="wait">
        {isDone ? (
          <motion.div
            key="trophy"
            {...ANIMATIONS.trophy}
            className={cn('p-1.5 rounded-lg border', doneIconBg, 'border-emerald-500/30')}
          >
            <Trophy className={cn(SIZES.icon.badge, doneIconColor)} />
          </motion.div>
        ) : (
          <motion.div
            key="icon"
            {...ANIMATIONS.icon}
            className={cn('p-1.5 rounded-lg border', iconBg, 'border-white/20')}
          >
            <Icon className={cn(SIZES.icon.badge, iconColor)} />
          </motion.div>
        )}
      </AnimatePresence>
      <span
        className={cn(
          'text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-500',
          isDone ? 'text-emerald-400/60' : 'text-white/40'
        )}
      >
        {isDone ? doneText : progressText}
      </span>
    </div>
  )
}

