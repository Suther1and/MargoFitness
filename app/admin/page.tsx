import { getCurrentProfile } from "@/lib/actions/profile"
import { getAllWeeks } from "@/lib/actions/content"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Plus, FileText, BookOpen, Users, TrendingUp } from "lucide-react"
import Link from "next/link"

export default async function AdminPage() {
  const profile = await getCurrentProfile()

  // Проверка доступа: только для админов
  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  const weeks = await getAllWeeks()

  return (
    <div className="container mx-auto space-y-8 py-10">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Админ-панель</h1>
          <p className="text-muted-foreground">
            Управление контентом и тренировками
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/analytics">
            <Button variant="outline">
              <TrendingUp className="mr-2 size-4" />
              Аналитика
            </Button>
          </Link>
          <Link href="/admin/users">
            <Button variant="outline">
              <Users className="mr-2 size-4" />
              Пользователи
            </Button>
          </Link>
          <Link href="/admin/free-content">
            <Button variant="outline">
              <BookOpen className="mr-2 size-4" />
              Бесплатные материалы
            </Button>
          </Link>
          <Link href="/admin/weeks">
            <Button>
              <Calendar className="mr-2 size-4" />
              Управление неделями
            </Button>
          </Link>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Всего недель</CardDescription>
            <CardTitle className="text-3xl">{weeks.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Опубликованных</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {weeks.filter(w => w.is_published).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Черновиков</CardDescription>
            <CardTitle className="text-3xl text-muted-foreground">
              {weeks.filter(w => !w.is_published).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Список недель */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Недели контента</h2>
        
        {weeks.length > 0 ? (
          <div className="grid gap-4">
            {weeks.map((week) => (
              <Card key={week.id} className={week.is_published ? '' : 'opacity-75'}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="size-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {formatDate(week.start_date)} - {formatDate(week.end_date)}
                        </span>
                      </div>
                      <CardTitle>{week.title || 'Без названия'}</CardTitle>
                      <CardDescription className="mt-2">
                        {week.description || 'Описание отсутствует'}
                      </CardDescription>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {week.is_published ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                          Опубликовано
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          Черновик
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-2">
                  <div className="flex gap-2">
                    <Link href={`/admin/weeks/${week.id}`}>
                      <Button variant="outline" size="sm">
                        <FileText className="mr-2 size-4" />
                        Управление
                      </Button>
                    </Link>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Создано: {new Date(week.created_at).toLocaleDateString('ru-RU')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex min-h-[200px] items-center justify-center">
              <div className="text-center space-y-2">
                <p className="text-muted-foreground">
                  Недель пока нет
                </p>
                <Link href="/admin/weeks">
                  <Button>
                    <Plus className="mr-2 size-4" />
                    Создать первую неделю
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Примечание */}
      <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="text-amber-900 dark:text-amber-100">
            📝 Заметка
          </CardTitle>
          <CardDescription className="text-amber-700 dark:text-amber-300">
            CRUD админка готова! Вы можете создавать недели, тренировки и упражнения.
            Перейдите в "Управление неделями" для начала работы.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

