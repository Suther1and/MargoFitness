'use client'

import { Scale, TrendingDown, TrendingUp, Minus, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useEditableValue } from '../hooks'
import { MetricButton, EditableMetricValue } from './shared'
import { COLORS, ANIMATIONS } from '../constants'

interface WeightCardHProps {
  value: number
  onUpdate: (val: number) => void
  goalWeight?: number
}

export function WeightCardH({ value, onUpdate, goalWeight }: WeightCardHProps) {
  const {
    isEditing,
    localValue,
    handleIncrement,
    handleDecrement,
    handleEdit,
    handleChange,
    handleBlur,
    handleKeyDown,
  } = useEditableValue(value, { onUpdate, step: 0.1, min: 0 })

  const weightHistory = useMemo(() => [72.1, 72.3, 72.7, 72.5, 72.6, 72.5, localValue], [localValue])

  const weekChange = localValue - weightHistory[0]
  const isGoalToLose = goalWeight ? goalWeight < localValue : weekChange < 0
  const changeColor = weekChange < 0 ? (isGoalToLose ? 'text-emerald-400' : 'text-red-400') : isGoalToLose ? 'text-red-400' : 'text-emerald-400'

  return (
    <div className="relative group overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900/50 backdrop-blur-2xl px-4 md:px-6 pt-4 pb-6 hover:border-emerald-500/20 transition-all duration-500 h-[180px]">
      <div className="absolute top-3 right-3 md:top-4 md:right-4">
        <div className={cn('flex items-center gap-1 px-1.5 py-0.5 md:px-2 md:py-1 rounded-lg bg-white/5 border border-white/5', changeColor)}>
          {weekChange < 0 ? <TrendingDown className="w-2.5 h-2.5 md:w-3 md:h-3" /> : <TrendingUp className="w-2.5 h-2.5 md:w-3 md:h-3" />}
          <span className="text-[8px] md:text-[10px] font-bold">
            {weekChange > 0 ? '+' : ''}
            {weekChange.toFixed(1)} кг
          </span>
        </div>
      </div>

      <div className="relative flex flex-col h-full justify-between">
        <div className="flex items-center gap-2">
          <div className={cn('p-1.5 rounded-lg', COLORS.weight.bg, COLORS.weight.border, 'border')}>
            <Scale className={cn('w-3 h-3 md:w-3.5 md:h-3.5', COLORS.weight.primary)} />
          </div>
          <span className="text-[8px] md:text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Вес тела</span>
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
                {...ANIMATIONS.progressBar}
                animate={{
                  width: `${Math.min(100, (Math.abs(localValue - weightHistory[0]) / Math.abs(goalWeight - weightHistory[0])) * 100)}%`,
                }}
                className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
