'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHabits } from '../../hooks/use-habits'
import { Habit, HabitFrequency, HabitTime, HABIT_FREQUENCY_OPTIONS, HABIT_TIME_OPTIONS } from '../../types'

export function HabitsSection() {
  const { habits, isLoaded, addHabit, updateHabit, deleteHabit } = useHabits()
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Состояние для новой привычки
  const [newHabit, setNewHabit] = useState<{
    title: string
    frequency: HabitFrequency
    time: HabitTime
    enabled: boolean
  }>({
    title: '',
    frequency: 'daily',
    time: 'anytime',
    enabled: true
  })

  // Состояние для редактирования
  const [editForm, setEditForm] = useState<{
    title: string
    frequency: HabitFrequency
    time: HabitTime
  } | null>(null)

  const handleAdd = () => {
    if (newHabit.title.trim().length < 2) {
      return
    }
    
    addHabit({
      title: newHabit.title.trim(),
      frequency: newHabit.frequency,
      time: newHabit.time,
      enabled: newHabit.enabled
    })

    // Сброс формы
    setNewHabit({
      title: '',
      frequency: 'daily',
      time: 'anytime',
      enabled: true
    })
  }

  const startEditing = (habit: Habit) => {
    setEditingId(habit.id)
    setEditForm({
      title: habit.title,
      frequency: habit.frequency,
      time: habit.time
    })
  }

  const saveEdit = (id: string) => {
    if (!editForm || editForm.title.trim().length < 2) return
    
    updateHabit(id, {
      title: editForm.title.trim(),
      frequency: editForm.frequency,
      time: editForm.time
    })
    
    setEditingId(null)
    setEditForm(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm(null)
  }

  if (!isLoaded) {
    return (
      <div className="text-center py-12 text-white/60">
        Загрузка...
      </div>
    )
  }

  return (
    <div>
      {/* Inline форма добавления */}
      <div className="mb-6 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
        <h3 className="text-sm font-semibold mb-3 text-white">Добавить привычку</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Название привычки */}
          <input
            placeholder="Название привычки"
            value={newHabit.title}
            onChange={(e) => setNewHabit({...newHabit, title: e.target.value})}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newHabit.title.trim().length >= 2) {
                handleAdd()
              }
            }}
            className="md:col-span-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-base text-white placeholder:text-white/40 focus:outline-none focus:border-green-500/50 transition-colors"
          />
          
          {/* Периодичность (select) */}
          <select
            value={newHabit.frequency}
            onChange={(e) => setNewHabit({...newHabit, frequency: e.target.value as HabitFrequency})}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-base text-white focus:outline-none focus:border-green-500/50 transition-colors"
          >
            {Object.entries(HABIT_FREQUENCY_OPTIONS).map(([key, label]) => (
              <option key={key} value={key} className="bg-[#09090b]">{label}</option>
            ))}
          </select>
          
          {/* Время (select) */}
          <select
            value={newHabit.time}
            onChange={(e) => setNewHabit({...newHabit, time: e.target.value as HabitTime})}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-base text-white focus:outline-none focus:border-green-500/50 transition-colors"
          >
            {Object.entries(HABIT_TIME_OPTIONS).map(([key, label]) => (
              <option key={key} value={key} className="bg-[#09090b]">{label}</option>
            ))}
          </select>
        </div>
        
        <button
          onClick={handleAdd}
          disabled={newHabit.title.trim().length < 2}
          className={cn(
            "mt-3 w-full py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2",
            newHabit.title.trim().length >= 2
              ? "bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30"
              : "bg-white/5 border border-white/10 text-white/40 cursor-not-allowed"
          )}
        >
          <Plus className="w-4 h-4" />
          Добавить привычку
        </button>
      </div>

      {/* Список привычек */}
      {habits.length === 0 ? (
        <div className="text-center py-12 text-white/60">
          <p className="text-lg mb-2">Привычек пока нет</p>
          <p className="text-sm text-white/40">Добавьте первую привычку выше</p>
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map(habit => (
            <motion.div
              key={habit.id}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
            >
              {editingId === habit.id && editForm ? (
                // Режим редактирования
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      placeholder="Название привычки"
                      value={editForm.title}
                      onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                      className="md:col-span-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-base text-white placeholder:text-white/40 focus:outline-none focus:border-green-500/50 transition-colors"
                    />
                    
                    <select
                      value={editForm.frequency}
                      onChange={(e) => setEditForm({...editForm, frequency: e.target.value as HabitFrequency})}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-base text-white focus:outline-none focus:border-green-500/50 transition-colors"
                    >
                      {Object.entries(HABIT_FREQUENCY_OPTIONS).map(([key, label]) => (
                        <option key={key} value={key} className="bg-[#09090b]">{label}</option>
                      ))}
                    </select>
                    
                    <select
                      value={editForm.time}
                      onChange={(e) => setEditForm({...editForm, time: e.target.value as HabitTime})}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-base text-white focus:outline-none focus:border-green-500/50 transition-colors"
                    >
                      {Object.entries(HABIT_TIME_OPTIONS).map(([key, label]) => (
                        <option key={key} value={key} className="bg-[#09090b]">{label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(habit.id)}
                      disabled={editForm.title.trim().length < 2}
                      className={cn(
                        "flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2",
                        editForm.title.trim().length >= 2
                          ? "bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30"
                          : "bg-white/5 border border-white/10 text-white/40 cursor-not-allowed"
                      )}
                    >
                      <Check className="w-4 h-4" />
                      Сохранить
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex-1 py-2 rounded-lg font-medium bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                // Режим просмотра
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white mb-1">{habit.title}</h4>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/40">
                      <span>{HABIT_FREQUENCY_OPTIONS[habit.frequency]}</span>
                      <span>•</span>
                      <span>{HABIT_TIME_OPTIONS[habit.time]}</span>
                      <span>•</span>
                      <span className="text-amber-400/80">Серия: {habit.streak} дней</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => startEditing(habit)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
                      title="Редактировать"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Удалить привычку "${habit.title}"?`)) {
                          deleteHabit(habit.id)
                        }
                      }}
                      className="p-2 hover:bg-red-500/20 rounded-lg text-red-400/60 hover:text-red-400 transition-colors"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

