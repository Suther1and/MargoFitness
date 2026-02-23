'use client'

import { useState, useEffect, useLayoutEffect, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Dumbbell, BookOpen, Zap, ChevronRight, Lock, CheckCircle2, Play, Clock, ArrowLeft, Sparkles, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCurrentWeek, checkWorkoutAccess } from '@/lib/access-control'
import type { ContentWeekWithSessions, WorkoutSessionWithAccess, Profile } from '@/types/database'
import { Badge } from '@/components/ui/badge'
import { WorkoutCompletionBlock } from '@/app/workouts/[id]/workout-completion-block'
import { AchievementPattern } from '@/app/workouts/[id]/achievement-pattern'
import { ARTICLE_REGISTRY } from "@/lib/config/articles";
import dynamic from "next/dynamic";
import { ArticlesList } from './articles/articles-list'
import { getArticleBySlug } from '@/lib/actions/articles'
import { getWorkoutsData } from '@/lib/actions/workouts'
import { incrementArticleViewBySlug } from '@/lib/actions/admin-articles'

// Динамический импорт хардкодных статей
const HardcodedArticles: Record<string, any> = {
  "home-vs-gym": dynamic(() => import("@/components/articles/content/HomeVsGym")),
  "nutrition-basics": dynamic(() => import("@/components/articles/content/NutritionBasics")),
  "safety-basics": dynamic(() => import("@/components/articles/content/SafetyBasics")),
  "habit-magic": dynamic(() => import("@/components/articles/content/HabitMagic")),
  "equipment-guide": dynamic(() => import("@/components/articles/content/EquipmentGuide")),
  "womens-body-myths": dynamic(() => import("@/components/articles/content/WomensBodyMyths")),
  "social-life-balance": dynamic(() => import("@/components/articles/content/SocialLifeBalance")),
  "movement-basics": dynamic(() => import("@/components/articles/content/MovementBasics")),
  "welcome-guide": dynamic(() => import("@/components/articles/content/WelcomeGuide")),
  "ration-constructor": dynamic(() => import("@/components/articles/content/RationConstructor")),
  "supplements-guide": dynamic(() => import("@/components/articles/content/SupplementsGuide")),
  "lab-control": dynamic(() => import("@/components/articles/content/LabControl")),
};

type WorkoutSubTab = 'workouts' | 'materials' | 'intensives' | 'marathons'

interface ArticleRendererProps {
  article: any;
  hasAccess: boolean;
  userTier: string;
  onBack: () => void;
}

const ArticleRendererFallback = ({
  article,
  hasAccess,
  userTier,
  onBack,
}: ArticleRendererProps) => {
  return (
    <div className="min-h-screen bg-[#09090b] pb-20 text-left">
      <div className="p-8 md:p-16">
        <button onClick={onBack} className="mb-8 text-white/40 hover:text-white transition-colors flex items-center gap-2">
          <ArrowLeft className="size-4" /> Назад
        </button>
        <h1 className="text-4xl font-oswald font-black text-white uppercase">{article.title}</h1>
        <p className="mt-4 text-white/60 italic">{article.description}</p>
        <div className="mt-12 p-10 border border-dashed border-white/10 rounded-[2rem] text-center">
          <p className="text-white/20">Контент этой статьи находится в процессе переноса в новый формат.</p>
        </div>
      </div>
    </div>
  );
};

const TIER_WEIGHTS = {
  free: 0,
  basic: 1,
  pro: 2,
  elite: 3,
};

export function WorkoutsTab({
  preloadedArticles,
  isArticlesLoading,
  userId,
  initialTier,
}: {
  preloadedArticles?: any[]
  isArticlesLoading?: boolean
  userId: string | null
  initialTier?: string | null
}) {
  const queryClient = useQueryClient()
  const [activeSubTab, setActiveSubTab] = useState<WorkoutSubTab>('workouts')
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [selectedArticleSlug, setSelectedArticleSlug] = useState<string | null>(null)
  const [selectedArticleData, setSelectedArticleData] = useState<any>(null)
  const [loadingArticle, setLoadingArticle] = useState(false)

  const { data: workoutsRaw, isLoading: isWorkoutsLoading } = useQuery({
    queryKey: ['workouts-data', userId],
    queryFn: () => getWorkoutsData(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  })

  const { weekData, profile } = useMemo(() => {
    if (!workoutsRaw) return { weekData: null, profile: null }

    const { weeks, completions, profile: profileData, demoSessions } = workoutsRaw

    let currentWeek = weeks.length ? getCurrentWeek(weeks as any, profileData as Profile) : null
    if (!currentWeek && weeks.length > 0) currentWeek = weeks[0] as any

    let sessionsWithAccess: WorkoutSessionWithAccess[] = []
    if (currentWeek) {
      sessionsWithAccess = ((currentWeek as any).sessions || [])
        .filter((s: any) => !s.is_demo)
        .map((session: any) => {
          const access = checkWorkoutAccess(session, profileData as Profile, currentWeek)
          const completion = completions.find((c: any) => c.workout_session_id === session.id)
          return {
            ...session,
            hasAccess: access.hasAccess,
            accessReason: access.reason as any,
            isCompleted: !!completion,
            userCompletion: completion || null,
          }
        })
    }

    if (demoSessions.length > 0) {
      const demoSession = demoSessions[0]
      const completion = completions.find((c: any) => c.workout_session_id === demoSession.id)
      const demoWithAccess: WorkoutSessionWithAccess = {
        ...demoSession,
        hasAccess: true,
        accessReason: 'subscription' as const,
        isCompleted: !!completion,
        userCompletion: completion || null,
        exercises: demoSession.exercises || [],
      }
      sessionsWithAccess = [demoWithAccess, ...sessionsWithAccess]
    }

    const resolvedWeekData = (currentWeek || sessionsWithAccess.length > 0)
      ? ({
          ...(currentWeek || { title: 'Программа', description: '', start_date: '', end_date: '', is_published: true }),
          sessions: sessionsWithAccess,
          isCurrent: true,
        } as ContentWeekWithSessions)
      : null

    return { weekData: resolvedWeekData, profile: profileData as Profile | null }
  }, [workoutsRaw])

  useLayoutEffect(() => {
    if (selectedArticleSlug) {
      document.body.classList.add('article-open');
    } else {
      document.body.classList.remove('article-open');
    }
    return () => document.body.classList.remove('article-open');
  }, [selectedArticleSlug]);

  // Убрали useEffect с window.scrollTo, так как прокрутка теперь внутри компонентов статьи

  const handleNavigate = (slug: string) => {
    if (slug === 'nutrition-basics') {
      window.sessionStorage.setItem('pending-scroll-target', 'calorie-calculator');
      window.sessionStorage.setItem('pending-scroll-from', 'ration-constructor');
    }
    setSelectedArticleSlug(slug);
  };

  const handleBackToArticle = (slug: string) => {
    if (slug === 'ration-constructor') {
      window.sessionStorage.setItem('pending-scroll-target', 'ration-constructor-link');
    }
    setSelectedArticleSlug(slug);
  };

  useEffect(() => {
    async function loadFullArticle() {
      if (!selectedArticleSlug) {
        setSelectedArticleData(null)
        return
      }

      const hardcodedMeta = ARTICLE_REGISTRY.find(a => a.slug === selectedArticleSlug);
      if (hardcodedMeta) {
        setSelectedArticleData(hardcodedMeta);
        incrementArticleViewBySlug(selectedArticleSlug);
        return;
      }

      setLoadingArticle(true)
      try {
        const articleData = await getArticleBySlug(selectedArticleSlug)
        setSelectedArticleData(articleData)
        if (articleData?.id) {
          incrementArticleViewBySlug(selectedArticleSlug);
        }
      } catch (err) {
        console.error('Error loading article:', err)
      } finally {
        setLoadingArticle(false)
      }
    }
    loadFullArticle()
  }, [selectedArticleSlug])

  useEffect(() => {
    const handleReset = () => {
      setSelectedSessionId(null)
      setSelectedArticleSlug(null)
    }
    window.addEventListener('reset-workout-selection', handleReset)
    return () => window.removeEventListener('reset-workout-selection', handleReset)
  }, [])


  const selectedSession = weekData?.sessions.find((s) => s.id === selectedSessionId)

  const tabs = [
    { id: 'workouts' as WorkoutSubTab, label: 'Тренировки', icon: Dumbbell, color: 'bg-cyan-500', shadow: 'shadow-cyan-500/20' },
    { id: 'materials' as WorkoutSubTab, label: 'Материалы', icon: BookOpen, color: 'bg-slate-400', shadow: 'shadow-slate-400/20' },
    { id: 'intensives' as WorkoutSubTab, label: 'Интенсивы', icon: Zap, color: 'bg-yellow-500', shadow: 'shadow-yellow-500/20' },
    { id: 'marathons' as WorkoutSubTab, label: 'Марафоны', icon: Trophy, color: 'bg-red-500/80', shadow: 'shadow-red-500/10' },
  ]

  if (selectedSession) {
    return (
      <WorkoutDetail
        session={selectedSession}
        onBack={() => {
          setSelectedSessionId(null)
          // Инвалидируем кеш тренировок, чтобы обновить статус выполнения без reload
          queryClient.invalidateQueries({ queryKey: ['workouts-data', userId] })
        }}
      />
    )
  }

  const HardcodedComponent = selectedArticleSlug ? HardcodedArticles[selectedArticleSlug] : null;

  if (selectedArticleSlug && selectedArticleData) {
    const hasAccess = TIER_WEIGHTS[profile?.subscription_tier as keyof typeof TIER_WEIGHTS] >= TIER_WEIGHTS[selectedArticleData.access_level as keyof typeof TIER_WEIGHTS];

    return (
      <div className="fixed inset-0 z-[100] bg-[#09090b] md:relative md:inset-auto md:z-0 md:bg-transparent">
        <div className="h-full overflow-y-auto md:overflow-visible md:h-auto scrollbar-hide md:scrollbar-default overscroll-contain isolation-auto touch-pan-y">
          <div className="relative min-h-full pt-16 pb-24 md:py-0">
            {/* Мобильная шапка статьи */}
            <div className="absolute top-0 left-0 right-0 h-[70px] z-[110] flex items-center justify-center px-4 md:hidden">
              <div className="fixed top-[15px] left-4 z-[120]">
                <button 
                  onClick={() => setSelectedArticleSlug(null)}
                  className="flex items-center justify-center size-10 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg"
                >
                  <ArrowLeft className="size-5 text-white" />
                </button>
              </div>
              
              <div className="text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                  Статья <span className="text-rose-500">{selectedArticleData.access_level.toUpperCase()}</span>
                </span>
              </div>
            </div>

            {HardcodedComponent && hasAccess ? (
              <HardcodedComponent 
                onBack={() => setSelectedArticleSlug(null)} 
                onNavigate={handleNavigate}
                onBackToArticle={handleBackToArticle}
                metadata={selectedArticleData}
              />
            ) : (
              <ArticleRendererFallback
                article={selectedArticleData}
                hasAccess={hasAccess}
                userTier={profile?.subscription_tier || 'free'}
                onBack={() => setSelectedArticleSlug(null)}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 md:pb-10 text-left">
      <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/10 mb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl transition-all font-bold text-xs uppercase tracking-wider",
                activeSubTab === tab.id
                  ? `${tab.color} text-black shadow-lg ${tab.shadow}`
                  : "text-white/40 hover:text-white/60 hover:bg-white/5"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      <div className="h-px bg-white/5 mb-4" />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeSubTab === 'workouts' && (
            <div className="space-y-6">
              {/* Показываем скелетоны пока userId есть но данных ещё нет (включая восстановление кеша из localStorage) */}
              {(isWorkoutsLoading || (!workoutsRaw && !!userId)) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({
                    // free видят демо-сессию + сессии недели (обычно 4), остальные — только сессии (обычно 3)
                    length: (initialTier === 'free' || !initialTier) ? 4 : 3
                  }).map((_, i) => (
                    <WorkoutCardSkeleton key={i} />
                  ))}
                </div>
              ) : weekData && weekData.sessions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {weekData.sessions.map((session) => (
                    <WorkoutCard 
                      key={session.id} 
                      session={session} 
                      profile={profile}
                      onClick={() => {
                        if (session.hasAccess) {
                          setSelectedSessionId(session.id)
                        } else {
                          window.dispatchEvent(new CustomEvent('open-upgrade-modal', { 
                            detail: { tier: session.required_tier } 
                          }))
                        }
                      }}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Dumbbell}
                  title="Тренировки скоро появятся"
                  description="Мы готовим для тебя персональные программы тренировок с видео и подробными инструкциями"
                  gradient="from-amber-500 to-orange-500"
                />
              )}
            </div>
          )}
          
          {activeSubTab === 'materials' && (
            <ArticlesList 
              articles={preloadedArticles || []} 
              isLoading={isArticlesLoading ?? false}
              userTier={profile?.subscription_tier || 'free'} 
              onSelectArticle={(slug) => {
                setSelectedArticleSlug(slug);
              }}
            />
          )}
          
          {activeSubTab === 'intensives' && (
            <EmptyState
              icon={Zap}
              title="Интенсивы готовятся"
              description="Скоро запустим специальные программы для быстрого достижения конкретных целей"
              gradient="from-purple-500 to-pink-500"
            />
          )}

          {activeSubTab === 'marathons' && (
            <EmptyState
              icon={Trophy}
              title="Марафоны в разработке"
              description="Здесь будут масштабные челленджи и марафоны с призами и общим рейтингом участников"
              gradient="from-red-500/40 to-rose-500/40"
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function WorkoutCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.03] animate-pulse w-full">
      <div className="p-8 flex flex-col h-full min-h-[280px]">
        {/* Шапка: иконка + бейдж — точно как в WorkoutCard */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-white/10 shrink-0" />
            <div className="space-y-2">
              <div className="h-[10px] w-24 bg-white/10 rounded-full" />
              <div className="h-[18px] w-10 bg-white/10 rounded-md" />
            </div>
          </div>
        </div>
        {/* Заголовок — text-2xl font-oswald, обычно 1-2 строки */}
        <div className="flex-1">
          <div className="h-8 w-[85%] bg-white/10 rounded-lg mb-2" />
          <div className="h-8 w-[55%] bg-white/10 rounded-lg mb-4" />
          {/* Время + упражнения */}
          <div className="flex items-center gap-4">
            <div className="h-4 w-16 bg-white/5 rounded-lg" />
            <div className="h-4 w-16 bg-white/5 rounded-lg" />
          </div>
        </div>
        {/* Кнопка — py-4 rounded-2xl */}
        <div className="mt-8 h-[52px] rounded-2xl bg-white/10 w-full" />
      </div>
    </div>
  )
}

function WorkoutCard({ session, onClick, profile }: { session: WorkoutSessionWithAccess, onClick: () => void, profile: Profile | null }) {
  const isLocked = !session.hasAccess
  const isDemo = session.is_demo || session.required_tier === 'free'
  const isPro = session.required_tier === 'pro'
  const isCompleted = session.isCompleted

  return (
    <button 
      onClick={onClick}
      className={cn(
        "relative group overflow-hidden rounded-[2.5rem] border transition-all duration-500 text-left w-full",
        isLocked 
          ? "bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04] cursor-pointer" 
          : isCompleted || isDemo
            ? "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40"
            : "bg-white/[0.03] border-white/10 hover:border-cyan-500/30 hover:bg-white/[0.05] shadow-xl hover:shadow-cyan-500/10",
        isCompleted && "border-emerald-500/30 bg-emerald-500/[0.02]"
      )}
    >
      {!isLocked && (
        <div className={cn(
          "absolute -inset-24 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700",
          isCompleted || isDemo ? "bg-emerald-500/10" : "bg-cyan-500/5"
        )} />
      )}

      <div className="relative p-8 flex flex-col h-full min-h-[280px]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center border transition-colors",
              isLocked 
                ? "bg-white/5 border-white/10" 
                : isCompleted || isDemo 
                  ? "bg-emerald-500/10 border-emerald-500/20" 
                  : "bg-cyan-500/10 border-cyan-500/20"
            )}>
              {isLocked ? <Lock className="size-5 text-white/20" /> : isCompleted || isDemo ? <Sparkles className="size-5 text-emerald-400" /> : <Dumbbell className="size-5 text-cyan-400" />}
            </div>
            <div>
              <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest leading-none mb-1">
                {isDemo ? 'Демонстрация' : `Тренировка ${session.session_number}`}
              </div>
              <Badge variant="outline" className={cn(
                "text-[9px] font-mono px-1.5 py-0 uppercase tracking-tighter",
                isDemo ? "text-emerald-400 border-emerald-400/30" : isPro ? "text-purple-400 border-purple-400/30" : isCompleted ? "text-emerald-400 border-emerald-400/30" : "text-cyan-400 border-cyan-400/30"
              )}>
                {isDemo ? 'FREE' : isPro ? 'Pro+' : 'Basic'}
              </Badge>
            </div>
          </div>
          
          {isCompleted && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="size-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Выполнена</span>
            </div>
          )}
        </div>

        <div className="flex-1">
          <h3 className={cn(
            "text-2xl font-oswald font-black text-white uppercase tracking-tight mb-3 transition-colors",
            !isLocked && (isCompleted || isDemo ? "group-hover:text-emerald-400" : "group-hover:text-cyan-400")
          )}>
            {session.title}
          </h3>
          <div className="flex items-center gap-4 text-white/40">
            <div className="flex items-center gap-1.5">
              <Clock className="size-3.5" />
              <span className="text-xs font-bold">{session.estimated_duration || 45} мин</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="size-3.5" />
              <span className="text-xs font-bold">{session.exercises?.length || 0} упр.</span>
            </div>
          </div>
        </div>

        <div className="mt-8">
          {isLocked ? (
            <div className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 group-hover:bg-white/10 group-hover:border-white/20 transition-all">
              Открыть доступ
              <ChevronRight className="size-4" />
            </div>
          ) : (
            <div className={cn(
              "w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg transition-transform",
              isCompleted || isDemo ? "bg-emerald-500 text-black shadow-emerald-500/20" : "bg-cyan-500 text-black shadow-cyan-500/20"
            )}>
              <Play className="size-4 fill-current" />
              {isCompleted ? 'Повторить тренировку' : 'Начать тренировку'}
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

function WorkoutDetail({ session: initialSession, onBack }: { session: WorkoutSessionWithAccess, onBack: () => void }) {
  const [session, setSession] = useState(initialSession)
  const isCompleted = session.isCompleted
  const isDemo = session.is_demo || session.required_tier === 'free'

  const handleComplete = async () => {
    setSession(prev => ({ ...prev, isCompleted: true }))
    setTimeout(() => {
      onBack()
    }, 500)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8 pb-24 text-left max-w-full overflow-hidden"
    >
      <div className="relative mb-8 md:mb-12 group">
        <div className={cn(
          "absolute -left-24 -top-24 w-80 h-80 rounded-full blur-[120px] pointer-events-none",
          isCompleted || isDemo ? "bg-emerald-500/5" : "bg-cyan-500/5"
        )} />
        
        <div className="relative space-y-6">
          <button 
            onClick={onBack}
            className="group/btn flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 w-fit"
          >
            <ArrowLeft className="size-4 text-white/40 group-hover/btn:text-white transition-colors" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 group-hover/btn:text-white transition-colors">Назад к списку</span>
          </button>

          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="flex-1 min-w-0">
                <h1 className={cn(
                  "text-4xl md:text-6xl lg:text-7xl font-oswald font-black uppercase tracking-tighter leading-[0.85] text-white transition-colors",
                  isCompleted || isDemo ? "group-hover:text-emerald-400" : "group-hover:text-cyan-400"
                )}>
                  {session.title}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] pb-1 shrink-0">
                <div className={cn(
                  "flex items-center gap-2",
                  isCompleted || isDemo ? "text-emerald-400" : "text-cyan-400"
                )}>
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    isCompleted || isDemo ? "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.4)]"
                  )} />
                  <span>Тренировка {session.session_number}</span>
                </div>
                
                <div className="hidden md:block w-px h-3 bg-white/10" />
                
                <div className="flex items-center gap-2 text-white/30">
                  <Clock className="size-3.5 text-white/10" />
                  <span>{session.estimated_duration || 45} мин</span>
                </div>
                
                <div className="hidden md:block w-px h-3 bg-white/10" />
                
                <div className="flex items-center gap-2 text-white/30">
                  <Zap className="size-3.5 text-white/10" />
                  <span>{session.exercises?.length || 0} упр.</span>
                </div>
                
                {isCompleted && (
                  <>
                    <div className="hidden md:block w-px h-3 bg-white/10" />
                    <div className="flex items-center gap-2 text-emerald-400/80">
                      <CheckCircle2 className="size-3.5" />
                      <span>ВЫПОЛНЕНА</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {session.description && (
        <p className="text-lg md:text-xl text-white/40 leading-relaxed font-medium max-w-3xl mb-12 border-l-2 border-white/10 pl-6 italic">
          {session.description}
        </p>
      )}

      <div className="space-y-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
          <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">Программа тренировки</h2>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
        </div>

        <div className="grid grid-cols-1 gap-6 md:gap-8">
          {session.exercises?.map((exercise, index) => (
            <div 
              key={exercise.id}
              className="group relative overflow-hidden rounded-[2.5rem] md:rounded-[3rem] bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all duration-500"
            >
              <div className="p-6 md:p-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
                    <div className="lg:col-span-7 space-y-6 md:space-y-8">
                      <div className="flex items-start gap-4 md:gap-6">
                        <div className={cn(
                          "w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/5 flex items-center justify-center border shrink-0 transition-colors",
                          isCompleted ? "group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20" : "group-hover:bg-cyan-500/10 group-hover:border-cyan-500/20"
                        )}>
                          <span className={cn(
                            "text-xl md:text-2xl font-oswald font-black text-white/20 transition-colors",
                            isCompleted ? "group-hover:text-emerald-400" : "group-hover:text-cyan-400"
                          )}>{index + 1}</span>
                        </div>
                        <div className="min-w-0">
                          <h3 className={cn(
                            "text-2xl md:text-4xl lg:text-5xl font-oswald font-black text-white uppercase tracking-tight leading-[0.9] mb-3 md:mb-4 transition-colors",
                            isCompleted ? "group-hover:text-emerald-400" : "group-hover:text-cyan-400"
                          )}>
                            {exercise.exercise_library.name}
                          </h3>
                          <p className="text-xs md:text-sm text-white/40 leading-relaxed italic border-l-2 border-white/10 pl-4">
                            {exercise.exercise_library.description}
                          </p>
                        </div>
                      </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
                      {[
                        { label: 'Подходы', val: exercise.sets, icon: Zap, unit: 'x' },
                        { label: 'Повторы', val: exercise.reps, icon: Zap, unit: '' },
                        { label: 'Отдых', val: exercise.rest_seconds, icon: Clock, unit: 'сек' },
                        { label: 'Инвентарь', val: exercise.exercise_library.inventory || 'Нет', icon: Dumbbell, isInventory: true }
                      ].map((item, i) => (
                        <div key={i} className="group/card relative overflow-hidden p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all flex flex-col justify-between min-h-[80px] md:min-h-[90px]">
                          <div className="relative flex items-center gap-1.5 md:gap-2 text-white/20">
                            <item.icon className="size-3 md:size-3.5" />
                            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                          </div>
                          
                          <div className="relative flex items-baseline mt-auto overflow-hidden">
                            <div className={cn(
                              "font-oswald font-bold leading-none uppercase text-white whitespace-nowrap",
                              item.isInventory ? "text-base md:text-lg" : "text-xl md:text-2xl"
                            )}>
                              {item.val}
                            </div>
                            {item.unit && (
                              <span className="text-[9px] md:text-[10px] font-black text-white/20 uppercase leading-none shrink-0 ml-1 md:ml-1.5">
                                {item.unit}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-5">
                    <div className="sticky top-8">
                      <div className="relative aspect-[9/16] w-full max-w-[280px] md:max-w-[320px] mx-auto overflow-hidden rounded-[2.5rem] md:rounded-[3rem] bg-white/5 border border-white/10 shadow-2xl group/video">
                        <div className="flex h-full items-center justify-center">
                          <Play className={cn("size-6 md:size-8 fill-current", isCompleted || isDemo ? "text-emerald-400" : "text-cyan-400")} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 md:mt-16 text-center">
        <WorkoutCompletionBlock 
          sessionId={session.id} 
          isCompleted={!!isCompleted as boolean}
          onComplete={handleComplete}
        />
      </div>
    </motion.div>
  )
}

function EmptyState({ icon: Icon, title, description, gradient }: { icon: any, title: string, description: string, gradient: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 rounded-[3rem] bg-white/[0.03] border border-white/10 relative overflow-hidden min-h-[400px]">
      <div className={cn("absolute inset-0 opacity-5 bg-gradient-to-br", gradient)} />
      <Icon className="w-10 h-10 text-white mb-6" />
      <h3 className="text-2xl font-oswald font-black text-white/90 mb-3 text-center uppercase tracking-wider">{title}</h3>
      <p className="text-sm text-white/40 text-center max-w-[320px] leading-relaxed font-medium">{description}</p>
    </div>
  )
}
