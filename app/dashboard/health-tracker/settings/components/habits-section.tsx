'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Check, X, Flame, Sun, Moon, Sunset, Clock, PlusCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHabits } from '../../hooks/use-habits'
import { Habit, HabitFrequency, HabitTime, HABIT_FREQUENCY_OPTIONS, HABIT_TIME_OPTIONS } from '../../types'

const TIME_ICONS = {
  anytime: Clock,
  morning: Sun,
  afternoon: Sunset,
  evening: Moon,
}

export function HabitsSection() {
  const { habits, isLoaded, addHabit, updateHabit, deleteHabit } = useHabits()
  const [editingId, setEditingId] = useState<string | null>(null)
  
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

  const [editForm, setEditForm] = useState<{
    title: string
    frequency: HabitFrequency
    time: HabitTime
  } | null>(null)

  const handleAdd = () => {
    if (newHabit.title.trim().length < 2) return
    
    addHabit({
      title: newHabit.title.trim(),
      frequency: newHabit.frequency,
      time: newHabit.time,
      enabled: newHabit.enabled
    })

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

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
        <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Загрузка привычек...</p>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Static Integrated Add Form */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <PlusCircle className="w-4 h-4 text-green-500/50" strokeWidth={2.5} />
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 whitespace-nowrap">Новая привычка</h2>
          <div className="h-px bg-white/5 w-full" />
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-6 md:p-8 shadow-xl">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-end">
            {/* Title Input */}
            <div className="xl:col-span-4 space-y-3">
              <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-1">Название привычки</label>
              <input
                placeholder="Например: Йога или чтение"
                value={newHabit.title}
                onChange={(e) => setNewHabit({...newHabit, title: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-lg font-oswald font-black text-white focus:outline-none focus:border-green-500/50 focus:bg-white/10 transition-all shadow-inner"
              />
            </div>

            {/* Frequency Selection */}
            <div className="xl:col-span-4 space-y-3">
              <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-1">Как часто?</label>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(HABIT_FREQUENCY_OPTIONS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setNewHabit({...newHabit, frequency: key as HabitFrequency})}
                    className={cn(
                      "px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border",
                      newHabit.frequency === key 
                        ? "bg-green-500 border-green-500 text-[#09090b] shadow-md" 
                        : "bg-white/5 border-white/5 text-white/30 hover:text-white/60 hover:bg-white/10"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            <div className="xl:col-span-3 space-y-3">
              <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-1">Когда?</label>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(HABIT_TIME_OPTIONS).map(([key, label]) => {
                  const Icon = TIME_ICONS[key as HabitTime]
                  return (
                    <button
                      key={key}
                      onClick={() => setNewHabit({...newHabit, time: key as HabitTime})}
                      className={cn(
                        "px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border flex items-center gap-2",
                        newHabit.time === key 
                          ? "bg-green-500 border-green-500 text-[#09090b] shadow-md" 
                          : "bg-white/5 border-white/5 text-white/30 hover:text-white/60 hover:bg-white/10"
                      )}
                    >
                      <Icon className="w-3 h-3" />
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Create Button */}
            <div className="xl:col-span-1">
              <button
                onClick={handleAdd}
                disabled={newHabit.title.trim().length < 2}
                className={cn(
                  "w-full h-[54px] rounded-xl flex items-center justify-center transition-all shadow-lg",
                  newHabit.title.trim().length >= 2
                    ? "bg-green-500 text-[#09090b] hover:bg-green-400"
                    : "bg-white/5 text-white/10 cursor-not-allowed"
                )}
              >
                <Plus className="w-6 h-6" strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Habits List */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-white/20" strokeWidth={2.5} />
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 whitespace-nowrap">Твои привычки</h2>
          <div className="h-px bg-white/5 w-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {habits.map(habit => {
            const TimeIcon = TIME_ICONS[habit.time]
            const isEditing = editingId === habit.id

            return (
              <motion.div
                key={habit.id}
                layout
                className={cn(
                  "p-6 rounded-[2.5rem] border transition-all duration-700 relative overflow-hidden group shadow-xl",
                  isEditing 
                    ? "border-green-500/50 bg-zinc-900 shadow-green-500/5 z-20 scale-[1.02]" 
                    : "border-white/5 bg-zinc-900/40 hover:border-white/10 hover:bg-zinc-900/60"
                )}
              >
                {isEditing && editForm ? (
                  <div className="space-y-5">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-1">Правка названия</label>
                      <input
                        value={editForm.title}
                        onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 font-oswald font-black text-xl text-white focus:outline-none focus:border-green-500/30 shadow-inner"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(habit.id)}
                        className="flex-1 py-3 bg-green-500 text-[#09090b] rounded-xl font-black uppercase tracking-wider text-[10px] shadow-lg shadow-green-500/20"
                      >
                        Сохранить
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-5 py-3 bg-white/5 text-white/40 rounded-xl font-black uppercase tracking-wider text-[10px] hover:text-white transition-colors"
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-green-500 transition-all border border-white/5 shadow-inner">
                          <TimeIcon className="w-5 h-5" strokeWidth={2.25} />
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="font-oswald font-black text-2xl uppercase tracking-tight text-white leading-none truncate max-w-[150px]">{habit.title}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest whitespace-nowrap">{HABIT_TIME_OPTIONS[habit.time]}</span>
                            <span className="w-1 h-1 rounded-full bg-white/10" />
                            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest whitespace-nowrap">{HABIT_FREQUENCY_OPTIONS[habit.frequency]}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-1">
                        <button
                          onClick={() => startEditing(habit)}
                          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all text-white/10 hover:text-white border border-transparent shadow-sm"
                        >
                          <Edit2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Удалить привычку "${habit.title}"?`)) {
                              deleteHabit(habit.id)
                            }
                          }}
                          className="p-2 bg-white/5 hover:bg-red-500/10 rounded-lg transition-all text-white/10 hover:text-red-400 border border-transparent shadow-sm"
                        >
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-white/5">
                      <div className="px-4 py-2 rounded-xl bg-amber-500/5 border border-amber-500/10 w-fit flex items-center gap-2">
                        <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-amber-500/40 uppercase tracking-widest leading-none mb-0.5">Серия</span>
                          <span className="text-sm font-oswald font-black text-amber-500 leading-none">{habit.streak} ДНЕЙ</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
