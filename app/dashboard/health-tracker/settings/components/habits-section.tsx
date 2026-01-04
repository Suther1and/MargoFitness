'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Check, X, Flame, Sun, Moon, Sunset, Clock } from 'lucide-react'
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
  const [isExpanded, setIsExpanded] = useState(false)
  
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
    setIsExpanded(false)
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
    <div className="space-y-12">
      {/* Collapsible Add Form */}
      <div className="space-y-4">
        {!isExpanded ? (
          <motion.button
            layout
            onClick={() => setIsExpanded(true)}
            className="w-full py-6 rounded-[2.5rem] border border-dashed border-white/10 hover:border-green-500/50 hover:bg-green-500/[0.02] transition-all flex items-center justify-center gap-4 group shadow-lg"
          >
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-green-500 group-hover:text-[#09090b] transition-all shadow-inner">
              <Plus className="w-5 h-5" />
            </div>
            <span className="font-oswald font-black text-lg uppercase tracking-[0.1em] text-white/20 group-hover:text-white transition-colors">
              Добавить новую привычку
            </span>
          </motion.button>
        ) : (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 md:p-10 rounded-[3.5rem] border border-white/10 bg-zinc-900/60 backdrop-blur-3xl relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50" />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <h3 className="font-oswald font-black text-3xl uppercase tracking-tighter">Новая привычка</h3>
                    <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">Создай свой ритуал успеха</p>
                  </div>
                  <button onClick={() => setIsExpanded(false)} className="text-white/20 hover:text-white p-2 bg-white/5 rounded-full lg:hidden">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Название ритуала</label>
                  <input
                    placeholder="Например: Утренняя йога"
                    value={newHabit.title}
                    onChange={(e) => setNewHabit({...newHabit, title: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xl font-oswald font-black text-white focus:outline-none focus:border-green-500/50 focus:bg-white/10 transition-all shadow-inner placeholder:opacity-20"
                  />
                </div>

                <button
                  onClick={handleAdd}
                  disabled={newHabit.title.trim().length < 2}
                  className={cn(
                    "hidden lg:flex w-full py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] transition-all shadow-[0_20px_40px_rgba(34,197,94,0.2)] items-center justify-center gap-3",
                    newHabit.title.trim().length >= 2
                      ? "bg-green-500 text-[#09090b] hover:bg-green-400 hover:scale-[1.02] active:scale-[0.98]"
                      : "bg-white/5 text-white/10 cursor-not-allowed"
                  )}
                >
                  <Check className="w-6 h-6" />
                  Создать
                </button>
              </div>

              <div className="space-y-8">
                <div className="hidden lg:flex justify-end">
                  <button onClick={() => setIsExpanded(false)} className="text-white/20 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Как часто?</label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(HABIT_FREQUENCY_OPTIONS).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => setNewHabit({...newHabit, frequency: key as HabitFrequency})}
                          className={cn(
                            "px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm",
                            newHabit.frequency === key 
                              ? "bg-green-500 border-green-500 text-[#09090b] shadow-green-500/20" 
                              : "bg-white/5 border-white/5 text-white/30 hover:text-white/60 hover:bg-white/10"
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Когда именно?</label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(HABIT_TIME_OPTIONS).map(([key, label]) => {
                        const Icon = TIME_ICONS[key as HabitTime]
                        return (
                          <button
                            key={key}
                            onClick={() => setNewHabit({...newHabit, time: key as HabitTime})}
                            className={cn(
                              "px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center gap-2.5 shadow-sm",
                              newHabit.time === key 
                                ? "bg-green-500 border-green-500 text-[#09090b] shadow-green-500/20" 
                                : "bg-white/5 border-white/5 text-white/30 hover:text-white/60 hover:bg-white/10"
                            )}
                          >
                            <Icon className="w-4 h-4" />
                            {label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleAdd}
                  disabled={newHabit.title.trim().length < 2}
                  className={cn(
                    "lg:hidden w-full py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] transition-all shadow-[0_20px_40px_rgba(34,197,94,0.2)] items-center justify-center gap-3",
                    newHabit.title.trim().length >= 2
                      ? "bg-green-500 text-[#09090b] hover:bg-green-400"
                      : "bg-white/5 text-white/10 cursor-not-allowed"
                  )}
                >
                  <Check className="w-6 h-6" />
                  Создать
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Habits List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {habits.map(habit => {
          const TimeIcon = TIME_ICONS[habit.time]
          const isEditing = editingId === habit.id

          return (
            <motion.div
              key={habit.id}
              layout
              className={cn(
                "p-7 rounded-[2.5rem] border transition-all duration-700 relative overflow-hidden group/card shadow-xl",
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
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover/card:text-green-500 transition-all border border-white/5 shadow-inner">
                        <TimeIcon className="w-6 h-6" />
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
                        className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-white/10 hover:text-white border border-transparent shadow-sm"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Удалить привычку "${habit.title}"?`)) {
                            deleteHabit(habit.id)
                          }
                        }}
                        className="p-2.5 bg-white/5 hover:bg-red-500/10 rounded-xl transition-all text-white/10 hover:text-red-400 border border-transparent shadow-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="px-4 py-2 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-amber-500/40 uppercase tracking-widest leading-none mb-0.5">Серия</span>
                        <span className="text-sm font-oswald font-black text-amber-500 leading-none">{habit.streak} ДНЕЙ</span>
                      </div>
                    </div>
                    
                    <div className="w-8 h-8 rounded-full bg-green-500/5 flex items-center justify-center border border-green-500/10">
                       <Check className="w-4 h-4 text-green-500/40" />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
