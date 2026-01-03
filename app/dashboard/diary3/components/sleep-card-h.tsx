'use client'

import { Moon, Star, Plus, Minus, Target } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface SleepCardHProps {
  hours: number
  goal: number
  quality: number
  onUpdate: (val: number) => void
}

export function SleepCardH({ hours, goal, quality, onUpdate }: SleepCardHProps) {
  const [isEditing, setIsEditing] = useState(false)
  const percentage = Math.min(Math.round((hours / goal) * 100), 100)

  const handleIncrement = () => onUpdate(Math.min(24, hours + 0.5))
  const handleDecrement = () => onUpdate(Math.max(0, hours - 0.5))

  return (
    <div className="relative group overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900/50 backdrop-blur-2xl p-6 hover:border-indigo-500/20 transition-all duration-500 h-[180px]">
      <div className="absolute top-4 right-4">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/5 shadow-sm">
          <span className="text-[8px] font-black text-white/20 uppercase tracking-tighter">качество</span>
          <div className="flex items-center gap-0.5">
            <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
            <span className="text-[10px] font-black text-yellow-500/80 tabular-nums">{quality}%</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 shadow-inner">
            <Moon className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/20" />
          </div>
          <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Сон</span>
        </div>

        <div className="flex items-center justify-between gap-2 my-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDecrement}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all hover:bg-white/10 active:scale-95"
          >
            <Minus className="w-4 h-4 text-white/40" />
          </motion.button>

          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" className="stroke-white/5" strokeWidth="6" fill="none" />
              <motion.circle
                cx="50" cy="50" r="44"
                stroke="currentColor"
                className="text-indigo-500"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDasharray: "276.5", strokeDashoffset: "276.5" }}
                animate={{ strokeDashoffset: 276.5 - (276.5 * percentage) / 100 }}
                transition={{ duration: 1.5, ease: "circOut" }}
                style={{ filter: 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.4))' }}
              />
            </svg>

            <div className="flex flex-col items-center justify-center select-none cursor-pointer" onClick={() => setIsEditing(true)}>
              <div className="flex items-baseline gap-0.5">
                {isEditing ? (
                  <input 
                    autoFocus
                    type="number"
                    step="0.5"
                    className="w-14 bg-transparent text-3xl font-black text-white font-oswald outline-none text-center"
                    value={hours}
                    onChange={(e) => onUpdate(parseFloat(e.target.value) || 0)}
                    onBlur={() => setIsEditing(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
                  />
                ) : (
                  <>
                    <span className="text-3xl font-black text-white font-oswald tracking-tighter leading-none">
                      {hours}
                    </span>
                    <span className="text-sm font-bold text-white/20 uppercase font-oswald leading-none">ч</span>
                  </>
                )}
              </div>
            </div>
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

        <div className="w-full space-y-2">
          <div className="flex items-center justify-between text-[9px] font-bold uppercase">
            <div className="flex items-center gap-1 opacity-20">
              <Target className="w-2.5 h-2.5" />
              <span>Цель {goal} ч</span>
            </div>
            <span className="text-indigo-400">{percentage}%</span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              className="h-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
