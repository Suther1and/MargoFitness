'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { SIZES, ANIMATIONS } from '../../constants'
import { LucideIcon } from 'lucide-react'

interface MetricButtonProps {
  icon: LucideIcon
  onClick: () => void
  variant?: 'default' | 'primary' | 'success' | 'danger'
  size?: 'small' | 'medium'
  className?: string
  iconClassName?: string
  disabled?: boolean
}

export function MetricButton({
  icon: Icon,
  onClick,
  variant = 'default',
  size = 'medium',
  className,
  iconClassName,
  disabled = false,
}: MetricButtonProps) {
  const sizeClass = size === 'small' ? SIZES.button.small : SIZES.button.medium
  const iconSize = size === 'small' ? SIZES.button.icon : SIZES.button.iconMedium

  const variantStyles = {
    default: 'bg-white/5 border-white/10 hover:bg-white/10',
    primary: 'bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20',
    success: 'bg-emerald-500/20 border-emerald-500/30 hover:bg-emerald-500/30',
    danger: 'bg-red-500/20 border-red-500/30 hover:bg-red-500/30',
  }

  return (
    <motion.button
      {...(size === 'small' ? ANIMATIONS.button : ANIMATIONS.buttonLarge)}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex-shrink-0 rounded-xl border flex items-center justify-center transform-gpu',
        sizeClass,
        variantStyles[variant],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <Icon className={cn(iconSize, iconClassName)} />
    </motion.button>
  )
}

