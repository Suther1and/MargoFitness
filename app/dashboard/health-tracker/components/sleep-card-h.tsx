'use client'

import { Moon, Plus, Minus, Trophy } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface SleepCardHProps {
  hours: number
  goal: number
  onUpdate: (val: number) => void
}

export function SleepCardH({ hours, goal, onUpdate }: SleepCardHProps) {
  const [isEditing, setIsEditing] = useState(false)
  const isDone = hours >= goal
  const percentage = Math.min(Math.round((hours / goal) * 100), 100)

  const handleIncrement = () => onUpdate(Math.min(24, hours + 0.5))
  const handleDecrement = () => onUpdate(Math.max(0, hours - 0.5))

  return (
    <div className={cn(
      "relative group overflow-hidden rounded-[2rem] border transition-all duration-700 h-[180px] flex flex-col px-6 pt-4 pb-6 backdrop-blur-2xl",
      isDone 
        ? "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/40" 
        : "border-white/10 bg-zinc-900/50 hover:border-indigo-500/20"
    )}>
      
      {/* Фоновое свечение - адаптируется под состояние */}
      <div className={cn(
        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 blur-[80px] rounded-full pointer-events-none transition-colors duration-1000",
        isDone ? "bg-emerald-500/10" : "bg-indigo-500/10"
      )} />

      {/* Header: Иконка и текст меняются при успехе */}
      <div className="relative z-20 flex items-center gap-2 mb-2">
        <AnimatePresence mode="wait">
          {isDone ? (
            <motion.div 
              key="trophy"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 shadow-inner"
            >
              <Trophy className="w-3.5 h-3.5 text-emerald-400" />
            </motion.div>
          ) : (
            <motion.div 
              key="moon"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 shadow-inner"
            >
              <Moon className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/20" />
            </motion.div>
          )}
        </AnimatePresence>
        <span className={cn(
          "text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-500",
          isDone ? "text-emerald-400/60" : "text-white/40"
        )}>
          {isDone ? "ЦЕЛЬ ДОСТИГНУТА" : "Сон"}
        </span>
      </div>

      {/* Центральный блок: translate-y-3 и кнопки ближе */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="flex items-center gap-1 pointer-events-auto translate-y-3">
          
          {/* Кнопка минус */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDecrement}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all hover:bg-white/10 hover:border-white/20 active:scale-95"
          >
            <Minus className="w-4 h-4 text-white/40" />
          </motion.button>

          {/* Кольцо с числом */}
          <div className="relative w-[125px] h-[125px] flex items-center justify-center flex-shrink-0">
            {/* Мягкое фоновое свечение за кольцом */}
            <motion.div 
              animate={isDone ? { scale: [1, 1.1, 1], opacity: [0.15, 0.3, 0.15] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className={cn(
                "absolute inset-4 blur-[24px] rounded-full transition-colors duration-1000",
                isDone ? "bg-emerald-500/20" : "bg-indigo-500/15"
              )} 
            />
            
            <svg className="w-full h-full -rotate-90 relative overflow-visible" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" className="stroke-white/5" strokeWidth="6" fill="none" />
              <motion.circle
                cx="50" cy="50" r="44"
                stroke="currentColor"
                className={isDone ? "text-emerald-500" : "text-indigo-500"}
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDasharray: "276.5", strokeDashoffset: "276.5" }}
                animate={{ strokeDashoffset: 276.5 - (276.5 * percentage) / 100 }}
                transition={{ duration: 1.5, ease: "circOut" }}
                style={{ filter: isDone 
                  ? 'drop-shadow(0 0 12px rgba(16, 185, 129, 0.5))' 
                  : 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.5))' 
                }}
              />
            </svg>

            {/* Число внутри кольца */}
            <div className="absolute inset-0 flex flex-col items-center justify-center select-none cursor-pointer z-10" onClick={() => setIsEditing(true)}>
              <div className="flex items-baseline gap-0.5">
                {isEditing ? (
                  <input 
                    autoFocus
                    type="number"
                    step="0.5"
                    className="w-16 bg-transparent text-4xl font-black text-white font-oswald outline-none text-center"
                    value={hours}
                    onChange={(e) => onUpdate(parseFloat(e.target.value) || 0)}
                    onBlur={() => setIsEditing(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
                  />
                ) : (
                  <>
                    <motion.span 
                      key={hours}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={cn(
                        "text-5xl font-black font-oswald tracking-tighter leading-none transition-colors duration-500",
                        isDone ? "text-emerald-400" : "text-white"
                      )}
                    >
                      {hours}
                    </motion.span>
                    <span className={cn(
                      "text-sm font-bold uppercase font-oswald leading-none ml-0.5 transition-colors duration-500",
                      isDone ? "text-emerald-400/40" : "text-white/20"
                    )}>ч</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Кнопка плюс */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleIncrement}
            className={cn(
              "flex-shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center transition-all active:scale-95",
              isDone 
                ? "bg-emerald-500/20 border-emerald-500/30 hover:bg-emerald-500/30" 
                : "bg-white/5 border-white/10 hover:bg-white/10"
            )}
          >
            <Plus className={cn("w-4 h-4", isDone ? "text-emerald-400" : "text-white/40")} />
          </motion.button>
          
        </div>
      </div>

    </div>
  )
}
