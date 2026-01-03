'use client'

import { Scale, Minus, Plus, TrendingDown, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'

interface WeightCardHProps {
  value: number
  onUpdate: (val: number) => void
  goalWeight?: number
}

export function WeightCardH({ value, onUpdate, goalWeight }: WeightCardHProps) {
  const [localValue, setLocalValue] = useState(value)
  const [isEditing, setIsEditing] = useState(false)
  
  const weightHistory = useMemo(() => [72.1, 72.3, 72.7, 72.5, 72.6, 72.5, localValue], [localValue])
  
  const weekChange = localValue - weightHistory[0]
  const isGoalToLose = goalWeight ? goalWeight < localValue : weekChange < 0
  const changeColor = weekChange < 0 
    ? (isGoalToLose ? 'text-emerald-400' : 'text-red-400')
    : (isGoalToLose ? 'text-red-400' : 'text-emerald-400')
  
  const handleIncrement = () => {
    const newValue = Math.round((localValue + 0.1) * 10) / 10
    setLocalValue(newValue)
    onUpdate(newValue)
  }
  
  const handleDecrement = () => {
    const newValue = Math.max(0, Math.round((localValue - 0.1) * 10) / 10)
    setLocalValue(newValue)
    onUpdate(newValue)
  }
  
  return (
    <div className="relative group overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900/50 backdrop-blur-2xl px-6 pt-4 pb-6 hover:border-emerald-500/20 transition-all duration-500 h-[180px]">
      <div className="absolute top-4 right-4">
        <div className={cn("flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/5", changeColor)}>
          {weekChange < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
          <span className="text-[10px] font-bold">{weekChange > 0 ? '+' : ''}{weekChange.toFixed(1)} кг</span>
        </div>
      </div>

      <div className="relative flex flex-col h-full justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Scale className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Вес тела</span>
        </div>

        <div className="flex items-center justify-between gap-2 my-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDecrement}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all hover:bg-white/10 active:scale-95"
          >
            <Minus className="w-4 h-4 text-white/40" />
          </motion.button>
          
          <div className="flex items-baseline justify-center flex-1">
            {isEditing ? (
              <input 
                autoFocus
                type="number"
                step="0.1"
                className="w-full bg-transparent text-4xl font-black text-white font-oswald outline-none text-center"
                value={localValue}
                onChange={(e) => setLocalValue(parseFloat(e.target.value) || 0)}
                onBlur={() => { setIsEditing(false); onUpdate(localValue); }}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
              />
            ) : (
              <motion.span 
                onClick={() => setIsEditing(true)}
                className="text-4xl font-black text-white font-oswald tracking-tighter cursor-pointer hover:text-emerald-400 transition-colors tabular-nums"
              >
                {localValue.toFixed(1)}
              </motion.span>
            )}
            <span className="ml-1 text-[10px] font-bold text-emerald-500/40 uppercase tracking-tighter">кг</span>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleIncrement}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all hover:bg-white/10 active:scale-95"
          >
            <Plus className="w-4 h-4 text-white/40" />
          </motion.button>
        </div>

        {goalWeight && (
          <div className="w-full space-y-1.5">
            <div className="flex items-center justify-between text-[9px] font-bold uppercase">
              <span className="text-white/20">До цели {goalWeight} кг</span>
              <span className="text-emerald-400">{Math.abs(localValue - goalWeight).toFixed(1)} кг</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (Math.abs(localValue - weightHistory[0]) / Math.abs(goalWeight - weightHistory[0])) * 100)}%` }}
                className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
