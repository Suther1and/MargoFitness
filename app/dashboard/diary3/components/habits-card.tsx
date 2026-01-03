'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Check, Flame, Plus, Clock, Sun, Moon, Calendar, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DailyHabit } from '../types'
import { DiaryCard } from './diary-card'

interface HabitItemProps {
  habit: DailyHabit
  onToggle: (id: string) => void
}

function HabitItem({ habit, onToggle }: HabitItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onToggle(habit.id)}
      className={cn(
        "group relative flex items-center justify-between p-3 rounded-2xl",
        "border transition-all duration-300 cursor-pointer",
        habit.completed
          ? "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10"
          : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10"
      )}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <motion.div
          className={cn(
            "relative w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0",
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
                <Check className="w-5 h-5 text-black stroke-[3px]" />
              </motion.div>
            )}
          </AnimatePresence>
          {!habit.completed && (
            <motion.div
              className="absolute inset-0 rounded-xl border-2 border-white/20"
              initial={{ scale: 1, opacity: 0 }}
              whileHover={{ scale: 1.15, opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className={cn(
            "text-sm font-bold truncate transition-all",
            habit.completed ? "text-white/40 line-through" : "text-white/90"
          )}>
            {habit.title}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {habit.streak > 0 && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/10">
                <Flame className="w-2.5 h-2.5 text-orange-500 fill-orange-500" />
                <span className="text-[10px] font-bold text-orange-500">{habit.streak}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {habit.completed && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="flex items-center px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 ml-2"
          >
            <span className="text-[8px] font-black text-amber-500 uppercase tracking-wider">
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
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full bg-amber-500"
                style={{ left: '30%', top: '50%' }}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  x: Math.cos((i * Math.PI * 2) / 6) * 30,
                  y: Math.sin((i * Math.PI * 2) / 6) * 30,
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

interface HabitsCardProps {
  habits: DailyHabit[]
  onToggle: (id: string) => void
}

export function HabitsCard({ habits, onToggle }: HabitsCardProps) {
  const categories = {
    morning: { label: 'Утро', icon: Sun, color: 'text-amber-400' },
    afternoon: { label: 'День', icon: Calendar, color: 'text-blue-400' },
    evening: { label: 'Вечер', icon: Moon, color: 'text-purple-400' },
    anytime: { label: 'В любое время', icon: Clock, color: 'text-slate-400' },
  }

  const completedCount = habits.filter(h => h.completed).length
  const totalCount = habits.length

  return (
    <DiaryCard
      title="Привычки"
      subtitle={`${completedCount}/${totalCount}`}
      icon={Target}
      iconColor="text-amber-500"
      iconBg="bg-amber-500/10"
      className="gap-3"
    >
      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
        <div className="grid grid-cols-1 gap-6">
          {(Object.entries(categories) as [keyof typeof categories, any][]).map(([key, info]) => {
            const categoryHabits = habits.filter(h => h.category === key)
            if (categoryHabits.length === 0) return null

            const Icon = info.icon

            return (
              <div key={key} className="space-y-3">
                <div className="flex items-center gap-1.5 px-1">
                  <Icon className={cn("w-3.5 h-3.5", info.color)} />
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{info.label}</span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <AnimatePresence mode="popLayout">
                    {categoryHabits.map((habit) => (
                      <HabitItem
                        key={habit.id}
                        habit={habit}
                        onToggle={onToggle}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <button className="mt-2 w-full py-3 rounded-xl border border-dashed border-white/10 hover:border-white/20 hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-[10px] text-white/20 hover:text-white/40 font-bold uppercase tracking-widest group">
        <Plus className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
        Добавить привычку
      </button>
    </DiaryCard>
  )
}
