'use client'

import { useState, useEffect, Suspense, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Calendar, Share2, Settings, Activity, ChevronDown, ChevronLeft, Target, ListChecks, X, BarChart3, Home, CalendarDays, Info } from 'lucide-react'
import { format, isSameDay } from 'date-fns'
import { ru } from 'date-fns/locale'
import { cn } from '@/lib/utils'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"

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
  const [settingsSubTab, setSettingsSubTab] = useState<'widgets' | 'habits'>('widgets')
  const [isAnimating, setIsAnimating] = useState(false)
  const [data, setData] = useState<DailyMetrics>(MOCK_DATA)
  const [mounted, setMounted] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const { isFirstVisit, settings, saveSettings } = useTrackerSettings()
  const [isBmiInfoOpen, setIsBmiInfoOpen] = useState(false)

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

  // BMI calculation and handlers
  const handleParamChange = (param: 'height' | 'weight' | 'age', value: string) => {
    const filtered = value.replace(/[^\d.]/g, '').slice(0, 3)
    const newSettings = {
      ...settings,
      userParams: {
        ...settings.userParams,
        [param]: filtered ? parseFloat(filtered) : null,
      }
    }
    saveSettings(newSettings)
  }

  const calculateBMI = () => {
    const { height, weight } = settings.userParams
    if (height && weight) {
      const heightInMeters = height / 100
      const bmi = weight / (heightInMeters * heightInMeters)
      return bmi.toFixed(1)
    }
    return null
  }

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Дефицит веса', color: 'text-blue-400', description: 'Твой вес ниже нормы.' }
    if (bmi < 25) return { label: 'Норма', color: 'text-green-400', description: 'Идеальный диапазон для твоего роста.' }
    if (bmi < 30) return { label: 'Лишний вес', color: 'text-amber-400', description: 'Вес немного выше нормы.' }
    return { label: 'Ожирение', color: 'text-red-400', description: 'ИМТ указывает на избыточный вес.' }
  }

  const bmiValue = calculateBMI()
  const bmiCategory = bmiValue ? getBMICategory(parseFloat(bmiValue)) : null

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

            <header className="mb-8 md:mb-12">
              {/* Mobile: Dialog календарь с анимированным заголовком */}
              <div className="flex flex-col lg:hidden">
                <Dialog open={isCalendarExpanded} onOpenChange={setIsCalendarExpanded}>
                  <DialogTrigger asChild>
                    <button className="flex items-center gap-1.5 group w-fit active:opacity-70 transition-all mb-1">
                      <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-white/90">
                        {format(selectedDate, 'EEEE, d MMMM', { locale: ru })}
                      </span>
                      <ChevronDown className={cn("w-3.5 h-3.5 text-white/20 group-hover:text-white/40 transition-transform", isCalendarExpanded && "rotate-180")} />
                    </button>
                  </DialogTrigger>
                  <DialogContent variant="bottom" className="p-0 overflow-hidden bg-[#121214]/95 backdrop-blur-2xl border-white/10 sm:max-w-md sm:mx-auto sm:rounded-[2.5rem] sm:bottom-6 rounded-t-[3rem] border-t border-x border-white/10">
                    <DialogHeader className="p-6 pb-2 border-b border-white/5">
                      <DialogTitle className="text-xl font-oswald font-black uppercase tracking-wider text-center flex items-center justify-center gap-3">
                        <Calendar className="w-5 h-5 text-amber-500" />
                        Выберите дату
                      </DialogTitle>
                    </DialogHeader>
                    <div className="p-4 pb-8">
                      <WeekNavigator 
                        selectedDate={selectedDate} 
                        onDateChange={(date) => {
                          setSelectedDate(date);
                          setIsCalendarExpanded(false);
                        }} 
                        minimal={true} 
                        isExpanded={true} 
                      />
                    </div>
                  </DialogContent>
                </Dialog>

                <div className="h-[40px] md:h-[60px] flex items-center relative overflow-hidden">
                  <AnimatePresence mode="popLayout">
                    <motion.h1 
                      key={activeTab}
                      initial={{ opacity: 0, y: 25 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -25 }}
                      transition={{ 
                        duration: 0.85,
                        ease: [0.22, 1, 0.36, 1] 
                      }}
                      className="text-4xl md:text-6xl font-oswald font-black uppercase tracking-tighter whitespace-nowrap leading-none absolute inset-0 flex items-center"
                    >
                      {activeTab === 'overview' && (
                        <>Мой <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600">Прогресс</span></>
                      )}
                      {activeTab === 'stats' && (
                        <>Моя <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-300 via-blue-500 to-slate-400">Статистика</span></>
                      )}
                      {activeTab === 'habits' && (
                        <>Мои <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-500 to-amber-500">Привычки</span></>
                      )}
                      {activeTab === 'goals' && (
                        <>Мои <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-emerald-500 to-emerald-400">Цели</span></>
                      )}
                      {activeTab === 'settings' && (
                        <>Настройки <span className={cn(
                          "text-transparent bg-clip-text bg-gradient-to-r transition-all duration-500",
                          settingsSubTab === 'widgets' ? "from-green-400 to-emerald-600" : "from-amber-400 to-orange-600"
                        )}>трекера</span></>
                      )}
                    </motion.h1>
                  </AnimatePresence>
                </div>
              </div>

              {/* Desktop: Простой статичный заголовок с кнопками */}
              <div className="hidden lg:flex items-center justify-between max-w-[1600px] mx-auto w-full">
                {activeTab === 'settings' ? (
                  /* Settings Header */
                  <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
                    <div className="space-y-1">
                      <motion.button 
                        whileHover={{ x: -4 }}
                        onClick={() => setActiveTab('overview')}
                        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group mb-3"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Назад к трекеру</span>
                      </motion.button>
                      <h1 className="text-2xl md:text-5xl font-oswald font-bold tracking-tighter uppercase leading-none">
                        Настройки <span className={cn(
                          "text-transparent bg-clip-text bg-gradient-to-r transition-all duration-500",
                          settingsSubTab === 'widgets' ? "from-green-400 to-emerald-600" : "from-amber-400 to-orange-600"
                        )}>трекера</span>
                      </h1>
                    </div>

                    {/* BMI Panel on Desktop */}
                    <div className="flex items-stretch bg-white/[0.03] rounded-xl border border-white/10 backdrop-blur-md overflow-hidden shadow-2xl h-[60px] min-w-[420px]">
                      <div className="flex items-center p-0.5 border-r border-white/5 bg-white/[0.02] flex-1">
                        <div className="flex flex-col px-4 py-1 border-r border-white/5 w-[100px]">
                          <label className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-0.5">Рост</label>
                          <div className="flex items-baseline gap-0.5">
                            <input
                              type="text"
                              inputMode="decimal"
                              placeholder="---"
                              value={settings.userParams.height ?? ''}
                              onChange={(e) => handleParamChange('height', e.target.value)}
                              className="w-full bg-transparent text-[28px] font-oswald font-black text-white focus:outline-none placeholder:text-white/5 leading-none"
                            />
                            <span className="text-[9px] font-bold text-white/10 uppercase shrink-0">см</span>
                          </div>
                        </div>
                        <div className="flex flex-col px-4 py-1 border-r border-white/5 w-[100px]">
                          <label className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-0.5">Вес</label>
                          <div className="flex items-baseline gap-0.5">
                            <input
                              type="text"
                              inputMode="decimal"
                              placeholder="---"
                              value={settings.userParams.weight ?? ''}
                              onChange={(e) => handleParamChange('weight', e.target.value)}
                              className="w-full bg-transparent text-[28px] font-oswald font-black text-white focus:outline-none placeholder:text-white/5 leading-none"
                            />
                            <span className="text-[9px] font-bold text-white/10 uppercase shrink-0">кг</span>
                          </div>
                        </div>
                        <div className="flex flex-col px-4 py-1 w-[100px]">
                          <label className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-0.5">Возраст</label>
                          <div className="flex items-baseline gap-0.5">
                            <input
                              type="text"
                              inputMode="numeric"
                              placeholder="--"
                              value={settings.userParams.age ?? ''}
                              onChange={(e) => handleParamChange('age', e.target.value)}
                              className="w-full bg-transparent text-[28px] font-oswald font-black text-white focus:outline-none placeholder:text-white/5 leading-none"
                            />
                            <span className="text-[9px] font-bold text-white/10 uppercase shrink-0">лет</span>
                          </div>
                        </div>
                      </div>

                      <div className={cn(
                        "px-4 py-1.5 flex flex-col transition-all duration-500 w-[115px] relative",
                        bmiValue ? "bg-white/[0.05]" : "bg-transparent"
                      )}>
                        {bmiValue ? (
                          <>
                            <span className="text-[7px] font-black text-white/30 uppercase tracking-[0.2em] mb-0.5 whitespace-nowrap">Твой ИМТ</span>
                            <div className="flex items-center mt-auto pb-0.5">
                              <div className="flex items-center gap-1">
                                <span className="text-[34px] font-oswald font-black text-white leading-none tracking-tighter">
                                  {bmiValue}
                                </span>
                                <div className={cn("w-2 h-2 rounded-full animate-pulse mt-1", 
                                  bmiCategory?.color === 'text-blue-400' && 'bg-blue-400',
                                  bmiCategory?.color === 'text-green-400' && 'bg-green-400',
                                  bmiCategory?.color === 'text-amber-400' && 'bg-amber-400',
                                  bmiCategory?.color === 'text-red-400' && 'bg-red-400'
                                )} />
                              </div>
                            </div>
                            <div className="absolute right-0 top-0">
                              <Dialog open={isBmiInfoOpen} onOpenChange={setIsBmiInfoOpen}>
                                <DialogTrigger asChild>
                                  <button className="p-2 text-white/40 hover:text-white transition-all focus:outline-none">
                                    <Info className="w-4 h-4" />
                                  </button>
                                </DialogTrigger>
                                <DialogContent className="bg-zinc-900/95 border-white/10 text-white rounded-2xl max-w-sm backdrop-blur-xl">
                                  <DialogHeader>
                                    <DialogTitle className="font-oswald font-black text-2xl uppercase tracking-tight">Что такое ИМТ?</DialogTitle>
                                    <DialogDescription className="text-white/60 text-sm pt-2 font-medium">
                                      Индекс массы тела (ИМТ) — оценка соответствия массы человека его росту.
                                      <br /><br />
                                      Формула: вес (кг) / рост² (м).
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                                    <div className="flex justify-between items-baseline">
                                      <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Результат</span>
                                      <span className={cn("text-2xl font-oswald font-black", bmiCategory?.color)}>{bmiValue}</span>
                                    </div>
                                    <div className={cn("text-xs font-bold uppercase tracking-wider", bmiCategory?.color)}>
                                      {bmiCategory?.label}
                                    </div>
                                    <p className="text-xs text-white/40 leading-relaxed font-medium">
                                      {bmiCategory?.description}
                                    </p>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest leading-tight text-center">Заполни данные</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Overview Header */
                  <>
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

                    {/* Desktop Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button 
                        className="p-3 md:p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
                      >
                        <BarChart3 className="w-5 h-5 text-white/40 group-hover:text-white" />
                      </button>
                      <button 
                        onClick={() => setActiveTab('settings')}
                        className="p-3 md:p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
                      >
                        <Settings className="w-5 h-5 text-white/40 group-hover:text-white" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </header>

            <AnimatePresence 
              mode="wait"
              onExitComplete={() => {
                window.scrollTo(0, 0)
                setIsAnimating(false)
              }}
            >
              <motion.div
                key={activeTab === 'settings' ? 'settings' : 'content'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="w-full"
              >
                {isFirstVisit && !dismissed && activeTab !== 'settings' && (
                  <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 mb-6">
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

                <div className="lg:hidden mb-24">
                  <AnimatePresence 
                    mode="wait"
                    onExitComplete={() => window.scrollTo(0, 0)}
                  >
                    {activeTab === 'settings' && (
                      <motion.div 
                        key="settings-mobile" 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0 }} 
                        transition={{ duration: 0.2 }}
                      >
                        <SettingsTab 
                          onBack={() => setActiveTab('overview')} 
                          selectedDate={selectedDate}
                          onDateChange={setSelectedDate}
                          isCalendarExpanded={isCalendarExpanded}
                          setIsCalendarExpanded={setIsCalendarExpanded}
                          activeSubTab={settingsSubTab}
                          setActiveSubTab={setSettingsSubTab}
                        />
                      </motion.div>
                    )}
                    {activeTab === 'goals' && (
                      <motion.div 
                        key="goals-mobile" 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0 }} 
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex flex-col gap-6">
                          <GoalsSummaryCard data={data} />
                          <AchievementsCard />
                          <DailyPhotosCard photos={data.dailyPhotos} />
                        </div>
                      </motion.div>
                    )}
                    {activeTab === 'habits' && (
                      <motion.div 
                        key="habits-mobile" 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0 }} 
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex flex-col gap-6">
                          <HabitsCard habits={data.habits} onToggle={(id) => handleMetricUpdate('habits', data.habits.map(h => h.id === id ? {...h, completed: !h.completed} : h))} />
                          <NotesCard value={data.notes} onUpdate={(val) => handleMetricUpdate('notes', val)} />
                        </div>
                      </motion.div>
                    )}
                    {activeTab === 'stats' && (
                      <motion.div 
                        key="stats-mobile" 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0 }} 
                        transition={{ duration: 0.2 }}
                      >
                        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8 bg-white/5 rounded-[2.5rem] border border-white/5">
                          <BarChart3 className="w-12 h-12 text-amber-500/40 mb-4" />
                          <h3 className="text-xl font-bold text-white mb-2">Статистика скоро</h3>
                          <p className="text-white/40 text-sm">Мы работаем над детальными графиками вашего прогресса</p>
                        </div>
                      </motion.div>
                    )}
                    {activeTab === 'overview' && (
                      <motion.div 
                        key="overview-mobile" 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0 }} 
                        transition={{ duration: 0.2 }}
                      >
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
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Desktop Settings - Limited Width Container */}
                {activeTab === 'settings' && (
                  <div className="hidden lg:block max-w-5xl mx-auto">
                    <SettingsTab 
                      onBack={() => setActiveTab('overview')} 
                      selectedDate={selectedDate}
                      onDateChange={setSelectedDate}
                      isCalendarExpanded={isCalendarExpanded}
                      setIsCalendarExpanded={setIsCalendarExpanded}
                      activeSubTab={settingsSubTab}
                      setActiveSubTab={setSettingsSubTab}
                    />
                  </div>
                )}

                <div className={cn(
                  "hidden lg:grid grid-cols-12 gap-6 items-start main-grid-container",
                  activeTab === 'settings' && "lg:hidden"
                )} style={{ contain: 'layout paint' }}>
                  <div className="lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1">
                    <WaterCardH value={data.waterIntake} goal={data.waterGoal} onUpdate={(val) => handleMetricUpdate('waterIntake', val)} />
                    <StepsCardH steps={data.steps} goal={data.stepsGoal} onUpdate={(val) => handleMetricUpdate('steps', val)} />
                    <div className="grid grid-cols-2 gap-4">
                      <WeightCardH value={data.weight} goalWeight={data.weightGoal} onUpdate={(val) => handleMetricUpdate('weight', val)} />
                      <CaffeineCardH value={data.caffeineIntake} goal={data.caffeineGoal} onUpdate={(val) => handleMetricUpdate('caffeineIntake', val)} />
                      <SleepCardH hours={data.sleepHours} goal={data.sleepGoal} onUpdate={(val) => handleMetricUpdate('sleepHours', val)} />
                      <MoodEnergyCardH mood={data.mood} energy={data.energyLevel} onMoodUpdate={(val) => handleMoodUpdate(val)} onEnergyUpdate={(val) => handleMetricUpdate('energyLevel', val)} />
                    </div>
                    <NutritionCardH calories={data.calories} caloriesGoal={data.caloriesGoal} foodQuality={data.foodQuality} weight={data.weight} height={data.height} age={data.age} gender={data.gender} onUpdate={(field, val) => handleMetricUpdate(field as keyof DailyMetrics, val)} />
                  </div>

                  <div className="lg:col-span-5 flex flex-col gap-6 order-3 lg:order-2">
                    <HabitsCard habits={data.habits} onToggle={(id) => handleMetricUpdate('habits', data.habits.map(h => h.id === id ? {...h, completed: !h.completed} : h))} />
                    <NotesCard value={data.notes} onUpdate={(val) => handleMetricUpdate('notes', val)} />
                  </div>

                  <div className="lg:col-span-3 space-y-6 order-1 lg:order-3">
                    <HealthTrackerCard 
                      className="p-4" 
                      title="Календарь" 
                      subtitle={format(selectedDate, 'LLLL', { locale: ru })} 
                      icon={Calendar} 
                      iconColor="text-amber-500" 
                      iconBg="bg-amber-500/10"
                      rightAction={
                        <button onClick={() => setIsCalendarExpanded(!isCalendarExpanded)} className="p-2">
                          <motion.div animate={{ rotate: isCalendarExpanded ? 180 : 0 }}>
                            <ChevronDown className="w-4 h-4 text-white/40" />
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

                    <GoalsSummaryCard data={data} />
                    <AchievementsCard />
                    <DailyPhotosCard photos={data.dailyPhotos} />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

          </div>
        )}
      </motion.div>

      {/* Mobile Bottom Navigation - Stable UI */}
      <div className="lg:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md mobile-nav-container">
        <div className="flex items-center justify-around p-2 rounded-[2rem] border border-white/10 bg-[#121214]/60 backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] h-[60px]">
          <button onClick={() => setActiveTab('overview')} className={cn("flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300", activeTab === 'overview' ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30" : "text-white/40")}>
            <Home className="w-5 h-5" />
          </button>
          <button onClick={() => setActiveTab('stats')} className={cn("flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300", activeTab === 'stats' ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30" : "text-white/40")}>
            <BarChart3 className="w-5 h-5" />
          </button>
          <button onClick={() => setActiveTab('habits')} className={cn("flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300", activeTab === 'habits' ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30" : "text-white/40")}>
            <ListChecks className="w-5 h-5" />
          </button>
          <button onClick={() => setActiveTab('goals')} className={cn("flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300", activeTab === 'goals' ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30" : "text-white/40")}>
            <Target className="w-5 h-5" />
          </button>
          <button onClick={() => setActiveTab('settings')} className={cn("flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300", activeTab === 'settings' ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30" : "text-white/40")}>
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
