'use client'

import { Moon, Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEditableValue, useGoalProgress } from '../hooks'
import { MetricButton, EditableMetricValue, AchievementBadge, ProgressRing } from './shared'
import { COLORS } from '../constants'

interface SleepCardHProps {
  hours: number
  goal: number
  onUpdate: (val: number) => void
}

export function SleepCardH({ hours, goal, onUpdate }: SleepCardHProps) {
  const { percentage, isDone } = useGoalProgress({ current: hours, goal })
  const {
    isEditing,
    localValue,
    handleIncrement,
    handleDecrement,
    handleEdit,
    handleChange,
    handleBlur,
    handleKeyDown,
  } = useEditableValue(hours, { onUpdate, step: 0.5, min: 0, max: 24 })

  return (
    <div
      className={cn(
        'relative group overflow-hidden rounded-[2rem] border transition-all duration-700 h-[180px] flex flex-col px-6 pt-4 pb-6 backdrop-blur-2xl',
        isDone ? 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/40' : 'border-white/10 bg-zinc-900/50 hover:border-indigo-500/20'
      )}
    >
      {/* Фоновое свечение */}
      <div
        className={cn(
          'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 blur-[80px] rounded-full pointer-events-none transition-colors duration-1000',
          isDone ? 'bg-emerald-500/10' : 'bg-indigo-500/10'
        )}
      />

      {/* Header */}
      <div className="relative z-20 flex items-center gap-2 mb-2">
        <AchievementBadge isDone={isDone} icon={Moon} doneText="ЦЕЛЬ ДОСТИГНУТА" progressText="Сон" iconColor={COLORS.sleep.primary} iconBg={COLORS.sleep.bg} />
      </div>

      {/* Центральный блок */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="flex items-center gap-1 pointer-events-auto translate-y-3">
          <MetricButton icon={Minus} onClick={handleDecrement} iconClassName="text-white/40" />

          <ProgressRing percentage={percentage} isDone={isDone} size="large" color="#6366f1" achievedColor="#10b981">
            <div className="flex items-baseline gap-0.5">
              <EditableMetricValue
                value={localValue}
                isEditing={isEditing}
                onEdit={handleEdit}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                unit="ч"
                size="xlarge"
                step="0.5"
                className={cn('leading-none transition-colors duration-500', isDone ? 'text-emerald-400' : 'text-white')}
                unitClassName={cn('text-sm leading-none ml-0.5 transition-colors duration-500', isDone ? 'text-emerald-400/40' : 'text-white/20')}
                inputClassName="w-16 text-center"
              />
            </div>
          </ProgressRing>

          <MetricButton
            icon={Plus}
            onClick={handleIncrement}
            variant={isDone ? 'success' : 'default'}
            iconClassName={isDone ? 'text-emerald-400' : 'text-white/40'}
            className={isDone ? 'hover:bg-emerald-500/30' : ''}
          />
        </div>
      </div>
    </div>
  )
}
