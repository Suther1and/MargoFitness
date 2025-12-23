import { getPublishedFreeContent } from "@/lib/actions/free-content"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookOpen, Lock, ArrowRight } from "lucide-react"

export default async function FreeContentPage() {
  const { data: freeContent, error } = await getPublishedFreeContent()

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Ошибка</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!freeContent || freeContent.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Бесплатные материалы</h1>
            <p className="text-muted-foreground text-lg">
              Доступные обучающие материалы для всех зарегистрированных пользователей
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Материалы пока не добавлены</CardTitle>
              <CardDescription>
                Скоро здесь появится полезный контент для начинающих
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-sm font-medium mb-4">
            <BookOpen className="size-4" />
            Бесплатный доступ
          </div>
          <h1 className="text-4xl font-bold mb-4">Бесплатные материалы</h1>
          <p className="text-muted-foreground text-lg">
            Обучающие материалы и полезные советы для начала вашего фитнес-путешествия
          </p>
        </div>

        {/* Content Grid */}
        <div className="space-y-6 mb-12">
          {freeContent.map((item, index) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary text-sm font-bold">
                        {index + 1}
                      </span>
                      <CardTitle className="text-2xl">{item.title}</CardTitle>
                    </div>
                    {item.description && (
                      <CardDescription className="text-base">
                        {item.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 whitespace-pre-line">
                  {item.content}
                </p>
                
                {item.video_url && (
                  <div className="mb-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      📹 Видео: <span className="font-mono">{item.video_url}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      (Интеграция с Kinescope будет добавлена позже)
                    </p>
                  </div>
                )}

                <Link href={`/free-content/${item.id}`}>
                  <Button variant="outline" className="w-full sm:w-auto">
                    Читать далее
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA для подписки */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="size-5" />
              Хотите больше?
            </CardTitle>
            <CardDescription className="text-base">
              Оформите подписку и получите доступ к полным программам тренировок с еженедельными обновлениями
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/pricing">
              <Button size="lg">
                Посмотреть тарифы
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

