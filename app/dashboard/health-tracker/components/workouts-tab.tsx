'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dumbbell, BookOpen, Zap, ChevronRight, Lock, CheckCircle2, Play, Clock, ArrowLeft, Sparkles, Repeat, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getDashboardWorkouts } from '@/lib/actions/dashboard-workouts'
import type { ContentWeekWithSessions, WorkoutSessionWithAccess } from '@/types/database'
import { Badge } from '@/components/ui/badge'
import WorkoutCompleteButton from '@/app/workouts/[id]/workout-complete-button'

type WorkoutSubTab = 'workouts' | 'materials' | 'intensives'

export function WorkoutsTab() {
  const [activeSubTab, setActiveSubTab] = useState<WorkoutSubTab>('workouts')
  const [loading, setLoading] = useState(true)
  const [weekData, setWeekData] = useState<ContentWeekWithSessions | null>(null)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)

  useEffect(() => {
    const handleReset = () => setSelectedSessionId(null)
    window.addEventListener('reset-workout-selection', handleReset)
    return () => window.removeEventListener('reset-workout-selection', handleReset)
  }, [])

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const result = await getDashboardWorkouts()
        if (result.success) {
          setWeekData(result.data)
        } else {
          console.error('Failed to load workouts:', result.error)
        }
      } catch (err) {
        console.error('Runtime error loading workouts:', err)
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
  ]

  if (selectedSession) {
    return (
      <WorkoutDetail 
        session={selectedSession} 
        onBack={() => setSelectedSessionId(null)} 
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
                      onClick={() => session.hasAccess && setSelectedSessionId(session.id)}
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
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function WorkoutCard({ session, onClick }: { session: WorkoutSessionWithAccess, onClick: () => void }) {
  const isLocked = !session.hasAccess

  return (
    <button 
      onClick={onClick}
      className={cn(
        "relative group overflow-hidden rounded-[2.5rem] border transition-all duration-500 text-left w-full",
        isLocked 
          ? "bg-white/[0.02] border-white/5 opacity-60 grayscale-[0.5] cursor-not-allowed" 
          : "bg-white/[0.03] border-white/10 hover:border-cyan-500/30 hover:bg-white/[0.05] shadow-xl hover:shadow-cyan-500/10",
        session.isCompleted && "border-emerald-500/30 bg-emerald-500/[0.02]"
      )}
    >
      {!isLocked && (
        <div className="absolute -inset-24 bg-cyan-500/5 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      )}

      <div className="relative p-8 flex flex-col h-full min-h-[280px]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center border transition-colors",
              isLocked ? "bg-white/5 border-white/10" : "bg-cyan-500/10 border-cyan-500/20"
            )}>
              {isLocked ? <Lock className="size-5 text-white/20" /> : <Dumbbell className="size-5 text-cyan-400" />}
            </div>
            <div>
              <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest leading-none mb-1">Тренировка {session.session_number}</div>
              <Badge variant="outline" className={cn(
                "text-[9px] font-mono px-1.5 py-0 uppercase tracking-tighter",
                session.required_tier === 'pro' ? "text-purple-400 border-purple-400/30" : "text-cyan-400 border-cyan-400/30"
              )}>
                {session.required_tier === 'pro' ? 'Pro+' : 'Basic'}
              </Badge>
            </div>
          </div>
          
          {session.isCompleted && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="size-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Готово</span>
            </div>
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-2xl font-oswald font-black text-white uppercase tracking-tight mb-3 group-hover:text-cyan-400 transition-colors">
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
            <div className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white/20 font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2">
              Открыть доступ
              <ChevronRight className="size-4" />
            </div>
          ) : (
            <div className="w-full py-4 rounded-2xl bg-cyan-500 text-black font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 group-hover:scale-[1.02] transition-transform">
              <Play className="size-4 fill-current" />
              Начать тренировку
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

function WorkoutDetail({ session, onBack }: { session: WorkoutSessionWithAccess, onBack: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8 pb-24 text-left"
    >
      <div className="relative mb-16 group">
        {/* Subtle background glow */}
        <div className="absolute -left-24 -top-24 w-80 h-80 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative space-y-6">
          {/* Navigation - aligned with the content start */}
          <button 
            onClick={onBack}
            className="group/btn flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 w-fit"
          >
            <ArrowLeft className="size-4 text-white/40 group-hover/btn:text-white transition-colors" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 group-hover/btn:text-white transition-colors">Назад к списку</span>
          </button>

          <div className="space-y-4">
            {/* Elegant Info Row - Now all stats are grouped on the right */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="flex-1 min-w-0">
                <h1 className="text-5xl md:text-7xl font-oswald font-black uppercase tracking-tighter leading-[0.85] text-white truncate">
                  {session.title}
                </h1>
              </div>

              {/* All Stats grouped to the right, aligned with the bottom of the title */}
              <div className="flex items-center gap-5 text-[10px] font-black uppercase tracking-[0.3em] pb-1 shrink-0">
                <div className="flex items-center gap-2 text-cyan-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.4)]" />
                  <span>Тренировка {session.session_number}</span>
                </div>
                
                <div className="w-px h-3 bg-white/10" />
                
                <div className="flex items-center gap-2 text-white/30">
                  <Clock className="size-3.5 text-white/10" />
                  <span>{session.estimated_duration || 45} мин</span>
                </div>
                
                <div className="w-px h-3 bg-white/10" />
                
                <div className="flex items-center gap-2 text-white/30">
                  <Zap className="size-3.5 text-white/10" />
                  <span>{session.exercises?.length || 0} упражнений</span>
                </div>
                
                {session.isCompleted && (
                  <>
                    <div className="w-px h-3 bg-white/10" />
                    <div className="flex items-center gap-2 text-emerald-400/80">
                      <CheckCircle2 className="size-3.5" />
                      <span>OK</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {session.description && (
        <p className="text-xl text-white/40 leading-relaxed font-medium max-w-3xl mb-12 border-l-2 border-white/10 pl-6 italic">
          {session.description}
        </p>
      )}

      <div className="space-y-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-white/20">Программа тренировки</h2>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
        </div>

        {session.exercises?.map((exercise, index) => (
          <div 
            key={exercise.id}
            className="group relative overflow-hidden rounded-[3rem] bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all duration-500"
          >
            <div className="p-8 md:p-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-7 space-y-8">
                  <div className="flex items-start gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/20 transition-colors">
                      <span className="text-2xl font-oswald font-black text-white/20 group-hover:text-cyan-400 transition-colors">{index + 1}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge className={cn(
                          "text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1 border-none shadow-sm",
                          exercise.exercise_library.name.includes('Приседания') ? "bg-orange-500/20 text-orange-400" :
                          exercise.exercise_library.name.includes('Тяга') ? "bg-cyan-500/20 text-cyan-400" :
                          exercise.exercise_library.name.includes('Выпады') ? "bg-yellow-500/20 text-yellow-400" :
                          exercise.exercise_library.name.includes('Планка') ? "bg-purple-500/20 text-purple-400" :
                          exercise.exercise_library.name.includes('Отжимания') ? "bg-emerald-500/20 text-emerald-400" :
                          "bg-white/10 text-white/60"
                        )}>
                          {exercise.exercise_library.name.split(' ')[0]}
                        </Badge>
                      </div>
                      <h3 className="text-3xl md:text-5xl font-oswald font-black text-white uppercase tracking-tight leading-[0.9] mb-4">
                        {exercise.exercise_library.name}
                      </h3>
                      <p className="text-sm text-white/40 leading-relaxed italic border-l-2 border-white/10 pl-4">
                        {exercise.exercise_library.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Подходы', val: exercise.sets, icon: Repeat, color: 'text-cyan-400' },
                      { label: 'Повторы', val: exercise.reps, icon: Sparkles, color: 'text-yellow-400' },
                      { label: 'Отдых', val: `${exercise.rest_seconds} сек`, icon: Clock, color: 'text-purple-400' },
                      { label: 'Инвентарь', val: exercise.exercise_library.inventory || 'Нет', icon: Dumbbell, color: 'text-orange-400' }
                    ].map((item, i) => (
                      <div key={i} className="flex-1 min-w-[120px] h-20 p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col items-center justify-center text-center group/item hover:bg-white/[0.05] hover:border-white/10 transition-all">
                        <div className="flex items-center gap-1.5 mb-1 opacity-30 group-hover/item:opacity-50 transition-opacity">
                          <item.icon className="size-3" />
                          <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
                        </div>
                        <div className={cn(
                          "font-oswald font-bold leading-none uppercase",
                          item.color,
                          String(item.val).length > 10 ? "text-[10px]" : "text-lg"
                        )}>
                          {item.val}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Info className="size-4 text-cyan-400" />
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/80">Техника выполнения</h4>
                    </div>
                    <div className="text-sm text-white/40 leading-relaxed whitespace-pre-line bg-white/[0.02] p-6 rounded-[2rem] border border-white/5">
                      {exercise.exercise_library.technique_steps}
                      
                      {/* Альтернатива и облегченная версия */}
                      {(exercise.exercise_library.light_version || exercise.exercise_library.inventory_alternative) && (
                        <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                          {exercise.exercise_library.light_version && (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-emerald-400/30">
                                <Zap className="size-3" />
                                <span className="text-[9px] font-bold uppercase tracking-widest">Облегченная версия</span>
                              </div>
                              <p className="text-xs text-emerald-200/40 italic leading-snug">
                                {exercise.exercise_library.light_version}
                              </p>
                            </div>
                          )}
                          {exercise.exercise_library.inventory_alternative && (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-white/20">
                                <Dumbbell className="size-3" />
                                <span className="text-[9px] font-bold uppercase tracking-widest">Чем заменить инвентарь</span>
                              </div>
                              <p className="text-xs text-white/40 italic leading-snug">
                                {exercise.exercise_library.inventory_alternative}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {exercise.exercise_library.typical_mistakes && (
                    <div className="p-6 rounded-[2rem] bg-rose-500/5 border border-rose-500/10 space-y-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="size-4 text-rose-400/50" />
                        <span className="text-[10px] font-bold text-rose-400/50 uppercase tracking-widest">Типичные ошибки</span>
                      </div>
                      <p className="text-xs text-rose-200/40 leading-relaxed whitespace-pre-line">
                        {exercise.exercise_library.typical_mistakes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-5">
                  <div className="sticky top-8">
                    <div className="relative aspect-[9/16] w-full max-w-[320px] mx-auto overflow-hidden rounded-[3rem] bg-white/5 border border-white/10 shadow-2xl group/video">
                      {exercise.video_kinescope_id ? (
                        <div className="flex h-full items-center justify-center">
                          <div className="text-center space-y-4 p-8">
                            <div className="w-20 h-20 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto ring-4 ring-cyan-500/10 group-hover/video:scale-110 transition-transform duration-500">
                              <Play className="size-8 text-cyan-400 fill-current" />
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm font-bold text-white uppercase tracking-widest">Видео-инструкция</div>
                              <div className="text-[10px] text-white/20 font-mono uppercase truncate px-4">
                                ID: {exercise.video_kinescope_id}
                              </div>
                            </div>
                            <p className="text-[10px] text-white/30 leading-relaxed">
                              Плеер Kinescope будет интегрирован в следующем обновлении
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <div className="text-center space-y-4 p-8">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/10">
                              <Play className="size-8 text-white/10" />
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm font-bold text-white/20 uppercase tracking-widest">Видео готовится</div>
                              <p className="text-[10px] text-white/10 leading-relaxed">
                                Мы скоро добавим видео для этого упражнения
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 pointer-events-none border-[12px] border-black/20 rounded-[3rem]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20">
        <div className="relative overflow-hidden rounded-[3.5rem] bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-transparent border border-white/10 p-10 md:p-16 text-center">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px]" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px]" />
          
          <div className="relative space-y-8 max-w-xl mx-auto">
            <div className="w-20 h-20 rounded-[2.5rem] bg-white/5 flex items-center justify-center mx-auto border border-white/10 shadow-2xl">
              <CheckCircle2 className={cn("size-10", session.isCompleted ? "text-emerald-400" : "text-white/20")} />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-3xl md:text-4xl font-oswald font-black uppercase tracking-tight">
                {session.isCompleted ? 'Тренировка завершена!' : 'Завершили тренировку?'}
              </h3>
              <p className="text-white/40 font-medium">
                {session.isCompleted 
                  ? 'Отличная работа! Вы можете обновить свою оценку или пройти тренировку заново.' 
                  : 'Отметьте свой прогресс, поставьте оценку и двигайтесь к цели!'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <WorkoutCompleteButton 
                sessionId={session.id} 
                isRetake={session.isCompleted}
              />
              <button 
                onClick={onBack}
                className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-[0.2em] transition-all active:scale-95 border border-white/10"
              >
                К списку тренировок
              </button>
            </div>
          </div>
        </div>
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
