import { getCurrentProfile } from "@/lib/actions/profile"
import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, Edit, Trash2 } from "lucide-react"
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
    <div className="container mx-auto space-y-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/weeks">
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="mr-2 size-4" />
              Назад к неделям
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{week.title}</h1>
          <p className="text-muted-foreground">
            {formatDate(week.start_date)} - {formatDate(week.end_date)}
          </p>
        </div>
        <CreateSessionButton weekId={weekId} />
      </div>

      {/* Тренировки */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Тренировки</h2>
        
        {workoutSessions.length > 0 ? (
          workoutSessions.map((session: any) => (
            <Card key={session.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground mb-1">
                      Тренировка {session.session_number}
                    </div>
                    <CardTitle>{session.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {session.description || 'Описание отсутствует'}
                    </CardDescription>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="rounded-full bg-muted px-3 py-1 text-xs">
                        Уровень: {session.required_tier}
                      </span>
                      {session.estimated_duration && (
                        <span className="rounded-full bg-muted px-3 py-1 text-xs">
                          {session.estimated_duration} минут
                        </span>
                      )}
                      <span className="rounded-full bg-muted px-3 py-1 text-xs">
                        Упражнений: {session.exercises[0]?.count || 0}
                      </span>
                    </div>
                  </div>
                  
                  <SessionActions session={session} />
                </div>
              </CardHeader>

              <CardContent className="flex gap-2">
                <Link href={`/admin/weeks/${weekId}/sessions/${session.id}`}>
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 size-4" />
                    Управление упражнениями
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex min-h-[200px] items-center justify-center">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Тренировок пока нет
                </p>
                <CreateSessionButton weekId={weekId} />
              </div>
            </CardContent>
          </Card>
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

