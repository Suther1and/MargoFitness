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

  return (
    <div className="relative group overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900/50 backdrop-blur-2xl px-6 pt-4 pb-6 hover:border-amber-500/20 transition-all duration-500 h-[180px]">
      <div className="absolute top-4 right-4">
        <div className={cn("flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/5", accentColor)}>
          <span className="text-[10px] font-bold">{Math.round((value / goal) * 100)}%</span>
        </div>
      </div>

      <div className="relative flex flex-col h-full justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("p-1.5 rounded-lg border transition-colors duration-500", isOverLimit ? "bg-red-500/10 border-red-500/20" : "bg-amber-500/10 border-amber-500/20")}>
            <Coffee className={cn("w-3.5 h-3.5", accentColor)} />
          </div>
          <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Кофеин</span>
        </div>

        <div className="flex items-center justify-between gap-2 my-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onUpdate(Math.max(0, value - 1))}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all hover:bg-white/10 active:scale-95"
          >
            <Minus className="w-4 h-4 text-white/40" />
          </motion.button>

          <div className="flex items-baseline justify-center flex-1">
            <AnimatePresence mode="wait">
              <motion.span
                key={value}
                initial={{ y: 5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -5, opacity: 0 }}
                className={cn("text-5xl font-black font-oswald tracking-tighter", isOverLimit ? "text-red-500" : "text-white")}
              >
                {value}
              </motion.span>
            </AnimatePresence>
            <span className="ml-1 text-[10px] font-bold text-white/20 uppercase tracking-tighter">/ {goal}</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onUpdate(value + 1)}
            className={cn("flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all active:scale-95", isOverLimit ? "hover:bg-red-500/20 hover:border-red-500/40" : "hover:bg-white/10 hover:border-white/20")}
          >
            <Plus className={cn("w-4 h-4", isOverLimit ? "text-red-400" : "text-white/40")} />
          </motion.button>
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
                <Zap className="w-2.5 h-2.5 text-amber-500" />
                <span className="text-[8px] font-bold uppercase tracking-widest text-white">Энергия и фокус</span>
              </div>
            )}
          </div>
          <div className="flex gap-1.5 w-full h-1.5">
            {Array.from({ length: goal }).map((_, i) => (
              <div key={i} className="flex-1 h-full rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  animate={{ 
                    width: i < value ? '100%' : '0%',
                    backgroundColor: isOverLimit ? 'rgb(239, 68, 68)' : 'rgb(245, 158, 11)'
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
}
