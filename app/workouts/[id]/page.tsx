import { getCurrentProfile } from "@/lib/actions/profile"
import { getWorkoutSessionById, getCurrentWeekWithAccess } from "@/lib/actions/content"
import { checkWorkoutAccess } from "@/lib/access-control"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock, Dumbbell, Play } from "lucide-react"
import WorkoutCompleteButton from "./workout-complete-button"

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

  // Проверить доступ
  const weekData = await getCurrentWeekWithAccess()
  const currentWeek = weekData?.sessions.find(s => s.id === id)
  
  if (!currentWeek) {
    notFound()
  }

  if (!currentWeek.hasAccess) {
    redirect('/pricing')
  }

  const isCompleted = currentWeek.isCompleted
  const userCompletion = currentWeek.userCompletion

  return (
    <div className="container mx-auto space-y-8 py-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/workouts">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="text-sm text-muted-foreground mb-1">
            Тренировка {workout.session_number}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{workout.title}</h1>
          {workout.description && (
            <p className="text-muted-foreground mt-2">{workout.description}</p>
          )}
        </div>
      </div>

      {/* Мета-информация */}
      <div className="flex flex-wrap gap-4">
        {workout.estimated_duration && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-4" />
            <span>{workout.estimated_duration} минут</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Dumbbell className="size-4" />
          <span>{workout.exercises.length} упражнений</span>
        </div>
        {isCompleted && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <span className="rounded-full bg-green-100 px-3 py-1 dark:bg-green-900">
              ✓ Завершено
            </span>
          </div>
        )}
      </div>

      {/* Оценка (если завершено) */}
      {isCompleted && userCompletion && (
        <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="text-green-900 dark:text-green-100">
              Ваша оценка
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-6">
            {userCompletion.rating && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Общая оценка</div>
                <div className="text-2xl">{'⭐'.repeat(userCompletion.rating)}</div>
              </div>
            )}
            {userCompletion.difficulty_rating && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Сложность</div>
                <div className="text-lg">{getDifficultyEmoji(userCompletion.difficulty_rating)}</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Упражнения */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Упражнения</h2>
        
        {workout.exercises.map((exercise, index) => (
          <Card key={exercise.id}>
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <CardTitle>{exercise.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {exercise.description}
                  </CardDescription>
                  
                  {/* Параметры упражнения */}
                  <div className="mt-3 flex flex-wrap gap-3 text-sm">
                    {exercise.sets && (
                      <span className="rounded-full bg-muted px-3 py-1">
                        <strong>Подходы:</strong> {exercise.sets}
                      </span>
                    )}
                    {exercise.reps && (
                      <span className="rounded-full bg-muted px-3 py-1">
                        <strong>Повторения:</strong> {exercise.reps}
                      </span>
                    )}
                    {exercise.rest_seconds && (
                      <span className="rounded-full bg-muted px-3 py-1">
                        <strong>Отдых:</strong> {exercise.rest_seconds} сек
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Placeholder для видео */}
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                <div className="flex h-full items-center justify-center">
                  <div className="text-center space-y-2">
                    <Play className="mx-auto size-12 text-muted-foreground" />
                    <div className="text-sm text-muted-foreground">
                      Видео: {exercise.video_kinescope_id}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      (Kinescope player будет добавлен позже)
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Кнопка завершения */}
      {!isCompleted && (
        <Card className="border-2 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <h3 className="text-xl font-bold">Завершили тренировку?</h3>
              <p className="text-sm text-muted-foreground">
                Отметьте тренировку как завершенную и поделитесь впечатлениями
              </p>
              <WorkoutCompleteButton sessionId={id} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Кнопка повторить */}
      {isCompleted && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <h3 className="text-xl font-bold">Хотите пройти снова?</h3>
              <WorkoutCompleteButton 
                sessionId={id} 
                isRetake={true}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Навигация */}
      <div className="flex justify-center">
        <Link href="/workouts">
          <Button variant="outline">
            <ArrowLeft className="mr-2 size-4" />
            Вернуться к тренировкам
          </Button>
        </Link>
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

