import { getCurrentProfile } from "@/lib/actions/profile"
import { getWorkoutSessionById, getWorkoutExercises, getUserCompletions } from "@/lib/actions/content"
import { getCurrentWeek, checkWorkoutAccess } from "@/lib/access-control"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock, Dumbbell, Play, CheckCircle2, AlertTriangle, Info, ChevronRight, Sparkles, Repeat, Zap, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { WorkoutCompletionBlock } from "./workout-completion-block"

interface WorkoutPageProps {
  params: {
    id: string
  }
}

export default async function WorkoutPage({ params }: WorkoutPageProps) {
  const { id } = await params
  const profile = await getCurrentProfile()

  if (!profile) {
    redirect('/')
  }

  const workout = await getWorkoutSessionById(id)

  if (!workout) {
    notFound()
  }

  // Проверить доступ через getCurrentWeekWithAccess логику
  const supabase = await (await import('@/lib/supabase/server')).createClient()
  const { data: weeks } = await supabase
    .from('content_weeks')
    .select('*')
    .eq('is_published', true)
    .order('start_date', { ascending: false })

  const currentWeek = getCurrentWeek(weeks || [], profile)
  const access = checkWorkoutAccess(workout, profile, currentWeek)
  
  if (!access.hasAccess) {
    redirect('/dashboard?tab=subscription')
  }

  const completions = await getUserCompletions(profile.id)
  const userCompletion = completions.find(c => c.workout_session_id === id)
  const isCompleted = !!userCompletion

  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-cyan-500/30 font-sans pb-20 text-left">
      {/* Ambient BG */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-8 md:mb-12">
          <Link 
            href="/dashboard?tab=workouts"
            className="group flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-95"
          >
            <ArrowLeft className="size-4 text-white/40 group-hover:text-white transition-colors" />
            <span className="text-xs font-bold uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">Назад в кабинет</span>
          </Link>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-[10px] font-mono px-2 py-0.5 border-white/10 text-white/40">
              ID: {workout.id.slice(0, 8)}
            </Badge>
            {isCompleted && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="size-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Выполнена</span>
              </div>
            )}
          </div>
        </div>

        {/* Hero Section */}
        <div className="mb-12 md:mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center border",
                  isCompleted ? "bg-emerald-500/10 border-emerald-500/20" : "bg-cyan-500/10 border-cyan-500/20"
                )}>
                  <Dumbbell className={cn("size-6", isCompleted ? "text-emerald-400" : "text-cyan-400")} />
                </div>
                <div>
                  <div className={cn(
                    "text-[10px] font-bold uppercase tracking-[0.2em] leading-none mb-1",
                    isCompleted ? "text-emerald-500/50" : "text-cyan-500/50"
                  )}>Тренировка {workout.session_number}</div>
                  <h1 className={cn(
                    "text-4xl md:text-6xl font-oswald font-black uppercase tracking-tighter leading-none transition-colors",
                    isCompleted ? "hover:text-emerald-400" : "hover:text-cyan-400"
                  )}>
                    {workout.title}
                  </h1>
                </div>
              </div>
              {workout.description && (
                <p className="text-lg text-white/40 leading-relaxed font-medium">
                  {workout.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl">
              <div className="text-center">
                <div className="flex items-center gap-2 text-white/20 mb-1 justify-center">
                  <Clock className="size-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Время</span>
                </div>
                <div className="text-xl font-oswald font-bold">{workout.estimated_duration || 45} <span className="text-xs text-white/40 uppercase">мин</span></div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <div className="flex items-center gap-2 text-white/20 mb-1 justify-center">
                  <Zap className="size-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Упражнения</span>
                </div>
                <div className="text-xl font-oswald font-bold">{workout.exercises.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Exercises List */}
        <div className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-white/20">Программа тренировки</h2>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
          </div>

          {workout.exercises.map((exercise, index) => (
            <div 
              key={exercise.id}
              className="group relative overflow-hidden rounded-[3rem] bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all duration-500"
            >
              <div className="p-8 md:p-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  
                  {/* Left: Info (7/12) */}
                  <div className="lg:col-span-7 space-y-8">
                    <div className="flex items-start gap-6">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border shrink-0 transition-colors",
                        isCompleted ? "group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20" : "group-hover:bg-cyan-500/10 group-hover:border-cyan-500/20"
                      )}>
                        <span className={cn(
                          "text-2xl font-oswald font-black text-white/20 transition-colors",
                          isCompleted ? "group-hover:text-emerald-400" : "group-hover:text-cyan-400"
                        )}>{index + 1}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline" className="text-[9px] font-mono border-white/10 text-white/30 px-1.5 py-0">
                            {exercise.exercise_library.category}
                          </Badge>
                        </div>
                        <h3 className={cn(
                          "text-2xl md:text-3xl font-oswald font-bold text-white uppercase tracking-tight leading-tight mb-4 transition-colors",
                          isCompleted ? "group-hover:text-emerald-400" : "group-hover:text-cyan-400"
                        )}>
                          {exercise.exercise_library.name}
                        </h3>
                        <p className="text-sm text-white/50 leading-relaxed italic border-l-2 border-white/10 pl-4">
                          {exercise.exercise_library.description}
                        </p>
                      </div>
                    </div>

                    {/* Params Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center space-y-1">
                        <div className="flex items-center justify-center gap-1.5 text-white/20">
                          <Repeat className="size-3" />
                          <span className="text-[9px] font-bold uppercase tracking-widest">Подходы</span>
                        </div>
                        <div className="text-xl font-oswald font-bold text-white">{exercise.sets}</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center space-y-1">
                        <div className="flex items-center justify-center gap-1.5 text-white/20">
                          <Sparkles className="size-3" />
                          <span className="text-[9px] font-bold uppercase tracking-widest">Повторы</span>
                        </div>
                        <div className="text-xl font-oswald font-bold text-white">{exercise.reps}</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center space-y-1">
                        <div className="flex items-center justify-center gap-1.5 text-white/20">
                          <Clock className="size-3" />
                          <span className="text-[9px] font-bold uppercase tracking-widest">Отдых</span>
                        </div>
                        <div className="text-xl font-oswald font-bold text-white">{exercise.rest_seconds} <span className="text-[10px] text-white/40 uppercase">сек</span></div>
                      </div>
                      {exercise.exercise_library.inventory && (
                        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-center space-y-1">
                          <div className="flex items-center justify-center gap-1.5 text-amber-400/40">
                            <Dumbbell className="size-3" />
                            <span className="text-[9px] font-bold uppercase tracking-widest">Инвентарь</span>
                          </div>
                          <div className="text-[11px] font-bold text-amber-200/70 leading-tight uppercase line-clamp-2">
                            {exercise.exercise_library.inventory}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Technique Steps */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Info className={cn("size-4", isCompleted ? "text-emerald-400" : "text-cyan-400")} />
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/80">Техника выполнения</h4>
                      </div>
                      <div className="text-sm text-white/40 leading-relaxed whitespace-pre-line bg-white/[0.02] p-6 rounded-[2rem] border border-white/5">
                        {exercise.exercise_library.technique_steps}
                        
                        {/* Альтернатива и облегченная версия */}
                        {(exercise.exercise_library.inventory_alternative || exercise.exercise_library.light_version) && (
                          <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {exercise.exercise_library.inventory_alternative && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-white/20">
                                  <Dumbbell className="size-3" />
                                  <span className="text-[9px] font-bold uppercase tracking-widest">Чем заменить инвентарь</span>
                                </div>
                                <p className="text-xs text-white/40 italic">
                                  {exercise.exercise_library.inventory_alternative}
                                </p>
                              </div>
                            )}
                            {exercise.exercise_library.light_version && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-emerald-400/30">
                                  <Zap className="size-3" />
                                  <span className="text-[9px] font-bold uppercase tracking-widest">Облегченная версия</span>
                                </div>
                                <p className="text-xs text-emerald-200/40 italic">
                                  {exercise.exercise_library.light_version}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Typical Mistakes */}
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

                  {/* Right: Video (5/12) */}
                  <div className="lg:col-span-5">
                    <div className="sticky top-8">
                      <div className="relative aspect-[9/16] w-full max-w-[320px] mx-auto overflow-hidden rounded-[3rem] bg-white/5 border border-white/10 shadow-2xl group/video">
                        {exercise.video_kinescope_id ? (
                          <div className="flex h-full items-center justify-center">
                            <div className="text-center space-y-4 p-8">
                              <div className={cn(
                                "w-20 h-20 rounded-full flex items-center justify-center mx-auto ring-4 transition-transform duration-500",
                                isCompleted ? "bg-emerald-500/20 ring-emerald-500/10 group-hover/video:scale-110" : "bg-cyan-500/20 ring-cyan-500/10 group-hover/video:scale-110"
                              )}>
                                <Play className={cn("size-8 fill-current", isCompleted ? "text-emerald-400" : "text-cyan-400")} />
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
                        
                        {/* Decorative Overlay */}
                        <div className="absolute inset-0 pointer-events-none border-[12px] border-black/20 rounded-[3rem]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Completion Section */}
        <div className="mt-12 md:mt-16">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-white/[0.02] border border-white/5 p-8 md:p-12">
            <WorkoutCompletionBlock 
              sessionId={id} 
              isCompleted={isCompleted} 
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function getDifficultyEmoji(rating: number): string {
  const emojis: Record<number, string> = {
    1: '😊 Легко',
    2: '🙂 Нормально',
    3: '😐 Средне',
    4: '😅 Тяжело',
    5: '😰 Очень тяжело',
  }
  return emojis[rating] || 'Не оценено'
}
