'use client'

import { memo, useMemo } from 'react'
import { Scale, TrendingDown, TrendingUp, Minus, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useEditableValue } from '../hooks'
import { MetricButton, EditableMetricValue } from './shared'
import { COLORS } from '../constants'

interface WeightCardHProps {
  value: number
  onUpdate: (val: number) => void
  goalWeight?: number
}

export const WeightCardH = memo(function WeightCardH({ value, onUpdate, goalWeight }: WeightCardHProps) {
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
  } = useEditableValue(value, { onUpdate, step: 0.1, min: 0, maxValue: 999.99, decimalPlaces: 2 })

  const weightHistory = useMemo(() => [72.1, 72.3, 72.7, 72.5, 72.6, 72.5, localValue], [localValue])

  const weekChange = localValue - weightHistory[0]
  const isGoalToLose = goalWeight ? goalWeight < localValue : weekChange < 0
  const changeColor = weekChange < 0 ? (isGoalToLose ? 'text-emerald-400' : 'text-red-400') : isGoalToLose ? 'text-red-400' : 'text-emerald-400'

  const progressPercentage = useMemo(() => {
    if (!goalWeight) return 0
    return Math.min(100, (Math.abs(localValue - weightHistory[0]) / Math.abs(goalWeight - weightHistory[0])) * 100)
  }, [localValue, goalWeight, weightHistory])

  const progressConfig = useMemo(() => ({
    initial: { width: 0 },
    animate: { width: `${progressPercentage}%` },
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const }
  }), [progressPercentage])

  return (
    <div className="relative group overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900/50 md:backdrop-blur-2xl px-4 md:px-6 pt-4 pb-6 hover:border-emerald-500/20 transition-colors duration-500 h-[180px]" style={{ contain: 'paint' }}>
      <div className="relative flex flex-col h-full justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('p-1.5 rounded-lg', COLORS.weight.bg, COLORS.weight.border, 'border')}>
              <Scale className={cn('w-3.5 h-3.5', COLORS.weight.primary)} />
            </div>
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] md:hidden">Вес</span>
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] hidden md:inline">Вес тела</span>
          </div>
          <div className={cn('flex items-center gap-1 px-2 py-1 rounded-lg md:bg-white/5 md:border md:border-white/5', changeColor)}>
            {weekChange < 0 ? <TrendingDown className="w-3 h-3 hidden md:block" /> : <TrendingUp className="w-3 h-3 hidden md:block" />}
            <span className="text-[10px] font-bold">
              {weekChange > 0 ? '+' : ''}
              {weekChange.toFixed(1)} кг
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-1 md:gap-2 my-2">
          <MetricButton icon={Minus} onClick={handleDecrement} size="small" iconClassName="text-white/40" />

          <div className="flex items-baseline justify-center flex-1 min-w-0">
            <EditableMetricValue
              value={localValue}
              isEditing={isEditing}
              onEdit={handleEdit}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              inputValue={inputValue}
              unit="кг"
              step="0.1"
              format={(v) => v.toFixed(1)}
              className="text-3xl md:text-4xl hover:text-emerald-400 truncate"
              unitClassName="text-emerald-500/40 text-[8px] md:text-[10px]"
              inputClassName="text-center w-full text-2xl md:text-4xl"
            />
          </div>

          <MetricButton icon={Plus} onClick={handleIncrement} size="small" iconClassName="text-white/40" />
        </div>

        {goalWeight && (
          <div className="w-full space-y-1.5">
            <div className="flex items-center justify-between text-[9px] font-bold uppercase">
              <span className="text-white/20">До цели {goalWeight} кг</span>
              <span className="text-emerald-400">{Math.abs(localValue - goalWeight).toFixed(1)} кг</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div
                {...progressConfig}
                layout
                className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
})
