'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { HabitItem } from './habit-item'
import { DailyHabit } from '../types'
import { cn } from '@/lib/utils'

interface Zone2HabitsProps {
  habits: DailyHabit[]
  onToggle: (id: string) => void
  onAddHabit?: () => void
}

export function Zone2Habits({ habits, onToggle, onAddHabit }: Zone2HabitsProps) {
  // Group habits by category
  const categories = {
    morning: habits.filter(h => h.category === 'morning'),
    afternoon: habits.filter(h => h.category === 'afternoon'),
    evening: habits.filter(h => h.category === 'evening'),
    anytime: habits.filter(h => h.category === 'anytime'),
  }

  const categoryInfo = {
    morning: { label: 'Утренние', icon: '🌅' },
    afternoon: { label: 'Дневные', icon: '☀️' },
    evening: { label: 'Вечерние', icon: '🌙' },
    anytime: { label: 'В любое время', icon: '⏰' },
  }

  const completedCount = habits.filter(h => h.completed).length
  const totalCount = habits.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#121214]/80 backdrop-blur-xl p-6 md:p-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
            Привычки дня
          </h2>
          <p className="text-sm text-white/40">
            Отметь выполненные задачи
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Progress Badge */}
          <div className="px-4 py-2 rounded-full border border-white/10 bg-white/5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white/60">
                {completedCount}/{totalCount}
              </span>
              <div className="w-12 h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Habits List */}
      <div className="space-y-6">
        {Object.entries(categories).map(([category, categoryHabits]) => {
          if (categoryHabits.length === 0) return null
          
          const info = categoryInfo[category as keyof typeof categoryInfo]
          const completed = categoryHabits.filter(h => h.completed).length
          
          return (
            <div key={category}>
              {/* Category Header */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{info.icon}</span>
                <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
                  {info.label}
                </h3>
                <span className="text-xs text-white/40">
                  ({completed}/{categoryHabits.length})
                </span>
                <div className="flex-1 h-px bg-white/5 ml-2" />
              </div>

              {/* Category Habits */}
              <div className="space-y-2">
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

      {/* Add Habit Button */}
      {onAddHabit && (
        <motion.button
          onClick={onAddHabit}
          className={cn(
            "mt-6 w-full flex items-center justify-center gap-2",
            "py-4 rounded-2xl border-2 border-dashed border-white/10",
            "hover:border-white/20 hover:bg-white/5 transition-all",
            "text-white/40 hover:text-white/60"
          )}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Добавить привычку</span>
        </motion.button>
      )}

      {/* Ambient Glow */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
    </motion.div>
  )
}

