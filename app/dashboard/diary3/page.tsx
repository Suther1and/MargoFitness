'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, ChevronLeft, ChevronRight, Settings, Share2, MoreVertical, LayoutGrid, Activity, ChevronDown, ChevronUp } from 'lucide-react'
import { format, addMonths } from 'date-fns'
import { ru } from 'date-fns/locale'
import { WaterCard } from './components/water-card'
import { SleepCard } from './components/sleep-card'
import { WeightCard } from './components/weight-card'
import { MoodEnergyCard } from './components/mood-energy-card'
import { StepsCard } from './components/steps-card'
import { HabitsCard } from './components/habits-card'
import { DiaryCard } from './components/diary-card'
import { AchievementsCard } from './components/achievements-card'
import { MOCK_DATA, DailyMetrics, MoodRating } from './types'
import { WeekNavigator } from '../diary/components/week-navigator'

export default function Diary3Page() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false)
  const [data, setData] = useState<DailyMetrics>(MOCK_DATA)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleToggleHabit = (id: string) => {
    setData(prev => ({
      ...prev,
      habits: prev.habits.map(h => 
        h.id === id ? { ...h, completed: !h.completed } : h
      )
    }))
  }

  const handleMetricUpdate = (metric: keyof DailyMetrics, value: any) => {
    setData(prev => ({
      ...prev,
      [metric]: value
    }))
  }

  const handleMoodUpdate = (val: MoodRating) => {
    handleMetricUpdate('mood', val)
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-amber-500/30 font-sans">
      {/* Subtle Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-8 py-8 md:py-10">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
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
            <h1 className="text-4xl md:text-5xl font-oswald font-bold tracking-tighter uppercase leading-none">
              Мой <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600">Прогресс</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
             <div className="hidden lg:flex items-center gap-6 px-6 py-3 rounded-2xl bg-white/5 border border-white/5 mr-4">
                <div className="flex flex-col">
                    <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Общий прогресс</span>
                    <span className="text-lg font-bold text-green-400 font-oswald leading-none mt-1">74%</span>
                </div>
                <div className="w-12 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-[74%] bg-green-400" />
                </div>
             </div>
             
             <button className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                <Share2 className="w-5 h-5 text-white/40 group-hover:text-white" />
             </button>
             <button className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                <Settings className="w-5 h-5 text-white/40 group-hover:text-white" />
             </button>
          </div>
        </header>

        {/* Main Content - 3 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Column 1: Physical Metrics (Left) */}
          <div className="lg:col-span-3 space-y-5">
            <WaterCard 
                value={data.waterIntake} 
                goal={data.waterGoal} 
                onUpdate={(val) => handleMetricUpdate('waterIntake', val)} 
            />
            <SleepCard 
                hours={data.sleepHours} 
                quality={data.sleepQuality} 
                onUpdate={(val) => handleMetricUpdate('sleepHours', val)} 
                onQualityUpdate={(val) => handleMetricUpdate('sleepQuality', val)}
            />
            <WeightCard 
                value={data.weight} 
                onUpdate={(val) => handleMetricUpdate('weight', val)} 
            />
          </div>

          {/* Column 2: Focus Area (Center) */}
          <div className="lg:col-span-6 space-y-5">
            <StepsCard 
                steps={data.steps} 
                goal={data.stepsGoal} 
                onUpdate={(val) => handleMetricUpdate('steps', val)}
            />
            <HabitsCard 
                habits={data.habits} 
                onToggle={handleToggleHabit} 
            />
          </div>

      {/* Column 3: Navigation & Mental & Achievements (Right) */}
      <div className="lg:col-span-3 space-y-5">
        {/* Calendar Navigator Card - Simplified */}
        <DiaryCard 
            className="p-4" 
            title="Календарь" 
            subtitle={format(selectedDate, 'LLLL', { locale: ru })}
            icon={Calendar} 
            iconColor="text-amber-500" 
            iconBg="bg-amber-500/10"
            rightAction={
                <div className="flex items-center gap-1">
                    {isCalendarExpanded && (
                        <div className="flex items-center gap-0.5 mr-2">
                            <button 
                                onClick={() => setSelectedDate(addMonths(selectedDate, -1))}
                                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                            >
                                <ChevronLeft className="w-3.5 h-3.5 text-white/40" />
                            </button>
                            <button 
                                onClick={() => setSelectedDate(addMonths(selectedDate, 1))}
                                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                            >
                                <ChevronRight className="w-3.5 h-3.5 text-white/40" />
                            </button>
                        </div>
                    )}
                    <button 
                        onClick={() => setIsCalendarExpanded(!isCalendarExpanded)}
                        className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 transition-all group"
                    >
                        <motion.div
                            animate={{ rotate: isCalendarExpanded ? 180 : 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            <ChevronDown className="w-4 h-4 text-white/40 group-hover:text-amber-500 transition-colors" />
                        </motion.div>
                    </button>
                </div>
            }
        >
            <div className="pt-0">
                <div className="w-full">
                    <WeekNavigator 
                        selectedDate={selectedDate} 
                        onDateChange={setSelectedDate} 
                        showDate={false}
                        minimal={true}
                        isExpanded={isCalendarExpanded}
                    />
                </div>
            </div>
        </DiaryCard>

            <MoodEnergyCard 
                mood={data.mood} 
                energy={data.energyLevel} 
                onMoodUpdate={(val) => handleMoodUpdate(val)} 
                onEnergyUpdate={(val) => handleMetricUpdate('energyLevel', val)} 
            />
            
            <AchievementsCard />
          </div>
        </div>

        {/* Simplified Footer */}
        <footer className="mt-8 p-6 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-xs">
                    74%
                </div>
                <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">Цели дня почти выполнены</p>
            </div>
            <button className="px-6 py-3 rounded-xl bg-white text-black font-black hover:bg-amber-400 transition-all text-[10px] uppercase tracking-widest">
                Отчет
            </button>
        </footer>
      </div>
    </div>
  )
}
