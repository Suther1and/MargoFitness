'use client'

import { useState } from 'react'
import { deleteExercise } from '@/lib/actions/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Exercise } from '@/types/database'
import EditExerciseButton from './edit-exercise-button'

interface ExerciseCardProps {
  exercise: Exercise
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
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3 flex-1">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {index + 1}
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">{exercise.title}</CardTitle>
              <CardDescription className="mt-1">
                {exercise.description}
              </CardDescription>
              
              <div className="flex flex-wrap gap-2 mt-3 text-xs">
                <span className="rounded-full bg-muted px-2 py-1">
                  Видео: {exercise.video_kinescope_id}
                </span>
                {exercise.sets && (
                  <span className="rounded-full bg-muted px-2 py-1">
                    Подходы: {exercise.sets}
                  </span>
                )}
                {exercise.reps && (
                  <span className="rounded-full bg-muted px-2 py-1">
                    Повторения: {exercise.reps}
                  </span>
                )}
                {exercise.rest_seconds && (
                  <span className="rounded-full bg-muted px-2 py-1">
                    Отдых: {exercise.rest_seconds}с
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <EditExerciseButton exercise={exercise} />
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={loading}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}

