import { getCurrentProfile } from "@/lib/actions/profile"
import { getWorkoutSessionById } from "@/lib/actions/content"
import { redirect, notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
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
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <Link 
            href={`/admin/weeks/${weekId}`} 
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-orange-400 transition-colors group"
          >
            <ArrowLeft className="size-3 transition-transform group-hover:-translate-x-1" />
            Назад к тренировкам
          </Link>
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-bold text-white font-oswald uppercase tracking-tight">
              {workout.title}
            </h1>
            <p className="text-sm font-medium text-white/60 leading-relaxed max-w-2xl">
              {workout.description || 'Описание отсутствует'}
            </p>
          </div>
        </div>
      </div>

      {/* Упражнения */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-white font-oswald uppercase tracking-tight">Упражнения</h2>
          <div className="h-px flex-1 bg-white/5" />
          <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
            {workout.exercises?.length || 0} упражнений
          </span>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {workout.exercises && workout.exercises.length > 0 && workout.exercises.map((exercise: any, index: number) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              index={index}
            />
          ))}
          <CreateExerciseButton 
            sessionId={sessionId} 
            nextOrderIndex={(workout.exercises?.length || 0) + 1} 
          />
        </div>
      </div>
    </div>
  )
}

