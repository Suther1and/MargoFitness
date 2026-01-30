'use client'

import { useState } from 'react'
import { deleteExercise } from '@/lib/actions/admin'
import { Trash2, Video, Repeat, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { WorkoutExercise, ExerciseLibrary } from '@/types/database'
import EditExerciseButton from './edit-exercise-button'

interface ExerciseCardProps {
  exercise: WorkoutExercise & { exercise_library: ExerciseLibrary }
  index: number
}

export default function ExerciseCard({ exercise, index }: ExerciseCardProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (loading) return

    const confirmed = confirm('Удалить это упражнение? Это действие нельзя отменить!')

    if (!confirmed) return

    setLoading(true)

    const result = await deleteExercise(exercise.id)

    setLoading(false)

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || 'Ошибка удаления')
    }
  }

  return (
    <section className="group relative overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 transition-all hover:ring-white/20">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative z-10 p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex gap-4 flex-1 min-w-0">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm font-black text-blue-400 font-oswald shadow-lg shadow-blue-500/10">
              {index + 1}
            </div>
            <div className="flex-1 space-y-3 min-w-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-purple-400 font-mono uppercase tracking-widest bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                    {exercise.exercise_library_id}
                  </span>
                  <h3 className="text-xl font-bold text-white font-oswald uppercase tracking-tight group-hover:text-blue-400 transition-colors">
                    {exercise.exercise_library.name}
                  </h3>
                </div>
                <p className="text-sm text-white/50 leading-relaxed line-clamp-2 md:line-clamp-none">
                  {exercise.exercise_library.description}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4 pt-1">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  <Video className="size-3 text-white/20" />
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest truncate max-w-[120px]">
                    {exercise.video_kinescope_id || 'Нет видео'}
                  </span>
                </div>
                {exercise.sets && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                    <Repeat className="size-3 text-blue-400/40" />
                    <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">
                      {exercise.sets} подходов
                    </span>
                  </div>
                )}
                {exercise.reps && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                    <Repeat className="size-3 text-blue-400/40" />
                    <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">
                      {exercise.reps} повт.
                    </span>
                  </div>
                )}
                {exercise.rest_seconds && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                    <Clock className="size-3 text-blue-400/40" />
                    <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">
                      Отдых: {exercise.rest_seconds}с
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity self-end md:self-start">
            <EditExerciseButton exercise={exercise} />
            <button
              onClick={handleDelete}
              disabled={loading}
              className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all active:scale-95 disabled:opacity-50"
              title="Удалить"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

