'use client'

import { Footprints, Flame, MapPin, Plus, Minus } from 'lucide-react'
import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useEditableValue, useGoalProgress } from '../hooks'
import { MetricButton, EditableMetricValue, AchievementBadge, ProgressRing } from './shared'
import { COLORS } from '../constants'

interface StepsCardHProps {
  steps: number
  goal: number
  onUpdate: (val: number) => void
}

export function StepsCardH({ steps, goal, onUpdate }: StepsCardHProps) {
  const { percentage, isDone } = useGoalProgress({ current: steps, goal })
  const {
    isEditing,
    localValue,
    handleIncrement,
    handleDecrement,
    handleEdit,
    handleChange,
    handleBlur,
    handleKeyDown,
  } = useEditableValue(steps, { onUpdate, step: 500, min: 0 })

  // Расчеты для девушек
  const distance = useMemo(() => ((localValue * 0.65) / 1000).toFixed(2), [localValue])
  const calories = useMemo(() => Math.round(localValue * 0.038), [localValue])

  return (
    <div
      className={cn(
        'relative group overflow-hidden rounded-[2rem] border transition-all duration-700 h-[120px] backdrop-blur-2xl px-6 pt-3 pb-5',
        isDone ? 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/40' : 'border-white/10 bg-zinc-900/50 hover:border-orange-500/20'
      )}
    >
      {/* Фоновое свечение */}
      <div
        className={cn(
          'absolute -top-24 -left-24 w-48 h-48 blur-[100px] rounded-full pointer-events-none transition-colors duration-1000',
          isDone ? 'bg-emerald-500/10' : 'bg-orange-500/5'
        )}
      />

      <div className="relative grid grid-cols-[1.2fr_auto_1fr_0.8fr] items-center h-full gap-0">
        {/* Блок 1: Управление и шаги */}
        <div className="flex flex-col h-full justify-between">
          <div className="flex items-center gap-2 pt-1">
            <AchievementBadge
              isDone={isDone}
              icon={Footprints}
              doneText="ЦЕЛЬ ДОСТИГНУТА"
              progressText="АКТИВНОСТЬ"
              iconColor={COLORS.steps.primary}
              iconBg={COLORS.steps.bg}
            />
          </div>

          <div className="flex items-center gap-3 mb-1">
            <MetricButton icon={Minus} onClick={handleDecrement} size="small" iconClassName="text-white/40" />

            <div className="flex flex-col items-center min-w-[100px]">
              <EditableMetricValue
                value={localValue}
                isEditing={isEditing}
                onEdit={handleEdit}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                size="large"
                format={(v) => v.toLocaleString()}
                className={cn('leading-none', isDone ? 'text-emerald-400' : 'hover:text-orange-400')}
                inputClassName="text-center text-3xl w-24"
              />
              <span
                className={cn(
                  'text-[9px] font-bold uppercase tracking-tighter transition-colors duration-500 mt-1',
                  isDone ? 'text-emerald-400' : 'text-white/20'
                )}
              >
                ШАГОВ СЕГОДНЯ
              </span>
            </div>

            <MetricButton
              icon={Plus}
              onClick={handleIncrement}
              size="small"
              variant={isDone ? 'success' : 'default'}
              iconClassName={isDone ? 'text-emerald-400' : 'text-orange-400'}
              className={isDone ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-orange-500/10 border-orange-500/20'}
            />
          </div>
        </div>

        {/* Блок 2: Разделитель */}
        <div className="w-px h-12 bg-white/5 mx-6" />

        {/* Блок 3: Микро-метрики */}
        <div className="flex flex-col justify-center gap-4">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center border',
                isDone ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-orange-500/5 border-orange-500/10'
              )}
            >
              <MapPin className={cn('w-4 h-4', isDone ? 'text-emerald-400/60' : 'text-orange-400/70')} />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-black text-white/80 tabular-nums leading-tight">{distance} км</span>
              <span className="text-[9px] font-bold text-white/20 uppercase tracking-wider">дистанция</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center border',
                isDone ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-orange-500/5 border-orange-500/10'
              )}
            >
              <Flame className={cn('w-4 h-4', isDone ? 'text-emerald-400/60' : 'text-orange-400/70')} />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-black text-white/80 tabular-nums leading-tight">{calories} ккал</span>
              <span className="text-[9px] font-bold text-white/20 uppercase tracking-wider">энергия</span>
            </div>
          </div>
        </div>

        {/* Блок 4: Кольцо прогресса */}
        <div className="relative w-full h-full flex items-center justify-end">
          <ProgressRing
            percentage={percentage}
            isDone={isDone}
            size="small"
            color="#f97316"
            achievedColor="#10b981"
            className="w-[90px] h-[90px]"
          >
            <span className={cn('text-[14px] font-black tabular-nums leading-none transition-colors duration-500', isDone ? 'text-emerald-400' : 'text-white')}>
              {percentage}%
            </span>
            <span className="text-[8px] font-black text-white/40 uppercase mt-1 transition-colors duration-500 text-center">
              {isDone ? 'ГОТОВО' : `${(goal / 1000).toFixed(0)}к цель`}
            </span>
          </ProgressRing>
        </div>
      </div>
    </div>
  )
}
