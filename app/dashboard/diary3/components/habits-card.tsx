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
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onToggle(habit.id)}
      className={cn(
        "group relative flex items-center justify-between p-2 rounded-xl",
        "border transition-all duration-200 cursor-pointer",
        habit.completed
          ? "border-amber-500/20 bg-amber-500/5 opacity-60"
          : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10"
      )}
    >
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <div className={cn(
          "relative w-7 h-7 rounded-lg flex items-center justify-center transition-all shrink-0",
          "border-2",
          habit.completed
            ? "bg-amber-500 border-amber-500 shadow-sm shadow-amber-500/30"
            : "border-white/10 bg-white/5"
        )}>
          {habit.completed && <Check className="w-4 h-4 text-black stroke-[3px]" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className={cn(
            "text-[12px] font-bold truncate transition-all",
            habit.completed ? "text-white/30 line-through" : "text-white/80"
          )}>
            {habit.title}
          </div>
        </div>
      </div>
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
