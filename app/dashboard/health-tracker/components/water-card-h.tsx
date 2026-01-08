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
  const animationConfig = useMemo(() => ({
    initial: { width: 0 },
    animate: { width: `${percentage}%` },
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  }), [percentage])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[2rem]">
      <motion.div
        className={cn(
          'absolute inset-y-0 left-0 h-full',
          isDone
            ? 'bg-gradient-to-r from-emerald-500/15 via-emerald-400/20 to-emerald-500/15'
            : 'bg-gradient-to-r from-blue-600/15 via-blue-500/20 to-blue-600/15'
        )}
        {...animationConfig}
        layout
      />
    </div>
  )
}

export const WaterCardH = memo(function WaterCardH({ value, goal, onUpdate }: WaterCardHProps) {
  const { percentage, isDone, remaining } = useGoalProgress({ current: value, goal })
  const {
    isEditing,
    localValue,
    handleIncrement,
    handleDecrement,
    handleEdit,
    handleChange,
    handleBlur,
    handleKeyDown,
  } = useEditableValue(value, { onUpdate, step: 250, min: 0 })

  return (
    <div
      className={cn(
        'relative group overflow-hidden rounded-[2rem] border transition-colors duration-500 h-[110px] md:h-[120px]',
        isDone
          ? 'border-emerald-500/30 bg-zinc-900/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
          : 'border-white/10 bg-zinc-900/50 hover:border-blue-500/20'
      )}
    >
      <WaveBackground percentage={percentage} isDone={isDone} />

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
