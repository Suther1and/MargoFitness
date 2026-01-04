'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Flame, Sun, Moon, Sunset, Clock, PlusCircle, MoreVertical, CheckCircle2, Power, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHabits } from '../../hooks/use-habits'
import { Habit, HabitFrequency, HabitTime, HABIT_FREQUENCY_OPTIONS, HABIT_TIME_OPTIONS } from '../../types'

const TIME_CONFIG = {
  morning: { label: 'Утро', icon: Sun, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  afternoon: { label: 'День', icon: Sunset, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  evening: { label: 'Вечер', icon: Moon, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  anytime: { label: 'Любое время', icon: Clock, color: 'text-slate-400', bg: 'bg-slate-400/10' },
}

interface HabitCardProps {
  habit: Habit
  isEditing: boolean
  editForm: { title: string; frequency: HabitFrequency; time: HabitTime } | null
  setEditForm: (form: { title: string; frequency: HabitFrequency; time: HabitTime } | null) => void
  startEditing: (habit: Habit) => void
  saveEdit: (id: string) => void
  cancelEditing: () => void
  toggleHabitStatus: (id: string, enabled: boolean) => void
  deleteHabit: (id: string) => void
}

function HabitCard({ habit, isEditing, editForm, setEditForm, startEditing, saveEdit, cancelEditing, toggleHabitStatus, deleteHabit }: HabitCardProps) {
  const config = TIME_CONFIG[habit.time]
  const Icon = config.icon

  if (isEditing && editForm) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="p-4 rounded-3xl border border-amber-500/30 bg-zinc-900/80 shadow-xl z-10"
      >
        <div className="space-y-4">
          <input
            autoFocus
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 font-oswald font-black text-lg text-white focus:outline-none focus:border-amber-500/30"
          />
          <div className="flex flex-wrap gap-2">
            <div className="flex flex-wrap gap-1">
              {Object.entries(HABIT_FREQUENCY_OPTIONS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setEditForm({ ...editForm, frequency: key as HabitFrequency })}
                  className={cn(
                    "px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border",
                    editForm.frequency === key 
                      ? "bg-amber-500 border-amber-500 text-[#09090b]" 
                      : "bg-white/5 border-white/5 text-white/30"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="w-px h-4 bg-white/5 mx-1" />
            <div className="flex flex-wrap gap-1">
              {Object.entries(HABIT_TIME_OPTIONS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setEditForm({ ...editForm, time: key as HabitTime })}
                  className={cn(
                    "px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border",
                    editForm.time === key 
                      ? "bg-amber-500 border-amber-500 text-[#09090b]" 
                      : "bg-white/5 border-white/5 text-white/30"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => saveEdit(habit.id)}
              className="flex-1 py-2 bg-amber-500 text-[#09090b] rounded-xl font-black uppercase tracking-wider text-[10px]"
            >
              Сохранить
            </button>
            <button
              onClick={cancelEditing}
              className="px-4 py-2 bg-white/5 text-white/40 rounded-xl font-black uppercase tracking-wider text-[10px]"
            >
              Отмена
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "group relative flex items-center justify-between p-4 rounded-[2rem] border transition-all duration-300",
        habit.enabled 
          ? "border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10" 
          : "border-white/5 bg-white/[0.01] opacity-40 grayscale"
      )}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
          habit.enabled ? config.bg : "bg-white/5",
          habit.enabled ? config.color : "text-white/20"
        )}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={cn(
            "font-oswald font-black text-lg uppercase tracking-tight leading-none truncate transition-colors",
            habit.enabled ? "text-white group-hover:text-amber-400" : "text-white/40"
          )}>
            {habit.title}
          </h4>
          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">
            {HABIT_FREQUENCY_OPTIONS[habit.frequency]}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end">
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors",
            habit.enabled ? "bg-amber-500/5 border-amber-500/10" : "bg-white/5 border-white/5"
          )}>
            <Flame className={cn("w-3.5 h-3.5", habit.enabled ? "text-amber-500 fill-amber-500" : "text-white/20")} />
            <span className={cn("text-xs font-oswald font-black", habit.enabled ? "text-amber-500" : "text-white/20")}>{habit.streak}</span>
          </div>
          <span className="text-[7px] font-black text-white/10 uppercase tracking-[0.2em] mt-0.5 whitespace-nowrap">дней подряд</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleHabitStatus(habit.id, !habit.enabled)}
            title={habit.enabled ? "Выключить" : "Включить"}
            className={cn(
              "p-2 rounded-lg transition-colors",
              habit.enabled ? "bg-white/5 text-white/40 hover:text-amber-400" : "bg-amber-500/20 text-amber-500"
            )}
          >
            <Power className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => startEditing(habit)}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              if (confirm(`Удалить привычку "${habit.title}"?`)) {
                deleteHabit(habit.id)
              }
            }}
            className="p-2 bg-white/5 hover:bg-red-500/10 rounded-lg text-white/40 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  )
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

  // Группировка привычек по времени суток
  const groupedHabits = useMemo(() => {
    const groups: Record<HabitTime | 'disabled', Habit[]> = {
      morning: [],
      afternoon: [],
      evening: [],
      anytime: [],
      disabled: []
    }
    habits.forEach(habit => {
      if (!habit.enabled) {
        groups.disabled.push(habit)
      } else {
        groups[habit.time].push(habit)
      }
    })
    return groups
  }, [habits])

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

  const toggleHabitStatus = (id: string, enabled: boolean) => {
    updateHabit(id, { enabled })
  }

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Загрузка привычек...</p>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Quick Add Form */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <PlusCircle className="w-4 h-4 text-amber-500/50" strokeWidth={2.5} />
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 whitespace-nowrap">Новая привычка</h2>
          <div className="h-px bg-white/5 w-full" />
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-4 md:p-6 shadow-xl backdrop-blur-md">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
            {/* Title Input */}
            <div className="flex-1 relative">
              <input
                placeholder="Назови привычку (напр. Йога)"
                value={newHabit.title}
                onChange={(e) => setNewHabit({...newHabit, title: e.target.value})}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-lg font-oswald font-black text-white focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all shadow-inner"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Frequency Selection */}
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                {(['daily', '2week', '3week'] as HabitFrequency[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setNewHabit({...newHabit, frequency: key})}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all",
                      newHabit.frequency === key 
                        ? "bg-amber-500 text-[#09090b] shadow-lg" 
                        : "text-white/30 hover:text-white/60"
                    )}
                  >
                    {HABIT_FREQUENCY_OPTIONS[key]}
                  </button>
                ))}
              </div>

              {/* Time Selection */}
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                {(['morning', 'afternoon', 'evening', 'anytime'] as HabitTime[]).map((key) => {
                  const Config = TIME_CONFIG[key]
                  const Icon = Config.icon
                  return (
                    <button
                      key={key}
                      title={Config.label}
                      onClick={() => setNewHabit({...newHabit, time: key})}
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                        newHabit.time === key 
                          ? "bg-amber-500 text-[#09090b] shadow-lg" 
                          : "text-white/30 hover:text-white/60"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  )
                })}
              </div>

              {/* Create Button */}
              <button
                onClick={handleAdd}
                disabled={newHabit.title.trim().length < 2}
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg shrink-0",
                  newHabit.title.trim().length >= 2
                    ? "bg-amber-500 text-[#09090b] hover:bg-amber-400 active:scale-95"
                    : "bg-white/5 text-white/10 cursor-not-allowed"
                )}
              >
                <Plus className="w-6 h-6" strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Habits Groups */}
      <div className="space-y-10">
        {(Object.entries(groupedHabits) as [HabitTime | 'disabled', Habit[]][]).map(([time, items]) => {
          if (items.length === 0) return null
          
          if (time === 'disabled') {
            return (
              <div key={time} className="space-y-5 pt-10 border-t border-white/5">
                <div className="flex items-center gap-3 px-2">
                  <EyeOff className="w-4 h-4 text-white/20" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 whitespace-nowrap">Временно неактивные</h3>
                  <div className="h-px bg-white/5 flex-1" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AnimatePresence mode="popLayout">
                    {items.map(habit => (
                      <HabitCard 
                        key={habit.id}
                        habit={habit}
                        isEditing={editingId === habit.id}
                        editForm={editForm}
                        setEditForm={setEditForm}
                        startEditing={startEditing}
                        saveEdit={saveEdit}
                        cancelEditing={() => {
                          setEditingId(null)
                          setEditForm(null)
                        }}
                        toggleHabitStatus={toggleHabitStatus}
                        deleteHabit={deleteHabit}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )
          }

          const config = TIME_CONFIG[time as HabitTime]
          const Icon = config.icon

          return (
            <div key={time} className="space-y-5">
              <div className="flex items-center gap-3 px-2">
                <Icon className={cn("w-4 h-4", config.color)} />
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">{config.label}</h3>
                <div className="h-px bg-white/5 flex-1" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {items.map(habit => (
                    <HabitCard 
                      key={habit.id}
                      habit={habit}
                      isEditing={editingId === habit.id}
                      editForm={editForm}
                      setEditForm={setEditForm}
                      startEditing={startEditing}
                      saveEdit={saveEdit}
                      cancelEditing={() => {
                        setEditingId(null)
                        setEditForm(null)
                      }}
                      toggleHabitStatus={toggleHabitStatus}
                      deleteHabit={deleteHabit}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
