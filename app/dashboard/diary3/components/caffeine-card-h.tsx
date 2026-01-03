'use client'

import { Coffee, Plus, Minus, AlertCircle, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CaffeineCardHProps {
  value: number
  goal: number
  onUpdate: (val: number) => void
}

export function CaffeineCardH({ value, goal, onUpdate }: CaffeineCardHProps) {
  const isOverLimit = value > goal
  const accentColor = isOverLimit ? 'text-red-500' : 'text-amber-500'
  const bgColor = isOverLimit ? 'bg-red-500' : 'bg-amber-500'
  const borderColor = isOverLimit ? 'border-red-500/20' : 'border-amber-500/20'
  const glowColor = isOverLimit ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)'

  return (
    <div className="relative group overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900/50 backdrop-blur-2xl p-6 hover:border-amber-500/20 transition-all duration-500 h-full">
      {/* Фоновое свечение */}
      <div className={cn(
        "absolute -top-12 -right-12 w-32 h-32 blur-[60px] rounded-full pointer-events-none transition-colors duration-700",
        isOverLimit ? "bg-red-500/10" : "bg-amber-500/10"
      )} />

      {/* Процент выполнения в углу */}
      <div className="absolute top-4 right-4">
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/5",
          accentColor
        )}>
          <span className="text-[10px] font-bold">
            {Math.round((value / goal) * 100)}%
          </span>
        </div>
      </div>

      <div className="relative flex flex-col h-full justify-between gap-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-1.5 rounded-lg border transition-colors duration-500",
            isOverLimit ? "bg-red-500/10 border-red-500/20" : "bg-amber-500/10 border-amber-500/20"
          )}>
            <Coffee className={cn("w-3.5 h-3.5 transition-colors duration-500", accentColor)} />
          </div>
          <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Кофеин</span>
        </div>

        {/* Central Info */}
        <div className="flex flex-col items-center justify-center flex-1 gap-1">
          <div className="flex items-center gap-4">
            {/* Minus Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onUpdate(Math.max(0, value - 1))}
              className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all hover:bg-white/10 hover:border-white/20 active:scale-95"
            >
              <Minus className="w-4 h-4 text-white/40" />
            </motion.button>

            <div className="flex items-baseline justify-center min-w-[70px]">
              <AnimatePresence mode="wait">
                <motion.span
                  key={value}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  className={cn(
                    "text-5xl font-black font-oswald tracking-tighter transition-colors duration-500",
                    isOverLimit ? "text-red-500" : "text-white"
                  )}
                >
                  {value}
                </motion.span>
              </AnimatePresence>
              <span className="ml-1 text-[10px] font-bold text-white/20 uppercase tracking-tighter tabular-nums">/ {goal}</span>
            </div>

            {/* Plus Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onUpdate(value + 1)}
              className={cn(
                "flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all active:scale-95",
                isOverLimit ? "hover:bg-red-500/20 hover:border-red-500/40" : "hover:bg-white/10 hover:border-white/20"
              )}
            >
              <Plus className={cn("w-4 h-4 transition-colors duration-500", isOverLimit ? "text-red-400" : "text-white/40")} />
            </motion.button>
          </div>
          
          <div className="flex items-center gap-1.5 h-4">
            {isOverLimit ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1"
              >
                <AlertCircle className="w-3 h-3 text-red-500" />
                <span className="text-[9px] font-bold text-red-500/60 uppercase tracking-widest">Лимит превышен</span>
              </motion.div>
            ) : (
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500/40" />
                <span className="text-[9px] font-bold text-white/10 uppercase tracking-widest">Энергия и фокус</span>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Pills (Segments) */}
        <div className="flex gap-1.5 w-full h-1.5 mt-2">
          {Array.from({ length: goal }).map((_, i) => (
            <div 
              key={i} 
              className="flex-1 h-full rounded-full overflow-hidden bg-white/5"
            >
              <motion.div
                initial={false}
                animate={{ 
                  width: i < value ? '100%' : '0%',
                  backgroundColor: isOverLimit ? 'rgb(239, 68, 68)' : 'rgb(245, 158, 11)'
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-full",
                  i < value && !isOverLimit && "shadow-[0_0_8px_rgba(245,158,11,0.4)]",
                  i < value && isOverLimit && "shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                )}
              />
            </div>
          ))}
          {/* Дополнительный индикатор если превышен лимит */}
          {isOverLimit && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '15%', opacity: 1 }}
              className="h-full bg-red-600 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)]"
            />
          )}
        </div>
      </div>
    </div>
  )
}

