import { getCurrentProfile } from "@/lib/actions/profile"
import { getAllWeeks } from "@/lib/actions/content"
import { redirect } from "next/navigation"
import { Calendar, Plus, Edit, Trash2, Eye, EyeOff, ArrowLeft, MoreHorizontal, Clock, ChevronRight, Sparkles, Settings2 } from "lucide-react"
import Link from "next/link"
import CreateWeekButton from "./create-week-button"
import WeekActions from "./week-actions"
import { createClient } from "@/lib/supabase/server"
import { EditWorkoutButton } from "./[weekId]/edit-workout-button"

export default async function AdminWeeksPage() {
  const profile = await getCurrentProfile()

  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  const weeks = await getAllWeeks()
  const supabase = await createClient()
  
  // Получаем демо-тренировку
  const { data: demoWorkouts } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('is_demo', true)
    .limit(1)
  
  const demoWorkout = demoWorkouts?.[0]

  return (
    <div className="space-y-10 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Link 
            href="/admin" 
            className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/80 transition-colors mb-4"
          >
            <ArrowLeft className="size-4" />
            <span>Назад в панель</span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white font-oswald uppercase">
            Контент
          </h1>
          <p className="mt-2 text-white/60">
            Управление тренировочными программами и демо-контентом
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!demoWorkout && (
            <Link href="/admin/weeks/demo/create">
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs uppercase tracking-widest hover:bg-emerald-500/20 transition-all active:scale-95">
                <Sparkles className="size-4" />
                Создать демо
              </button>
            </Link>
          )}
          <CreateWeekButton />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Всего недель', value: weeks.length, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Опубликовано', value: weeks.filter(w => w.is_published).length, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Черновики', value: weeks.filter(w => !w.is_published).length, color: 'text-orange-400', bg: 'bg-orange-500/10' },
        ].map((stat, i) => (
          <div key={i} className="relative overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-6">
            <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${stat.bg} blur-2xl pointer-events-none`} />
            <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-2">{stat.label}</p>
            <div className="text-3xl font-bold font-oswald text-white">{stat.value}</div>
          </div>
        ))}

        {/* Demo Workout Card */}
        {demoWorkout ? (
          <div className="relative overflow-hidden rounded-3xl bg-emerald-500/5 ring-1 ring-emerald-500/20 p-6 group">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-400/60">Демо-тренировка</p>
              <div className="flex items-center gap-2">
                <EditWorkoutButton session={demoWorkout} />
                <Link href={`/admin/weeks/demo/sessions/${demoWorkout.id}`}>
                  <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all active:scale-95 shadow-sm">
                    <Settings2 className="size-4" />
                  </button>
                </Link>
              </div>
            </div>
            <div className="text-xl font-bold font-oswald text-white uppercase truncate mb-1">
              {demoWorkout.title}
            </div>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
              {demoWorkout.estimated_duration} мин • Free
            </p>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-3xl bg-white/[0.02] border border-dashed border-white/10 p-6 flex flex-col items-center justify-center text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">Демо не создана</p>
          </div>
        )}
      </div>

      {/* Weeks List */}

      {/* Weeks List */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Calendar className="size-5 text-purple-400" />
          <h2 className="text-2xl font-bold text-white font-oswald uppercase tracking-tight">График контента</h2>
        </div>
        
        {weeks.length > 0 ? (
          <div className="grid gap-6">
            {weeks.map((week) => (
              <section 
                key={week.id} 
                className={`group relative overflow-hidden rounded-[2rem] bg-white/[0.04] ring-1 ring-white/10 transition-all hover:ring-white/20 ${!week.is_published ? 'opacity-80' : ''}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${week.is_published ? 'from-emerald-500/5' : 'from-orange-500/5'} via-transparent to-transparent pointer-events-none`} />
                
                <div className="relative z-10 p-6 md:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/60">
                          <Clock className="size-3" />
                          {formatDate(week.start_date)} — {formatDate(week.end_date)}
                        </div>
                        {week.is_published ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest ring-1 ring-emerald-500/30">
                            <Eye className="size-3" />
                            Опубликовано
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-[10px] font-bold uppercase tracking-widest ring-1 ring-orange-500/30">
                            <EyeOff className="size-3" />
                            Черновик
                          </span>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-2xl md:text-3xl font-bold text-white font-oswald uppercase tracking-tight mb-2 group-hover:text-purple-300 transition-colors">
                          {week.title || 'Без названия'}
                        </h3>
                        <p className="text-white/50 text-sm leading-relaxed max-w-3xl">
                          {week.description || 'Описание отсутствует для этой недели'}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-white/30">
                        <span>Создано: {new Date(week.created_at).toLocaleDateString('ru-RU')}</span>
                        <div className="w-1 h-1 rounded-full bg-white/10" />
                        <span>ID: {week.id.slice(0, 8)}...</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                      <Link href={`/admin/weeks/${week.id}`} className="w-full">
                        <button className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-purple-500/20">
                          <Edit className="size-4" />
                          Управление
                          <ChevronRight className="size-4" />
                        </button>
                      </Link>
                      <WeekActions week={week} />
                    </div>
                  </div>
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-[2rem] bg-white/[0.04] ring-1 ring-white/10 p-20 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center gap-6">
              <div className="p-6 rounded-full bg-white/5 ring-1 ring-white/10">
                <Calendar className="size-12 text-white/20" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white font-oswald uppercase tracking-tight">Недель пока нет</h3>
                <p className="text-white/40 max-w-sm mx-auto">Создайте свою первую тренировочную неделю, чтобы начать наполнять её контентом.</p>
              </div>
              <CreateWeekButton />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
  })
}
