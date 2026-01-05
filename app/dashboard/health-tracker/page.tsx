'use client'

import { useState, useEffect, Suspense, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Calendar, Share2, Settings, Activity, ChevronDown, Target, ListChecks, X, BarChart3, Home } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { cn } from '@/lib/utils'

// Ленивая загрузка тяжелых вкладок
const SettingsTab = dynamic(() => import('./components/settings-tab'), {
  loading: () => <div className="min-h-[50vh] flex items-center justify-center"><Activity className="w-8 h-8 text-amber-500 animate-spin" /></div>
})

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
import { useTrackerSettings } from './hooks/use-tracker-settings'

export default function HealthTrackerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#09090b]" />}>
      <HealthTrackerContent />
    </Suspense>
  )
}

function HealthTrackerContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'habits' | 'goals' | 'settings'>(
    (tabParam as any) || 'overview'
  )
  const [isAnimating, setIsAnimating] = useState(false)
  const [data, setData] = useState<DailyMetrics>(MOCK_DATA)
  const [mounted, setMounted] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const { isFirstVisit } = useTrackerSettings()

  useEffect(() => {
    setMounted(true)
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  useEffect(() => {
    if (tabParam && ['overview', 'stats', 'habits', 'goals', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam as any)
    }
  }, [tabParam])

  const handleMetricUpdate = (metric: keyof DailyMetrics, value: any) => {
    setData(prev => ({ ...prev, [metric]: value }))
  }

  const handleMoodUpdate = (val: MoodRating) => {
    handleMetricUpdate('mood', val)
  }

  return (
    <div className={cn(
      "min-h-screen bg-[#09090b] text-white selection:bg-amber-500/30 font-sans pb-32 md:pb-20",
      isAnimating && "is-animating"
    )}>
      <style jsx global>{`
        @media (max-width: 767px) {
          .is-animating *:not(.mobile-nav-container):not(.mobile-nav-container *) {
            box-shadow: none !important;
            text-shadow: none !important;
            filter: none !important;
            backdrop-filter: none !important;
          }
          
          .is-animating .main-grid-container {
            opacity: 0.9 !important;
            pointer-events: none !important;
            will-change: transform !important;
          }
        }
      `}</style>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={mounted ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {mounted && (
          <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-8 py-6 md:py-8">
            {/* Ambient BG - Desktop only */}
            <div className="hidden md:block fixed inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[120px]" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]" />
            </div>

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-10">
              <div className="flex items-center justify-between w-full md:w-auto">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 mb-2">
                      <div className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[8px] font-black text-amber-500 uppercase tracking-[0.2em]">
                          V3.0 Beta
                      </div>
                      <div className="h-px w-8 bg-white/10" />
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                          <Activity className="w-3 h-3" />
                          Live
                      </span>
                  </div>
                  <h1 className="text-2xl md:text-5xl font-oswald font-bold tracking-tighter uppercase leading-none">
                    Мой <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600">Прогресс</span>
                  </h1>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-2 md:gap-3">
                <div className="flex items-center gap-2 flex-1 md:hidden">
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-1.5 flex items-center gap-2 flex-1">
                      <WeekNavigator 
                        selectedDate={selectedDate} 
                        onDateChange={setSelectedDate} 
                        minimal={true} 
                        isExpanded={isCalendarExpanded}
                        disableViewSwitch={true}
                        daysCount={1}
                        onCalendarClick={() => setIsCalendarExpanded(!isCalendarExpanded)}
                      />
                      <div className="flex-1 px-1">
                        <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest leading-none mb-1">
                          {format(selectedDate, 'EEEE', { locale: ru })}
                        </div>
                        <div className="text-sm font-bold text-white leading-none">
                          {format(selectedDate, 'd MMMM', { locale: ru })}
                        </div>
                      </div>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-2">
                    <button className="p-3 md:p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                        <Share2 className="w-5 h-5 text-white/40 group-hover:text-white" />
                    </button>
                    <button 
                      onClick={() => setActiveTab('settings')}
                      className={cn(
                        "p-3 md:p-4 rounded-2xl border transition-all group",
                        activeTab === 'settings' 
                          ? "bg-amber-500 border-amber-500 text-black" 
                          : "bg-white/5 border-white/5 hover:bg-white/10 text-white/40 hover:text-white"
                      )}
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
              </div>
            </header>

            {isFirstVisit && !dismissed && activeTab !== 'settings' && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-8 mt-6">
                <div className="p-4 md:p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 md:backdrop-blur-xl">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1 text-lg">Настрой виджеты для отслеживания</h3>
                      <p className="text-sm text-white/60">Выбери метрики здоровья, которые хочешь контролировать</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setActiveTab('settings')}
                        className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-medium transition-all active:scale-95 whitespace-nowrap"
                      >
                        Настроить
                      </button>
                      <button onClick={() => setDismissed(true)} className="p-2 text-white/40 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <AnimatePresence initial={false} onExitComplete={() => setIsAnimating(false)}>
              {isCalendarExpanded && (
                <motion.div 
                  key="mobile-calendar"
                  onAnimationStart={() => setIsAnimating(true)}
                  onAnimationComplete={() => setIsAnimating(false)}
                  initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                  animate={{ height: 'auto', opacity: 1, marginBottom: 24 }}
                  exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                  className="overflow-hidden lg:hidden"
                >
                  <div className="p-4 rounded-[2rem] border border-white/5 bg-[#121214]/95 md:bg-[#121214]/40 md:backdrop-blur-xl">
                    <WeekNavigator selectedDate={selectedDate} onDateChange={(date) => { setSelectedDate(date); setIsCalendarExpanded(false); }} minimal={true} isExpanded={true} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence 
              mode="wait"
              onExitComplete={() => {
                window.scrollTo(0, 0)
                setIsAnimating(false)
              }}
            >
              {activeTab === 'goals' && (
                <motion.div key="goals" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="lg:hidden mb-24">
                  <GoalsSummaryCard data={data} />
                </motion.div>
              )}

              {activeTab === 'habits' && (
                <motion.div key="habits" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="lg:hidden mb-24">
                  <HabitsCard habits={data.habits} onToggle={(id) => handleMetricUpdate('habits', data.habits.map(h => h.id === id ? {...h, completed: !h.completed} : h))} />
                </motion.div>
              )}

              {activeTab === 'stats' && (
                <motion.div key="stats" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="lg:hidden mb-24 min-h-[50vh] flex flex-col items-center justify-center text-center p-8 bg-white/5 rounded-[2.5rem] border border-white/5">
                  <BarChart3 className="w-12 h-12 text-amber-500/40 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Статистика скоро</h3>
                  <p className="text-white/40 text-sm">Мы работаем над детальными графиками вашего прогресса</p>
                </motion.div>
              )}

              {activeTab === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="lg:hidden mb-24">
                  <div className="flex flex-col gap-6">
                    <WaterCardH value={data.waterIntake} goal={data.waterGoal} onUpdate={(val) => handleMetricUpdate('waterIntake', val)} />
                    <StepsCardH steps={data.steps} goal={data.stepsGoal} onUpdate={(val) => handleMetricUpdate('steps', val)} />
                    <div className="grid grid-cols-2 gap-4">
                        <WeightCardH value={data.weight} goalWeight={data.weightGoal} onUpdate={(val) => handleMetricUpdate('weight', val)} />
                        <CaffeineCardH value={data.caffeineIntake} goal={data.caffeineGoal} onUpdate={(val) => handleMetricUpdate('caffeineIntake', val)} />
                        <SleepCardH hours={data.sleepHours} goal={data.sleepGoal} onUpdate={(val) => handleMetricUpdate('sleepHours', val)} />
                        <MoodEnergyCardH mood={data.mood} energy={data.energyLevel} onMoodUpdate={(val) => handleMoodUpdate(val)} onEnergyUpdate={(val) => handleMetricUpdate('energyLevel', val)} />
                    </div>
                    <NutritionCardH calories={data.calories} caloriesGoal={data.caloriesGoal} foodQuality={data.foodQuality} weight={data.weight} height={data.height} age={data.age} gender={data.gender} onUpdate={(field, val) => handleMetricUpdate(field as keyof DailyMetrics, val)} />
                    <AchievementsCard />
                    <NotesCard value={data.notes} onUpdate={(val) => handleMetricUpdate('notes', val)} />
                    <DailyPhotosCard photos={data.dailyPhotos} />
                  </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="mb-24">
                  <SettingsTab onBack={() => setActiveTab('overview')} />
                </motion.div>
              )}
            </AnimatePresence>

            {activeTab !== 'settings' && (
              <LayoutGroup id="tracker-layout">
                <div className="hidden lg:grid grid-cols-12 gap-6 items-start main-grid-container" style={{ contain: 'layout paint' }}>
                  <motion.div layout className="lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1">
                    <WaterCardH value={data.waterIntake} goal={data.waterGoal} onUpdate={(val) => handleMetricUpdate('waterIntake', val)} />
                    <StepsCardH steps={data.steps} goal={data.stepsGoal} onUpdate={(val) => handleMetricUpdate('steps', val)} />
                    <div className="grid grid-cols-2 gap-4">
                        <WeightCardH value={data.weight} goalWeight={data.weightGoal} onUpdate={(val) => handleMetricUpdate('weight', val)} />
                        <CaffeineCardH value={data.caffeineIntake} goal={data.caffeineGoal} onUpdate={(val) => handleMetricUpdate('caffeineIntake', val)} />
                        <SleepCardH hours={data.sleepHours} goal={data.sleepGoal} onUpdate={(val) => handleMetricUpdate('sleepHours', val)} />
                        <MoodEnergyCardH mood={data.mood} energy={data.energyLevel} onMoodUpdate={(val) => handleMoodUpdate(val)} onEnergyUpdate={(val) => handleMetricUpdate('energyLevel', val)} />
                    </div>
                    <NutritionCardH calories={data.calories} caloriesGoal={data.caloriesGoal} foodQuality={data.foodQuality} weight={data.weight} height={data.height} age={data.age} gender={data.gender} onUpdate={(field, val) => handleMetricUpdate(field as keyof DailyMetrics, val)} />
                  </motion.div>

                  <motion.div layout className="lg:col-span-5 flex flex-col gap-6 order-3 lg:order-2">
                    <div className="hidden lg:block"><HabitsCard habits={data.habits} onToggle={(id) => handleMetricUpdate('habits', data.habits.map(h => h.id === id ? {...h, completed: !h.completed} : h))} /></div>
                    <AchievementsCard />
                    <NotesCard value={data.notes} onUpdate={(val) => handleMetricUpdate('notes', val)} />
                    <DailyPhotosCard photos={data.dailyPhotos} />
                  </motion.div>

                  <motion.div layout className="lg:col-span-3 space-y-6 order-1 lg:order-3">
                    <div className="hidden lg:block">
                        <HealthTrackerCard 
                          className="p-4" 
                          title="Календарь" 
                          subtitle={format(selectedDate, 'LLLL', { locale: ru })} 
                          icon={Calendar} 
                          iconColor="text-amber-500" 
                          iconBg="bg-amber-500/10"
                          rightAction={
                            <button 
                              onClick={() => setIsCalendarExpanded(!isCalendarExpanded)}
                              className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                            >
                              <motion.div
                                animate={{ rotate: isCalendarExpanded ? 180 : 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                              >
                                <ChevronDown className="w-4 h-4 text-white/40 group-hover:text-white" />
                              </motion.div>
                            </button>
                          }
                        >
                            <WeekNavigator 
                              selectedDate={selectedDate} 
                              onDateChange={setSelectedDate} 
                              minimal={true} 
                              isExpanded={isCalendarExpanded} 
                            />
                        </HealthTrackerCard>
                    </div>
                    <div className="hidden lg:block"><GoalsSummaryCard data={data} /></div>
                  </motion.div>
                </div>
              </LayoutGroup>
            )}
          </div>
        )}
      </motion.div>

      {/* Mobile Bottom Navigation - Stable UI */}
      <div className="lg:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md mobile-nav-container">
        <div className="flex items-center justify-around p-1.5 rounded-full border border-white/10 bg-[#121214]/60 backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <button onClick={() => setActiveTab('overview')} className={cn("flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300", activeTab === 'overview' ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30" : "text-white/40")}>
            <Home className="w-5 h-5" />
          </button>
          <button onClick={() => setActiveTab('stats')} className={cn("flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300", activeTab === 'stats' ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30" : "text-white/40")}>
            <BarChart3 className="w-5 h-5" />
          </button>
          <button onClick={() => setActiveTab('habits')} className={cn("flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300", activeTab === 'habits' ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30" : "text-white/40")}>
            <ListChecks className="w-5 h-5" />
          </button>
          <button onClick={() => setActiveTab('goals')} className={cn("flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300", activeTab === 'goals' ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30" : "text-white/40")}>
            <Target className="w-5 h-5" />
          </button>
          <button onClick={() => setActiveTab('settings')} className={cn("flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300", activeTab === 'settings' ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30" : "text-white/40")}>
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
