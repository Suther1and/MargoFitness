'use client'

import { useState, useEffect, Suspense, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { Calendar, Settings, Activity, ChevronDown, ChevronLeft, Target, ListChecks, X, BarChart3, Home, Dumbbell, User } from 'lucide-react'
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

import { ProfileEditDialog } from '@/components/profile-edit-dialog'
import { SubscriptionRenewalModal } from '@/components/subscription-renewal-modal'
import { SubscriptionUpgradeModal } from '@/components/subscription-upgrade-modal'
import { ToastProvider } from '@/contexts/toast-context'
import { ToastContainer } from '@/components/dashboard/universal-toast'

// Импорт напрямую - убираем ленивую загрузку для лучшей производительности
import SettingsTab, { BmiInfoDialog } from './health-tracker/components/settings-tab'

// Новые компоненты
import { WaterCardH } from './health-tracker/components/water-card-h'
import { StepsCardH } from './health-tracker/components/steps-card-h'
import { WeightCardH } from './health-tracker/components/weight-card-h'
import { SleepCardH } from './health-tracker/components/sleep-card-h'
import { NutritionCardH } from './health-tracker/components/nutrition-card-h'
import { MoodEnergyCardH } from './health-tracker/components/mood-energy-card-h'
import { CaffeineCardH } from './health-tracker/components/caffeine-card-h'
import { GoalsSummaryCard } from './health-tracker/components/goals-summary-card'
import { DailyPhotosCard } from './health-tracker/components/daily-photos-card'
import { HabitsCard } from './health-tracker/components/habits-card'
import { AchievementsCard } from './health-tracker/components/achievements-card'
import { AchievementsChecker } from './health-tracker/components/achievements-checker'
import { HealthTrackerCard } from './health-tracker/components/health-tracker-card'
import { WeekNavigator } from './health-tracker/components/week-navigator'
import StatsTab from './health-tracker/components/stats-tab'
import { WorkoutsTab } from './health-tracker/components/workouts-tab'
import { ProfileTab } from './health-tracker/components/profile-tab'
import { DesktopProfileCard } from './health-tracker/components/desktop-profile-card'
import { DesktopSubscriptionCard } from './health-tracker/components/desktop-subscription-card'
import { DesktopBonusCard } from './health-tracker/components/desktop-bonus-card'
import { UnifiedHeaderCard } from './health-tracker/components/unified-header-card'
import { DesktopNavigation } from './health-tracker/components/desktop-navigation'
import { BonusesTab } from './health-tracker/components/bonuses-tab'
import { SubscriptionTab } from './health-tracker/components/subscription-tab'

import { MOCK_DATA, DailyMetrics, MoodRating, PeriodType, DateRange } from './health-tracker/types'
import { useTrackerSettings } from './health-tracker/hooks/use-tracker-settings'
import { useHabits } from './health-tracker/hooks/use-habits'
import { useStatsDateRange } from './health-tracker/hooks/use-stats-date-range'
import { useHealthDiary } from './health-tracker/hooks/use-health-diary'
import { useRegistrationDate } from './health-tracker/hooks/use-registration-date'
import { useQuery } from '@tanstack/react-query'
import { usePrefetchStats } from './health-tracker/hooks/use-prefetch-stats'
import { getStatsPeriodLabel } from './health-tracker/utils/date-formatters'
import { hasActiveMainWidgets } from './health-tracker/utils/widget-helpers'
import { calculateBMI, getBMICategory } from './health-tracker/utils/bmi-utils'
import { StatsDatePickerDialog } from './health-tracker/components/stats-date-picker-dialog'
import { checkAndUnlockAchievements } from '@/lib/actions/achievements'
import { createClient } from '@/lib/supabase/client'
import { getActiveHabitsForDate, calculateHabitStats, shouldShowHabitOnDate } from './health-tracker/utils/habit-scheduler'
import { getHabitsStats } from '@/lib/actions/health-stats'
import { serializeDateRange } from './health-tracker/utils/query-utils'

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

export function HealthTrackerContent({ profile: initialProfile, bonusStats: initialBonusStats }: { profile: any | null, bonusStats: any | null }) {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')

  // Получаем userId один раз для всех хуков
  const [userId, setUserId] = useState<string | null>(null)
  const [profile, setProfile] = useState<any | null>(initialProfile)
  const [bonusStats, setBonusStats] = useState<any | null>(initialBonusStats)
  const [referralStats, setReferralStats] = useState<any | null>(null)
  const [referralLink, setReferralLink] = useState<string | null>(null)
  
  // State для модалок профиля (desktop)
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)
  const [renewalModalOpen, setRenewalModalOpen] = useState(false)
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)
  const [isBmiDialogOpen, setIsBmiDialogOpen] = useState(false)
  
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id)
        // Обновляем profile и bonusStats если они пришли null (маловероятно)
        if (!initialProfile) {
          import('@/lib/actions/profile').then(m => m.getCurrentProfile()).then(setProfile)
        }
        if (!initialBonusStats) {
          import('@/lib/actions/bonuses').then(m => m.getBonusStats(data.user.id)).then(result => {
            if (result.success) setBonusStats(result.data)
          })
        }
        // Загружаем данные рефералов для вкладки бонусов
        import('@/lib/actions/referrals').then(m => {
          m.getReferralStats(data.user.id).then(result => {
            if (result.data) setReferralStats(result.data)
          })
          m.getReferralLink(data.user.id).then(result => {
            if (result.link) setReferralLink(result.link)
          })
        })
      }
    })
  }, [initialProfile, initialBonusStats])

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  
  // Проверка даты регистрации
  const { registrationDate, isLoading: isRegistrationLoading } = useRegistrationDate(userId)
  
  // Флаг "только для чтения" для прошлых дней
  // ВРЕМЕННО ОТКЛЮЧЕНО ДЛЯ ТЕСТИРОВАНИЯ
  const isReadOnly = useMemo(() => {
    return false // Для теста - разрешаем редактировать все
    // const today = new Date()
    // today.setHours(0, 0, 0, 0)
    // const selected = new Date(selectedDate)
    // selected.setHours(0, 0, 0, 0)
    // 
    // return selected < today // Прошлые дни - только чтение
  }, [selectedDate])
  
  // State для статистики (объединен в хук)
  const { 
    periodType: statsPeriodType, 
    dateRange: statsDateRange, 
    isDialogOpen: isStatsPeriodOpen,
    openDialog: openStatsPeriodDialog,
    closeDialog: closeStatsPeriodDialog,
    setPeriod: handleStatsPeriodSelect 
  } = useStatsDateRange()

  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'workouts' | 'goals' | 'profile' | 'settings' | 'bonuses' | 'subscription'>(
    (tabParam as any) || 'overview'
  )
  const [overviewTab, setOverviewTab] = useState<'widgets' | 'habits'>('widgets')
  const [settingsSubTab, setSettingsSubTab] = useState<'widgets' | 'habits'>('widgets')
  const [mounted, setMounted] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  // Все хуки получают userId и загружаются параллельно
  const { settings, isFirstVisit, isLoaded: isSettingsLoaded, saveSettings } = useTrackerSettings(userId)
  const { habits, isLoaded: isHabitsLoaded } = useHabits(userId)
  
  // Интеграция с Supabase через useHealthDiary
  const { 
    metrics, 
    habitsCompleted,
    isLoading: isDiaryLoading,
    saveStatus,
    updateMetric,
    toggleHabit: toggleHabitCompleted,
    forceSave
  } = useHealthDiary({ userId, selectedDate })
  
  // Фоновая предзагрузка данных статистики - стартует параллельно
  usePrefetchStats({
    userId,
    dateRange: statsDateRange,
    enabled: !!userId,
    settings,
    habits,
    selectedDate
  })
  
  // Получаем данные привычек для расчета streak
  // Используем компактный период: последние 30 дней (достаточно для расчета стрика)
  const streakDateRange = useMemo(() => {
    const end = new Date()
    const start = subDays(end, 30) // Последние 30 дней достаточно для стрика
    return { start, end }
  }, [])
  
  const { data: habitsData } = useQuery({
    queryKey: ['habits-streak-data', userId, format(streakDateRange.start, 'yyyy-MM-dd'), format(streakDateRange.end, 'yyyy-MM-dd')],
    queryFn: async () => {
      if (!userId) return null
      return await getHabitsStats(userId, streakDateRange)
    },
    enabled: !!userId && habits.length > 0,
    staleTime: 1000 * 60 * 2, // 2 минуты кеш - не нужно постоянно обновлять
    refetchOnMount: false, // Не перезапрашивать каждый раз
  })
  
  // Локально считаем текущие стрики из данных + оптимистичное обновление
  const habitStreaks = useMemo(() => {
    if (!habitsData?.success || !habitsData.data) {
      return {}
    }
    
    const result: Record<string, number> = {}
    habits.forEach(habit => {
      // Создаем копию данных для оптимистичного расчета
      const dataWithCurrent = [...habitsData.data]
      
      // Находим запись для выбранной даты
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const existingEntry = dataWithCurrent.find(e => e.date === dateStr)
      
      if (existingEntry) {
        // Обновляем существующую запись с текущим состоянием
        existingEntry.habits_completed = {
          ...existingEntry.habits_completed,
          [habit.id]: habitsCompleted[habit.id] || false
        }
      } else if (shouldShowHabitOnDate(habit, selectedDate)) {
        // Добавляем новую запись если день запланирован
        dataWithCurrent.push({
          date: dateStr,
          habits_completed: {
            [habit.id]: habitsCompleted[habit.id] || false
          }
        })
      }
      
      // Считаем стрик с учетом оптимистичных изменений
      const stats = calculateHabitStats(habit, dataWithCurrent, selectedDate)
      result[habit.id] = stats.streak
    })
    
    return result
  }, [habitsData, habits, selectedDate, habitsCompleted])
  
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
    weightGoal: settings.widgets.weight.goal || undefined,
    sleepGoal: settings.widgets.sleep.goal || 8,
    caffeineGoal: settings.widgets.caffeine.goal || 3,
    caloriesGoal: settings.widgets.nutrition.goal || 2000,
    
    // User params from settings
    height: settings.userParams.height || 170,
    age: settings.userParams.age || 25,
    gender: settings.userParams.gender || 'female',
    
    // Habits - фильтруем по расписанию и объединяем с данными выполнения
    habits: getActiveHabitsForDate(habits, selectedDate).map(habit => ({
      id: habit.id,
      title: habit.title,
      completed: habitsCompleted[habit.id] || false,
      streak: habitStreaks[habit.id] || 0,
      category: habit.time as "morning" | "afternoon" | "evening" | "anytime"
    })),
    
    // Placeholder для фото
    dailyPhotos: [],
  }

  // Проверка наличия активных виджетов (только основные метрики здоровья из левой колонки)
  const hasMainWidgets = hasActiveMainWidgets(settings)

  // Detect desktop
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024)
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // Автообновление веса из дневника в настройки
  useEffect(() => {
    if (data.weight && settings.userParams.weight !== data.weight) {
      // Обновляем вес в настройках, если он изменился в дневнике
      const newSettings = {
        ...settings,
        userParams: {
          ...settings.userParams,
          weight: data.weight
        }
      }
      saveSettings(newSettings)
    }
  }, [data.weight, settings.userParams.weight]) // Зависимости: вес из дневника и вес из настроек

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
    } else if (metric === 'calories') {
      // Для калорий также сохраняем тип цели
      updateMetric(metric, value)
      // Сохраняем nutritionGoalType в metrics
      const nutritionGoalType = settings.widgets.nutrition.nutritionGoalType || 'maintain'
      updateMetric('nutritionGoalType' as any, nutritionGoalType)
    } else {
      // Для всех остальных метрик
      updateMetric(metric, value)
    }
  }

  const handleMoodUpdate = (val: MoodRating) => {
    handleMetricUpdate('mood', val)
  }

  // Функция переключения табов с принудительным сохранением данных
  const handleTabChange = async (tab: 'overview' | 'stats' | 'workouts' | 'goals' | 'profile' | 'settings') => {
    // Если переходим в статистику, принудительно сохраняем данные и ждем завершения
    if (tab === 'stats') {
      await forceSave()
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
    <ToastProvider>
      <AchievementsChecker mounted={mounted} />
      <ToastContainer />
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
            <div className="relative z-10 max-w-[1400px] xl:max-w-[1600px] mx-auto px-4 md:px-8 py-6 md:py-8">
            {/* Ambient BG - Desktop only */}
            <div className="hidden md:block fixed inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[120px]" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]" />
            </div>

            <header className="mb-8 md:mb-12 lg:mb-6 relative">
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
                        minDate={registrationDate}
                        maxDate={new Date()}
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

                <div className="min-h-[40px] md:min-h-[60px] flex items-center relative overflow-hidden">
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
                      {activeTab === 'workouts' && (
                        <>Мои<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500">Тренировки</span></>
                      )}
                      {activeTab === 'goals' && (
                        <>Мои<span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-emerald-500 to-emerald-400">Цели</span></>
                      )}
                      {activeTab === 'profile' && (
                        <>Мой<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-500 to-purple-600">Профиль</span></>
                      )}
                      {activeTab === 'settings' && (
                        <>Мои<span className={cn(
                          "text-transparent bg-clip-text bg-gradient-to-r transition-all duration-500",
                          settingsSubTab === 'widgets' ? "from-green-400 to-emerald-600" : "from-amber-400 to-orange-600"
                        )}>Настройки</span></>
                      )}
                    </motion.h1>
                  </AnimatePresence>
                </div>
              </div>

              {/* Desktop: Заголовок с идеально горизонтальным перетеканием и выравниванием по сетке */}
              <div className="hidden lg:flex items-center w-full lg:min-h-[70px] lg:mb-0 pl-4 md:pl-8 pr-0">
                <div className="flex items-start justify-between w-full pb-6">
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
                    
                    <AnimatePresence mode="wait">
                      <motion.h1 
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="text-2xl md:text-5xl font-oswald font-bold tracking-tighter uppercase leading-none whitespace-nowrap"
                      >
                        {activeTab === 'overview' ? (
                          <>Мой <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600">Прогресс</span></>
                        ) : (
                          <>
                            {activeTab === 'settings' && (
                              <>Мои<span className={cn(
                                "text-transparent bg-clip-text bg-gradient-to-r transition-all duration-500",
                                settingsSubTab === 'widgets' ? "from-green-400 to-emerald-600" : "from-amber-400 to-orange-600"
                              )}>Настройки</span></>
                            )}
                            {activeTab === 'stats' && (
                              <>Моя<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-blue-400 to-indigo-500">Статистика</span></>
                            )}
                            {activeTab === 'bonuses' && (
                              <>Мои<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-500 to-purple-600">Бонусы</span></>
                            )}
                            {activeTab === 'subscription' && (
                              <>Моя<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600">Подписка</span></>
                            )}
                            {activeTab === 'workouts' && (
                              <>Мои<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500">Тренировки</span></>
                            )}
                          </>
                        )}
                      </motion.h1>
                    </AnimatePresence>
                  </div>

                  <div className="flex items-center gap-3 mt-[5px] mb-[5px]">
                    {profile && (
                      <UnifiedHeaderCard 
                        profile={profile}
                        bonusStats={bonusStats}
                        onEditClick={() => setProfileDialogOpen(true)}
                        onRenewalClick={() => setRenewalModalOpen(true)}
                        onUpgradeClick={() => setUpgradeModalOpen(true)}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Декоративный разделитель */}
              <div className="absolute bottom-0 left-0 w-full h-px overflow-hidden hidden lg:block">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '300%' }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"
                />
              </div>
            </header>

            {/* Mobile версия с анимацией */}
            <AnimatePresence 
              mode="wait"
              onExitComplete={() => window.scrollTo(0, 0)}
            >
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="w-full lg:hidden"
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

                <div className="mb-24">
                  {activeTab === 'settings' && (
                    <SettingsTab 
                      userId={userId}
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
                  
                  {activeTab === 'workouts' && (
                    <WorkoutsTab />
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
                        <DailyPhotosCard userId={userId} selectedDate={selectedDate} />
                      )}
                    </div>
                  )}
                  
                  {activeTab === 'profile' && profile && (
                    <ProfileTab profile={profile} bonusStats={bonusStats} />
                  )}
                  
                  {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Tabs переключатель */}
                    <div className="flex gap-2 p-2 bg-white/5 rounded-2xl border border-white/10 mb-4">
                      <button
                        onClick={() => setOverviewTab('widgets')}
                        className={cn(
                          "flex-1 py-3.5 px-4 rounded-xl transition-all font-bold text-xs uppercase tracking-wider",
                          overviewTab === 'widgets'
                            ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                            : "text-white/40 hover:text-white/60 hover:bg-white/5"
                        )}
                      >
                        Виджеты
                      </button>
                      <button
                        onClick={() => setOverviewTab('habits')}
                        className={cn(
                          "flex-1 py-3.5 px-4 rounded-xl transition-all font-bold text-xs uppercase tracking-wider",
                          overviewTab === 'habits'
                            ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                            : "text-white/40 hover:text-white/60 hover:bg-white/5"
                        )}
                      >
                        Привычки
                      </button>
                    </div>

                    {/* Разделитель */}
                    <div className="h-px bg-white/5 mb-4" />

                    {/* Контент в зависимости от выбранного таба */}
                    {overviewTab === 'widgets' ? (
                      !hasMainWidgets ? (
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
                              <WeightCardH 
                                value={data.weight} 
                                goalWeight={data.weightGoal} 
                                initialWeight={settings.userParams.weight || undefined}
                                onUpdate={(val) => handleMetricUpdate('weight', val)} 
                              />
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
                            <NutritionCardH 
                              calories={data.calories} 
                              caloriesGoal={data.caloriesGoal} 
                              foodQuality={data.foodQuality} 
                              weight={data.weight} 
                              height={settings.userParams.height || data.height} 
                              age={settings.userParams.age || data.age} 
                              gender={settings.userParams.gender || data.gender}
                              activityLevel={settings.userParams.activityLevel || 1.55}
                              nutritionGoalType={settings.widgets.nutrition.nutritionGoalType || 'maintain'}
                              onUpdate={(field, val) => handleMetricUpdate(field as keyof DailyMetrics, val)}
                              onOpenBmiDialog={() => setIsBmiDialogOpen(true)}
                            />
                          )}
                        </>
                      )
                    ) : (
                      <HabitsCard 
                        habits={data.habits} 
                        onToggle={(id) => handleMetricUpdate('habits', data.habits.map(h => h.id === id ? {...h, completed: !h.completed} : h))} 
                        onNavigateToSettings={() => {
                          setActiveTab('settings')
                          setSettingsSubTab('habits')
                        }}
                        isReadOnly={isReadOnly}
                      />
                    )}
                  </div>
                )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Desktop версия БЕЗ общей анимации, навигация статична */}
            <div className="hidden lg:block">
              {(activeTab === 'settings' || activeTab === 'stats' || activeTab === 'bonuses' || activeTab === 'subscription' || activeTab === 'workouts') && (
                <div className="flex gap-6 w-full">
                  <DesktopNavigation 
                    activeTab={activeTab}
                    onTabChange={(tab) => handleTabChange(tab as any)}
                  />
                  <div className="flex-1">
                    <AnimatePresence mode="wait">
                      {activeTab === 'settings' && (
                        <motion.div
                          key="settings-content"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
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
                        </motion.div>
                      )}

                      {activeTab === 'stats' && (
                        <motion.div
                          key="stats-content"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <StatsTab 
                            userId={userId}
                            periodType={statsPeriodType} 
                            dateRange={statsDateRange} 
                            data={data} 
                            onPeriodSelect={handleStatsPeriodSelect}
                          />
                        </motion.div>
                      )}

                      {activeTab === 'bonuses' && (
                        <motion.div
                          key="bonuses-content"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <BonusesTab 
                            bonusStats={bonusStats}
                            referralStats={referralStats}
                            referralLink={referralLink}
                            userId={userId || ''}
                          />
                        </motion.div>
                      )}

                      {activeTab === 'subscription' && profile && (
                        <motion.div
                          key="subscription-content"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <SubscriptionTab 
                            profile={profile}
                            onRenewalClick={() => setRenewalModalOpen(true)}
                            onUpgradeClick={() => setUpgradeModalOpen(true)}
                          />
                        </motion.div>
                      )}

                      {activeTab === 'workouts' && (
                        <motion.div
                          key="workouts-content"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <WorkoutsTab />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {activeTab === 'overview' && (
                <div className="grid grid-cols-12 gap-6 items-start main-grid-container" style={{ contain: 'layout paint' }}>
                  {/* Левая навигация: фиксированная ширина */}
                  <div className="col-span-1" style={{ paddingTop: 0, paddingBottom: 0 }}>
                    <DesktopNavigation 
                      activeTab={activeTab}
                      onTabChange={(tab) => handleTabChange(tab as any)}
                    />
                  </div>
                  
                  <AnimatePresence mode="wait">
                    {/* Виджеты здоровья: 4/12 */}
                    <motion.div
                      key="overview-widgets"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="lg:col-span-4 flex flex-col gap-6"
                    >
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
                        <WeightCardH 
                          value={data.weight} 
                          goalWeight={data.weightGoal} 
                          initialWeight={settings.userParams.weight || undefined}
                          onUpdate={(val) => handleMetricUpdate('weight', val)} 
                        />
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
                        <NutritionCardH 
                          calories={data.calories} 
                          caloriesGoal={data.caloriesGoal} 
                          foodQuality={data.foodQuality} 
                          weight={data.weight} 
                          height={settings.userParams.height || data.height} 
                          age={settings.userParams.age || data.age} 
                          gender={settings.userParams.gender || data.gender}
                          activityLevel={settings.userParams.activityLevel || 1.55}
                          nutritionGoalType={settings.widgets.nutrition.nutritionGoalType || 'maintain'}
                          onUpdate={(field, val) => handleMetricUpdate(field as keyof DailyMetrics, val)}
                          onOpenBmiDialog={() => setIsBmiDialogOpen(true)}
                        />
                      )}
                      </>
                    )}
                  </motion.div>

                  {/* Привычки: 4/12 */}
                  <motion.div
                    key="overview-habits"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="lg:col-span-4 flex flex-col gap-6"
                  >
                    <HabitsCard 
                      habits={data.habits} 
                      onToggle={(id) => handleMetricUpdate('habits', data.habits.map(h => h.id === id ? {...h, completed: !h.completed} : h))} 
                      onNavigateToSettings={() => {
                        setActiveTab('settings')
                        setSettingsSubTab('habits')
                      }}
                      isReadOnly={isReadOnly}
                    />
                  </motion.div>

                  {/* Календарь и цели: 3/12 */}
                  <motion.div
                    key="overview-calendar"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="lg:col-span-3 space-y-6"
                  >
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
                        minDate={registrationDate}
                        maxDate={new Date()}
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
                      <DailyPhotosCard userId={userId} selectedDate={selectedDate} />
                    )}
                  </motion.div>
                  </AnimatePresence>
                </div>
              )}
            </div>

          </div>
        )}
      </motion.div>
    </div>

      {/* Mobile Bottom Navigation - Stable UI */}
      <div className="lg:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md mobile-nav-container">
        <div className="flex items-center justify-around p-2 rounded-[2rem] border border-white/10 bg-[#121214]/60 backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] min-h-[60px]">
          <button onClick={() => handleTabChange('overview')} className={cn("flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300", activeTab === 'overview' ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30" : "text-white/40")}>
            <Home className="w-5 h-5" />
          </button>
          <button onClick={() => handleTabChange('stats')} className={cn("flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300", activeTab === 'stats' ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30" : "text-white/40")}>
            <BarChart3 className="w-5 h-5" />
          </button>
          <button onClick={() => handleTabChange('workouts')} className={cn("flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300", activeTab === 'workouts' ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30" : "text-white/40")}>
            <Dumbbell className="w-5 h-5" />
          </button>
          <button onClick={() => handleTabChange('goals')} className={cn("flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300", activeTab === 'goals' ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30" : "text-white/40")}>
            <Target className="w-5 h-5" />
          </button>
          <button onClick={() => handleTabChange('profile')} className={cn("flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300", activeTab === 'profile' ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30" : "text-white/40")}>
            <User className="w-5 h-5" />
          </button>
          <button onClick={() => handleTabChange('settings')} className={cn("flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300", activeTab === 'settings' ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30" : "text-white/40")}>
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Desktop Modals */}
      {profile && (
        <>
          <ProfileEditDialog
            open={profileDialogOpen}
            onOpenChange={setProfileDialogOpen}
            profile={profile}
          />
          
          <SubscriptionRenewalModal
            open={renewalModalOpen}
            onOpenChange={setRenewalModalOpen}
            currentTier={profile.subscription_tier}
            currentExpires={profile.subscription_expires_at}
            userId={profile.id}
          />
          
          <SubscriptionUpgradeModal
            open={upgradeModalOpen}
            onOpenChange={setUpgradeModalOpen}
            currentTier={profile.subscription_tier}
            userId={profile.id}
          />
        </>
      )}

      {/* BMI Dialog for Nutrition Widget */}
      {settings && (
        <BmiInfoDialog
          isOpen={isBmiDialogOpen}
          onOpenChange={setIsBmiDialogOpen}
          bmiValue={calculateBMI(settings.userParams.height, settings.userParams.weight)}
          bmiCategory={
            calculateBMI(settings.userParams.height, settings.userParams.weight)
              ? getBMICategory(parseFloat(calculateBMI(settings.userParams.height, settings.userParams.weight)!))
              : null
          }
          userParams={settings.userParams}
          settings={settings}
          onUpdateSettings={saveSettings}
        />
      )}
    </ToastProvider>
  )
}
