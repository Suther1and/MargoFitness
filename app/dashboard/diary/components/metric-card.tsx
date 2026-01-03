'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  label: string
  value: string | number
  unit?: string
  icon: LucideIcon
  color: string
  progress?: number
  max?: number
  onClick?: () => void
  onValueChange?: (value: number) => void
}

export function MetricCard({
  label,
  value,
  unit,
  icon: Icon,
  color,
  progress,
  max,
  onClick,
  onValueChange
}: MetricCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [tempValue, setTempValue] = useState(value.toString())

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      setIsEditing(true)
    }
  }

  const handleSave = () => {
    if (onValueChange) {
      const numValue = parseFloat(tempValue)
      if (!isNaN(numValue)) {
        onValueChange(numValue)
      }
    }
    setIsEditing(false)
  }

  const progressPercent = progress && max ? (progress / max) * 100 : 0

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/5 bg-[#121214]/80 backdrop-blur-xl",
        "p-4 cursor-pointer transition-all duration-300",
        "hover:border-white/10 hover:shadow-lg",
        "group"
      )}
      onClick={handleClick}
    >
      {/* Ambient Glow */}
      <div 
        className={cn(
          "absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500",
          color
        )} 
      />

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            "bg-white/5 border border-white/5 group-hover:border-white/10 transition-colors"
          )}>
            <Icon className={cn("w-5 h-5", color.replace('bg-', 'text-'))} />
          </div>
          
          {progress !== undefined && max !== undefined && (
            <div className="text-xs text-white/40 font-medium">
              {progress}/{max}
            </div>
          )}
        </div>

        {/* Value */}
        <div className="flex-1 flex flex-col justify-end">
          <div className="text-xs uppercase tracking-wider text-white/40 mb-1 font-medium">
            {label}
          </div>
          
          {isEditing ? (
            <input
              type="number"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave()
                if (e.key === 'Escape') {
                  setIsEditing(false)
                  setTempValue(value.toString())
                }
              }}
              className="text-2xl font-bold text-white bg-white/5 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-white/20"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div className="text-2xl font-bold text-white flex items-baseline gap-1">
              {value}
              {unit && <span className="text-sm font-normal text-white/40">{unit}</span>}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {progress !== undefined && max !== undefined && (
          <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={cn("h-full rounded-full", color)}
            />
          </div>
        )}
      </div>

      {/* Hover Indicator */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
          <svg 
            className="w-3 h-3 text-white/40" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </div>
      </div>
    </motion.div>
  )
}

