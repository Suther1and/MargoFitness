'use client'

import { memo, useMemo } from 'react'
import { Scale, Minus, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useEditableValue } from '../hooks'
import { MetricButton, EditableMetricValue } from './shared'
import { COLORS } from '../constants'

interface WeightCardHProps {
  value: number
  onUpdate: (val: number) => void
  goalWeight?: number
  initialWeight?: number
}

export const WeightCardH = memo(function WeightCardH({ value, onUpdate, goalWeight, initialWeight }: WeightCardHProps) {
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

  // Используем initialWeight как точку отсчета для прогресса
  const startWeight = initialWeight || value || localValue
  
  const isGoalToLose = goalWeight ? goalWeight < startWeight : true
  const weightDiff = goalWeight ? localValue - goalWeight : 0
  const isGoalReached = goalWeight 
    ? (isGoalToLose ? localValue <= goalWeight : localValue >= goalWeight)
    : false

  const progressPercentage = useMemo(() => {
    if (!goalWeight || !startWeight || startWeight === goalWeight) return 0
    
    const totalChangeNeeded = Math.abs(startWeight - goalWeight)
    const currentChange = Math.abs(startWeight - localValue)
    
    const isMovingInRightDirection = isGoalToLose 
      ? localValue <= startWeight 
      : localValue >= startWeight
      
    if (!isMovingInRightDirection) return 0
    
    return Math.min(100, (currentChange / totalChangeNeeded) * 100)
  }, [localValue, goalWeight, startWeight, isGoalToLose])

  const progressConfig = useMemo(() => ({
    initial: { width: 0 },
    animate: { width: `${goalWeight ? progressPercentage : 0}%` },
    transition: { duration: 0.8, ease: "easeOut" as const }
  }), [progressPercentage, goalWeight])

  return (
    <div className={cn(
      "relative group overflow-hidden rounded-[2rem] border transition-all duration-500 h-[180px]",
      isGoalReached 
        ? "border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.05)]" 
        : "border-white/10 bg-zinc-900/50 hover:border-emerald-500/20"
    )} style={{ contain: 'paint' }}>
      {/* Фоновый градиент прогресса */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className={cn(
            "absolute inset-y-0 left-0 bg-gradient-to-r transition-colors duration-1000",
            isGoalReached ? "from-emerald-500/15 via-emerald-400/10 to-transparent" : "from-emerald-500/5 to-transparent"
          )}
          initial={{ width: 0 }}
          animate={{ width: `${goalWeight ? Math.max(progressPercentage, 2) : 0}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>

      <div className="relative flex flex-col h-full justify-between p-4 md:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={cn('p-2 rounded-xl border transition-colors duration-500', 
              isGoalReached ? 'bg-emerald-500/20 border-emerald-500/30' : COLORS.weight.bg + ' ' + COLORS.weight.border
            )}>
              <Scale className={cn('w-4 h-4', isGoalReached ? 'text-emerald-400' : COLORS.weight.primary)} />
            </div>
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Вес тела</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 my-2">
          <MetricButton 
            icon={Minus} 
            onClick={handleDecrement} 
            size="small" 
            className="bg-white/5 hover:bg-white/10 border-white/5"
            iconClassName="text-white/40" 
          />

          <div className="flex items-baseline justify-center flex-1 min-w-0 group/value">
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
              className={cn(
                "text-4xl md:text-5xl font-black tracking-tight transition-colors duration-300",
                isGoalReached ? "text-emerald-400" : "group-hover/value:text-emerald-400 text-white"
              )}
              unitClassName="text-emerald-500/60 text-[10px] ml-1"
              inputClassName="text-center w-full text-3xl md:text-5xl font-black bg-transparent border-none focus:ring-0"
            />
          </div>

          <MetricButton 
            icon={Plus} 
            onClick={handleIncrement} 
            size="small" 
            className="bg-white/5 hover:bg-white/10 border-white/5"
            iconClassName="text-white/40" 
          />
        </div>

        <div className="w-full space-y-2">
          {goalWeight && (
            <div className="flex items-end justify-between px-0.5">
              <div className="flex flex-col gap-0.5">
                <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Цель</span>
                <span className="text-[10px] font-black text-emerald-500/50 tabular-nums leading-none">
                  {goalWeight} <span className="text-[8px] opacity-60">кг</span>
                </span>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">
                  {isGoalReached ? 'Результат' : 'Осталось'}
                </span>
                <span className={cn(
                  "text-[10px] font-black tabular-nums leading-none",
                  isGoalReached ? "text-emerald-400" : "text-white/40"
                )}>
                  {isGoalReached ? 'ЦЕЛЬ!' : `${Math.abs(weightDiff).toFixed(1)}`}
                  {!isGoalReached && <span className="text-[8px] ml-0.5 opacity-60">кг</span>}
                </span>
              </div>
            </div>
          )}
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div
              {...progressConfig}
              layout
              className={cn(
                "h-full transition-colors duration-500",
                goalWeight 
                  ? (isGoalReached ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.4)]" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.2)]")
                  : "bg-white/5"
              )}
            />
          </div>
        </div>
      </div>
    </div>
  )
})
