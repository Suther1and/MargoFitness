'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Check, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DailyHabit } from '../types'

interface HabitItemProps {
  habit: DailyHabit
  onToggle: (id: string) => void
}

export function HabitItem({ habit, onToggle }: HabitItemProps) {
  const handleToggle = () => {
    onToggle(habit.id)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "group relative flex items-center justify-between p-4 rounded-2xl",
        "border transition-all duration-300 cursor-pointer",
        "hover:shadow-lg",
        habit.completed
          ? "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10"
          : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10"
      )}
      onClick={handleToggle}
    >
      {/* Checkbox */}
      <div className="flex items-center gap-4 flex-1">
        <motion.div
          className={cn(
            "relative w-12 h-12 rounded-xl flex items-center justify-center transition-all",
            "border-2",
            habit.completed
              ? "bg-amber-500 border-amber-500 shadow-lg shadow-amber-500/30"
              : "border-white/10 bg-white/5 group-hover:border-white/20"
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            {habit.completed && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              >
                <Check className="w-6 h-6 text-black stroke-[3px]" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pulse effect on hover when not completed */}
          {!habit.completed && (
            <motion.div
              className="absolute inset-0 rounded-xl border-2 border-white/20"
              initial={{ scale: 1, opacity: 0 }}
              whileHover={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </motion.div>

        {/* Habit Info */}
        <div className="flex-1 min-w-0">
          <div className={cn(
            "text-base font-medium transition-all",
            habit.completed 
              ? "text-white/50 line-through" 
              : "text-white group-hover:text-white"
          )}>
            {habit.title}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-white/40 capitalize">
              {habit.category === 'morning' && '🌅 Утро'}
              {habit.category === 'afternoon' && '☀️ День'}
              {habit.category === 'evening' && '🌙 Вечер'}
              {habit.category === 'anytime' && '⏰ Любое время'}
            </span>
            
            {habit.streak > 0 && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20">
                <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                <span className="text-xs font-bold text-orange-500">{habit.streak}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Completion Badge */}
      <AnimatePresence>
        {habit.completed && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30"
          >
            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
              Готово
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confetti Effect */}
      <AnimatePresence>
        {habit.completed && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-amber-500"
                style={{
                  left: '50%',
                  top: '50%',
                }}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  x: Math.cos((i * Math.PI * 2) / 8) * 50,
                  y: Math.sin((i * Math.PI * 2) / 8) * 50,
                }}
                transition={{ duration: 0.5 }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

