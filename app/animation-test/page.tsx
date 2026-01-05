'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ListChecks } from 'lucide-react'
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

// Мемоизированные версии виджетов
const MemoizedWaterCard = React.memo(WaterCardH)
const MemoizedStepsCard = React.memo(StepsCardH)
const MemoizedWeightCard = React.memo(WeightCardH)
const MemoizedSleepCard = React.memo(SleepCardH)
const MemoizedCaffeineCard = React.memo(CaffeineCardH)
const MemoizedMoodEnergyCard = React.memo(MoodEnergyCardH)
const MemoizedNotesCard = React.memo(NotesCard)
const MemoizedGoalsSummaryCard = React.memo(GoalsSummaryCard)

interface DailyHabit {
  id: string
  title: string
  completed: boolean
}

function HabitItem({ habit, onToggle }: any) {
  return (
    <div 
      onClick={() => onToggle(habit.id)} 
      className={cn(
        "flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors",
        habit.completed
          ? "border-amber-500/20 bg-amber-500/5 opacity-60"
          : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
      )}
    >
      <div className={cn(
        "w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-colors",
        habit.completed ? "bg-amber-500 border-amber-500" : "border-white/10 bg-white/5"
      )}>
        {habit.completed && <Check className="w-3 h-3 text-black stroke-[3px]" />}
      </div>
      <span className={cn("text-sm font-bold", habit.completed ? "text-white/30 line-through" : "text-white/80")}>
        {habit.title}
      </span>
    </div>
  )
}

function TestHabitsCard({ habits, onToggle, variantName }: any) {
  return (
    <div className="rounded-[2rem] border border-white/5 bg-[#121214]/95 p-4 shadow-xl md:backdrop-blur-md">
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
          <HabitItem key={habit.id} habit={habit} onToggle={onToggle} />
        ))}
      </div>
    </div>
  )
}

export default function AnimationTestRealWorld() {
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [habits, setHabits] = useState<DailyHabit[]>([
    { id: '1', title: 'Выпить воды', completed: false },
    { id: '2', title: 'Зарядка', completed: true },
    { id: '3', title: 'Прогулка', completed: false },
    { id: '4', title: 'Чтение', completed: false },
    { id: '5', title: 'Медитация', completed: false },
  ])
  const [trackerData, setTrackerData] = useState(MOCK_DATA)
  
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState(0)

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
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight)
    }
  }, [habits])

  if (!mounted) return null

  const toggleSection = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className={cn(
      "min-h-screen bg-[#09090b] text-white p-4 md:p-8 pb-32 font-sans overflow-x-hidden transition-colors duration-500",
      isAnimating && "is-animating"
    )}>
      <style jsx global>{`
        .is-animating * {
          box-shadow: none !important;
          text-shadow: none !important;
          filter: none !important;
          backdrop-filter: none !important;
        }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Кнопки */}
        <div className="flex justify-center p-4 rounded-2xl bg-zinc-900/30 border border-white/5">
          <button
            onClick={toggleSection}
            className={cn(
              "px-8 py-3 rounded-xl border font-bold text-xs uppercase transition-colors active:scale-95",
              isOpen ? "bg-amber-500 border-amber-500 text-black" : "bg-white/5 border-white/5 text-white/60"
            )}
          >
            Manual GPU Shift
          </button>
        </div>

        {/* Анимированный контейнер - Manual GPU Shift Strategy */}
        <div className="relative">
          <AnimatePresence 
            initial={false}
            onExitComplete={() => setIsAnimating(false)}
          >
            {isOpen && (
              <motion.div
                onAnimationStart={() => setIsAnimating(true)}
                onAnimationComplete={() => setIsAnimating(false)}
                initial={{ height: 0, opacity: 0 }}
                animate={{ 
                  height: 'auto', 
                  opacity: 1,
                  transition: {
                    height: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
                    opacity: { duration: 0.25, delay: 0.1 }
                  }
                }}
                exit={{ 
                  height: 0, 
                  opacity: 0,
                  transition: {
                    height: { duration: 0.35, ease: [0.4, 0, 1, 1] },
                    opacity: { duration: 0.2 }
                  }
                }}
                className="overflow-hidden transform-gpu"
                style={{ willChange: 'height, opacity' }}
              >
                <div ref={contentRef} className="py-1 pb-6">
                  <TestHabitsCard
                    habits={habits}
                    onToggle={handleHabitToggle}
                    variantName="Pure 60FPS Strategy"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Сдвигаемый контент - теперь с форсированной GPU изоляцией */}
        <div 
          className={cn(
            "space-y-6 transition-opacity duration-300",
            isAnimating && "pointer-events-none opacity-90"
          )}
          style={{ 
            contain: 'layout paint style',
            transform: 'translateZ(0)',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        >
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
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
