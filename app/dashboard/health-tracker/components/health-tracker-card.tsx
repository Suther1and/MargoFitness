'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HealthTrackerCardProps {
  children: ReactNode
  title?: string
  subtitle?: string
  icon?: LucideIcon
  iconColor?: string
  iconBg?: string
  className?: string
  containerClassName?: string
  rightAction?: ReactNode
}

export function HealthTrackerCard({
  children,
  title,
  subtitle,
  icon: Icon,
  iconColor = "text-white",
  iconBg = "bg-white/5",
  className,
  containerClassName,
  rightAction
}: HealthTrackerCardProps) {
  return (
    <div 
      className={cn(
        "relative h-full overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#121214]/90 md:bg-[#121214]/40 md:backdrop-blur-xl transition-colors duration-500 hover:border-white/10 group",
        containerClassName
      )}
    >
      {/* Background Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
        <div className={cn(
          "absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[100px]",
          iconBg.replace('bg-', 'bg-').replace('/20', '/10') || "bg-white/5"
        )} />
      </div>

      <div className={cn("relative z-10 flex flex-col h-full p-6", className)}>
        {/* Header (Optional) */}
        {(title || Icon) && (
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110",
                  iconBg,
                  "border border-white/5"
                )}>
                  <Icon className={cn("w-5 h-5", iconColor)} />
                </div>
              )}
              {title && (
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight uppercase leading-none">{title}</h3>
                  {subtitle && <p className="text-[10px] text-white/40 font-medium uppercase tracking-[0.1em] mt-1">{subtitle}</p>}
                </div>
              )}
            </div>
            {rightAction && (
              <div className="flex items-center">
                {rightAction}
              </div>
            )}
          </div>
        )}

        <div className="flex-1 flex flex-col">
          {children}
        </div>
      </div>
    </div>
  )
}

