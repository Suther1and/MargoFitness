import { getProductById } from "@/lib/actions/products"
import { getCurrentProfile } from "@/lib/actions/profile"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Crown, Zap, Sparkles, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MockPaymentWidget } from "./mock-payment-widget"

interface PaymentPageProps {
  params: {
    productId: string
  }
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const profile = await getCurrentProfile()
  
  if (!profile) {
    redirect('/auth/login?redirect=/pricing')
  }

  const product = await getProductById(params.productId)

  if (!product) {
    redirect('/pricing')
  }

  // Рассчитать детали
  const duration = product.duration_months || 1
  const pricePerMonth = Math.round(product.price / duration)
  const hasDiscount = (product.discount_percentage || 0) > 0
  const originalPrice = hasDiscount 
    ? Math.round(product.price / (1 - (product.discount_percentage || 0) / 100))
    : product.price
  const savings = originalPrice - product.price

  const tierIcons: Record<number, any> = {
    1: Zap,
    2: Crown,
    3: Sparkles
  }
  const Icon = tierIcons[product.tier_level || 1] || Zap

  return (
    <div className="container mx-auto max-w-4xl space-y-8 py-10">
      {/* Кнопка назад */}
      <Link href="/pricing">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="size-4" />
          Назад к тарифам
        </Button>
      </Link>

      {/* Заголовок */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Оформление подписки</h1>
        <p className="text-muted-foreground">
          Вы выбрали тариф {product.name}
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Левая колонка - Детали продукта */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                <Icon className="size-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{product.name}</CardTitle>
                <CardDescription>{product.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Цена */}
            <div className="space-y-3">
              {hasDiscount && (
                <div className="flex items-center gap-2">
                  <span className="text-xl line-through text-muted-foreground">
                    {originalPrice} ₽
                  </span>
                  <span className="rounded-full bg-green-500 px-2 py-0.5 text-xs font-bold text-white">
                    -{product.discount_percentage}%
                  </span>
                </div>
              )}
              
              <div>
                <span className="text-4xl font-bold">{product.price} ₽</span>
                {duration > 1 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {pricePerMonth} ₽/месяц
                  </p>
                )}
              </div>

              {savings > 0 && (
                <div className="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-950 px-3 py-1 text-sm font-medium text-green-700 dark:text-green-300">
                  💰 Экономия {savings} ₽
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Что входит:</h3>
              <div className="space-y-2">
                {getFeaturesList(product.tier_level || 1).map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="size-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4 space-y-2 text-sm text-muted-foreground">
              <p>• Период подписки: {duration} {duration === 1 ? 'месяц' : duration < 5 ? 'месяца' : 'месяцев'}</p>
              <p>• Автоматическое продление (можно отключить)</p>
              <p>• Отмена в любое время</p>
              <p>• Безопасные платежи через ЮKassa</p>
            </div>
          </CardContent>
        </Card>

        {/* Правая колонка - Виджет оплаты */}
        <MockPaymentWidget 
          product={product}
          profile={profile}
        />
      </div>

      {/* Безопасность */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🔒</div>
            <div className="space-y-1">
              <p className="font-medium">Безопасные платежи</p>
              <p className="text-sm text-muted-foreground">
                Все платежи обрабатываются через защищенное соединение. Мы не храним данные вашей карты.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
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
