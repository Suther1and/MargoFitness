import { getFreeContentById } from "@/lib/actions/free-content"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, BookOpen, Video } from "lucide-react"
import { notFound } from "next/navigation"

export default async function FreeContentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { data: content, error } = await getFreeContentById(id)

  if (error || !content) {
    notFound()
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link href="/free-content">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 size-4" />
            Назад к материалам
          </Button>
        </Link>

        {/* Content Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-sm font-medium mb-4 w-fit">
              <BookOpen className="size-4" />
              Бесплатный материал
            </div>
            <CardTitle className="text-3xl sm:text-4xl">{content.title}</CardTitle>
            {content.description && (
              <CardDescription className="text-lg mt-2">
                {content.description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Video Player Placeholder */}
            {content.video_url && (
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                <div className="text-center p-8">
                  <Video className="size-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">
                    Видео: <span className="font-mono text-sm">{content.video_url}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    (Интеграция с Kinescope будет добавлена позже)
                  </p>
                </div>
              </div>
            )}

            {/* Content Text */}
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <div className="whitespace-pre-line text-base leading-relaxed">
                {content.content}
              </div>
            </div>

            {/* Meta Info */}
            <div className="pt-6 border-t">
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div>
                  <strong>Создано:</strong> {new Date(content.created_at).toLocaleDateString('ru-RU')}
                </div>
                {content.updated_at !== content.created_at && (
                  <div>
                    <strong>Обновлено:</strong> {new Date(content.updated_at).toLocaleDateString('ru-RU')}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Готовы к полноценным тренировкам?</CardTitle>
            <CardDescription className="text-base">
              Оформите подписку и получите доступ к профессиональным программам тренировок
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-3">
            <Link href="/pricing">
              <Button size="lg">
                Посмотреть тарифы
              </Button>
            </Link>
            <Link href="/free-content">
              <Button size="lg" variant="outline">
                Другие материалы
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

