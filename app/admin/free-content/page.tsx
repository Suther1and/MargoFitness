import { getAllFreeContent } from "@/lib/actions/free-content"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Plus, BookOpen } from "lucide-react"
import CreateFreeContentButton from "./create-button"
import FreeContentActions from "./content-actions"

export default async function AdminFreeContentPage() {
  const { data: contents, error } = await getAllFreeContent()

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 size-4" />
              Назад в админку
            </Button>
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-sm font-medium mb-3">
                <BookOpen className="size-4" />
                Управление бесплатными материалами
              </div>
              <h1 className="text-4xl font-bold mb-2">Бесплатные материалы</h1>
              <p className="text-muted-foreground">
                Управление контентом для зарегистрированных пользователей
              </p>
            </div>
            <CreateFreeContentButton />
          </div>
        </div>

        {/* Error */}
        {error && (
          <Card className="border-destructive mb-6">
            <CardHeader>
              <CardTitle className="text-destructive">Ошибка</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Content List */}
        {contents && contents.length > 0 ? (
          <div className="space-y-4">
            {contents.map((content) => (
              <Card key={content.id} className={!content.is_published ? 'opacity-75 border-dashed' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{content.title}</CardTitle>
                        {content.is_published ? (
                          <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium dark:bg-green-900 dark:text-green-300">
                            Опубликовано
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium dark:bg-gray-800 dark:text-gray-300">
                            Черновик
                          </span>
                        )}
                      </div>
                      {content.description && (
                        <CardDescription className="text-base">
                          {content.description}
                        </CardDescription>
                      )}
                    </div>
                    <FreeContentActions content={content} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground line-clamp-3">
                      {content.content}
                    </div>
                    {content.video_url && (
                      <div className="text-xs text-muted-foreground">
                        📹 Видео: <span className="font-mono">{content.video_url}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div>Порядок: {content.order_index}</div>
                      <div>Создано: {new Date(content.created_at).toLocaleDateString('ru-RU')}</div>
                      {content.updated_at !== content.created_at && (
                        <div>Обновлено: {new Date(content.updated_at).toLocaleDateString('ru-RU')}</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center min-h-[300px] text-center">
              <BookOpen className="size-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Материалы не найдены</p>
              <p className="text-sm text-muted-foreground mb-6">
                Создайте первый бесплатный материал для пользователей
              </p>
              <CreateFreeContentButton />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

