'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, ChevronLeft, ChevronRight, Settings, Share2, MoreVertical, LayoutGrid, Activity } from 'lucide-react'
import { WaterCard } from './components/water-card'
import { SleepCard } from './components/sleep-card'
import { WeightCard } from './components/weight-card'
import { MoodEnergyCard } from './components/mood-energy-card'
import { StepsCard } from './components/steps-card'
import { HabitsCard } from './components/habits-card'
import { DiaryCard } from './components/diary-card'
import { MOCK_DATA, DailyMetrics, MoodRating } from './types'
import { WeekNavigator } from '../diary/components/week-navigator'

export default function Diary3Page() {
  const [selectedDate, setSelectedDate] = useState(new Date())
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

        {/* Navigation Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 bg-[#121214]/60 backdrop-blur-md p-4 rounded-[2rem] border border-white/5 shadow-2xl">
           <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 text-black font-bold hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 text-xs uppercase tracking-widest">
                 <Calendar className="w-4 h-4" />
                 Сегодня
              </button>
              <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
                 <button className="p-2.5 rounded-lg hover:bg-white/10 transition-all text-white/40 hover:text-white">
                    <ChevronLeft className="w-4 h-4" />
                 </button>
                 <button className="p-2.5 rounded-lg hover:bg-white/10 transition-all text-white/40 hover:text-white">
                    <ChevronRight className="w-4 h-4" />
                 </button>
              </div>
           </div>
           
           <div className="flex-1 max-w-2xl mx-auto w-full">
            <WeekNavigator 
                selectedDate={selectedDate} 
                onDateChange={setSelectedDate} 
            />
           </div>
           
           <button className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all hidden lg:block">
              <LayoutGrid className="w-5 h-5 text-white/40" />
           </button>
        </div>

        {/* Main Content - 3 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Column 1: Physical Metrics (Left) */}
          <div className="lg:col-span-3 space-y-6">
            <WaterCard 
                value={data.waterIntake} 
                goal={data.waterGoal} 
                onUpdate={(val) => handleMetricUpdate('waterIntake', val)} 
            />
            <SleepCard 
                hours={data.sleepHours} 
                quality={data.sleepQuality} 
                onUpdate={(val) => handleMetricUpdate('sleepHours', val)} 
            />
            <WeightCard 
                value={data.weight} 
                onUpdate={(val) => handleMetricUpdate('weight', val)} 
            />
          </div>

          {/* Column 2: Focus Area (Center) */}
          <div className="lg:col-span-6 space-y-6">
            <StepsCard 
                steps={data.steps} 
                goal={data.stepsGoal} 
            />
            <HabitsCard 
                habits={data.habits} 
                onToggle={handleToggleHabit} 
            />
          </div>

          {/* Column 3: Mental & Insights (Right) */}
          <div className="lg:col-span-3 space-y-6">
            <MoodEnergyCard 
                mood={data.mood} 
                energy={data.energyLevel} 
                onMoodUpdate={(val) => handleMoodUpdate(val)} 
                onEnergyUpdate={(val) => handleMetricUpdate('energyLevel', val)} 
            />
            
            {/* Achievements / Insights Placeholder (Simplified Zone 3) */}
            <DiaryCard title="Инсайты" subtitle="Ваш прогресс" icon={Activity} iconColor="text-blue-400" iconBg="bg-blue-500/10">
                <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">🔥 Стрик</div>
                        <div className="text-xs font-bold text-white/80">7 дней подряд "Креатин 5г"</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-[10px] font-bold text-green-500 uppercase tracking-widest mb-1">🎯 Цель</div>
                        <div className="text-xs font-bold text-white/80">Шаги выполнены на 64%</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/10">
                        <div className="text-sm font-bold text-white mb-1">Отличный темп!</div>
                        <p className="text-[10px] text-white/40 uppercase leading-relaxed">Вы активнее, чем 85% пользователей</p>
                    </div>
                </div>
            </DiaryCard>
          </div>
        </div>

        {/* Footer Insights */}
        <footer className="mt-12 p-10 rounded-[3rem] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-xl">
                    <h3 className="text-2xl font-bold text-white mb-2">Аналитика недели готова</h3>
                    <p className="text-sm text-white/40 leading-relaxed">
                        На этой неделе ваша активность выросла на <span className="text-green-400 font-bold">12.4%</span>. 
                        Вы соблюдаете норму воды 5 дней подряд. Так держать!
                    </p>
                </div>
                <button className="px-10 py-5 rounded-2xl bg-white text-black font-black hover:bg-amber-400 transition-all hover:scale-105 active:scale-95 shadow-2xl text-xs uppercase tracking-widest whitespace-nowrap">
                    Подробный отчет
                </button>
            </div>
        </footer>
      </div>
    </div>
  )
}
