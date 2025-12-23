import { getCurrentProfile } from "@/lib/actions/profile"
import { getAllWeeks } from "@/lib/actions/content"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import CreateWeekButton from "./create-week-button"
import WeekActions from "./week-actions"

export default async function AdminWeeksPage() {
  const profile = await getCurrentProfile()

  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  const weeks = await getAllWeeks()

  return (
    <div className="container mx-auto space-y-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Управление неделями</h1>
          <p className="text-muted-foreground">
            Создавайте и редактируйте недели с тренировками
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin">
            <Button variant="outline">← Назад</Button>
          </Link>
          <CreateWeekButton />
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
        {weeks.length > 0 ? (
          weeks.map((week) => (
            <Card key={week.id} className={week.is_published ? '' : 'opacity-75'}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="size-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {formatDate(week.start_date)} - {formatDate(week.end_date)}
                      </span>
                      {week.is_published ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                          <Eye className="inline size-3 mr-1" />
                          Опубликовано
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          <EyeOff className="inline size-3 mr-1" />
                          Черновик
                        </span>
                      )}
                    </div>
                    <CardTitle>{week.title || 'Без названия'}</CardTitle>
                    <CardDescription className="mt-2">
                      {week.description || 'Описание отсутствует'}
                    </CardDescription>
                  </div>
                  
                  <WeekActions week={week} />
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex gap-2">
                  <Link href={`/admin/weeks/${week.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 size-4" />
                      Управление тренировками
                    </Button>
                  </Link>
                </div>

                <div className="mt-3 text-xs text-muted-foreground">
                  Создано: {new Date(week.created_at).toLocaleDateString('ru-RU')}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex min-h-[200px] items-center justify-center">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Недель пока нет
                </p>
                <CreateWeekButton />
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

