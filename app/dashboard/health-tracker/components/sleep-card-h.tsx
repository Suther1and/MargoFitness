'use client'

import { memo, useMemo } from 'react'
import { Moon, Minus, Plus, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useEditableValue, useGoalProgress } from '../hooks'
import { MetricButton, EditableMetricValue, ProgressRing } from './shared'
import { COLORS } from '../constants'

interface SleepCardHProps {
  hours: number
  goal: number
  onUpdate: (val: number) => void
}

const StarField = () => {
  const stars = useMemo(() => 
    Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 5
    })), [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      {stars.map(star => (
        <motion.div
          key={star.id}
          className="absolute bg-white rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
          }}
        />
      ))}
    </div>
  )
}

export const SleepCardH = memo(function SleepCardH({ hours, goal, onUpdate }: SleepCardHProps) {
  const { percentage, isDone, remaining } = useGoalProgress({ current: hours, goal })
  const {
    isEditing,
    localValue,
    inputValue,
    handleIncrement,
    handleDecrement,
    handleEdit,
    handleChange,
    handleBlur,
    handleKeyDown,
  } = useEditableValue(hours, { onUpdate, step: 0.5, min: 0, maxValue: 24, decimalPlaces: 1 })

  const sleepStatus = useMemo(() => {
    if (percentage >= 100) return 'Отличный сон'
    if (percentage >= 80) return 'Хороший отдых'
    if (percentage >= 50) return 'Средний сон'
    if (hours > 0) return 'Мало сна'
    return 'Нет данных'
  }, [percentage, hours])

  return (
    <div
      className={cn(
        'relative group overflow-hidden rounded-[2rem] border transition-all duration-500 min-h-[180px] flex flex-col md:backdrop-blur-2xl',
        isDone 
          ? 'border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.05)]' 
          : 'border-white/10 bg-zinc-900/50 hover:border-indigo-500/20'
      )}
      style={{ contain: 'paint' }}
    >
      <StarField />
      
      {/* Фоновое свечение */}
      <div
        className={cn(
          'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 blur-[80px] rounded-full pointer-events-none transition-colors duration-1000 opacity-20',
          isDone ? 'bg-emerald-500' : 'bg-indigo-500'
        )}
      />

      <div className="relative z-10 flex flex-col h-full px-4 py-3 md:px-5 md:py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-2.5">
            <div className={cn('p-1.5 rounded-xl border transition-colors duration-500', 
              isDone ? 'bg-emerald-500/20 border-emerald-500/30' : COLORS.sleep.bg + ' ' + COLORS.sleep.border
            )}>
              <Moon className={cn('w-3.5 h-3.5', isDone ? 'text-emerald-400' : COLORS.sleep.primary)} />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] leading-tight">Сон</span>
              <span className={cn(
                "text-[7px] font-bold uppercase tracking-wider transition-colors leading-tight",
                isDone ? "text-emerald-400/60" : "text-white/20"
              )}>
                {sleepStatus}
              </span>
            </div>
          </div>
          
          {isDone && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="px-2 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[7px] font-black uppercase tracking-widest"
            >
              DONE
            </motion.div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex items-center justify-center relative min-h-0">
          <MetricButton 
            icon={Minus} 
            onClick={handleDecrement} 
            size="small" 
            className="absolute -left-2 md:-left-3 bg-white/5 hover:bg-white/10 border-white/5 z-20"
            iconClassName="text-white/40" 
          />

          <ProgressRing 
            percentage={percentage} 
            isDone={isDone} 
            size="medium" 
            color="#6366f1" 
            achievedColor="#10b981"
            className="scale-[0.8] md:scale-95 transition-transform duration-500"
          >
            <div className="flex flex-col items-center justify-center group/value cursor-pointer">
              <EditableMetricValue
                value={localValue}
                isEditing={isEditing}
                onEdit={handleEdit}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                inputValue={inputValue}
                unit="ч"
                step="0.5"
                format={(v) => v.toFixed(1)}
                className={cn(
                  "text-2xl md:text-4xl font-black tracking-tight transition-colors duration-300",
                  isDone ? "text-emerald-400" : "group-hover/value:text-indigo-400 text-white"
                )}
                unitClassName={cn(
                  "text-[8px] md:text-[10px] ml-0.5 transition-colors",
                  isDone ? "text-emerald-500/60" : "text-indigo-500/60"
                )}
                inputClassName="text-center w-12 md:w-14 text-xl md:text-2xl font-black bg-transparent border-none focus:ring-0"
              />
              <span className="text-[7px] md:text-[8px] font-black text-white/20 uppercase tracking-widest -mt-1">
                из {goal}ч
              </span>
            </div>
          </ProgressRing>

          <MetricButton 
            icon={Plus} 
            onClick={handleIncrement} 
            size="small" 
            className="absolute -right-2 md:-right-3 bg-white/5 hover:bg-white/10 border-white/5 z-20"
            variant={isDone ? 'success' : 'default'}
            iconClassName={isDone ? 'text-emerald-400' : 'text-white/40'} 
          />
        </div>
      </div>
    </div>
  )
})
