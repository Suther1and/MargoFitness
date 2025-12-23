import { getCurrentWeekWithAccess } from "@/lib/actions/content"
import { getCurrentProfile } from "@/lib/actions/profile"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock, Play, CheckCircle, Crown, Calendar } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getTierDisplayName } from "@/lib/access-control"

export default async function WorkoutsPage() {
  const profile = await getCurrentProfile()

  if (!profile) {
    redirect('/auth/login?redirect=/workouts')
  }

  const weekData = await getCurrentWeekWithAccess()

  return (
    <div className="container mx-auto space-y-8 py-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Тренировки недели</h1>
        <p className="text-muted-foreground">
          Ваша подписка: <strong>{getTierDisplayName(profile.subscription_tier)}</strong>
        </p>
      </div>

      {/* Информация о неделе */}
      {weekData && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="size-5" />
                  {weekData.title}
                </CardTitle>
                <CardDescription className="mt-2">
                  {weekData.description}
                </CardDescription>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <div>{formatDate(weekData.start_date)} -</div>
                <div>{formatDate(weekData.end_date)}</div>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Статистика */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Тренировок на неделе</CardDescription>
            <CardTitle className="text-3xl">{weekData?.sessions.length || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Доступно вам</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {weekData?.sessions.filter(s => s.hasAccess).length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Заблокировано</CardDescription>
            <CardTitle className="text-3xl text-muted-foreground">
              {weekData?.sessions.filter(s => !s.hasAccess).length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Завершено</CardDescription>
            <CardTitle className="text-3xl">
              {weekData?.sessions.filter(s => s.isCompleted).length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Список тренировок */}
      {weekData && weekData.sessions.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {weekData.sessions.map((session) => (
            <Card key={session.id} className={session.hasAccess ? '' : 'opacity-75'}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      Тренировка {session.session_number}
                    </div>
                    <CardTitle className="flex items-center gap-2">
                      {session.isCompleted ? (
                        <CheckCircle className="size-5 text-green-600" />
                      ) : session.hasAccess ? (
                        <Play className="size-5 text-primary" />
                      ) : (
                        <Lock className="size-5 text-muted-foreground" />
                      )}
                      {session.title}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {session.description || 'Описание скоро появится'}
                    </CardDescription>
                  </div>
                </div>

                {/* Мета-информация */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className={`rounded-full px-2 py-1 text-xs ${getTierBadgeColor(session.required_tier)}`}>
                    {getTierDisplayName(session.required_tier)}+
                  </span>
                  {session.estimated_duration && (
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {session.estimated_duration} мин
                    </span>
                  )}
                  {session.exercises && session.exercises.length > 0 && (
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      {session.exercises.length} упражнений
                    </span>
                  )}
                  {session.isCompleted && (
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700 dark:bg-green-900 dark:text-green-300">
                      ✓ Завершено
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Рейтинг (если тренировка завершена) */}
                {session.isCompleted && session.userCompletion && (
                  <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
                    {session.userCompletion.rating && (
                      <div>
                        Оценка: {'⭐'.repeat(session.userCompletion.rating)}
                      </div>
                    )}
                    {session.userCompletion.difficulty_rating && (
                      <div>
                        Сложность: {getDifficultyLabel(session.userCompletion.difficulty_rating)}
                      </div>
                    )}
                  </div>
                )}

                {/* Статус доступа */}
                {!session.hasAccess && (
                  <div className="rounded-lg p-3 text-sm bg-muted text-muted-foreground">
                    Требуется подписка {getTierDisplayName(session.required_tier)} или выше
                  </div>
                )}

                {/* Кнопки действий */}
                {session.hasAccess ? (
                  <Link href={`/workouts/${session.id}`}>
                    <Button className="w-full">
                      <Play className="mr-2 size-4" />
                      {session.isCompleted ? 'Пройти снова' : 'Начать'}
                    </Button>
                  </Link>
                ) : (
                  <Link href="/pricing">
                    <Button variant="outline" className="w-full">
                      <Crown className="mr-2 size-4" />
                      Получить доступ
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex min-h-[200px] items-center justify-center">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                {weekData ? 'На этой неделе тренировок пока нет' : 'Недели с тренировками не найдено'}
              </p>
              <p className="text-sm text-muted-foreground">
                Новые тренировки появляются каждый понедельник
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
  })
}

function getTierBadgeColor(tier: string): string {
  const colors: Record<string, string> = {
    free: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    basic: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    pro: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    elite: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  }
  return colors[tier] || colors.free
}

function getDifficultyLabel(rating: number): string {
  const labels: Record<number, string> = {
    1: '😊 Легко',
    2: '🙂 Нормально',
    3: '😐 Средне',
    4: '😅 Тяжело',
    5: '😰 Очень тяжело',
  }
  return labels[rating] || 'Не оценено'
}
