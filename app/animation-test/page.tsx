'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion'
import { ChevronDown, Calendar, Target, ListChecks, Droplets, Footprints, Coffee, Moon, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const springConfig = { stiffness: 260, damping: 30 }

// Простая карточка виджета (копия стиля из health-tracker)
function WidgetCard({ title, value, goal, icon: Icon, color }: any) {
  const percentage = goal ? Math.min((value / goal) * 100, 100) : 0
  const isDone = goal && value >= goal

  return (
    <div className={cn(
      "relative group overflow-hidden border transition-all duration-700 backdrop-blur-2xl rounded-[2rem] p-4",
      "bg-zinc-900/50 border-white/10 hover:border-white/20"
    )}>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", `bg-${color}-500/10`)}>
            <Icon className={cn("w-4 h-4", `text-${color}-400`)} />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-white/50">{title}</span>
        </div>
        
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-3xl font-bold text-white">{value}</span>
          {goal && <span className="text-sm text-white/30">/ {goal}</span>}
        </div>

        {goal && (
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              className={cn("h-full", isDone ? "bg-emerald-500" : `bg-${color}-500`)}
              transition={springConfig}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// Компонент привычки
function HabitItem({ title, completed, onToggle }: any) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={onToggle}
      className={cn(
        "flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer transition-all",
        completed
          ? "border-amber-500/20 bg-amber-500/5 opacity-60"
          : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
      )}
    >
      <div className={cn(
        "w-7 h-7 rounded-lg flex items-center justify-center border-2 transition-all",
        completed ? "bg-amber-500 border-amber-500" : "border-white/10 bg-white/5"
      )}>
        {completed && <Check className="w-4 h-4 text-black stroke-[3px]" />}
      </div>
      <span className={cn(
        "text-sm font-bold transition-all",
        completed ? "text-white/30 line-through" : "text-white/80"
      )}>{title}</span>
    </motion.div>
  )
}

export default function AnimationTestHealthTracker() {
  const [mounted, setMounted] = useState(false)
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false)
  const [isDailyPlanExpanded, setIsDailyPlanExpanded] = useState(false)
  const [isHabitsExpanded, setIsHabitsExpanded] = useState(false)
  
  const [habits, setHabits] = useState([
    { id: 1, title: 'Выпить воды', completed: false },
    { id: 2, title: 'Зарядка', completed: true },
    { id: 3, title: 'Прогулка', completed: false },
  ])

  useEffect(() => {
    setMounted(true)
    // Force GPU acceleration
    document.documentElement.style.transform = 'translateZ(0)'
    document.documentElement.style.willChange = 'transform'
  }, [])

  if (!mounted) return null

  return (
    <MotionConfig reducedMotion="never" transition={springConfig}>
      <div className="min-h-screen bg-[#09090b] text-white p-4 md:p-8 pb-32 font-sans overflow-x-hidden" style={{ transform: 'translateZ(0)', willChange: 'transform' }}>
        
        {/* Ambient BG */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          
          <header className="mb-8">
            <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">
              Health Tracker <span className="text-amber-500">Test</span>
            </h1>
            <p className="text-white/40 text-sm">Тестируем анимации реальных элементов</p>
          </header>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 mb-6 md:hidden">
            <button 
              onClick={() => {
                setIsCalendarExpanded(!isCalendarExpanded)
                if (!isCalendarExpanded) {
                  setIsDailyPlanExpanded(false)
                  setIsHabitsExpanded(false)
                }
              }}
              className={cn(
                "p-3 rounded-2xl border transition-all",
                isCalendarExpanded 
                  ? "bg-amber-500 border-amber-500" 
                  : "bg-white/5 border-white/5 hover:bg-white/10"
              )}
            >
              <Calendar className={cn("w-5 h-5", isCalendarExpanded ? "text-black" : "text-white/40")} />
            </button>
            
            <button 
              onClick={() => {
                setIsHabitsExpanded(!isHabitsExpanded)
                if (!isHabitsExpanded) {
                  setIsCalendarExpanded(false)
                  setIsDailyPlanExpanded(false)
                }
              }}
              className={cn(
                "p-3 rounded-2xl border transition-all",
                isHabitsExpanded 
                  ? "bg-amber-500 border-amber-500" 
                  : "bg-white/5 border-white/5 hover:bg-white/10"
              )}
            >
              <ListChecks className={cn("w-5 h-5", isHabitsExpanded ? "text-black" : "text-white/40")} />
            </button>

            <button 
              onClick={() => {
                setIsDailyPlanExpanded(!isDailyPlanExpanded)
                if (!isDailyPlanExpanded) {
                  setIsCalendarExpanded(false)
                  setIsHabitsExpanded(false)
                }
              }}
              className={cn(
                "p-3 rounded-2xl border transition-all",
                isDailyPlanExpanded 
                  ? "bg-amber-500 border-amber-500" 
                  : "bg-white/5 border-white/5 hover:bg-white/10"
              )}
            >
              <Target className={cn("w-5 h-5", isDailyPlanExpanded ? "text-black" : "text-white/40")} />
            </button>
          </div>

          {/* Mobile Calendar Expansion */}
          <AnimatePresence>
            {isCalendarExpanded && (
              <motion.div 
                key="mobile-calendar"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={springConfig}
                className="md:hidden mb-6"
              >
                <div className="p-6 rounded-[2rem] border border-white/5 bg-[#121214]/40 backdrop-blur-xl">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-amber-400" />
                    <h3 className="text-lg font-bold">Календарь</h3>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div key={i} className="aspect-square bg-white/5 rounded-xl flex items-center justify-center text-xs">
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Daily Plan Expansion */}
          <AnimatePresence>
            {isDailyPlanExpanded && (
              <motion.div 
                key="mobile-daily-plan"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={springConfig}
                className="md:hidden mb-6"
              >
                <div className="p-6 rounded-[2rem] border border-white/5 bg-[#121214]/40 backdrop-blur-xl">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-bold">План на день</h3>
                  </div>
                  <div className="space-y-2">
                    {['Вода: 1500/2000 мл', 'Шаги: 8000/10000', 'Сон: 7/8 ч'].map((item, i) => (
                      <div key={i} className="p-3 bg-white/5 rounded-xl text-sm">{item}</div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Habits Expansion */}
          <AnimatePresence>
            {isHabitsExpanded && (
              <motion.div 
                key="mobile-habits"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={springConfig}
                className="md:hidden mb-6"
              >
                <div className="p-6 rounded-[2rem] border border-white/5 bg-[#121214]/40 backdrop-blur-xl">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <ListChecks className="w-5 h-5 text-amber-400" />
                    <h3 className="text-lg font-bold">Привычки</h3>
                  </div>
                  <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                      {habits.map((habit) => (
                        <HabitItem
                          key={habit.id}
                          title={habit.title}
                          completed={habit.completed}
                          onToggle={() => {
                            setHabits(habits.map(h => 
                              h.id === habit.id ? { ...h, completed: !h.completed } : h
                            ))
                          }}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <WidgetCard title="Вода" value={1500} goal={2000} icon={Droplets} color="blue" />
            <WidgetCard title="Шаги" value={8543} goal={10000} icon={Footprints} color="red" />
            <WidgetCard title="Кофеин" value={200} goal={400} icon={Coffee} color="amber" />
            <WidgetCard title="Сон" value={7.5} goal={8} icon={Moon} color="indigo" />
            <WidgetCard title="Вода" value={1800} goal={2000} icon={Droplets} color="blue" />
            <WidgetCard title="Шаги" value={12000} goal={10000} icon={Footprints} color="red" />
          </div>

          <div className="mt-8 p-6 rounded-[2rem] bg-zinc-900/50 border border-white/10">
            <h3 className="text-sm font-black uppercase tracking-widest text-amber-500 mb-4">Инструкции</h3>
            <ul className="space-y-2 text-sm text-white/60">
              <li>• Протестируй кнопки раскрытия (календарь, привычки, план)</li>
              <li>• Проверь плавность смещения виджетов вниз</li>
              <li>• Кликай по привычкам - проверь анимацию</li>
              <li>• Все лагает? - начинаем удалять эффекты по одному</li>
              <li>• Всё плавно? - переносим решение в основной проект</li>
            </ul>
          </div>

        </div>
      </div>
    </MotionConfig>
  )
}
