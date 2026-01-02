import { getCurrentProfile } from "@/lib/actions/profile"
import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { ArrowLeft, ChevronRight, Edit, Plus } from "lucide-react"
import Link from "next/link"
import CreateSessionButton from "./create-session-button"
import SessionActions from "./session-actions"

interface AdminWeekPageProps {
  params: {
    weekId: string
  }
}

export default async function AdminWeekPage({ params }: AdminWeekPageProps) {
  const { weekId } = await params
  const profile = await getCurrentProfile()

  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  const supabase = await createClient()

  // Получить неделю
  const { data: week, error: weekError } = await supabase
    .from('content_weeks')
    .select('*')
    .eq('id', weekId)
    .single()

  if (weekError || !week) {
    notFound()
  }

  // Получить тренировки
  const { data: sessions, error: sessionsError } = await supabase
    .from('workout_sessions')
    .select('*, exercises(count)')
    .eq('week_id', weekId)
    .order('session_number', { ascending: true })

  const workoutSessions = sessions || []

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <Link 
            href="/admin/weeks" 
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-orange-400 transition-colors group"
          >
            <ArrowLeft className="size-3 transition-transform group-hover:-translate-x-1" />
            Назад к неделям
          </Link>
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-bold text-white font-oswald uppercase tracking-tight">
              {week.title}
            </h1>
            <p className="text-sm font-medium text-white/40 uppercase tracking-widest">
              {formatDate(week.start_date)} — {formatDate(week.end_date)}
            </p>
          </div>
        </div>
        <CreateSessionButton weekId={weekId} />
      </div>

      {/* Тренировки */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-white font-oswald uppercase tracking-tight">Тренировки</h2>
          <div className="h-px flex-1 bg-white/5" />
          <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
            {workoutSessions.length} сессий
          </span>
        </div>
        
        {workoutSessions.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {workoutSessions.map((session: any) => (
              <section
                key={session.id}
                className="group relative overflow-hidden rounded-[2rem] bg-white/[0.04] ring-1 ring-white/10 transition-all hover:ring-white/20"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent pointer-events-none" />
                
                <div className="relative z-10 p-6 md:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div className="flex-1 space-y-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-[10px] font-black text-orange-400 uppercase tracking-widest">
                            Тренировка {session.session_number}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                            Уровень: {session.required_tier}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold text-white font-oswald uppercase tracking-tight group-hover:text-orange-400 transition-colors">
                          {session.title}
                        </h3>
                        <p className="text-sm text-white/60 leading-relaxed max-w-2xl mt-2">
                          {session.description || 'Описание отсутствует'}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-6 pt-2">
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Длительность</div>
                          <div className="text-sm font-bold text-white/80">{session.estimated_duration || 0} минут</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Упражнений</div>
                          <div className="text-sm font-bold text-white/80">{session.exercises[0]?.count || 0}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                      <Link href={`/admin/weeks/${weekId}/sessions/${session.id}`} className="w-full">
                        <button className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-orange-500/20">
                          <Edit className="size-4" />
                          Управление
                          <ChevronRight className="size-4" />
                        </button>
                      </Link>
                      <SessionActions session={session} />
                    </div>
                  </div>
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-[2rem] bg-white/[0.04] ring-1 ring-white/10 p-12 text-center">
            <div className="max-w-xs mx-auto space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-white/5 ring-1 ring-white/10 flex items-center justify-center mx-auto">
                <Plus className="size-8 text-white/20" />
              </div>
              <div className="space-y-2">
                <p className="text-white/60 font-medium">Тренировок пока нет</p>
                <p className="text-xs text-white/30 leading-relaxed">Начните планировать программу этой недели, добавив первую тренировку</p>
              </div>
              <CreateSessionButton weekId={weekId} />
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
    month: 'long',
  })
}

