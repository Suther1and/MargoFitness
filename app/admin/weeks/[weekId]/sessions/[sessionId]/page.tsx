import { getCurrentProfile } from "@/lib/actions/profile"
import { getWorkoutSessionById } from "@/lib/actions/content"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import CreateExerciseButton from "./create-exercise-button"
import ExerciseCard from "./exercise-card"

interface AdminSessionPageProps {
  params: {
    weekId: string
    sessionId: string
  }
}

export default async function AdminSessionPage({ params }: AdminSessionPageProps) {
  const { weekId, sessionId } = await params
  const profile = await getCurrentProfile()

  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  const workout = await getWorkoutSessionById(sessionId)

  if (!workout) {
    notFound()
  }

  return (
    <div className="container mx-auto space-y-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/admin/weeks/${weekId}`}>
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="mr-2 size-4" />
              Назад к тренировкам
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{workout.title}</h1>
          <p className="text-muted-foreground">
            {workout.description || 'Описание отсутствует'}
          </p>
        </div>
        <CreateExerciseButton sessionId={sessionId} />
      </div>

      {/* Упражнения */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Упражнения</h2>
        
        {workout.exercises.length > 0 ? (
          <div className="space-y-3">
            {workout.exercises.map((exercise, index) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                index={index}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex min-h-[200px] items-center justify-center">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Упражнений пока нет
                </p>
                <CreateExerciseButton sessionId={sessionId} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

