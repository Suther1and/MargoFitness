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
import { SubscriptionFreezeModal } from '@/components/subscription-freeze-modal'
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
import { PremiumAchievementsCard } from './health-tracker/components/premium-achievements-card'
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
import { useQuery, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { usePrefetchStats } from './health-tracker/hooks/use-prefetch-stats'
import { getStatsPeriodLabel } from './health-tracker/utils/date-formatters'
import { hasActiveMainWidgets } from './health-tracker/utils/widget-helpers'
import { calculateBMI, getBMICategory } from './health-tracker/utils/bmi-utils'
import { StatsDatePickerDialog } from './health-tracker/components/stats-date-picker-dialog'
import { checkAndUnlockAchievements } from '@/lib/actions/achievements'
import { createClient } from '@/lib/supabase/client'
import { getActiveHabitsForDate, calculateHabitStats, shouldShowHabitOnDate } from './health-tracker/utils/habit-scheduler'
import { getHabitsStats } from '@/lib/actions/health-stats'
import { getArticleStats, getCachedArticleStats } from '@/lib/actions/admin-articles'
import { ARTICLE_REGISTRY } from '@/lib/config/articles'
import { serializeDateRange } from './health-tracker/utils/query-utils'
import { checkAndExpireSubscription } from '@/lib/actions/profile'
import { checkAndAutoUnfreeze, ensureFreezeTokens } from '@/lib/actions/freeze-actions'
import { checkArticleAccess, getEffectiveTier, getWidgetLimit, getHabitLimit, isSubscriptionActive } from '@/lib/access-control'
import { logUserAuth } from '@/lib/actions/admin-user-extra'
import { useAllAchievements } from './health-tracker/hooks/use-achievements'

// Создаем QueryClient для использования вне Providers, если это необходимо, 
// но лучше использовать QueryClientProvider внутри компонента, если RootLayout Providers не прокидываются
const localQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 60 * 24,
      refetchOnWindowFocus: false,
      retry: 1,
      refetchOnMount: false,
    },
  },
})

/**
 * Health Tracker - главная страница отслеживания здоровья
 */

export function HealthTrackerContent({ 
  profile: initialProfile, 
  bonusStats: initialBonusStats,
  initialReferralStats
}: { 
  profile: any | null, 
  bonusStats: any | null,
  initialReferralStats?: any | null
}) {
  return (
    <QueryClientProvider client={localQueryClient}>
      <HealthTrackerInner 
        profile={initialProfile} 
        bonusStats={initialBonusStats} 
        initialReferralStats={initialReferralStats} 
      />
    </QueryClientProvider>
  )
}

function HealthTrackerInner({ 
  profile: initialProfile, 
  bonusStats: initialBonusStats,
  initialReferralStats
}: { 
  profile: any | null, 
  bonusStats: any | null,
  initialReferralStats?: any | null
}) {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const queryClient = useQueryClient()

  // Оптимистично обновляем read-статус статьи без перезагрузки списка
  useEffect(() => {
    const handleArticleRead = (e: Event) => {
      const { articleId } = (e as CustomEvent).detail;
      queryClient.setQueryData(['articles-list'], (old: any) => {
        if (!old) return old;
        const existing = old.readStatuses.find((s: any) => s.article_id === articleId);
        if (existing?.is_read) return old;
        return {
          ...old,
          readStatuses: [
            ...old.readStatuses.filter((s: any) => s.article_id !== articleId),
            { article_id: articleId, is_read: true },
          ],
        };
      });
    };
    window.addEventListener('article-marked-read', handleArticleRead);
    return () => window.removeEventListener('article-marked-read', handleArticleRead);
  }, [queryClient]);

  // Получаем userId один раз для всех хуков
  const [userId, setUserId] = useState<string | null>(null)
  const [profile, setProfile] = useState<any | null>(initialProfile)
  const [bonusStats, setBonusStats] = useState<any | null>(initialBonusStats)
  const [referralStats, setReferralStats] = useState<any | null>(initialReferralStats || null)
  const [referralLink, setReferralLink] = useState<string | null>(null)
  const [referralCode, setReferralCode] = useState<string | null>(null)
  
  const { data: allAchievements = [] } = useAllAchievements(userId)

  const referralAchievements = useMemo(() => {
    const mentor = allAchievements.find(a => (a.metadata as any)?.type === 'referral_mentor' && (a.metadata as any)?.value === 1)
    const advancedMentor = allAchievements.find(a => (a.metadata as any)?.type === 'referral_mentor' && (a.metadata as any)?.value === 3)
    const guru = allAchievements.find(a => (a.metadata as any)?.type === 'referral_mentor' && (a.metadata as any)?.value === 5)
    
    return {
      mentor,
      advancedMentor,
      guru
    }
  }, [allAchievements])

  const hasMentorAchievement = useMemo(() => referralAchievements.mentor?.isUnlocked || false, [referralAchievements])

  // State для модалок профиля (desktop)
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)
  const [renewalModalOpen, setRenewalModalOpen] = useState(false)
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)
  const [freezeModalOpen, setFreezeModalOpen] = useState(false)
  const [initialUpgradeTier, setInitialUpgradeTier] = useState<any>(undefined)
  const [isBmiDialogOpen, setIsBmiDialogOpen] = useState(false)

  // Для истекших подписок — открывать upgrade (free-style) вместо renewal
  const handleRenewalClick = () => {
    if (profile && !isSubscriptionActive(profile)) {
      setUpgradeModalOpen(true)
    } else {
      setRenewalModalOpen(true)
    }
  }
  
  useEffect(() => {
    const handleOpenUpgrade = (e: any) => {
      // Если подписка заморожена, открываем модал разморозки вместо апгрейда
      if (profile?.is_frozen) {
        setFreezeModalOpen(true)
      } else {
        if (e.detail?.tier) setInitialUpgradeTier(e.detail.tier)
        setUpgradeModalOpen(true)
      }
    }
    window.addEventListener('open-upgrade-modal', handleOpenUpgrade)

    const handleSubscriptionUpdate = () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ['workouts-data', userId] })
        queryClient.invalidateQueries({ queryKey: ['articles-list'] })
      }
      
      import('@/lib/actions/profile').then(m => m.getCurrentProfile()).then(p => {
        if (p) {
          setProfile(p)
          window.dispatchEvent(new CustomEvent('profile-refreshed', { detail: p }))
        }
      })
    }
    window.addEventListener('subscription-updated', handleSubscriptionUpdate)

    return () => {
      window.removeEventListener('open-upgrade-modal', handleOpenUpgrade)
      window.removeEventListener('subscription-updated', handleSubscriptionUpdate)
    }
  }, [userId, queryClient, profile?.is_frozen])
  
  const { data: articleStats } = useQuery({
    queryKey: ['article-stats'],
    queryFn: async () => {
      const { data } = await getCachedArticleStats()
      return data
    },
    staleTime: 1000 * 60 * 5,
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id)
        logUserAuth(data.user.id).catch(e => console.error('Auth logging failed:', e))

        const profileSubscription = supabase
          .channel(`profile-changes-${data.user.id}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'profiles',
              filter: `id=eq.${data.user.id}`,
            },
            (payload) => {
              const updatedProfile = payload.new as any
              setProfile(updatedProfile)
              queryClient.invalidateQueries({ queryKey: ['workouts-data', data.user.id] })
              queryClient.invalidateQueries({ queryKey: ['articles-list'] })
              window.dispatchEvent(new CustomEvent('profile-refreshed', { detail: updatedProfile }))
            }
          )
          .subscribe()

        Promise.all([
          checkAndExpireSubscription(data.user.id),
          checkAndAutoUnfreeze(data.user.id),
          ensureFreezeTokens(data.user.id),
        ]).then(() => {
          import('@/lib/actions/profile').then(m => m.getCurrentProfile()).then(p => {
            if (p) setProfile(p)
          })
        })

        import('@/lib/actions/referrals').then(m => {
          if (!referralStats) {
            m.getReferralStats(data.user.id).then(res => {
              if (res.success) setReferralStats(res.data)
            })
          }
          m.getReferralLink(data.user.id).then(res => {
            if (res.success) {
              setReferralLink(res.link || null)
              setReferralCode(res.code || null)
            }
          })
        })
        
        return () => {
          supabase.removeChannel(profileSubscription)
        }
      }
    })
  }, [userId, queryClient])

  useEffect(() => {
    const isPaymentSuccess = searchParams.get('payment') === 'success'
    if (isPaymentSuccess && userId) {
      import('@/lib/actions/profile').then(m => m.getCurrentProfile()).then(p => {
        if (p) setProfile(p)
      })
      import('@/lib/actions/bonuses').then(m => m.getBonusStats(userId)).then(result => {
        if (result.success && result.data) setBonusStats(result.data)
      })
      import('@/lib/actions/referrals').then(m => {
        m.getReferralStats(userId).then(res => {
          if (res.success) setReferralStats(res.data)
        })
        m.getReferralLink(userId).then(res => {
          if (res.success) {
            setReferralLink(res.link || null)
            setReferralCode(res.code || null)
          }
        })
      })
    }
  }, [searchParams, userId])

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  
  const { registrationDate } = useRegistrationDate(userId)
  const isReadOnly = false
  
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

  useEffect(() => {
    if (tabParam && ['overview', 'stats', 'workouts', 'goals', 'profile', 'settings', 'bonuses', 'subscription'].includes(tabParam)) {
      // На десктопе вкладка profile не используется, редиректим на обзор
      if (isDesktop && tabParam === 'profile') {
        setActiveTab('overview')
        return
      }
      setActiveTab(tabParam as any)
    }
  }, [tabParam, isDesktop])

  const [overviewTab, setOverviewTab] = useState<'widgets' | 'habits'>('widgets')
  const [settingsSubTab, setSettingsSubTab] = useState<'widgets' | 'habits'>('widgets')
  const [mounted, setMounted] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const themeColor = useMemo(() => {
    switch (activeTab) {
      case 'overview': return { border: 'border-amber-500/20', bg: 'bg-amber-500/10', text: 'text-amber-500', separator: 'via-amber-500/30' };
      case 'stats': return { border: 'border-blue-500/20', bg: 'bg-blue-500/10', text: 'text-blue-500', separator: 'via-blue-500/30' };
      case 'workouts': return { border: 'border-cyan-500/20', bg: 'bg-cyan-500/10', text: 'text-cyan-500', separator: 'via-cyan-500/30' };
      case 'goals': return { border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', text: 'text-emerald-500', separator: 'via-emerald-500/30' };
      case 'profile': return { border: 'border-purple-500/20', bg: 'bg-purple-500/10', text: 'text-purple-500', separator: 'via-purple-500/30' };
      case 'bonuses': return { border: 'border-purple-500/20', bg: 'bg-purple-500/10', text: 'text-purple-500', separator: 'via-purple-500/30' };
      case 'subscription': return { border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', text: 'text-emerald-500', separator: 'via-emerald-500/30' };
      case 'settings': 
        return settingsSubTab === 'widgets' 
          ? { border: 'border-green-500/20', bg: 'bg-green-500/10', text: 'text-green-500', separator: 'via-green-500/30' }
          : { border: 'border-amber-500/20', bg: 'bg-amber-500/10', text: 'text-amber-500', separator: 'via-amber-500/30' };
      default: return { border: 'border-amber-500/20', bg: 'bg-amber-500/10', text: 'text-amber-500', separator: 'via-amber-500/30' };
    }
  }, [activeTab, settingsSubTab]);

  const { settings, isFirstVisit, isLoaded: isSettingsLoaded, saveSettings } = useTrackerSettings(userId)
  const { habits, isLoaded: isHabitsLoaded } = useHabits(userId)

  const WIDGET_RENDER_ORDER = ['water', 'steps', 'weight', 'caffeine', 'sleep', 'mood', 'nutrition', 'photos'] as const
  const activeWidgetIds = useMemo(() => {
    const limit = getWidgetLimit(getEffectiveTier(profile))
    const enabled = WIDGET_RENDER_ORDER.filter(id => settings?.widgets[id]?.enabled)
    return new Set(enabled.slice(0, limit))
  }, [settings, profile])
  
  const { 
    metrics, 
    habitsCompleted,
    isLoading: isDiaryLoading,
    updateMetric,
    toggleHabit: toggleHabitCompleted,
    forceSave
  } = useHealthDiary({ userId, selectedDate })
  
  const { data: articlesData, isLoading: isArticlesLoading } = useQuery({
    queryKey: ['articles-list'],
    queryFn: async () => {
      const supabase = createClient();
      const [{ data: authData }, { data: dbArticles }] = await Promise.all([
        supabase.auth.getSession(),
        supabase.from("articles").select("slug, sort_order, display_status, is_new, is_updated, image_url").neq("display_status", "hidden")
      ]);
      const userId = authData.session?.user?.id;
      let readStatuses: any[] = [];
      if (userId) {
        const { data } = await supabase.from('user_article_progress' as any).select('article_id, is_read').eq('user_id', userId);
        readStatuses = data || [];
      }
      return { dbArticles: dbArticles || [], readStatuses };
    },
    staleTime: 1000 * 60 * 30,
  })

  const finalArticles = useMemo(() => {
    const dbMeta = articlesData?.dbArticles || [];
    const readStatuses = articlesData?.readStatuses || [];
    const registryArticles = ARTICLE_REGISTRY.map(a => {
      const dbInfo = dbMeta.find((db: any) => db.slug === a.slug);
      const status = readStatuses.find((s: any) => s.article_id === a.id || s.article_id === a.slug);
      return {
        ...a,
        id: a.id || a.slug,
        is_read: !!status?.is_read,
        sort_order: dbInfo?.sort_order ?? 999,
        display_status: dbInfo?.display_status ?? 'all',
        is_new: dbInfo?.is_new ?? false,
        is_updated: dbInfo?.is_updated ?? false,
        image_url: dbInfo?.image_url || a.image_url,
        tags: [a.category],
        hasAccess: checkArticleAccess(profile, a.access_level)
      };
    });
    return registryArticles.sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));
  }, [articlesData, profile]);

  usePrefetchStats({ userId, dateRange: statsDateRange, enabled: !!userId, settings, habits, selectedDate })
  
  const streakDateRange = useMemo(() => {
    const end = new Date()
    const start = subDays(end, 30)
    return { start, end }
  }, [])
  
  const { data: habitsData } = useQuery({
    queryKey: ['habits-streak-data', userId, format(streakDateRange.start, 'yyyy-MM-dd'), format(streakDateRange.end, 'yyyy-MM-dd')],
    queryFn: async () => {
      if (!userId) return null
      return await getHabitsStats(userId, streakDateRange)
    },
    enabled: !!userId && habits.length > 0,
  })
  
  const habitStreaks = useMemo(() => {
    if (!habitsData?.success || !habitsData.data) return {}
    const result: Record<string, number> = {}
    habits.forEach(habit => {
      const dataWithCurrent = [...habitsData.data]
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const existingEntry = dataWithCurrent.find(e => e.date === dateStr)
      if (existingEntry) {
        existingEntry.habits_completed = { ...existingEntry.habits_completed, [habit.id]: habitsCompleted[habit.id] || false }
      } else if (shouldShowHabitOnDate(habit, selectedDate)) {
        dataWithCurrent.push({ date: dateStr, habits_completed: { [habit.id]: habitsCompleted[habit.id] || false } })
      }
      const stats = calculateHabitStats(habit, dataWithCurrent, selectedDate)
      result[habit.id] = stats.streak
    })
    return result
  }, [habitsData, habits, selectedDate, habitsCompleted])
  
  const data: DailyMetrics = {
    date: selectedDate,
    waterIntake: metrics.waterIntake || 0,
    steps: metrics.steps || 0,
    weight: metrics.weight || 0,
    sleepHours: metrics.sleepHours || 0,
    caffeineIntake: metrics.caffeineIntake || 0,
    calories: metrics.calories || 0,
    mood: metrics.mood || null,
    energyLevel: metrics.energyLevel || 0,
    foodQuality: metrics.foodQuality || null,
    waterGoal: settings.widgets.water.goal || 2500,
    stepsGoal: settings.widgets.steps.goal || 10000,
    weightGoal: settings.widgets.weight.goal || undefined,
    sleepGoal: settings.widgets.sleep.goal || 8,
    caffeineGoal: settings.widgets.caffeine.goal || 3,
    caloriesGoal: settings.widgets.nutrition.goal || 2000,
    height: settings.userParams.height || 170,
    age: settings.userParams.age || 25,
    gender: settings.userParams.gender || 'female',
    habits: getActiveHabitsForDate(habits, selectedDate)
      .slice(0, getHabitLimit(getEffectiveTier(profile)))
      .map(habit => ({
        id: habit.id,
        title: habit.title,
        completed: habitsCompleted[habit.id] || false,
        streak: habitStreaks[habit.id] || 0,
        category: habit.time as "morning" | "afternoon" | "evening" | "anytime"
      })),
    dailyPhotos: [],
  }

  const hasMainWidgets = hasActiveMainWidgets(settings)

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024)
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  useEffect(() => {
    if (data.weight && settings.userParams.weight !== data.weight) {
      saveSettings({ ...settings, userParams: { ...settings.userParams, weight: data.weight } })
    }
  }, [data.weight, settings.userParams.weight])

  useEffect(() => {
    setMounted(true)
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'
  }, [])

  const handleMetricUpdate = (metric: keyof DailyMetrics, value: any) => {
    if (metric === 'habits') {
      (value as typeof data.habits).forEach(habit => {
        if (habit.completed !== habitsCompleted[habit.id]) toggleHabitCompleted(habit.id, habit.completed)
      })
    } else if (metric === 'calories') {
      updateMetric(metric, value)
      updateMetric('nutritionGoalType' as any, settings.widgets.nutrition.nutritionGoalType || 'maintain')
    } else {
      updateMetric(metric, value)
    }
  }

  const handleMoodUpdate = (val: MoodRating) => handleMetricUpdate('mood', val)

  const handleTabChange = async (tab: string) => {
    if (tab === activeTab) {
      if (tab === 'workouts') window.dispatchEvent(new CustomEvent('reset-workout-selection'))
      return
    }
    if (tab === 'stats') await forceSave()
    setActiveTab(tab as any)
  }

  if (!mounted) return null

  return (
    <QueryClientProvider client={localQueryClient}>
      <ToastProvider>
        <AchievementsChecker mounted={mounted} />
        <ToastContainer />
        <div className="min-h-screen bg-[#09090b] text-white selection:bg-amber-500/30 font-sans pb-32 md:pb-20">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <div className="relative z-10 max-w-[1400px] xl:max-w-[1600px] mx-auto px-4 md:px-8 py-6 md:py-8">
              <header className="mb-8 md:mb-12 lg:mb-6 relative">
                <div className="flex flex-col lg:hidden">
                  {activeTab === 'stats' ? (
                    <button onClick={openStatsPeriodDialog} className="flex items-center gap-1.5 group w-fit active:opacity-70 transition-all mb-1 outline-none">
                      <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-white/90">{getStatsPeriodLabel(statsDateRange)}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-white/60 group-hover:text-white/80 transition-colors -mt-0.5" />
                    </button>
                  ) : (
                    <Dialog open={isCalendarExpanded && !isDesktop} onOpenChange={setIsCalendarExpanded}>
                      <DialogTrigger asChild>
                        <button className="flex items-center gap-1.5 group w-fit active:opacity-70 transition-all mb-1 outline-none">
                          <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-white/90">{format(selectedDate, 'EEEE, d MMMM', { locale: ru })}</span>
                          <ChevronDown className={cn("w-3.5 h-3.5 text-white/60 group-hover:text-white/80 transition-transform -mt-0.5", isCalendarExpanded && "rotate-180")} />
                        </button>
                      </DialogTrigger>
                      <DialogContent variant="bottom" className="p-0 overflow-hidden bg-[#121214]/95 border-white/10 sm:max-w-md sm:mx-auto sm:rounded-[2.5rem] rounded-t-[3rem]">
                        <DialogHeader className="p-6 pb-2 border-b border-white/5">
                          <DialogTitle className="text-xl font-oswald font-black uppercase tracking-wider text-center flex items-center justify-center gap-3">
                            <Calendar className="w-5 h-5 text-amber-500" />Выберите дату
                          </DialogTitle>
                        </DialogHeader>
                        <div className="p-4 pb-8">
                          <WeekNavigator selectedDate={selectedDate} onDateChange={(date) => { setSelectedDate(date); setIsCalendarExpanded(false); }} minimal={true} isExpanded={true} minDate={registrationDate} maxDate={new Date()} />
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                  <StatsDatePickerDialog isOpen={isStatsPeriodOpen} onClose={closeStatsPeriodDialog} onPeriodSelect={handleStatsPeriodSelect} currentPeriodType={statsPeriodType} currentDateRange={statsDateRange} />
                  <div className="min-h-[40px] md:min-h-[60px] flex items-center relative overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.h1 key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }} className="text-4xl md:text-6xl font-oswald font-black uppercase tracking-tighter whitespace-nowrap leading-none absolute inset-0 flex items-center">
                        {activeTab === 'overview' && <>Мой<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600">Прогресс</span></>}
                        {activeTab === 'stats' && <>Моя<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-blue-400 to-indigo-500">Статистика</span></>}
                        {activeTab === 'workouts' && <>Мои<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500">Тренировки</span></>}
                        {activeTab === 'goals' && <>Мои<span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-emerald-500 to-emerald-400">Цели</span></>}
                        {activeTab === 'profile' && <>Мой<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-500 to-purple-600">Профиль</span></>}
                        {activeTab === 'settings' && <>Мои<span className={cn("text-transparent bg-clip-text bg-gradient-to-r transition-all duration-500", settingsSubTab === 'widgets' ? "from-green-400 to-emerald-600" : "from-amber-400 to-orange-600")}>Настройки</span></>}
                      </motion.h1>
                    </AnimatePresence>
                  </div>
                </div>

                <div className="hidden lg:flex items-center w-full lg:min-h-[70px] lg:mb-0 pl-4 md:pl-8 pr-0">
                  <div className="flex items-start justify-between w-full pb-6">
                    <div className="flex flex-col">
                      <div className="h-8 mb-1 flex items-center">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="flex items-center gap-2">
                          <div className={cn("px-2 py-0.5 rounded-md border text-[8px] font-black uppercase tracking-[0.2em] transition-all duration-500", themeColor.bg, themeColor.border, themeColor.text)}>V3.2 Beta</div>
                          <div className="h-px w-8 bg-white/10" />
                          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5"><Activity className="w-3 h-3" />Live</span>
                        </motion.div>
                      </div>
                      <div className="relative h-[48px] flex items-center">
                        <AnimatePresence mode="wait">
                          <motion.h1 key={activeTab} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.15 }} className="text-2xl md:text-5xl font-oswald font-bold tracking-tighter uppercase leading-none whitespace-nowrap absolute left-0">
                            {activeTab === 'overview' ? <>Мой <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600">Прогресс</span></> : (
                              <>
                                {activeTab === 'settings' && <>Мои<span className={cn("text-transparent bg-clip-text bg-gradient-to-r transition-all duration-500", settingsSubTab === 'widgets' ? "from-green-400 to-emerald-600" : "from-amber-400 to-orange-600")}>Настройки</span></>}
                                {activeTab === 'stats' && <>Моя<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-blue-400 to-indigo-500">Статистика</span></>}
                                {activeTab === 'bonuses' && <>Мои<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-500 to-purple-600">Бонусы</span></>}
                                {activeTab === 'subscription' && <>Моя<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600">Подписка</span></>}
                                {activeTab === 'workouts' && <>Мои<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500">Тренировки</span></>}
                                {activeTab === 'profile' && <>Мой<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-500 to-purple-600">Профиль</span></>}
                                {activeTab === 'goals' && <>Мои<span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-emerald-500 to-emerald-400">Цели</span></>}
                              </>
                            )}
                          </motion.h1>
                        </AnimatePresence>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-[5px] mb-[5px]">
                      {profile && <UnifiedHeaderCard profile={profile} onEditClick={() => setProfileDialogOpen(true)} onRenewalClick={handleRenewalClick} onUpgradeClick={() => setUpgradeModalOpen(true)} onSubscriptionClick={() => handleTabChange('subscription' as any)} onFreezeClick={() => setFreezeModalOpen(true)} />}
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-px hidden lg:block">
                  <div className="relative w-full h-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <div className="absolute inset-0 w-full h-full" style={{ maskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)' }}>
                      <motion.div initial={{ x: '-100%' }} animate={{ x: '300%' }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className={cn("absolute inset-0 w-1/3 bg-gradient-to-r from-transparent to-transparent transition-colors duration-500", themeColor.separator)} />
                    </div>
                  </div>
                </div>
              </header>

              <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }} className="w-full lg:hidden">
                  <div className="mb-24">
                    {activeTab === 'settings' && <SettingsTab userId={userId || ''} profile={profile} onBack={() => setActiveTab('overview')} selectedDate={selectedDate} onDateChange={setSelectedDate} isCalendarExpanded={isCalendarExpanded} setIsCalendarExpanded={setIsCalendarExpanded} activeSubTab={settingsSubTab} setActiveSubTab={setSettingsSubTab} isMobile={true} />}
                    {activeTab === 'stats' && <StatsTab userId={userId || ''} periodType={statsPeriodType} dateRange={statsDateRange} data={data} onPeriodSelect={handleStatsPeriodSelect} />}
                    {activeTab === 'workouts' && <WorkoutsTab preloadedArticles={finalArticles} isArticlesLoading={isArticlesLoading} userId={userId || ''} initialTier={profile?.subscription_tier} fullProfile={profile} />}
                    {activeTab === 'goals' && (
                      <div className="flex flex-col gap-6">
                        <GoalsSummaryCard data={data} settings={settings} onNavigateToSettings={() => { setActiveTab('settings'); setSettingsSubTab('widgets'); }} />
                        {activeWidgetIds.has('photos') && <DailyPhotosCard userId={userId || ''} selectedDate={selectedDate} />}
                      </div>
                    )}
                    {activeTab === 'profile' && profile && <ProfileTab profile={profile} bonusStats={bonusStats} onProfileUpdate={setProfile} />}
                    {activeTab === 'overview' && (
                      <div className="space-y-6">
                        <div className="flex gap-2 p-2 bg-white/5 rounded-2xl border border-white/10 mb-4">
                          <button onClick={() => setOverviewTab('widgets')} className={cn("flex-1 py-3.5 px-4 rounded-xl transition-all font-bold text-xs uppercase tracking-wider", overviewTab === 'widgets' ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" : "text-white/40 hover:text-white/60 hover:bg-white/5")}>Виджеты</button>
                          <button onClick={() => setOverviewTab('habits')} className={cn("flex-1 py-3.5 px-4 rounded-xl transition-all font-bold text-xs uppercase tracking-wider", overviewTab === 'habits' ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" : "text-white/40 hover:text-white/60 hover:bg-white/5")}>Привычки</button>
                        </div>
                        {overviewTab === 'widgets' ? (
                          !hasMainWidgets ? (
                            <div className="flex flex-col items-center justify-center py-12 px-8 rounded-[3rem] bg-white/[0.03] border-2 border-dashed border-white/10 min-h-[340px]">
                              <h3 className="text-xl font-oswald font-black text-white/90 mb-2 text-center uppercase tracking-wider">Настрой панель</h3>
                              <p className="text-xs text-white/30 text-center mb-8 max-w-[220px] leading-relaxed font-medium">Выбери показатели здоровья, которые будем отслеживать</p>
                              <button onClick={() => { setActiveTab('settings'); setSettingsSubTab('widgets'); }} className="w-full max-w-[200px] py-4 rounded-2xl bg-green-500 text-[#09090b] font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-green-500/20 flex items-center justify-center gap-3 mb-2"><Settings className="w-4 h-4" />Выбрать виджеты</button>
                            </div>
                          ) : (
                            <>
                              {settings.widgets.water?.enabled && <WaterCardH value={data.waterIntake} goal={data.waterGoal} onUpdate={(val) => handleMetricUpdate('waterIntake', val)} />}
                              {settings.widgets.steps?.enabled && <StepsCardH steps={data.steps} goal={data.stepsGoal} onUpdate={(val) => handleMetricUpdate('steps', val)} />}
                              <div className="grid grid-cols-2 gap-4">
                                {settings.widgets.weight?.enabled && <WeightCardH value={data.weight} goalWeight={data.weightGoal} initialWeight={settings.userParams.weight || undefined} onUpdate={(val) => handleMetricUpdate('weight', val)} />}
                                {settings.widgets.caffeine?.enabled && <CaffeineCardH value={data.caffeineIntake} goal={data.caffeineGoal} onUpdate={(val) => handleMetricUpdate('caffeineIntake', val)} />}
                                {settings.widgets.sleep?.enabled && <SleepCardH hours={data.sleepHours} goal={data.sleepGoal} onUpdate={(val) => handleMetricUpdate('sleepHours', val)} />}
                                {settings.widgets.mood?.enabled && <MoodEnergyCardH mood={data.mood} energy={data.energyLevel} onMoodUpdate={handleMoodUpdate} onEnergyUpdate={(val) => handleMetricUpdate('energyLevel', val)} />}
                              </div>
                              {settings.widgets.nutrition?.enabled && <NutritionCardH calories={data.calories} caloriesGoal={data.caloriesGoal} foodQuality={data.foodQuality} weight={data.weight} height={settings.userParams.height || data.height} age={settings.userParams.age || data.age} gender={settings.userParams.gender || data.gender} activityLevel={settings.userParams.activityLevel || 1.55} nutritionGoalType={settings.widgets.nutrition.nutritionGoalType || 'maintain'} onUpdate={(field, val) => handleMetricUpdate(field as keyof DailyMetrics, val)} onOpenBmiDialog={() => setIsBmiDialogOpen(true)} />}
                            </>
                          )
                        ) : (
                          <HabitsCard habits={data.habits} onToggle={(id) => handleMetricUpdate('habits', data.habits.map(h => h.id === id ? {...h, completed: !h.completed} : h))} onNavigateToSettings={() => { setActiveTab('settings'); setSettingsSubTab('habits'); }} isReadOnly={isReadOnly} />
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="hidden lg:block">
                {activeTab !== 'overview' ? (
                  <div className="flex gap-6 w-full">
                    <DesktopNavigation activeTab={activeTab as any} onTabChange={(tab) => handleTabChange(tab as any)} />
                    <div className="flex-1">
                      <AnimatePresence mode="wait">
                        {activeTab === 'settings' && <motion.div key="settings-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}><SettingsTab userId={userId || ''} profile={profile} onBack={() => setActiveTab('overview')} selectedDate={selectedDate} onDateChange={setSelectedDate} isCalendarExpanded={isCalendarExpanded} setIsCalendarExpanded={setIsCalendarExpanded} activeSubTab={settingsSubTab} setActiveSubTab={setSettingsSubTab} isMobile={false} /></motion.div>}
                        {activeTab === 'stats' && <motion.div key="stats-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}><StatsTab userId={userId || ''} periodType={statsPeriodType} dateRange={statsDateRange} data={data} onPeriodSelect={handleStatsPeriodSelect} /></motion.div>}
                        {activeTab === 'bonuses' && <motion.div key="bonuses-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}><BonusesTab bonusStats={bonusStats} referralStats={referralStats} referralLink={referralLink} referralCode={referralCode} userId={userId || ''} referralAchievements={referralAchievements} /></motion.div>}
                        {activeTab === 'subscription' && profile && <motion.div key="subscription-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}><SubscriptionTab profile={profile} onRenewalClick={handleRenewalClick} onUpgradeClick={() => setUpgradeModalOpen(true)} onFreezeClick={() => setFreezeModalOpen(true)} initialArticleStats={articleStats} /></motion.div>}
                        {activeTab === 'workouts' && <motion.div key="workouts-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}><WorkoutsTab preloadedArticles={finalArticles} isArticlesLoading={isArticlesLoading} userId={userId || ''} initialTier={profile?.subscription_tier} fullProfile={profile} /></motion.div>}
                        {activeTab === 'goals' && <motion.div key="goals-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }} className="flex flex-col gap-6"><GoalsSummaryCard data={data} settings={settings} onNavigateToSettings={() => { setActiveTab('settings'); setSettingsSubTab('widgets'); }} />{activeWidgetIds.has('photos') && <DailyPhotosCard userId={userId || ''} selectedDate={selectedDate} />}</motion.div>}
                      </AnimatePresence>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-12 gap-6 items-start main-grid-container">
                    <div className="col-span-1"><DesktopNavigation activeTab={activeTab} onTabChange={(tab) => handleTabChange(tab as any)} /></div>
                    <AnimatePresence mode="wait">
                      <motion.div key="overview-widgets" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }} className="lg:col-span-4 flex flex-col gap-6">
                        {!hasMainWidgets ? (
                          <div className="flex flex-col items-center justify-center py-12 px-8 rounded-[3rem] bg-white/[0.03] border-2 border-dashed border-white/10 min-h-[340px]">
                            <h3 className="text-xl font-oswald font-black text-white/90 mb-2 text-center uppercase tracking-wider">Настрой панель</h3>
                            <p className="text-[12px] text-white/30 text-center mb-8 max-w-[220px] leading-relaxed font-medium">Выбери показатели здоровья, которые будем отслеживать</p>
                            <button onClick={() => { setActiveTab('settings'); setSettingsSubTab('widgets'); }} className="w-full max-w-[200px] py-4 rounded-2xl bg-green-500 text-[#09090b] font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-green-500/20 flex items-center justify-center gap-3 mb-2"><Settings className="w-4 h-4" />Выбрать виджеты</button>
                          </div>
                        ) : (
                          <>
                            {activeWidgetIds.has('water') && <WaterCardH value={data.waterIntake} goal={data.waterGoal} onUpdate={(val) => handleMetricUpdate('waterIntake', val)} />}
                            {activeWidgetIds.has('steps') && <StepsCardH steps={data.steps} goal={data.stepsGoal} onUpdate={(val) => handleMetricUpdate('steps', val)} />}
                            <div className="grid grid-cols-2 gap-4">
                              {activeWidgetIds.has('weight') && <WeightCardH value={data.weight} goalWeight={data.weightGoal} initialWeight={settings.userParams.weight || undefined} onUpdate={(val) => handleMetricUpdate('weight', val)} />}
                              {activeWidgetIds.has('caffeine') && <CaffeineCardH value={data.caffeineIntake} goal={data.caffeineGoal} onUpdate={(val) => handleMetricUpdate('caffeineIntake', val)} />}
                              {activeWidgetIds.has('sleep') && <SleepCardH hours={data.sleepHours} goal={data.sleepGoal} onUpdate={(val) => handleMetricUpdate('sleepHours', val)} />}
                              {activeWidgetIds.has('mood') && <MoodEnergyCardH mood={data.mood} energy={data.energyLevel} onMoodUpdate={handleMoodUpdate} onEnergyUpdate={(val) => handleMetricUpdate('energyLevel', val)} />}
                            </div>
                            {activeWidgetIds.has('nutrition') && <NutritionCardH calories={data.calories} caloriesGoal={data.caloriesGoal} foodQuality={data.foodQuality} weight={data.weight} height={settings.userParams.height || data.height} age={settings.userParams.age || data.age} gender={settings.userParams.gender || data.gender} activityLevel={settings.userParams.activityLevel || 1.55} nutritionGoalType={settings.widgets.nutrition.nutritionGoalType || 'maintain'} onUpdate={(field, val) => handleMetricUpdate(field as keyof DailyMetrics, val)} onOpenBmiDialog={() => setIsBmiDialogOpen(true)} />}
                          </>
                        )}
                      </motion.div>
                      <motion.div key="overview-habits" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }} className="lg:col-span-4 flex flex-col gap-6"><HabitsCard habits={data.habits} onToggle={(id) => handleMetricUpdate('habits', data.habits.map(h => h.id === id ? {...h, completed: !h.completed} : h))} onNavigateToSettings={() => { setActiveTab('settings'); setSettingsSubTab('habits'); }} isReadOnly={isReadOnly} /></motion.div>
                      <motion.div key="overview-calendar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }} className="lg:col-span-3 space-y-6"><HealthTrackerCard className="p-4" title="Календарь" subtitle={format(selectedDate, 'LLLL', { locale: ru })} icon={Calendar} iconColor="text-amber-500" iconBg="bg-amber-500/10" rightAction={<button onClick={() => setIsCalendarExpanded(!isCalendarExpanded)} className="p-2"><motion.div animate={{ rotate: isCalendarExpanded ? 180 : 0 }}><ChevronDown className="w-4 h-4 text-white/60 hover:text-white/80 transition-colors" /></motion.div></button>}><WeekNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} minimal={true} isExpanded={isCalendarExpanded} minDate={registrationDate} maxDate={new Date()} /></HealthTrackerCard><GoalsSummaryCard data={data} settings={settings} onNavigateToSettings={() => { setActiveTab('settings'); setSettingsSubTab('widgets'); }} /><PremiumAchievementsCard />{activeWidgetIds.has('photos') && <DailyPhotosCard userId={userId || ''} selectedDate={selectedDate} />}</motion.div>
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="lg:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md mobile-nav-container">
          <div className="flex items-center justify-around p-2 rounded-[2rem] border border-white/10 bg-[#121214]/95 md:bg-[#121214]/60 md:backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] min-h-[60px]">
            <button onClick={() => handleTabChange('overview')} className={cn("flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300", activeTab === 'overview' ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30" : "text-white/40")}><Home className="w-5 h-5" /></button>
            <button onClick={() => handleTabChange('stats')} className={cn("flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300", activeTab === 'stats' ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30" : "text-white/40")}><BarChart3 className="w-5 h-5" /></button>
            <button onClick={() => handleTabChange('workouts')} className={cn("flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300", activeTab === 'workouts' ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30" : "text-white/40")}><Dumbbell className="w-5 h-5" /></button>
            <button onClick={() => handleTabChange('goals')} className={cn("flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300", activeTab === 'goals' ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30" : "text-white/40")}><Target className="w-5 h-5" /></button>
            <button onClick={() => handleTabChange('profile')} className={cn("flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300", activeTab === 'profile' ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30" : "text-white/40")}><User className="w-5 h-5" /></button>
            <button onClick={() => handleTabChange('settings')} className={cn("flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300", activeTab === 'settings' ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30" : "text-white/40")}><Settings className="w-5 h-5" /></button>
          </div>
        </div>

        {profile && (
          <>
            <ProfileEditDialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen} profile={profile} onSuccess={setProfile} />
            {profile.subscription_tier?.toUpperCase() !== 'FREE' && <SubscriptionRenewalModal open={renewalModalOpen} onOpenChange={setRenewalModalOpen} currentTier={profile.subscription_tier} currentExpires={profile.subscription_expires_at} userId={profile.id} />}
            <SubscriptionUpgradeModal open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen} currentTier={getEffectiveTier(profile)} userId={profile.id} initialTier={initialUpgradeTier} onOpenRenewal={() => setRenewalModalOpen(true)} />
            <SubscriptionFreezeModal open={freezeModalOpen} onOpenChange={setFreezeModalOpen} profile={profile} userId={profile.id} />
          </>
        )}

        {settings && (
          <BmiInfoDialog isOpen={isBmiDialogOpen} onOpenChange={setIsBmiDialogOpen} bmiValue={calculateBMI(settings.userParams.height, settings.userParams.weight)} bmiCategory={calculateBMI(settings.userParams.height, settings.userParams.weight) ? getBMICategory(parseFloat(calculateBMI(settings.userParams.height, settings.userParams.weight)!)) : null} userParams={settings.userParams} settings={settings} onUpdateSettings={saveSettings} />
        )}
      </ToastProvider>
    </QueryClientProvider>
  )
}
