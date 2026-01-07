'use client'

import { Coffee, AlertCircle, Zap, Plus, Minus } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useEditableValue, useGoalProgress } from '../hooks'
import { MetricButton, EditableMetricValue } from './shared'
import { COLORS } from '../constants'

interface CaffeineCardHProps {
  value: number
  goal: number
  onUpdate: (val: number) => void
}

export const CaffeineCardH = memo(function CaffeineCardH({ value, goal, onUpdate }: CaffeineCardHProps) {
  const { isOverLimit } = useGoalProgress({ current: value, goal })
  const { 
    localValue, 
    isEditing,
    handleIncrement, 
    handleDecrement,
    handleEdit,
    handleChange,
    handleBlur,
    handleKeyDown
  } = useEditableValue(value, { onUpdate, step: 1, min: 0 })

  const accentColor = isOverLimit ? 'text-red-500' : 'text-amber-600'

  return (
    <div className="relative group overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900/50 md:backdrop-blur-2xl px-4 md:px-6 pt-4 pb-6 hover:border-amber-600/20 transition-colors duration-500 h-[180px]">
      <div className="relative flex flex-col h-full justify-between">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'p-1.5 rounded-lg border transition-colors duration-500',
                isOverLimit ? 'bg-red-500/10 border-red-500/20' : 'bg-amber-600/10 border-amber-600/20'
              )}
            >
              <Coffee className={cn('w-3.5 h-3.5', accentColor)} />
            </div>
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Кофеин</span>
          </div>
          <div className={cn('hidden md:flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/5', accentColor)}>
            <span className="text-[10px] font-bold">{goal > 0 ? Math.round((localValue / goal) * 100) : 0}%</span>
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
              className={cn('text-3xl md:text-5xl font-black font-oswald tracking-tighter', isOverLimit ? 'text-red-500' : 'text-white')}
              inputClassName="text-center text-3xl md:text-5xl w-16 md:w-24"
            />
            <span className="ml-0.5 md:ml-1 text-[8px] md:text-[10px] font-bold text-white/20 uppercase tracking-tighter whitespace-nowrap">/ {goal}</span>
          </div>

          <MetricButton
            icon={Plus}
            onClick={handleIncrement}
            size="small"
            iconClassName={isOverLimit ? 'text-red-400' : 'text-white/40'}
            className={isOverLimit ? 'hover:bg-red-500/20 hover:border-red-500/40' : ''}
          />
        </div>

        <div className="w-full space-y-2">
          <div className="flex items-center gap-1.5 h-3 justify-center">
            {isOverLimit ? (
              <div className="flex items-center gap-1">
                <AlertCircle className="w-2.5 h-2.5 text-red-500" />
                <span className="text-[8px] font-bold text-red-500/60 uppercase tracking-widest">Лимит превышен</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 opacity-20">
                <Zap className="w-2.5 h-2.5 text-amber-600" />
                <span className="text-[8px] font-bold uppercase tracking-widest text-white">Энергия и фокус</span>
              </div>
            )}
          </div>
          <div className="flex gap-1.5 w-full h-1.5">
            {Array.from({ length: goal }).map((_, i) => (
              <div key={i} className="flex-1 h-full rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  animate={{
                    width: i < localValue ? '100%' : '0%',
                    backgroundColor: isOverLimit ? 'rgb(239, 68, 68)' : 'rgb(217, 119, 6)',
                  }}
                  className="h-full rounded-full"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
})
