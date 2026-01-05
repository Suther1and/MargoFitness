'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { Check, Clock, Sun, Moon, Calendar as CalendarIcon, ListChecks, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

// Реальные компоненты из health-tracker
import { WaterCardH } from '@/app/dashboard/health-tracker/components/water-card-h'
import { StepsCardH } from '@/app/dashboard/health-tracker/components/steps-card-h'
import { WeightCardH } from '@/app/dashboard/health-tracker/components/weight-card-h'
import { SleepCardH } from '@/app/dashboard/health-tracker/components/sleep-card-h'
import { CaffeineCardH } from '@/app/dashboard/health-tracker/components/caffeine-card-h'
import { MoodEnergyCardH } from '@/app/dashboard/health-tracker/components/mood-energy-card-h'
import { NotesCard } from '@/app/dashboard/health-tracker/components/notes-card'
import { GoalsSummaryCard } from '@/app/dashboard/health-tracker/components/goals-summary-card'
import { MOCK_DATA } from '@/app/dashboard/health-tracker/types'

// Мемоизированные версии виджетов - не ререндерятся при раскрытии HabitsCard
const MemoizedWaterCard = React.memo(WaterCardH)
const MemoizedStepsCard = React.memo(StepsCardH)
const MemoizedWeightCard = React.memo(WeightCardH)
const MemoizedSleepCard = React.memo(SleepCardH)
const MemoizedCaffeineCard = React.memo(CaffeineCardH)
const MemoizedMoodEnergyCard = React.memo(MoodEnergyCardH)
const MemoizedNotesCard = React.memo(NotesCard)
const MemoizedGoalsSummaryCard = React.memo(GoalsSummaryCard)

// === ТИПЫ ===
interface DailyHabit {
  id: string
  title: string
  completed: boolean
  streak: number
  category: "morning" | "afternoon" | "evening" | "anytime"
}

// === БАЗОВЫЙ HabitItem (будем менять для каждого варианта) ===
function HabitItem({ habit, onToggle, variant }: any) {
  const baseClasses = cn(
    "flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all",
    habit.completed
      ? "border-amber-500/20 bg-amber-500/5 opacity-60"
      : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
  )

  const content = (
    <>
      <div className={cn(
        "w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all",
        habit.completed ? "bg-amber-500 border-amber-500" : "border-white/10 bg-white/5"
      )}>
        {habit.completed && <Check className="w-3 h-3 text-black stroke-[3px]" />}
      </div>
      <span className={cn("text-sm font-bold", habit.completed ? "text-white/30 line-through" : "text-white/80")}>
        {habit.title}
      </span>
    </>
  )

  // Current Fix: обычный div без анимаций
  return (
    <div onClick={() => onToggle(habit.id)} className={baseClasses}>
      {content}
    </div>
  )
}

// === HabitsCard с выбором варианта ===
function TestHabitsCard({ habits, onToggle, variant, variantName }: any) {
  return (
    <div className="rounded-[2rem] border border-white/5 bg-[#121214]/90 p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
          <ListChecks className="w-4 h-4 text-amber-500" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">{variantName}</h3>
          <p className="text-[10px] text-white/40">Completed: {habits.filter((h: any) => h.completed).length}/{habits.length}</p>
        </div>
      </div>
      
      <div className="space-y-2">
        {habits.map((habit: any) => (
          <HabitItem key={habit.id} habit={habit} onToggle={onToggle} variant={variant} />
        ))}
      </div>
    </div>
  )
}

export default function AnimationTestRealWorld() {
  const [mounted, setMounted] = useState(false)
  const [openSections, setOpenSections] = useState<number[]>([])
  
  const [habits, setHabits] = useState<DailyHabit[]>([
    { id: '1', title: 'Выпить воды', completed: false, streak: 3, category: 'morning' },
    { id: '2', title: 'Зарядка', completed: true, streak: 5, category: 'morning' },
    { id: '3', title: 'Прогулка', completed: false, streak: 2, category: 'afternoon' },
    { id: '4', title: 'Чтение', completed: false, streak: 7, category: 'evening' },
  ])
  
  // Хуки для варианта 2 (Measure Height) - ДОЛЖНЫ быть на верхнем уровне
  const contentRef = useRef<HTMLDivElement>(null)
  const [measuredHeight, setMeasuredHeight] = useState<number | 'auto'>('auto')
  
  // Состояние для реальных компонентов трекера
  const [trackerData, setTrackerData] = useState(MOCK_DATA)
  
  // Стабильный коллбэк - не создается заново при каждом рендере
  const handleMetricUpdate = useCallback((metric: string, value: any) => {
    setTrackerData(prev => ({ ...prev, [metric]: value }))
  }, [])
  
  const handleHabitToggle = useCallback((id: string) => {
    setHabits(prev => prev.map(h => 
      h.id === id ? { ...h, completed: !h.completed } : h
    ))
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const toggleSection = (section: number) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const variants = [
    { id: 1, name: 'Different Exit', color: 'orange', desc: 'без подлага' },
  ]

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-4 md:p-8 pb-32 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* 5 КНОПОК */}
        <div className="flex flex-nowrap gap-3 justify-center p-4 rounded-2xl bg-zinc-900/30 border border-white/5 overflow-x-auto">
          {variants.map((v) => (
            <button
              key={v.id}
              onClick={() => toggleSection(v.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-3 rounded-xl border font-bold text-xs uppercase transition-all whitespace-nowrap",
                openSections.includes(v.id)
                  ? `bg-${v.color}-500 border-${v.color}-500 text-black`
                  : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10"
              )}
            >
              <span>{v.name}</span>
              <span className="text-[10px] font-normal lowercase opacity-60">{v.desc}</span>
            </button>
          ))}
        </div>

        {/* РАСКРЫВАЮЩАЯСЯ СЕКЦИЯ */}
        {variants.map((v) => {
          const isOpen = openSections.includes(v.id)
          
          return (
            <AnimatePresence key={v.id}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ 
                    height: 'auto', 
                    opacity: 1,
                    transition: { type: 'spring', duration: 0.4, bounce: 0 }
                  }}
                  exit={{ 
                    height: 0, 
                    opacity: 0,
                    transition: { duration: 0.25, ease: [0.4, 0, 1, 1] }
                  }}
                  className="overflow-hidden mb-6"
                >
                  <TestHabitsCard
                    habits={habits}
                    onToggle={handleHabitToggle}
                    variant={1}
                    variantName={`Different Exit (без подлага)`}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          )
        })}

        {/* РЕАЛЬНЫЕ ВИДЖЕТЫ ВНИЗУ - без анимации движения */}
        <div className="mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MemoizedWaterCard 
              value={trackerData.waterIntake} 
              goal={trackerData.waterGoal} 
              onUpdate={(val) => handleMetricUpdate('waterIntake', val)} 
            />
            <MemoizedStepsCard 
              steps={trackerData.steps} 
              goal={trackerData.stepsGoal} 
              onUpdate={(val) => handleMetricUpdate('steps', val)} 
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <MemoizedWeightCard 
              value={trackerData.weight} 
              goalWeight={trackerData.weightGoal}
              onUpdate={(val) => handleMetricUpdate('weight', val)} 
            />
            <MemoizedCaffeineCard 
              value={trackerData.caffeineIntake} 
              goal={trackerData.caffeineGoal} 
              onUpdate={(val) => handleMetricUpdate('caffeineIntake', val)} 
            />
            <MemoizedSleepCard 
              hours={trackerData.sleepHours} 
              goal={trackerData.sleepGoal} 
              onUpdate={(val) => handleMetricUpdate('sleepHours', val)} 
            />
            <MemoizedMoodEnergyCard 
              mood={trackerData.mood} 
              energy={trackerData.energyLevel} 
              onMoodUpdate={(val) => handleMetricUpdate('mood', val)} 
              onEnergyUpdate={(val) => handleMetricUpdate('energyLevel', val)} 
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <MemoizedNotesCard 
              value={trackerData.notes} 
              onUpdate={(val) => handleMetricUpdate('notes', val)} 
            />
            <MemoizedGoalsSummaryCard data={trackerData} />
          </div>
        </div>



      </div>
    </div>
  )
}
