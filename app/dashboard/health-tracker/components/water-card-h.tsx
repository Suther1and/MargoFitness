'use client'

import { memo, useMemo } from 'react'
import { Droplets, Waves, Plus, Minus } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useEditableValue, useGoalProgress } from '../hooks'
import { MetricButton, EditableMetricValue, AchievementBadge } from './shared'
import { COLORS } from '../constants'

interface WaterCardHProps {
  value: number
  goal: number
  onUpdate: (val: number) => void
}

const WaveBackground = ({ percentage, isDone }: { percentage: number; isDone: boolean }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[2rem]">
      <motion.div
        className={cn(
          'absolute inset-y-0 left-0 h-full',
          isDone
            ? 'bg-gradient-to-r from-emerald-500/15 via-emerald-400/20 to-emerald-500/15'
            : 'bg-gradient-to-r from-blue-600/15 via-blue-500/20 to-blue-600/15'
        )}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20,
          mass: 0.5,
        }}
      />
    </div>
  )
}

const BubblesField = memo(({ isDone, percentage }: { isDone: boolean; percentage: number }) => {
  const bubbles = useMemo(() => 
    Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 3 + 3,
      delay: Math.random() * 10
    })), [])

  return (
    <motion.div 
      className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden rounded-[2rem]"
      initial={{ clipPath: 'inset(0 100% 0 0)' }}
      animate={{ clipPath: `inset(0 ${100 - percentage}% 0 0)` }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 20,
        mass: 0.5,
      }}
    >
      {bubbles.map(b => (
        <motion.div
          key={b.id}
          className={cn(
            "absolute rounded-full border border-white/10",
            isDone ? "bg-emerald-400/20" : "bg-blue-300/20"
          )}
          style={{
            left: `${b.x}%`,
            bottom: `-15%`,
            width: b.size,
            height: b.size,
          }}
          animate={{
            y: [0, -160],
            x: [0, Math.sin(b.id + b.x) * 10],
            opacity: [0, 0.8, 0.6, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: b.duration,
            repeat: Infinity,
            delay: b.delay,
            ease: "easeInOut"
          }}
        />
      ))}
    </motion.div>
  )
})

export const WaterCardH = memo(function WaterCardH({ value, goal, onUpdate }: WaterCardHProps) {
  const { percentage, isDone, remaining } = useGoalProgress({ current: value, goal })
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
  } = useEditableValue(value, { onUpdate, step: 250, min: 0, maxValue: 9999, decimalPlaces: 0 })

  return (
    <div
      className={cn(
        'relative group overflow-hidden rounded-[2rem] border transition-colors duration-500 min-h-[110px] md:min-h-[120px]',
        isDone
          ? 'border-emerald-500/30 bg-zinc-900/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
          : 'border-white/10 bg-zinc-900/50 hover:border-blue-500/20'
      )}
    >
      <WaveBackground percentage={percentage} isDone={isDone} />
      <BubblesField isDone={isDone} percentage={percentage} />

      <div className="relative z-10 flex flex-col h-full px-5 pt-3 pb-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <AchievementBadge
            isDone={isDone}
            icon={Droplets}
            doneText="Цель достигнута"
            progressText="Гидратация"
            iconColor={COLORS.water.primary}
            iconBg={COLORS.water.bg}
          />
          <div
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-colors duration-500',
              isDone ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-white/5 border-white/10'
            )}
          >
            <span className={cn('text-[10px] font-black tabular-nums', isDone ? 'text-emerald-400' : 'text-blue-400')}>
              {percentage}%
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex items-center justify-between flex-1">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-baseline gap-2">
              <EditableMetricValue
                value={localValue}
                isEditing={isEditing}
                onEdit={handleEdit}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                inputValue={inputValue}
                className="text-3xl md:text-4xl hover:text-blue-400"
                inputClassName="text-left text-2xl md:text-4xl w-20 md:w-24"
              />
              <span className="text-[8px] md:text-[10px] font-bold text-white/20 uppercase tracking-widest tabular-nums">
                / {goal} мл
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Waves className={cn('w-3 h-3 transition-colors', isDone ? 'text-emerald-500/50' : 'text-blue-500/50')} />
              <span
                className={cn(
                  'text-[9px] font-black uppercase tracking-wider transition-colors',
                  isDone ? 'text-emerald-400/80' : 'text-white/40'
                )}
              >
                {isDone ? 'Отличный результат!' : `Осталось ${remaining} мл`}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <MetricButton icon={Minus} onClick={handleDecrement} iconClassName="text-white/40" />
            <MetricButton
              icon={Plus}
              onClick={handleIncrement}
              variant={isDone ? 'success' : 'primary'}
              iconClassName={isDone ? 'text-emerald-400' : 'text-blue-400'}
              className="shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
  )
})
