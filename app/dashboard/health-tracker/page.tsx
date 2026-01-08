'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { Calendar, Settings, Activity, ChevronDown, ChevronLeft, Target, ListChecks, X, BarChart3, Home } from 'lucide-react'
import { format, subDays, differenceInDays } from 'date-fns'
import { ru } from 'date-fns/locale'
import { cn } from '@/lib/utils'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Импорт напрямую - убираем ленивую загрузку для лучшей производительности
import SettingsTab from './components/settings-tab'

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
import StatsTab from './components/stats-tab'
import { AchievementUnlockedToast, useAchievementNotifications } from './components/achievement-unlocked-toast'

import { MOCK_DATA, DailyMetrics, MoodRating, PeriodType, DateRange } from './types'
import { useTrackerSettings } from './hooks/use-tracker-settings'
import { useHabits } from './hooks/use-habits'
import { useStatsDateRange } from './hooks/use-stats-date-range'
import { useHealthDiary } from './hooks/use-health-diary'
import { usePrefetchStats } from './hooks/use-prefetch-stats'
import { getStatsPeriodLabel } from './utils/date-formatters'
import { hasActiveMainWidgets } from './utils/widget-helpers'
import { StatsDatePickerDialog } from './components/stats-date-picker-dialog'
import { checkAndUnlockAchievements } from '@/lib/actions/achievements'
import { createClient } from '@/lib/supabase/client'

/**
 * Health Tracker - главная страница отслеживания здоровья
 * 
 * Комплексное приложение для мониторинга различных метрик здоровья:
 * - Вода, шаги, вес, сон, кофеин, настроение, питание
 * - Система привычек с трекингом
 * - Статистика за произвольные периоды
 * - Достижения и мотивация
 * - Фото-прогресс и заметки
 * 
 * @features
 * - Полностью адаптивный дизайн (мобильный/десктопный)
 * - Настраиваемые виджеты метрик
 * - Анимации и переходы на Framer Motion
 * - Offline-first с localStorage
 * - Готов к интеграции с Supabase
 * 
 * @architecture
 * - Разделение UI: мобильный/десктопный рендеринг (намеренно)
 * - State management: React hooks + custom hooks
 * - Data layer: готов к async/await Supabase queries
 * - Shared components: переиспользуемые UI элементы
 */

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

  // Получаем userId один раз для всех хуков
  const [userId, setUserId] = useState<string | null>(null)
  
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id)
    })
  }, [])

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  
  // State для статистики (объединен в хук)
  const { 
    periodType: statsPeriodType, 
    dateRange: statsDateRange, 
    isDialogOpen: isStatsPeriodOpen,
    openDialog: openStatsPeriodDialog,
    closeDialog: closeStatsPeriodDialog,
    setPeriod: handleStatsPeriodSelect 
  } = useStatsDateRange()

  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'habits' | 'goals' | 'settings'>(
    (tabParam as any) || 'overview'
  )
  const [settingsSubTab, setSettingsSubTab] = useState<'widgets' | 'habits'>('widgets')
  const [mounted, setMounted] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  // Все хуки получают userId и загружаются параллельно
  const { settings, isFirstVisit, isLoaded: isSettingsLoaded } = useTrackerSettings(userId)
  const { habits, isLoaded: isHabitsLoaded } = useHabits(userId)
  const { currentAchievement, showAchievement, clearCurrent } = useAchievementNotifications()
  
  // Интеграция с Supabase через useHealthDiary
  const { 
    metrics, 
    notes, 
    habitsCompleted,
    isLoading: isDiaryLoading,
    saveStatus,
    updateMetric,
    updateNotes,
    toggleHabit: toggleHabitCompleted,
    forceSave
  } = useHealthDiary({ userId, selectedDate })
  
  // Фоновая предзагрузка данных статистики - стартует параллельно
  usePrefetchStats({
    userId,
    dateRange: statsDateRange,
    enabled: !!userId, // Только проверка userId
    settings,
    habits
  })
  
  // Объединяем данные из БД с настройками для отображения
  const data: DailyMetrics = {
    date: selectedDate,
    // Metrics from DB
    waterIntake: metrics.waterIntake || 0,
    steps: metrics.steps || 0,
    weight: metrics.weight || 0,
    sleepHours: metrics.sleepHours || 0,
    caffeineIntake: metrics.caffeineIntake || 0,
    calories: metrics.calories || 0,
    mood: metrics.mood || null,
    energyLevel: metrics.energyLevel || 0,
    foodQuality: metrics.foodQuality || null,
    
    // Goals from settings
    waterGoal: settings.widgets.water.goal || 2500,
    stepsGoal: settings.widgets.steps.goal || 10000,
    weightGoal: settings.widgets.weight.goal || null,
    sleepGoal: settings.widgets.sleep.goal || 8,
    caffeineGoal: settings.widgets.caffeine.goal || 3,
    caloriesGoal: settings.widgets.nutrition.goal || 2000,
    
    // User params from settings
    height: settings.userParams.height || 170,
    age: settings.userParams.age || 25,
    gender: settings.userParams.gender || 'female',
    
    // Notes
    notes: notes || '',
    
    // Habits - объединяем данные привычек с их статусом выполнения
    habits: habits.filter(h => h.enabled).map(habit => ({
      id: habit.id,
      title: habit.title,
      completed: habitsCompleted[habit.id] || false,
      streak: habit.streak,
      category: habit.time as "morning" | "afternoon" | "evening" | "anytime"
    })),
    
    // Placeholder для фото
    dailyPhotos: [],
  }

  // Проверка наличия активных виджетов (только основные метрики здоровья из левой колонки)
  const hasMainWidgets = hasActiveMainWidgets(settings)

  // Фоновая проверка достижений при загрузке страницы
  useEffect(() => {
    async function checkAchievements() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) return

        const result = await checkAndUnlockAchievements(user.id)
        
        if (result.success && result.newAchievements && result.newAchievements.length > 0) {
          // Показываем уведомления о новых достижениях
          result.newAchievements.forEach(achievement => {
            showAchievement(achievement)
          })
        }
      } catch (err) {
        console.error('Error checking achievements on load:', err)
      }
    }

    if (mounted) {
      checkAchievements()
    }
  }, [mounted])

  // Detect desktop
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024)
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

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
    // Проверяем, является ли это метрикой из БД или локальным состоянием
    if (metric === 'habits') {
      // Для привычек используем специальную логику
      const updatedHabits = value as typeof data.habits
      updatedHabits.forEach(habit => {
        if (habit.completed !== habitsCompleted[habit.id]) {
          toggleHabitCompleted(habit.id, habit.completed)
        }
      })
    } else if (metric === 'notes') {
      updateNotes(value)
    } else {
      // Для всех остальных метрик
      updateMetric(metric, value)
    }
  }

  const handleMoodUpdate = (val: MoodRating) => {
    handleMetricUpdate('mood', val)
  }

  // Функция переключения табов с принудительным сохранением данных
  const handleTabChange = async (tab: 'overview' | 'stats' | 'habits' | 'goals' | 'settings') => {
    // Если переходим в статистику, принудительно сохраняем данные и ждем завершения
    if (tab === 'stats') {
      console.log('📊 Переход в статистику, сохраняем данные...')
      await forceSave() // Ждем завершения сохранения
      console.log('📊 Данные сохранены, открываем статистику')
    }
    setActiveTab(tab)
  }

  // Прогрессивный рендеринг: показываем UI сразу, данные появляются по мере загрузки
  const isLoading = !isSettingsLoaded || !isHabitsLoaded || isDiaryLoading

  // Полноэкранный индикатор загрузки
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-sm">Загрузка трекера...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <AchievementUnlockedToast achievement={currentAchievement} onClose={clearCurrent} />
      <div className="min-h-screen bg-[#09090b] text-white selection:bg-amber-500/30 font-sans pb-32 md:pb-20">
      <style jsx global>{`
        @media (max-width: 767px) {
          .is-animating .main-grid-container {
            opacity: 0.9 !important;
            pointer-events: none !important;
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

            <header className="mb-8 md:mb-12 lg:mb-6">
              {/* Mobile: Dialog календарь с анимированным заголовком */}
              <div className="flex flex-col lg:hidden">
                {activeTab === 'stats' ? (
                  <button 
                    onClick={openStatsPeriodDialog}
                    className="flex items-center gap-1.5 group w-fit active:opacity-70 transition-all mb-1 outline-none focus:ring-0 focus:outline-none focus-visible:outline-none"
                  >
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-white/90">
                      {getStatsPeriodLabel(statsDateRange)}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-white/60 group-hover:text-white/80 transition-colors -mt-0.5" />
                  </button>
                ) : (
                  <Dialog open={isCalendarExpanded && !isDesktop} onOpenChange={setIsCalendarExpanded}>
                    <DialogTrigger asChild>
                      <button className="flex items-center gap-1.5 group w-fit active:opacity-70 transition-all mb-1 outline-none focus:ring-0 focus:outline-none focus-visible:outline-none">
                        <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-white/90">
                          {format(selectedDate, 'EEEE, d MMMM', { locale: ru })}
                        </span>
                        <ChevronDown className={cn("w-3.5 h-3.5 text-white/60 group-hover:text-white/80 transition-transform -mt-0.5", isCalendarExpanded && "rotate-180")} />
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
                )}
                
                {/* Dialog выбора периода для статистики */}
                <StatsDatePickerDialog
                  isOpen={isStatsPeriodOpen}
                  onClose={closeStatsPeriodDialog}
                  onPeriodSelect={handleStatsPeriodSelect}
                  currentPeriodType={statsPeriodType}
                  currentDateRange={statsDateRange}
                />

                <div className="h-[40px] md:h-[60px] flex items-center relative overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.h1 
                      key={activeTab}
                      initial={{ opacity: 0, y: 25 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -25 }}
                      transition={{ 
                        duration: 0.3,
                        ease: [0.4, 0, 0.2, 1] 
                      }}
                      className="text-4xl md:text-6xl font-oswald font-black uppercase tracking-tighter whitespace-nowrap leading-none absolute inset-0 flex items-center"
                    >
                      {activeTab === 'overview' && (
                        <>Мой<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600">Прогресс</span></>
                      )}
                      {activeTab === 'stats' && (
                        <>Моя<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-blue-400 to-indigo-500">Статистика</span></>
                      )}
                      {activeTab === 'habits' && (
                        <>Мои<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-500 to-amber-500">Привычки</span></>
                      )}
                      {activeTab === 'goals' && (
                        <>Мои<span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-emerald-500 to-emerald-400">Цели</span></>
                      )}
                      {activeTab === 'settings' && (
                        <>Настройки<span className={cn(
                          "text-transparent bg-clip-text bg-gradient-to-r transition-all duration-500",
                          settingsSubTab === 'widgets' ? "from-green-400 to-emerald-600" : "from-amber-400 to-orange-600"
                        )}>трекера</span></>
                      )}
                    </motion.h1>
                  </AnimatePresence>
                </div>
              </div>

              {/* Desktop: Заголовок с идеально горизонтальным перетеканием и выравниванием по сетке */}
              <div className="hidden lg:flex items-center max-w-[1600px] mx-auto w-full lg:min-h-[70px] px-4 md:px-8 lg:mb-0">
                <div className="w-full">
                  {activeTab === 'settings' || activeTab === 'stats' ? (
                    <div className="max-w-5xl mx-auto w-full">
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col">
                          <div className="h-8 mb-1">
                            <motion.div 
                              initial={{ opacity: 0 }} 
                              animate={{ opacity: 1 }} 
                              transition={{ duration: 0.2 }}
                            >
                              <button 
                                onClick={() => setActiveTab('overview')}
                                className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group w-fit"
                              >
                                <ChevronLeft className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Назад к трекеру</span>
                              </button>
                            </motion.div>
                          </div>
                          
                          <motion.h1 
                            layoutId="header-title"
                            className="text-2xl md:text-5xl font-oswald font-bold tracking-tighter uppercase leading-none whitespace-nowrap"
                            transition={{ 
                              type: "spring", 
                              stiffness: 220, 
                              damping: 28,
                              mass: 1
                            }}
                          >
                            {activeTab === 'settings' ? (
                              <>Настройки <span className={cn(
                                "text-transparent bg-clip-text bg-gradient-to-r transition-all duration-500",
                                settingsSubTab === 'widgets' ? "from-green-400 to-emerald-600" : "from-amber-400 to-orange-600"
                              )}>трекера</span></>
                            ) : (
                              <>Моя <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-blue-400 to-indigo-500">Статистика</span></>
                            )}
                          </motion.h1>
                        </div>

                        {/* Период удален отсюда для десктопа в режиме статистики, так как он теперь в сайдбаре */}
                      </div>
                    </div>
                  ) : (
                    /* Переключаем на items-start и добавляем mt-9 (36px), чтобы выровнять по верху h1 */
                    <div className="flex items-start justify-between w-full">
                      <div className="flex flex-col">
                        <div className="h-8 mb-1 flex items-center">
                          <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-2"
                          >
                            <div className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[8px] font-black text-amber-500 uppercase tracking-[0.2em]">
                              V3.0 Beta
                            </div>
                            <div className="h-px w-8 bg-white/10" />
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                              <Activity className="w-3 h-3" />
                              Live
                            </span>
                          </motion.div>
                        </div>
                        
                        <motion.h1 
                          layoutId="header-title"
                          className="text-2xl md:text-5xl font-oswald font-bold tracking-tighter uppercase leading-none whitespace-nowrap"
                          transition={{ 
                            type: "spring", 
                            stiffness: 220, 
                            damping: 28,
                            mass: 1
                          }}
                        >
                          Мой <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600">Прогресс</span>
                        </motion.h1>
                      </div>

                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 mt-9"
                      >
                        <button 
                          onClick={() => handleTabChange('stats')}
                          className="p-3 md:p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
                        >
                          <BarChart3 className="w-5 h-5 text-white/40 group-hover:text-white" />
                        </button>
                        <button 
                          onClick={() => handleTabChange('settings')}
                          className="p-3 md:p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
                        >
                          <Settings className="w-5 h-5 text-white/40 group-hover:text-white" />
                        </button>
                      </motion.div>
                    </div>
                  )}
                </div>
              </div>
            </header>

            <AnimatePresence 
              mode="wait"
              onExitComplete={() => window.scrollTo(0, 0)}
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
                  {activeTab === 'settings' && (
                    <SettingsTab 
                      onBack={() => setActiveTab('overview')} 
                      selectedDate={selectedDate}
                      onDateChange={setSelectedDate}
                      isCalendarExpanded={isCalendarExpanded}
                      setIsCalendarExpanded={setIsCalendarExpanded}
                      activeSubTab={settingsSubTab}
                      setActiveSubTab={setSettingsSubTab}
                      isMobile={true}
                    />
                  )}
                  
                  {activeTab === 'stats' && (
                    <StatsTab 
                      userId={userId}
                      periodType={statsPeriodType} 
                      dateRange={statsDateRange} 
                      data={data} 
                      onPeriodSelect={handleStatsPeriodSelect}
                    />
                  )}
                  
                  {activeTab === 'goals' && (
                    <div className="flex flex-col gap-6">
                      <GoalsSummaryCard 
                        data={data} 
                        settings={settings}
                        onNavigateToSettings={() => {
                          setActiveTab('settings')
                          setSettingsSubTab('widgets')
                        }}
                      />
                      <AchievementsCard />
                      {settings.widgets.photos?.enabled && (
                        <DailyPhotosCard photos={data.dailyPhotos} />
                      )}
                    </div>
                  )}
                  
                  {activeTab === 'habits' && (
                    <div className="flex flex-col gap-6">
                      <HabitsCard 
                        habits={data.habits} 
                        onToggle={(id) => handleMetricUpdate('habits', data.habits.map(h => h.id === id ? {...h, completed: !h.completed} : h))} 
                        onNavigateToSettings={() => {
                          setActiveTab('settings')
                          setSettingsSubTab('habits')
                        }}
                      />
                      {settings.widgets.notes?.enabled && (
                        <NotesCard value={data.notes} onUpdate={(val) => handleMetricUpdate('notes', val)} />
                      )}
                    </div>
                  )}
                  
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      {!hasMainWidgets ? (
                          <div className="flex flex-col items-center justify-center py-12 px-8 rounded-[3rem] bg-white/[0.03] backdrop-blur-md border-2 border-dashed border-white/10 relative overflow-hidden min-h-[340px]">
                            <h3 className="text-xl font-oswald font-black text-white/90 mb-2 text-center uppercase tracking-wider">Настрой панель</h3>
                            <p className="text-xs text-white/30 text-center mb-8 max-w-[220px] leading-relaxed font-medium">
                              Выбери показатели здоровья, которые будем отслеживать
                            </p>

                            <button 
                              onClick={() => {
                                setActiveTab('settings')
                                setSettingsSubTab('widgets')
                              }}
                              className="w-full max-w-[200px] py-4 rounded-2xl bg-green-500 text-[#09090b] font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-green-500/20 flex items-center justify-center gap-3 mb-2"
                            >
                              <Settings className="w-4 h-4" />
                              Выбрать виджеты
                            </button>
                          </div>
                        ) : (
                          <>
                            {settings.widgets.water?.enabled && (
                              <WaterCardH value={data.waterIntake} goal={data.waterGoal} onUpdate={(val) => handleMetricUpdate('waterIntake', val)} />
                            )}
                            {settings.widgets.steps?.enabled && (
                              <StepsCardH steps={data.steps} goal={data.stepsGoal} onUpdate={(val) => handleMetricUpdate('steps', val)} />
                            )}
                            <div className="grid grid-cols-2 gap-4">
                              {settings.widgets.weight?.enabled && (
                                <WeightCardH value={data.weight} goalWeight={data.weightGoal} onUpdate={(val) => handleMetricUpdate('weight', val)} />
                              )}
                              {settings.widgets.caffeine?.enabled && (
                                <CaffeineCardH value={data.caffeineIntake} goal={data.caffeineGoal} onUpdate={(val) => handleMetricUpdate('caffeineIntake', val)} />
                              )}
                              {settings.widgets.sleep?.enabled && (
                                <SleepCardH hours={data.sleepHours} goal={data.sleepGoal} onUpdate={(val) => handleMetricUpdate('sleepHours', val)} />
                              )}
                              {settings.widgets.mood?.enabled && (
                                <MoodEnergyCardH mood={data.mood} energy={data.energyLevel} onMoodUpdate={(val) => handleMoodUpdate(val)} onEnergyUpdate={(val) => handleMetricUpdate('energyLevel', val)} />
                              )}
                          </div>
                            {settings.widgets.nutrition?.enabled && (
                              <NutritionCardH calories={data.calories} caloriesGoal={data.caloriesGoal} foodQuality={data.foodQuality} weight={data.weight} height={data.height} age={data.age} gender={data.gender} onUpdate={(field, val) => handleMetricUpdate(field as keyof DailyMetrics, val)} />
                            )}
                          </>
                        )}
                    </div>
                  )}
                </div>

                {activeTab === 'settings' && (
                  <div className="hidden lg:block max-w-5xl mx-auto">
                    <SettingsTab 
                      userId={userId}
                      onBack={() => setActiveTab('overview')} 
                      selectedDate={selectedDate}
                      onDateChange={setSelectedDate}
                      isCalendarExpanded={isCalendarExpanded}
                      setIsCalendarExpanded={setIsCalendarExpanded}
                      activeSubTab={settingsSubTab}
                      setActiveSubTab={setSettingsSubTab}
                      isMobile={false}
                    />
                  </div>
                )}

                {activeTab === 'stats' && (
                  <div className="hidden lg:block w-full">
                    <StatsTab 
                      userId={userId}
                      periodType={statsPeriodType} 
                      dateRange={statsDateRange} 
                      data={data} 
                      onPeriodSelect={handleStatsPeriodSelect}
                    />
                  </div>
                )}

                {activeTab === 'overview' && (
                  <div className="hidden lg:grid grid-cols-12 gap-6 items-start main-grid-container" style={{ contain: 'layout paint' }}>
                    {/* Левая колонка: виджеты здоровья */}
                    <div className="lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1">
                    {!hasMainWidgets ? (
                      <div className="flex flex-col items-center justify-center py-12 px-8 rounded-[3rem] bg-white/[0.03] backdrop-blur-md border-2 border-dashed border-white/10 relative overflow-hidden min-h-[340px]">
                        <h3 className="text-xl font-oswald font-black text-white/90 mb-2 text-center uppercase tracking-wider">Настрой панель</h3>
                        <p className="text-[12px] text-white/30 text-center mb-8 max-w-[220px] leading-relaxed font-medium">
                          Выбери показатели здоровья, которые будем отслеживать
                        </p>

                        <button 
                          onClick={() => {
                            setActiveTab('settings')
                            setSettingsSubTab('widgets')
                          }}
                          className="w-full max-w-[200px] py-4 rounded-2xl bg-green-500 text-[#09090b] font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-green-500/20 flex items-center justify-center gap-3 mb-2"
                        >
                          <Settings className="w-4 h-4" />
                          Выбрать виджеты
                        </button>
                      </div>
                    ) : (
                      <>
                    {settings.widgets.water?.enabled && (
                      <WaterCardH value={data.waterIntake} goal={data.waterGoal} onUpdate={(val) => handleMetricUpdate('waterIntake', val)} />
                    )}
                    {settings.widgets.steps?.enabled && (
                      <StepsCardH steps={data.steps} goal={data.stepsGoal} onUpdate={(val) => handleMetricUpdate('steps', val)} />
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      {settings.widgets.weight?.enabled && (
                        <WeightCardH value={data.weight} goalWeight={data.weightGoal} onUpdate={(val) => handleMetricUpdate('weight', val)} />
                      )}
                      {settings.widgets.caffeine?.enabled && (
                        <CaffeineCardH value={data.caffeineIntake} goal={data.caffeineGoal} onUpdate={(val) => handleMetricUpdate('caffeineIntake', val)} />
                      )}
                      {settings.widgets.sleep?.enabled && (
                        <SleepCardH hours={data.sleepHours} goal={data.sleepGoal} onUpdate={(val) => handleMetricUpdate('sleepHours', val)} />
                      )}
                      {settings.widgets.mood?.enabled && (
                        <MoodEnergyCardH mood={data.mood} energy={data.energyLevel} onMoodUpdate={(val) => handleMoodUpdate(val)} onEnergyUpdate={(val) => handleMetricUpdate('energyLevel', val)} />
                      )}
                    </div>
                      {settings.widgets.nutrition?.enabled && (
                        <NutritionCardH calories={data.calories} caloriesGoal={data.caloriesGoal} foodQuality={data.foodQuality} weight={data.weight} height={data.height} age={data.age} gender={data.gender} onUpdate={(field, val) => handleMetricUpdate(field as keyof DailyMetrics, val)} />
                      )}
                      </>
                    )}
                  </div>

                  {/* Средняя колонка: привычки + заметки */}
                  <div className="lg:col-span-5 flex flex-col gap-6 order-3 lg:order-2">
                    <HabitsCard 
                      habits={data.habits} 
                      onToggle={(id) => handleMetricUpdate('habits', data.habits.map(h => h.id === id ? {...h, completed: !h.completed} : h))} 
                      onNavigateToSettings={() => {
                        setActiveTab('settings')
                        setSettingsSubTab('habits')
                      }}
                    />
                    {settings.widgets.notes?.enabled && (
                      <NotesCard value={data.notes} onUpdate={(val) => handleMetricUpdate('notes', val)} />
                    )}
                  </div>

                  {/* Правая колонка: календарь, цели, достижения */}
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
                            <ChevronDown className="w-4 h-4 text-white/60 hover:text-white/80 transition-colors" />
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

                    <GoalsSummaryCard 
                      data={data} 
                      settings={settings}
                      onNavigateToSettings={() => {
                        setActiveTab('settings')
                        setSettingsSubTab('widgets')
                      }}
                    />
                    <AchievementsCard />
                    {settings.widgets.photos?.enabled && (
                      <DailyPhotosCard photos={data.dailyPhotos} />
                    )}
                  </div>
                </div>
                )}
              </motion.div>
            </AnimatePresence>

          </div>
        )}
      </motion.div>
    </div>

      {/* Mobile Bottom Navigation - Stable UI */}
      <div className="lg:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md mobile-nav-container">
        <div className="flex items-center justify-around p-2 rounded-[2rem] border border-white/10 bg-[#121214]/60 backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] h-[60px]">
          <button onClick={() => handleTabChange('overview')} className={cn("flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300", activeTab === 'overview' ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30" : "text-white/40")}>
            <Home className="w-5 h-5" />
          </button>
          <button onClick={() => handleTabChange('stats')} className={cn("flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300", activeTab === 'stats' ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30" : "text-white/40")}>
            <BarChart3 className="w-5 h-5" />
          </button>
          <button onClick={() => handleTabChange('habits')} className={cn("flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300", activeTab === 'habits' ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30" : "text-white/40")}>
            <ListChecks className="w-5 h-5" />
          </button>
          <button onClick={() => handleTabChange('goals')} className={cn("flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300", activeTab === 'goals' ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30" : "text-white/40")}>
            <Target className="w-5 h-5" />
          </button>
          <button onClick={() => handleTabChange('settings')} className={cn("flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300", activeTab === 'settings' ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30" : "text-white/40")}>
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  )
}
