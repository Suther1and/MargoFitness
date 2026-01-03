'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Share2, Settings, Activity, ChevronDown } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

// Новые компоненты
import { WaterCardH } from './components/water-card-h'
import { StepsCardH } from './components/steps-card-h'
import { WeightCardH } from './components/weight-card-h'
import { SleepCardH } from './components/sleep-card-h'
import { NutritionCardH } from './components/nutrition-card-h'
import { MoodEnergyCardH } from './components/mood-energy-card-h'
import { CaffeineCardH } from './components/caffeine-card-h'
import { GoalsSummaryCard } from './components/goals-summary-card'
import { NotesCard } from './components/notes-card'
import { DailyPhotosCard } from './components/daily-photos-card'
import { HabitsCard } from './components/habits-card'
import { AchievementsCard } from './components/achievements-card'
import { HealthTrackerCard } from './components/health-tracker-card'
import { WeekNavigator } from './components/week-navigator'

import { MOCK_DATA, DailyMetrics, MoodRating } from './types'

export default function HealthTrackerPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false)
  const [data, setData] = useState<DailyMetrics>(MOCK_DATA)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleMetricUpdate = (metric: keyof DailyMetrics, value: any) => {
    setData(prev => ({ ...prev, [metric]: value }))
  }

  const handleMoodUpdate = (val: MoodRating) => {
    handleMetricUpdate('mood', val)
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-amber-500/30 font-sans pb-20">
      {/* Ambient BG */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-8 py-6 md:py-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
                <div className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[8px] font-black text-amber-500 uppercase tracking-[0.2em]">
                    V3.0 Beta
                </div>
                <div className="h-px w-8 bg-white/10" />
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                    <Activity className="w-3 h-3" />
                    Live Dashboard
                </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-oswald font-bold tracking-tighter uppercase leading-none">
              Мой <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600">Прогресс</span>
            </h1>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-2 md:gap-3">
             {/* Date Navigation & Actions - Mobile */}
             <div className="flex items-center gap-2 flex-1 md:hidden">
                <WeekNavigator 
                  selectedDate={selectedDate} 
                  onDateChange={setSelectedDate} 
                  minimal={true} 
                  isExpanded={isCalendarExpanded}
                  onCalendarClick={() => setIsCalendarExpanded(!isCalendarExpanded)}
                />
                
                <div className="flex items-center gap-2 shrink-0">
                    <button className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                        <Share2 className="w-5 h-5 text-white/40 group-hover:text-white" />
                    </button>
                    <button className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                        <Settings className="w-5 h-5 text-white/40 group-hover:text-white" />
                    </button>
                </div>
             </div>

             {/* Actions - Desktop */}
             <div className="hidden md:flex items-center gap-2">
                <button className="p-3 md:p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                    <Share2 className="w-5 h-5 text-white/40 group-hover:text-white" />
                </button>
                <button className="p-3 md:p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                    <Settings className="w-5 h-5 text-white/40 group-hover:text-white" />
                </button>
             </div>
          </div>
        </header>

        {/* Mobile Calendar Expansion */}
        <motion.div 
          initial={false}
          animate={{ 
            height: isCalendarExpanded ? 'auto' : 0, 
            opacity: isCalendarExpanded ? 1 : 0,
            marginBottom: isCalendarExpanded ? 24 : 0 
          }}
          className="overflow-hidden lg:hidden"
        >
          <div className="p-4 rounded-[2rem] border border-white/5 bg-[#121214]/40 backdrop-blur-xl">
            <WeekNavigator 
              selectedDate={selectedDate} 
              onDateChange={(date) => {
                setSelectedDate(date)
                setIsCalendarExpanded(false)
              }} 
              minimal={true} 
              isExpanded={true} 
            />
          </div>
        </motion.div>

        {/* Main Grid - 12 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Column 1 & 2 (Combined for metrics logic) */}
          <div className="lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1">
            <div className="grid grid-cols-1 gap-6">
                <WaterCardH 
                    value={data.waterIntake} 
                    goal={data.waterGoal} 
                    onUpdate={(val) => handleMetricUpdate('waterIntake', val)} 
                />
                <StepsCardH 
                    steps={data.steps} 
                    goal={data.stepsGoal} 
                    onUpdate={(val) => handleMetricUpdate('steps', val)} 
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <WeightCardH 
                    value={data.weight} 
                    goalWeight={data.weightGoal}
                    onUpdate={(val) => handleMetricUpdate('weight', val)} 
                />
                <CaffeineCardH 
                    value={data.caffeineIntake} 
                    goal={data.caffeineGoal} 
                    onUpdate={(val) => handleMetricUpdate('caffeineIntake', val)} 
                />
                <SleepCardH 
                    hours={data.sleepHours} 
                    goal={data.sleepGoal} 
                    onUpdate={(val) => handleMetricUpdate('sleepHours', val)} 
                />
                <MoodEnergyCardH 
                    mood={data.mood} 
                    energy={data.energyLevel} 
                    onMoodUpdate={(val) => handleMoodUpdate(val)} 
                    onEnergyUpdate={(val) => handleMetricUpdate('energyLevel', val)} 
                />
            </div>
            
            <div className="grid grid-cols-1 gap-4">
                <NutritionCardH 
                    calories={data.calories} 
                    caloriesGoal={data.caloriesGoal}
                    foodQuality={data.foodQuality}
                    weight={data.weight}
                    height={data.height}
                    age={data.age}
                    gender={data.gender}
                    onUpdate={(field, val) => handleMetricUpdate(field as keyof DailyMetrics, val)}
                />
            </div>
          </div>

          {/* Column 3: Focus Area (Habits + Notes) */}
          <div className="lg:col-span-5 flex flex-col gap-6 order-3 lg:order-2">
            <HabitsCard 
                habits={data.habits} 
                onToggle={(id) => {
                    handleMetricUpdate('habits', data.habits.map(h => h.id === id ? {...h, completed: !h.completed} : h))
                }} 
            />
            
            <div className="lg:hidden flex flex-col gap-6">
                <AchievementsCard />
            </div>

            <NotesCard 
                value={data.notes} 
                onUpdate={(val) => handleMetricUpdate('notes', val)} 
            />

            <div className="lg:hidden flex flex-col gap-6">
                <DailyPhotosCard photos={data.dailyPhotos} />
            </div>
          </div>

          {/* Column 4: Info & Progress (Desktop Right) */}
          <div className="lg:col-span-3 space-y-6 order-1 lg:order-3">
            {/* Calendar (Desktop Only) */}
            <div className="hidden lg:block">
                <HealthTrackerCard 
                    className="p-4" 
                    title="Календарь" 
                    subtitle={format(selectedDate, 'LLLL', { locale: ru })}
                    icon={Calendar} iconColor="text-amber-500" iconBg="bg-amber-500/10"
                    rightAction={
                        <button onClick={() => setIsCalendarExpanded(!isCalendarExpanded)} className="p-2">
                            <motion.div animate={{ rotate: isCalendarExpanded ? 180 : 0 }}>
                                <ChevronDown className="w-4 h-4 text-white/40" />
                            </motion.div>
                        </button>
                    }
                >
                    <WeekNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} minimal={true} isExpanded={isCalendarExpanded} />
                </HealthTrackerCard>
            </div>

            <GoalsSummaryCard data={data} />
            
            <div className="hidden lg:flex flex-col gap-6">
                <AchievementsCard />
                <DailyPhotosCard photos={data.dailyPhotos} />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
