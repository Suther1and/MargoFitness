'use client'

import { Droplets, Plus, Minus, Waves, Trophy, PartyPopper } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useState, useMemo } from 'react'

interface WaterCardHProps {
  value: number
  goal: number
  onUpdate: (val: number) => void
}

const WaveBackground = ({ percentage, isDone }: { percentage: number, isDone: boolean }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[2rem]">
      {/* Простое заполнение с градиентом */}
      <motion.div 
        className={cn(
          "absolute inset-y-0 left-0 h-full transition-colors duration-1000",
          isDone 
            ? "bg-gradient-to-r from-emerald-500/15 via-emerald-400/20 to-emerald-500/15" 
            : "bg-gradient-to-r from-blue-600/15 via-blue-500/20 to-blue-600/15"
        )}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ type: "spring", stiffness: 50, damping: 15 }}
      />
    </div>
  )
}

export function WaterCardH({ value, goal, onUpdate }: WaterCardHProps) {
  const [isEditing, setIsEditing] = useState(false)
  const percentage = Math.min(Math.round((value / goal) * 100), 100)
  const isDone = value >= goal
  
  return (
    <div className={cn(
      "relative group overflow-hidden rounded-[2rem] border transition-all duration-700 h-[120px]",
      isDone 
        ? "border-emerald-500/30 bg-zinc-900/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]" 
        : "border-white/10 bg-zinc-900/50 hover:border-blue-500/20"
    )}>
      {/* Живой фон */}
      <WaveBackground percentage={percentage} isDone={isDone} />

      <div className="relative z-10 flex flex-col h-full p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={cn(
              "p-1.5 rounded-lg border transition-all duration-500",
              isDone ? "bg-emerald-500/20 border-emerald-500/30" : "bg-blue-500/10 border-blue-500/20"
            )}>
              <AnimatePresence mode="wait">
                {isDone ? (
                  <motion.div
                    key="trophy"
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                  >
                    <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="drop"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <Droplets className="w-3.5 h-3.5 text-blue-400" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
              {isDone ? 'Цель достигнута' : 'Гидратация'}
            </span>
          </div>
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all duration-500",
            isDone ? "bg-emerald-500/20 border-emerald-500/30" : "bg-white/5 border-white/10"
          )}>
            <span className={cn(
              "text-[10px] font-black tabular-nums",
              isDone ? "text-emerald-400" : "text-blue-400"
            )}>{percentage}%</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex items-center justify-between flex-1">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-baseline gap-2">
              {isEditing ? (
                <input
                  type="number"
                  autoFocus
                  className="w-24 bg-transparent text-4xl font-black text-white font-oswald outline-none text-left"
                  value={value}
                  onChange={(e) => onUpdate(parseInt(e.target.value) || 0)}
                  onBlur={() => setIsEditing(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
                />
              ) : (
                <motion.span 
                  onClick={() => setIsEditing(true)}
                  className="text-4xl font-black text-white font-oswald tracking-tighter cursor-pointer hover:text-blue-400 transition-colors tabular-nums"
                >
                  {value}
                </motion.span>
              )}
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest tabular-nums">/ {goal} мл</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Waves className={cn("w-3 h-3 transition-colors", isDone ? "text-emerald-500/50" : "text-blue-500/50")} />
              <span className={cn(
                "text-[9px] font-black uppercase tracking-wider transition-colors",
                isDone ? "text-emerald-400/80" : "text-white/40"
              )}>
                {isDone ? 'Отличный результат!' : `Осталось ${goal - value} мл`}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onUpdate(Math.max(0, value - 250))}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all hover:bg-white/10 active:scale-95"
            >
              <Minus className="w-4 h-4 text-white/40" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onUpdate(value + 250)}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-lg",
                isDone 
                  ? "bg-emerald-500/20 border-emerald-500/30 hover:bg-emerald-500/30 shadow-emerald-500/5" 
                  : "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20 shadow-blue-500/5"
              )}
            >
              <Plus className={cn("w-5 h-5 transition-colors", isDone ? "text-emerald-400" : "text-blue-400")} />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}


