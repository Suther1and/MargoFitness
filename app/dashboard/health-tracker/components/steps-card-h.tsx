'use client'

import { Footprints, Target, Plus, Minus, Flame, MapPin, Trophy } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'

interface StepsCardHProps {
  steps: number
  goal: number
  onUpdate: (val: number) => void
}

export function StepsCardH({ steps, goal, onUpdate }: StepsCardHProps) {
  const [isEditing, setIsEditing] = useState(false)
  const isDone = steps >= goal
  const percentage = Math.min(Math.round((steps / goal) * 100), 100)

  // Расчеты для девушек
  const distance = useMemo(() => ((steps * 0.65) / 1000).toFixed(2), [steps])
  const calories = useMemo(() => Math.round(steps * 0.038), [steps])

  const handleIncrement = () => onUpdate(steps + 500)
  const handleDecrement = () => onUpdate(Math.max(0, steps - 500))

  return (
    <div className={cn(
      "relative group overflow-hidden rounded-[2rem] border transition-all duration-700 h-[120px] backdrop-blur-2xl px-6 pt-3 pb-5",
      isDone 
        ? "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/40" 
        : "border-white/10 bg-zinc-900/50 hover:border-orange-500/20"
    )}>
      {/* Фоновое свечение */}
      <div className={cn(
        "absolute -top-24 -left-24 w-48 h-48 blur-[100px] rounded-full pointer-events-none transition-colors duration-1000",
        isDone ? "bg-emerald-500/10" : "bg-orange-500/5"
      )} />

      <div className="relative grid grid-cols-[1.2fr_auto_1fr_0.8fr] items-center h-full gap-0">
        
        {/* Блок 1: Управление и шаги */}
        <div className="flex flex-col h-full justify-between">
          <div className="flex items-center gap-2 pt-1">
            <AnimatePresence mode="wait">
              {isDone ? (
                <motion.div 
                  key="trophy"
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30"
                >
                  <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                </motion.div>
              ) : (
                <motion.div 
                  key="feet"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20"
                >
                  <Footprints className="w-3.5 h-3.5 text-orange-400" />
                </motion.div>
              )}
            </AnimatePresence>
            <span className={cn(
              "text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-500",
              isDone ? "text-emerald-400/60" : "text-white/40"
            )}>
              {isDone ? "ЦЕЛЬ ДОСТИГНУТА" : "АКТИВНОСТЬ"}
            </span>
          </div>

          <div className="flex items-center gap-3 mb-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDecrement}
              className="flex-shrink-0 w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all hover:bg-white/10 active:scale-95"
            >
              <Minus className="w-3.5 h-3.5 text-white/40" />
            </motion.button>

            <div className="flex flex-col items-center min-w-[100px]">
              {isEditing ? (
                <input 
                  autoFocus
                  type="number"
                  className="w-24 bg-transparent text-3xl font-black text-white font-oswald outline-none text-center"
                  value={steps}
                  onChange={(e) => onUpdate(parseInt(e.target.value) || 0)}
                  onBlur={() => setIsEditing(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
                />
              ) : (
                <motion.span 
                  onClick={() => setIsEditing(true)}
                  className={cn(
                    "text-4xl font-black font-oswald tracking-tighter cursor-pointer transition-colors tabular-nums leading-none",
                    isDone ? "text-emerald-400" : "text-white hover:text-orange-400"
                  )}
                >
                  {steps.toLocaleString()}
                </motion.span>
              )}
              <span className={cn(
                "text-[9px] font-bold uppercase tracking-tighter transition-colors duration-500 mt-1",
                isDone ? "text-emerald-400" : "text-white/20"
              )}>
                ШАГОВ СЕГОДНЯ
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleIncrement}
              className={cn(
                "flex-shrink-0 w-9 h-9 rounded-xl border flex items-center justify-center transition-all active:scale-95",
                isDone 
                  ? "bg-emerald-500/20 border-emerald-500/30" 
                  : "bg-orange-500/10 border-orange-500/20"
              )}
            >
              <Plus className={cn("w-3.5 h-3.5", isDone ? "text-emerald-400" : "text-orange-400")} />
            </motion.button>
          </div>
        </div>

        {/* Блок 2: Разделитель */}
        <div className="w-px h-12 bg-white/5 mx-6" />

        {/* Блок 3: Микро-метрики */}
        <div className="flex flex-col justify-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center border",
              isDone ? "bg-emerald-500/5 border-emerald-500/10" : "bg-orange-500/5 border-orange-500/10"
            )}>
              <MapPin className={cn("w-4 h-4", isDone ? "text-emerald-400/60" : "text-orange-400/70")} />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-black text-white/80 tabular-nums leading-tight">{distance} км</span>
              <span className="text-[9px] font-bold text-white/20 uppercase tracking-wider">дистанция</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center border",
              isDone ? "bg-emerald-500/5 border-emerald-500/10" : "bg-orange-500/5 border-orange-500/10"
            )}>
              <Flame className={cn("w-4 h-4", isDone ? "text-emerald-400/60" : "text-orange-400/70")} />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-black text-white/80 tabular-nums leading-tight">{calories} ккал</span>
              <span className="text-[9px] font-bold text-white/20 uppercase tracking-wider">энергия</span>
            </div>
          </div>
        </div>

        {/* Блок 4: Кольцо прогресса */}
        <div className="relative w-full h-full flex items-center justify-end">
          <div className="relative w-[90px] h-[90px] flex-shrink-0 flex items-center justify-center">
            {/* Мягкое фоновое свечение (Glow) */}
            <motion.div 
              animate={isDone ? { scale: [1, 1.1, 1], opacity: [0.15, 0.3, 0.15] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className={cn(
                "absolute inset-2 blur-[24px] rounded-full transition-colors duration-1000",
                isDone ? "bg-emerald-500/30" : "bg-orange-500/15"
              )} 
            />
            
            <svg className="w-full h-full -rotate-90 relative overflow-visible" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="38" className="stroke-white/5" strokeWidth="9" fill="none" />
              <motion.circle
                cx="50" cy="50" r="38"
                stroke={isDone ? "url(#emeraldGradient)" : "url(#stepsGradient)"}
                strokeWidth="9"
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDasharray: "238.7", strokeDashoffset: "238.7" }}
                animate={{ strokeDashoffset: 238.7 - (238.7 * percentage) / 100 }}
                transition={{ duration: 1.5, ease: "circOut" }}
                style={{ filter: isDone 
                  ? 'drop-shadow(0 0 12px rgba(16, 185, 129, 0.5))' 
                  : 'drop-shadow(0 0 8px rgba(249, 115, 22, 0.4))' 
                }}
              />
              <defs>
                <linearGradient id="stepsGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f97316" /><stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
                <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn(
                "text-[14px] font-black tabular-nums leading-none transition-colors duration-500",
                isDone ? "text-emerald-400" : "text-white"
              )}>
                {percentage}%
              </span>
              <span className="text-[8px] font-black text-white/40 uppercase mt-1 transition-colors duration-500 text-center">
                {isDone ? "ГОТОВО" : `${(goal/1000).toFixed(0)}к цель`}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
