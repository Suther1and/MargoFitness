'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dumbbell, BookOpen, Zap, ChevronRight, Lock, CheckCircle2, Play, Clock, ArrowLeft, Sparkles, Repeat, Info, AlertTriangle, RotateCcw, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { getCurrentWeek, checkWorkoutAccess } from '@/lib/access-control'
import { completeWorkout } from '@/lib/actions/content'
import type { ContentWeekWithSessions, WorkoutSessionWithAccess, Profile } from '@/types/database'
import { Badge } from '@/components/ui/badge'
import { WorkoutCompletionBlock } from '@/app/workouts/[id]/workout-completion-block'
import { AchievementPattern } from '@/app/workouts/[id]/achievement-pattern'

type WorkoutSubTab = 'workouts' | 'materials' | 'intensives' | 'marathons'

// Хелпер для получения чистой категории и её цвета
function getCategoryInfo(category: string) {
  // Очищаем от английского текста в скобках
  const cleanName = category.split('(')[0].trim();
  
  const lowerName = cleanName.toLowerCase();
  
  // Карта цветов по паттернам
  if (lowerName.includes('приседания')) return { name: cleanName, color: 'bg-orange-500/20 text-orange-400' };
  if (lowerName.includes('выпады')) return { name: cleanName, color: 'bg-yellow-500/20 text-yellow-400' };
  if (lowerName.includes('тяга') || lowerName.includes('румынская')) return { name: cleanName, color: 'bg-cyan-500/20 text-cyan-400' };
  if (lowerName.includes('мостик')) return { name: cleanName, color: 'bg-pink-500/20 text-pink-400' };
  if (lowerName.includes('отведения')) return { name: cleanName, color: 'bg-rose-500/20 text-rose-400' };
  if (lowerName.includes('отжимания') || lowerName.includes('жим')) return { name: cleanName, color: 'bg-emerald-500/20 text-emerald-400' };
  if (lowerName.includes('планка') || lowerName.includes('кор') || lowerName.includes('скручивания')) return { name: cleanName, color: 'bg-purple-500/20 text-purple-400' };
  if (lowerName.includes('бицепс') || lowerName.includes('трицепс') || lowerName.includes('плечи') || lowerName.includes('разводка')) return { name: cleanName, color: 'bg-blue-500/20 text-blue-400' };
  if (lowerName.includes('кардио') || lowerName.includes('комплексные')) return { name: cleanName, color: 'bg-red-500/20 text-red-400' };

  return { name: cleanName, color: 'bg-white/10 text-white/60' };
}

export function WorkoutsTab() {
  const [activeSubTab, setActiveSubTab] = useState<WorkoutSubTab>('workouts')
  const [loading, setLoading] = useState(true)
  const [weekData, setWeekData] = useState<ContentWeekWithSessions | null>(null)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    const handleReset = () => setSelectedSessionId(null)
    window.addEventListener('reset-workout-selection', handleReset)
    return () => window.removeEventListener('reset-workout-selection', handleReset)
  }, [])

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const supabase = createClient()

        // 1. Получаем профиль пользователя
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (profileData) setProfile(profileData as Profile)

        // 2. Получаем недели и сразу джойним сессии и упражнения
        const { data: weeks, error: weeksError } = await supabase
          .from('content_weeks')
          .select(`
            *,
            sessions:workout_sessions(
              *,
              exercises:workout_exercises(
                *,
                exercise_library(*)
              )
            )
          `)
          .eq('is_published', true)
          .order('start_date', { ascending: false })

        if (weeksError) {
          console.error('[WorkoutsTab] Weeks fetch error:', weeksError)
        }
        
        // 3. Получаем завершенные тренировки
        const { data: completions } = await supabase
          .from('user_workout_completions')
          .select('*')
          .eq('user_id', user.id)

        // 4. Определяем текущую неделю
        let currentWeek = weeks ? getCurrentWeek(weeks as any, profileData as Profile) : null
        if (!currentWeek && weeks && weeks.length > 0) {
          currentWeek = weeks[0] as any
        }

        // 5. Формируем данные сессий
        let sessionsWithAccess: WorkoutSessionWithAccess[] = []
        
        if (currentWeek) {
          const weekSessions = (currentWeek as any).sessions || []
          sessionsWithAccess = (weekSessions as any[])
            .filter((s: any) => !s.is_demo)
            .map((session: any) => {
              const access = checkWorkoutAccess(session, profileData as Profile, currentWeek)
              const completion = completions?.find(c => c.workout_session_id === session.id)

              return {
                ...session,
                hasAccess: access.hasAccess,
                accessReason: access.reason as any,
                isCompleted: !!completion as boolean,
                userCompletion: completion || null,
              }
            })
        }

        // 6. Добавляем демо-тренировку ТОЛЬКО для Free пользователей
        if (profileData?.subscription_tier === 'free') {
          const { data: demoSessions } = await supabase
            .from('workout_sessions')
            .select(`
              *,
              exercises:workout_exercises(
                *,
                exercise_library(*)
              )
            `)
            .eq('is_demo', true)
            .limit(1)

          if (demoSessions && demoSessions.length > 0) {
            const demoSession = demoSessions[0]
            const completion = completions?.find(c => c.workout_session_id === demoSession.id)
            
            const demoWithAccess: WorkoutSessionWithAccess = {
              ...demoSession,
              hasAccess: true,
              accessReason: 'subscription',
              isCompleted: !!completion,
              userCompletion: completion || null,
              exercises: (demoSession as any).exercises || []
            }

            // Добавляем демо в начало списка
            sessionsWithAccess = [demoWithAccess, ...sessionsWithAccess]
          }
        }

        // 7. Устанавливаем данные
        if (currentWeek || sessionsWithAccess.length > 0) {
          setWeekData({
            ...(currentWeek || { title: 'Программа', description: '', start_date: '', end_date: '', is_published: true }),
            sessions: sessionsWithAccess,
            isCurrent: true,
          } as ContentWeekWithSessions)
        } else {
          setWeekData(null)
        }
      } catch (err) {
        console.error('Error loading workouts directly:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const selectedSession = weekData?.sessions.find(s => s.id === selectedSessionId)

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
          window.location.reload()
        }} 
      />
    )
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
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-64 rounded-[2.5rem] bg-white/5 animate-pulse border border-white/10" />
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
            <EmptyState
              icon={BookOpen}
              title="Материалы в разработке"
              description="Здесь будут полезные статьи, гайды по питанию, технике выполнения упражнений и многое другое"
              gradient="from-blue-500 to-indigo-500"
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
                          <div className="flex flex-wrap items-center gap-2 mb-2 md:mb-3">
                            {exercise.exercise_library.category && (
                              <Badge className={cn(
                                "text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] px-2 md:px-3 py-0.5 md:py-1 border-none shadow-sm",
                                getCategoryInfo(exercise.exercise_library.category).color
                              )}>
                                {getCategoryInfo(exercise.exercise_library.category).name}
                              </Badge>
                            )}
                          </div>
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
                        { label: 'Подходы', val: exercise.sets, icon: RotateCcw, unit: 'x' },
                        { label: 'Повторы', val: exercise.reps, icon: Zap, unit: exercise.reps && !exercise.reps.toLowerCase().includes('ногу') && !exercise.reps.toLowerCase().includes('секунд') ? 'раз' : '' },
                        { label: 'Отдых', val: exercise.rest_seconds, icon: Clock, unit: 'сек' },
                        { label: 'Инвентарь', val: exercise.exercise_library.inventory || 'Нет', icon: Dumbbell, isInventory: true }
                      ].map((item, i) => (
                        <div key={i} className="group/card relative overflow-hidden p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all flex flex-col justify-between min-h-[80px] md:min-h-[90px]">
                          <div className="relative flex items-center gap-1.5 md:gap-2 text-white/20">
                            <item.icon className="size-3 md:size-3.5" />
                            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                          </div>
                          
                          <div className="relative flex items-baseline mt-auto overflow-hidden">
                            {item.label === 'Подходы' && item.unit && (
                              <span className="text-[12px] md:text-[14px] font-black text-white/20 uppercase leading-none shrink-0 mb-0.5 mr-0.5">
                                {item.unit}
                              </span>
                            )}
                            <div className={cn(
                              "font-oswald font-bold leading-none uppercase text-white whitespace-nowrap",
                              item.isInventory ? (
                                String(item.val).length > 15 ? "text-xs md:text-sm" : "text-base md:text-lg"
                              ) : (
                                String(item.val).length > 18 ? "text-[10px] md:text-[11px]" :
                                String(item.val).length > 14 ? "text-[11px] md:text-[13px]" :
                                String(item.val).length > 10 ? "text-base md:text-lg" : "text-xl md:text-2xl"
                              )
                            )}>
                              {item.val}
                            </div>
                            {item.label !== 'Подходы' && item.unit && (
                              <span className="text-[9px] md:text-[10px] font-black text-white/20 uppercase leading-none shrink-0 ml-1 md:ml-1.5">
                                {item.unit}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Info className={cn("size-3.5 md:size-4", isCompleted || isDemo ? "text-emerald-400" : "text-cyan-400")} />
                        <h4 className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-white/80">Техника выполнения</h4>
                      </div>
                      <div className="text-xs md:text-sm text-white/40 leading-relaxed whitespace-pre-line bg-white/[0.02] p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-white/5">
                        {exercise.exercise_library.technique_steps}
                        
                        {(exercise.exercise_library.light_version || exercise.exercise_library.inventory_alternative) && (
                          <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {exercise.exercise_library.light_version && (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-emerald-400/30">
                                  <Zap className="size-3" />
                                  <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest">Облегченная версия</span>
                                </div>
                                <p className="text-[11px] md:text-xs text-emerald-200/40 italic leading-snug">
                                  {exercise.exercise_library.light_version}
                                </p>
                              </div>
                            )}
                            {exercise.exercise_library.inventory_alternative && (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-white/20">
                                  <Dumbbell className="size-3" />
                                  <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest">Чем заменить инвентарь</span>
                                </div>
                                <p className="text-[11px] md:text-xs text-white/40 italic leading-snug">
                                  {exercise.exercise_library.inventory_alternative}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {exercise.exercise_library.typical_mistakes && (
                      <div className="p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] bg-rose-500/5 border border-rose-500/10 space-y-2 md:space-y-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="size-3.5 md:size-4 text-rose-400/50" />
                          <span className="text-[9px] md:text-[10px] font-bold text-rose-400/50 uppercase tracking-widest">Типичные ошибки</span>
                        </div>
                        <p className="text-[11px] md:text-xs text-rose-200/40 leading-relaxed whitespace-pre-line">
                          {exercise.exercise_library.typical_mistakes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-5">
                    <div className="sticky top-8">
                      <div className="relative aspect-[9/16] w-full max-w-[280px] md:max-w-[320px] mx-auto overflow-hidden rounded-[2.5rem] md:rounded-[3rem] bg-white/5 border border-white/10 shadow-2xl group/video">
                        {exercise.video_kinescope_id ? (
                          <div className="flex h-full items-center justify-center">
                            <div className="text-center space-y-4 p-6 md:p-8">
                              <div className={cn(
                                "w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto ring-4 transition-transform duration-500",
                                isCompleted || isDemo ? "bg-emerald-500/20 ring-emerald-500/10 group-hover/video:scale-110" : "bg-cyan-500/20 ring-cyan-500/10 group-hover/video:scale-110"
                              )}>
                                <Play className={cn("size-6 md:size-8 fill-current", isCompleted || isDemo ? "text-emerald-400" : "text-cyan-400")} />
                              </div>
                              <div className="space-y-2">
                                <div className="text-xs md:text-sm font-bold text-white uppercase tracking-widest">Видео-инструкция</div>
                                <div className="text-[9px] md:text-[10px] text-white/20 font-mono uppercase truncate px-4">
                                  ID: {exercise.video_kinescope_id}
                                </div>
                              </div>
                              <p className="text-[9px] md:text-[10px] text-white/30 leading-relaxed">
                                Видеоплеер будет доступен в ближайшем обновлении
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <div className="text-center space-y-4 p-6 md:p-8">
                              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/10">
                                <Play className="size-6 md:size-8 text-white/10" />
                              </div>
                              <div className="space-y-2">
                                <div className="text-xs md:text-sm font-bold text-white/20 uppercase tracking-widest">Видео готовится</div>
                                <p className="text-[9px] md:text-[10px] text-white/10 leading-relaxed">
                                  Мы скоро добавим видео для этого упражнения
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 pointer-events-none border-[8px] md:border-[12px] border-black/20 rounded-[2.5rem] md:rounded-[3rem]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 md:mt-16">
        {isDemo ? (
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/5 p-8 md:p-12 text-center min-h-[460px] flex items-center justify-center">
            {/* Background Pattern */}
            <AchievementPattern />
            
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-purple-500/5 via-transparent to-transparent pointer-events-none" />
            
            <div className="relative space-y-8 max-w-xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[9px] font-black uppercase tracking-[0.2em]">
                <Sparkles className="size-3" />
                <span>Полный доступ</span>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-3xl md:text-4xl font-oswald font-black uppercase tracking-tight text-white leading-none">
                  Понравилась <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">тренировка?</span>
                </h3>
                <p className="text-white/40 text-sm md:text-base font-medium leading-relaxed max-w-md mx-auto">
                  Получи доступ ко всем тренировкам программы, планам питания и системе отслеживания прогресса.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <button 
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('open-upgrade-modal', { 
                      detail: { tier: 'pro' } 
                    }))
                  }}
                  className="group relative px-8 py-4 rounded-xl bg-white text-black font-black text-xs uppercase tracking-[0.15em] transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/5"
                >
                  Начать трансформацию
                </button>
                <button 
                  onClick={onBack}
                  className="px-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-bold text-xs uppercase tracking-[0.15em] transition-all active:scale-95 border border-white/10"
                >
                  Вернуться
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-[2.5rem] bg-white/[0.02] border border-white/5 p-8 md:p-12 min-h-[460px] flex items-center justify-center">
            {/* Background Pattern */}
            <AchievementPattern />
            
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent pointer-events-none" />

            <WorkoutCompletionBlock 
              sessionId={session.id} 
              isCompleted={!!isCompleted as boolean}
              onComplete={handleComplete}
            />
          </div>
        )}
      </div>
    </motion.div>
  )
}

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  gradient: string
}

function EmptyState({ icon: Icon, title, description, gradient }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 rounded-[3rem] bg-white/[0.03] md:backdrop-blur-md border border-white/10 relative overflow-hidden min-h-[400px]">
      <div 
        className={cn(
          "absolute inset-0 opacity-5 bg-gradient-to-br",
          gradient
        )} 
      />
      
      <div className="relative mb-6">
        <div 
          className={cn(
            "absolute inset-0 blur-2xl opacity-20 bg-gradient-to-br rounded-full",
            gradient
          )}
        />
        <div 
          className={cn(
            "relative w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br",
            gradient
          )}
        >
          <Icon className="w-10 h-10 text-white" />
        </div>
      </div>

      <h3 className="text-2xl font-oswald font-black text-white/90 mb-3 text-center uppercase tracking-wider">
        {title}
      </h3>
      <p className="text-sm text-white/40 text-center max-w-[320px] leading-relaxed font-medium mb-8">
        {description}
      </p>

      <div className="flex items-center gap-2 text-xs text-white/20 font-black uppercase tracking-widest">
        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        Скоро запуск
        <ChevronRight className="w-3 h-3" />
      </div>
    </div>
  )
}
