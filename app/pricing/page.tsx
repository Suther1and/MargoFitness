import { getSubscriptionTiers, getOneTimePacks } from "@/lib/actions/products"
import { getCurrentProfile } from "@/lib/actions/profile"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Crown, Zap, Sparkles } from "lucide-react"
import Link from "next/link"
import { getTierDisplayName } from "@/lib/access-control"
import type { SubscriptionTier } from "@/types/database"

export default async function PricingPage() {
  const subscriptions = await getSubscriptionTiers()
  const packs = await getOneTimePacks()
  const profile = await getCurrentProfile()

  return (
    <div className="container mx-auto space-y-16 py-10">
      {/* Header */}
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Тарифы и цены</h1>
        <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
          Выберите подходящий план подписки или купите отдельные программы тренировок
        </p>
        {profile && (
          <p className="text-sm text-muted-foreground">
            Ваш текущий тариф: <strong>{getTierDisplayName(profile.subscription_tier)}</strong>
          </p>
        )}
      </div>

      {/* Подписки */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Подписки</h2>
          <p className="mt-2 text-muted-foreground">
            Полный доступ к библиотеке тренировок по уровням
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {subscriptions.map((sub) => {
            // Конвертируем tier_level в SubscriptionTier для сравнения
            const subTier: SubscriptionTier = 
              sub.tier_level === 1 ? 'basic' :
              sub.tier_level === 2 ? 'pro' :
              sub.tier_level === 3 ? 'elite' : 'free'
            
            const isCurrentTier = profile?.subscription_tier === subTier
            const tierIcons: Record<number, any> = {
              1: Zap,
              2: Crown,
              3: Sparkles
            }
            const Icon = tierIcons[sub.tier_level || 1] || Zap

            return (
              <Card 
                key={sub.id}
                className={`relative ${
                  sub.tier_level === 2 
                    ? 'border-primary shadow-lg' 
                    : ''
                }`}
              >
                {sub.tier_level === 2 && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <span className="rounded-full bg-primary px-4 py-1 text-sm font-medium text-primary-foreground">
                      Популярный
                    </span>
                  </div>
                )}

                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="size-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{sub.name}</CardTitle>
                  <CardDescription className="min-h-[40px]">
                    {sub.description}
                  </CardDescription>
                  <div className="pt-4">
                    <span className="text-4xl font-bold">{sub.price} ₽</span>
                    <span className="text-muted-foreground">/месяц</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {getFeaturesList(sub.tier_level || 1).map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Check className="size-4 text-green-600" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {profile ? (
                    isCurrentTier ? (
                      <Button 
                        className="w-full" 
                        variant="secondary"
                        disabled
                      >
                        Текущий тариф
                      </Button>
                    ) : (
                      <Link href={`/payment/${sub.id}`}>
                        <Button className="w-full">
                          Выбрать план
                        </Button>
                      </Link>
                    )
                  ) : (
                    <Link href="/auth/signup">
                      <Button className="w-full">
                        Начать
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* One-Time Packs */}
      {packs.length > 0 && (
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Программы тренировок</h2>
            <p className="mt-2 text-muted-foreground">
              Купите один раз — владейте навсегда
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {packs.map((pack) => (
              <Card key={pack.id}>
                <CardHeader>
                  <CardTitle>{pack.name}</CardTitle>
                  <CardDescription>
                    {pack.description || 'Специальная программа тренировок'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{pack.price} ₽</span>
                    <span className="text-sm text-muted-foreground">один раз</span>
                  </div>
                  
                  {profile ? (
                    <Button className="w-full">
                      Купить программу
                    </Button>
                  ) : (
                    <Link href="/auth/signup">
                      <Button className="w-full">
                        Зарегистрироваться
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* FAQ или дополнительная информация */}
      <section className="mx-auto max-w-3xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Информация о платежах</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Принимаем карты МИР, Visa, Mastercard</p>
            <p>• Подписку можно отменить в любой момент</p>
            <p>• Купленные программы остаются с вами навсегда</p>
            <p>• Безопасные платежи через CloudPayments/T-Pay</p>
            <p className="pt-2 text-xs">
              <strong>Примечание:</strong> Интеграция платежей будет добавлена в следующих версиях
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function getFeaturesList(tier: number): string[] {
  const features: Record<number, string[]> = {
    1: [
      'Базовая библиотека тренировок',
      'HD качество видео',
      'Трекинг прогресса',
      'Мобильное приложение'
    ],
    2: [
      'Всё из Basic',
      'Продвинутые техники',
      'Персональные рекомендации',
      'Программы питания',
      'Приоритетная поддержка'
    ],
    3: [
      'Всё из Pro',
      'Эксклюзивные тренировки',
      'Персональные консультации',
      'Индивидуальные программы',
      'VIP поддержка 24/7',
      'Закрытое комьюнити'
    ]
  }
  return features[tier] || []
}

