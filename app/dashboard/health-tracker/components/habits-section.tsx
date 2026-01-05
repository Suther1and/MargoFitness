'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Flame, Sun, Moon, Coffee, Clock, PlusCircle, Power, EyeOff, ChevronDown, ChevronUp, ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHabits } from '../hooks/use-habits'
import { useIsMobile } from '@/lib/hooks/use-is-mobile'
import { Habit, HabitFrequency, HabitTime, HABIT_FREQUENCY_OPTIONS, HABIT_TIME_OPTIONS } from '../types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const TIME_CONFIG = {
  morning: { label: 'Утро', icon: Coffee, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  afternoon: { label: 'День', icon: Sun, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  evening: { label: 'Вечер', icon: Moon, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  anytime: { label: 'Любое время', icon: Clock, color: 'text-slate-400', bg: 'bg-slate-400/10' },
}

const GPU_ENHANCED_STYLE = {
  transform: 'translate3d(0,0,0)',
  WebkitBackfaceVisibility: 'hidden' as const,
  backfaceVisibility: 'hidden' as const,
  willChange: 'transform, opacity, height',
}

interface HabitCardProps {
  habit: Habit
  isEditing: boolean
  isAnyEditing: boolean
  isMobile: boolean
  editForm: { title: string; frequency: HabitFrequency; time: HabitTime } | null
  setEditForm: (form: { title: string; frequency: HabitFrequency; time: HabitTime } | null) => void
  startEditing: (habit: Habit) => void
  saveEdit: (id: string) => void
  cancelEditing: () => void
  toggleHabitStatus: (id: string, enabled: boolean) => void
  deleteHabit: (id: string) => void
}

function HabitCard({ habit, isEditing, isAnyEditing, isMobile, editForm, setEditForm, startEditing, saveEdit, cancelEditing, toggleHabitStatus, deleteHabit }: HabitCardProps) {
  const config = TIME_CONFIG[habit.time]
  const Icon = config.icon

  return (
    <motion.div
      layout="position"
      initial={false}
      transition={{
        layout: { 
          duration: 0.5, 
          ease: [0.16, 1, 0.3, 1] 
        }
      }}
      style={{ ...GPU_ENHANCED_STYLE, contain: 'paint layout', overflow: 'hidden' }}
      className={cn(
        "group relative rounded-[2rem] border transition-[colors,opacity,filter] duration-300",
        isEditing 
          ? "bg-white/[0.02] border-amber-500/20 px-4 py-4 md:px-5 md:py-3 shadow-xl" 
          : habit.enabled 
            ? "border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 p-4" 
            : "border-white/5 bg-white/[0.01] opacity-40 grayscale p-4",
        isAnyEditing && !isEditing && "opacity-40 saturate-50"
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isEditing && editForm ? (
          <motion.div
            key="edit"
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
              opacity: 1, 
              height: 'auto',
              transition: {
                height: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.3, delay: 0.2 }
              }
            }}
            exit={{ 
              opacity: 0,
              height: 0,
              transition: { 
                height: { duration: 0.4, ease: [0.7, 0, 0.84, 0] },
                opacity: { duration: 0.15 }
              } 
            }}
            className="w-full flex flex-col gap-6 md:gap-3 overflow-hidden"
          >
            <div className="space-y-1.5 md:space-y-1">
              <span className="text-[8px] md:text-[7px] font-black uppercase tracking-[0.2em] text-white/40 md:text-white/30 ml-1">Что планируем?</span>
              <input
                placeholder="Йога, Чтение или Зарядка"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-2.5 text-base font-oswald font-black text-white focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-colors"
              />
            </div>

            <div className="flex flex-row md:flex-row items-end gap-3 md:gap-4 w-full">
              <div className="space-y-1.5 md:space-y-1 flex-1 md:flex-none">
                <span className="text-[8px] md:text-[7px] font-black uppercase tracking-[0.2em] text-white/40 md:text-white/30 ml-1">Сколько раз в неделю?</span>
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 justify-between md:justify-start">
                  {([1, 2, 3, 4, 5, 6, 7] as HabitFrequency[]).map((num) => (
                    <button
                      key={num}
                      onClick={() => setEditForm({ ...editForm, frequency: num })}
                      className={cn(
                        "w-8 h-8 md:w-9 md:h-9 rounded-lg text-xs md:text-sm font-black transition-all flex items-center justify-center",
                        editForm.frequency === num 
                          ? "bg-amber-500 text-[#09090b] shadow-lg" 
                          : "text-white/30 hover:text-white/60"
                      )}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile: Dropdown */}
              <div className="space-y-1.5 flex-[0.7] md:hidden">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">В какое время?</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-full h-10 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between px-3 text-white/60 active:bg-white/10 transition-colors">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const Config = TIME_CONFIG[editForm.time]
                          const Icon = Config.icon
                          return (
                            <>
                              <Icon className={cn("w-3.5 h-3.5", Config.color)} />
                              <span className="text-[10px] font-black uppercase tracking-wider">
                                {editForm.time === 'anytime' ? 'Любое' : Config.label}
                              </span>
                            </>
                          )
                        })()}
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 opacity-40" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-zinc-900/95 border-white/10 md:backdrop-blur-xl rounded-xl min-w-[140px]">
                    {(['morning', 'afternoon', 'evening', 'anytime'] as HabitTime[]).map((key) => {
                      const Config = TIME_CONFIG[key]
                      const Icon = Config.icon
                      return (
                        <DropdownMenuItem 
                          key={key}
                          onClick={() => setEditForm({ ...editForm, time: key })}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors",
                            editForm.time === key ? "bg-white/5 text-white" : "text-white/60"
                          )}
                        >
                          <Icon className={cn("w-4 h-4", Config.color)} />
                          <span className="text-xs font-black uppercase tracking-widest">
                            {key === 'anytime' ? 'Любое' : Config.label}
                          </span>
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Desktop: Icon Buttons */}
              <div className="hidden md:block space-y-1">
                <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">
                  {editForm.time === 'morning' && 'Утром'}
                  {editForm.time === 'afternoon' && 'Днем'}
                  {editForm.time === 'evening' && 'Вечером'}
                  {editForm.time === 'anytime' && 'В любое время'}
                </span>
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                  {(['morning', 'afternoon', 'evening', 'anytime'] as HabitTime[]).map((key) => {
                    const Config = TIME_CONFIG[key]
                    const Icon = Config.icon
                    return (
                      <button
                        key={key}
                        title={Config.label}
                        onClick={() => setEditForm({ ...editForm, time: key })}
                        className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                          editForm.time === key 
                            ? "bg-amber-500 text-[#09090b] shadow-lg" 
                            : "text-white/30 hover:text-white/60"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => saveEdit(habit.id)}
                className="h-[46px] md:h-[40px] flex-1 bg-amber-500 text-[#09090b] rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg active:scale-95 transition-all"
              >
                Сохранить
              </button>
              <button
                onClick={cancelEditing}
                className="h-[46px] md:h-[40px] px-6 md:px-5 bg-white/5 text-white/40 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
              >
                Отмена
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="view"
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
              opacity: 1, 
              height: 'auto',
              transition: {
                height: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.3, delay: 0.2 }
              }
            }}
            exit={{ 
              opacity: 0,
              height: 0,
              transition: { 
                height: { duration: 0.4, ease: [0.7, 0, 0.84, 0] },
                opacity: { duration: 0.15 }
              }
            }}
            className="w-full flex items-center justify-between overflow-hidden"
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

            <div className="flex items-center gap-3">
              <div className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors",
                habit.enabled ? "bg-amber-500/5 border-amber-500/10" : "bg-white/5 border-white/5"
              )}>
                <Flame className={cn("w-3.5 h-3.5", habit.enabled ? "text-amber-500 fill-amber-500" : "text-white/20")} />
                <span className={cn("text-xs font-oswald font-black", habit.enabled ? "text-amber-500" : "text-white/20")}>{habit.streak}</span>
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
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function HabitsSection() {
  const { habits, isLoaded, addHabit, updateHabit, deleteHabit } = useHabits()
  const isMobile = useIsMobile(768)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isDisabledExpanded, setIsDisabledExpanded] = useState(false)
  
  const [newHabit, setNewHabit] = useState<{
    title: string
    frequency: HabitFrequency
    time: HabitTime
    enabled: boolean
  }>({
    title: '',
    frequency: 7,
    time: 'anytime',
    enabled: true
  })

  const [editForm, setEditForm] = useState<{
    title: string
    frequency: HabitFrequency
    time: HabitTime
  } | null>(null)

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
      frequency: 7,
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
    <div className="space-y-8">
      {/* Quick Add Form */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <PlusCircle className="w-4 h-4 text-amber-500/50" strokeWidth={2.5} />
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 whitespace-nowrap">Новая привычка</h2>
          <div className="h-px bg-white/5 w-full" />
        </div>

        {/* DESKTOP VERSION */}
        <div className="hidden md:block bg-white/[0.02] border border-white/5 rounded-[2rem] px-4 py-4 md:pt-3 md:pb-5 md:px-6 shadow-xl md:backdrop-blur-md">
          <div className="flex flex-col xl:flex-row gap-6 xl:items-end">
            <div className="flex-1 space-y-1.5">
              <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/20 ml-1">Что планируем?</span>
              <input
                placeholder="Йога, Чтение или Зарядка"
                value={newHabit.title}
                onChange={(e) => setNewHabit({...newHabit, title: e.target.value})}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-2.5 text-base font-oswald font-black text-white focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all"
              />
            </div>

            <div className="flex flex-wrap items-end gap-6">
              <div className="space-y-1.5">
                <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/20 ml-1">Сколько раз в неделю?</span>
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                  {([1, 2, 3, 4, 5, 6, 7] as HabitFrequency[]).map((num) => (
                      <button
                        key={num}
                        onClick={() => setNewHabit({...newHabit, frequency: num})}
                        className={cn(
                          "w-9 h-9 rounded-lg text-sm font-black transition-colors flex items-center justify-center",
                          newHabit.frequency === num 
                            ? "bg-amber-500 text-[#09090b] shadow-lg" 
                            : "text-white/30 hover:text-white/60"
                        )}
                      >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/20 ml-1">
                  {newHabit.time === 'morning' && 'Утром'}
                  {newHabit.time === 'afternoon' && 'Днем'}
                  {newHabit.time === 'evening' && 'Вечером'}
                  {newHabit.time === 'anytime' && 'В любое время'}
                </span>
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
                            "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
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
              </div>

              <button
                onClick={handleAdd}
                disabled={newHabit.title.trim().length < 2}
                className={cn(
                  "h-[46px] px-8 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shrink-0 font-black text-[10px] uppercase tracking-widest",
                  newHabit.title.trim().length >= 2
                    ? "bg-amber-500 text-[#09090b] hover:bg-amber-400 active:scale-95"
                    : "bg-white/5 text-white/10 cursor-not-allowed"
                )}
              >
                <Plus className="w-4 h-4" strokeWidth={3} />
                Добавить
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE VERSION */}
        <div className="md:hidden bg-white/[0.02] border border-white/5 rounded-[2rem] px-4 py-5 shadow-xl">
          <div className="flex flex-col gap-6">
            <div className="space-y-1.5">
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Что планируем?</span>
              <input
                placeholder="Йога, Чтение или Зарядка"
                value={newHabit.title}
                onChange={(e) => setNewHabit({...newHabit, title: e.target.value})}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-2.5 text-base font-oswald font-black text-white focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-colors"
              />
            </div>

            <div className="flex flex-row items-end gap-3 w-full">
              <div className="space-y-1.5 flex-1">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Сколько раз в неделю?</span>
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 justify-between">
                  {([1, 2, 3, 4, 5, 6, 7] as HabitFrequency[]).map((num) => (
                    <button
                      key={num}
                      onClick={() => setNewHabit({...newHabit, frequency: num})}
                      className={cn(
                        "w-8 h-8 rounded-lg text-xs font-black transition-all flex items-center justify-center",
                        newHabit.frequency === num 
                          ? "bg-amber-500 text-[#09090b] shadow-lg" 
                          : "text-white/30 hover:text-white/60"
                      )}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 flex-[0.7]">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">В какое время?</span>
                <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="w-full h-10 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between px-3 text-white/60 active:bg-white/10 transition-colors">
                          <div className="flex items-center gap-2">
                            {(() => {
                              const Config = TIME_CONFIG[newHabit.time]
                              const Icon = Config.icon
                              return (
                                <>
                                  <Icon className={cn("w-3.5 h-3.5", Config.color)} />
                                  <span className="text-[10px] font-black uppercase tracking-wider">
                                    {newHabit.time === 'anytime' ? 'Любое' : Config.label}
                                  </span>
                                </>
                              )
                            })()}
                          </div>
                          <ChevronDown className="w-3.5 h-3.5 opacity-40" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-zinc-900/95 border-white/10 md:backdrop-blur-xl rounded-xl min-w-[140px]">
                        {(['morning', 'afternoon', 'evening', 'anytime'] as HabitTime[]).map((key) => {
                          const Config = TIME_CONFIG[key]
                          const Icon = Config.icon
                          return (
                            <DropdownMenuItem 
                              key={key}
                              onClick={() => setNewHabit({...newHabit, time: key})}
                              className={cn(
                                "flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors",
                                newHabit.time === key ? "bg-white/5 text-white" : "text-white/60"
                              )}
                            >
                              <Icon className={cn("w-4 h-4", Config.color)} />
                              <span className="text-xs font-black uppercase tracking-widest">
                                {key === 'anytime' ? 'Любое' : Config.label}
                              </span>
                            </DropdownMenuItem>
                          )
                        })}
                      </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <button
              onClick={handleAdd}
              disabled={newHabit.title.trim().length < 2}
              className={cn(
                "h-[46px] w-full rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shrink-0 font-black text-[10px] uppercase tracking-widest",
                newHabit.title.trim().length >= 2
                  ? "bg-amber-500 text-[#09090b] hover:bg-amber-400 active:scale-95"
                  : "bg-white/5 text-white/10 cursor-not-allowed"
              )}
            >
              <Plus className="w-4 h-4" strokeWidth={3} />
              Добавить
            </button>
          </div>
        </div>
      </div>

      {/* Habits Groups */}
      <div className="space-y-6">
        {(Object.entries(groupedHabits) as [HabitTime | 'disabled', Habit[]][]).map(([time, items]) => {
          if (items.length === 0) return null
          
          if (time === 'disabled') {
            return (
              <div key={time} className="space-y-3 pt-6 border-t border-white/5">
                <button 
                  onClick={() => setIsDisabledExpanded(!isDisabledExpanded)}
                  className="flex items-center gap-3 px-2 w-full group"
                >
                  <EyeOff className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 whitespace-nowrap group-hover:text-white/40 transition-colors">
                    Временно неактивные ({items.length})
                  </h3>
                  <div className="h-px bg-white/5 flex-1" />
                  {isDisabledExpanded ? (
                    <ChevronUp className="w-4 h-4 text-white/20 group-hover:text-white/40" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-white/20 group-hover:text-white/40" />
                  )}
                </button>

                <AnimatePresence>
                  {isDisabledExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ 
                        height: 'auto', 
                        opacity: 1,
                        transition: {
                          height: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
                          opacity: { duration: 0.3, delay: 0.1 }
                        }
                      }}
                      exit={{ 
                        height: 0, 
                        opacity: 0,
                        transition: {
                          height: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
                          opacity: { duration: 0.2 }
                        }
                      }}
                      className="overflow-hidden"
                      style={{ willChange: 'height, opacity' }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 md:items-start gap-4 pt-2">
                        <AnimatePresence mode="popLayout" initial={false}>
                          {items.map(habit => (
                            <HabitCard 
                              key={habit.id}
                            habit={habit}
                            isEditing={editingId === habit.id}
                            isAnyEditing={editingId !== null}
                            isMobile={isMobile}
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          }

          const config = TIME_CONFIG[time as HabitTime]
          const Icon = config.icon

          return (
            <div key={time} className="space-y-3">
              <div className="flex items-center gap-3 px-2">
                <Icon className={cn("w-4 h-4", config.color)} />
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">{config.label}</h3>
                <div className="h-px bg-white/5 flex-1" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 md:items-start gap-4">
                <AnimatePresence mode="popLayout" initial={false}>
                  {items.map(habit => (
                    <HabitCard 
                      key={habit.id}
                      habit={habit}
                      isEditing={editingId === habit.id}
                      isAnyEditing={editingId !== null}
                      isMobile={isMobile}
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

      {/* Empty State */}
      {habits.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 px-6 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mb-6">
            <PlusCircle className="w-7 h-7 text-amber-500/40" />
          </div>
          <h3 className="text-xl font-oswald font-black uppercase text-white mb-8 tracking-tight">Как это работает?</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[800px] w-full">
            {/* Левая колонка */}
            <div className="relative">
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-amber-500/20 rounded-full" />
              <div className="space-y-3">
                <h4 className="font-oswald font-black uppercase text-amber-500 text-lg leading-none">Создай систему</h4>
                <p className="text-sm text-white/40 leading-relaxed">
                  Задай название привычке, регулярность и время суток. Следи за серией и временно отключай задачи, если нужен перерыв.
                </p>
              </div>
            </div>
            
            {/* Правая колонка */}
            <div className="relative">
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-cyan-500/20 rounded-full" />
              <div className="space-y-3">
                <a 
                  href="/dashboard/health-tracker" 
                  className="block font-oswald font-black uppercase text-cyan-400 text-lg leading-none hover:text-cyan-300 transition-colors"
                >
                  Выполняй запланированное
                </a>
                <p className="text-sm text-white/40 leading-relaxed">
                  Активные привычки будут автоматически появляться в твоем трекере с выбранной периодичностью: отмечай выполненное и достигай своих целей.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Кнопка наверх */}
      <div className="flex justify-center pt-8">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/5 text-white/20 hover:text-white hover:bg-white/10 hover:border-white/10 transition-colors group font-black text-[10px] uppercase tracking-widest"
        >
          <ArrowUp className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
          Наверх
        </button>
      </div>
    </div>
  )
}
