"use client"

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface EnhancedStatsCardProps {
  title: string
  subtitle?: string
  icon?: LucideIcon
  iconColor?: string
  iconBg?: string
  size?: 'small' | 'medium' | 'large' | 'full'
  children: ReactNode
  onClick?: () => void
  className?: string
  variant?: 'default' | 'gradient' | 'filled'
  accentColor?: string
}

const SIZE_CLASSES = {
  small: 'col-span-3',
  medium: 'col-span-4',
  large: 'col-span-5',
  full: 'col-span-12'
}

const VARIANT_CLASSES = {
  default: 'bg-[#121214]/60 border-white/10',
  gradient: 'bg-gradient-to-br from-white/[0.08] to-white/[0.02] border-white/10',
  filled: 'bg-white/[0.06] border-white/15'
}

export function EnhancedStatsCard({
  title,
  subtitle,
  icon: Icon,
  iconColor = 'text-amber-500',
  iconBg = 'bg-amber-500/10',
  size = 'medium',
  children,
  onClick,
  className,
  variant = 'default',
  accentColor
}: EnhancedStatsCardProps) {
  const MotionComponent = onClick ? motion.button : motion.div
  
  return (
    <MotionComponent
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-[2.5rem] border p-5 transition-all duration-300 transform-gpu",
        SIZE_CLASSES[size],
        VARIANT_CLASSES[variant],
        onClick && "cursor-pointer active:scale-[0.98] hover:shadow-xl",
        !onClick && "pointer-events-auto",
        className
      )}
      whileHover={onClick ? { 
        borderColor: accentColor ? `${accentColor}40` : 'rgba(255,255,255,0.2)',
        y: -2
      } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      style={onClick ? { touchAction: 'manipulation' } : undefined}
    >
      {/* Accent glow effect */}
      {accentColor && onClick && (
        <>
          <motion.div 
            className="absolute inset-0 opacity-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${accentColor}15, transparent 70%)`
            }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
          {/* Subtle border glow on hover */}
          <motion.div
            className="absolute inset-0 rounded-[2.5rem] pointer-events-none opacity-0"
            style={{
              boxShadow: `0 0 20px ${accentColor}30`
            }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        </>
      )}

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <motion.div 
              className={cn(
                "p-2.5 rounded-xl border flex items-center justify-center shrink-0",
                iconBg,
                accentColor ? '' : 'border-white/10'
              )}
              style={accentColor ? { borderColor: `${accentColor}30` } : undefined}
              whileHover={onClick ? { scale: 1.1 } : undefined}
              transition={{ duration: 0.3 }}
            >
              <Icon className={cn("w-5 h-5", iconColor)} />
            </motion.div>
          )}
          <div className="min-w-0">
            <div className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-0.5 truncate">
              {title}
            </div>
            {subtitle && (
              <div className="text-xs font-medium text-white/60 truncate">
                {subtitle}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </MotionComponent>
  )
}

// Специальные варианты для разных типов карточек

interface StatsCardHeaderProps {
  value: string | number
  unit?: string
  label?: string
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
  }
}

export function StatsCardHeader({ value, unit, label, trend }: StatsCardHeaderProps) {
  const getTrendColor = () => {
    if (!trend) return ''
    if (trend.direction === 'up') return 'text-emerald-400'
    if (trend.direction === 'down') return 'text-red-400'
    return 'text-white/40'
  }

  const getTrendIcon = () => {
    if (!trend) return null
    if (trend.direction === 'up') return '↑'
    if (trend.direction === 'down') return '↓'
    return '→'
  }

  return (
    <div className="flex items-baseline justify-between gap-3">
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-black text-white tabular-nums tracking-tight">
          {value}
        </span>
        {unit && (
          <span className="text-sm font-bold text-white/40 uppercase">
            {unit}
          </span>
        )}
      </div>
      {trend && (
        <div className={cn("flex items-center gap-1 text-sm font-black", getTrendColor())}>
          <span>{getTrendIcon()}</span>
          <span className="tabular-nums">{Math.abs(trend.value)}</span>
        </div>
      )}
    </div>
  )
}

interface StatsCardFooterProps {
  label: string
  value: string | number
  variant?: 'default' | 'success' | 'warning' | 'info'
}

export function StatsCardFooter({ label, value, variant = 'default' }: StatsCardFooterProps) {
  const variantColors = {
    default: 'text-white/60',
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    info: 'text-blue-400'
  }

  return (
    <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5">
      <span className="text-[9px] font-black text-white/30 uppercase tracking-wider">
        {label}
      </span>
      <span className={cn("text-sm font-black tabular-nums", variantColors[variant])}>
        {value}
      </span>
    </div>
  )
}

