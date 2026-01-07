'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Check, Clock, Sun, Moon, Calendar, ListChecks, PlusCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DailyHabit } from '../types'
import { HealthTrackerCard } from './health-tracker-card'

interface HabitItemProps {
  habit: DailyHabit
  onToggle: (id: string) => void
}

function HabitItem({ habit, onToggle }: HabitItemProps) {
  return (
    <div
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
    </div>
  )
}

interface HabitsCardProps {
  habits: DailyHabit[]
  onToggle: (id: string) => void
  onNavigateToSettings?: () => void
}

export function HabitsCard({ habits, onToggle, onNavigateToSettings }: HabitsCardProps) {
  const categories = {
    morning: { label: 'Утро', icon: Sun, color: 'text-amber-400' },
    afternoon: { label: 'День', icon: Calendar, color: 'text-blue-400' },
    evening: { label: 'Вечер', icon: Moon, color: 'text-purple-400' },
    anytime: { label: 'В любое время', icon: Clock, color: 'text-slate-400' },
  }

  const completedCount = habits.filter(h => h.completed).length
  const totalCount = habits.length

  // Плейсхолдер для пустого состояния
  if (totalCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-8 rounded-[3rem] bg-white/[0.03] backdrop-blur-md border-2 border-dashed border-white/10 relative overflow-hidden h-full min-h-[340px]">
        <h3 className="text-xl font-oswald font-black text-white mb-2 text-center uppercase tracking-wider">Твои привычки</h3>
        <p className="text-xs text-white/40 text-center mb-8 max-w-[220px] leading-relaxed font-medium">
          Начни отслеживать полезные привычки для достижения своих целей
        </p>

        <button 
          onClick={onNavigateToSettings}
          className="w-full max-w-[220px] py-4 rounded-2xl bg-amber-500 text-black font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-amber-500/20 flex items-center justify-center gap-3 mb-2"
        >
          <PlusCircle className="w-4 h-4 text-black" />
          Добавить привычку
        </button>
      </div>
    )
  }

  return (
    <HealthTrackerCard
      title="Привычки"
      subtitle={`${completedCount}/${totalCount}`}
      icon={Flame}
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
                  {categoryHabits.map((habit) => (
                    <HabitItem
                      key={habit.id}
                      habit={habit}
                      onToggle={onToggle}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <button 
        onClick={onNavigateToSettings}
        className="mt-2 w-full py-3 rounded-xl border border-dashed border-white/10 hover:border-white/20 hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-[10px] text-white/20 hover:text-white/40 font-bold uppercase tracking-widest group"
      >
        <Plus className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
        Добавить привычку
      </button>
    </HealthTrackerCard>
  )
}
