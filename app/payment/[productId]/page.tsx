import { getCurrentProfile } from "@/lib/actions/profile"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { CheckCircle, Shield, CreditCard } from "lucide-react"
import PaymentButton from "./payment-button"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface PaymentPageProps {
  params: {
    productId: string
  }
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { productId } = await params
  const profile = await getCurrentProfile()

  if (!profile) {
    redirect('/auth/login?redirect=/pricing')
  }

  // Получить информацию о продукте
  const supabase = await createClient()
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .eq('is_active', true)
    .single()

  if (error || !product) {
    notFound()
  }

  // Только для подписок (пока)
  if (product.type !== 'subscription_tier') {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Оплата one-time паков будет добавлена позже
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl space-y-8 py-10">
      {/* Заголовок */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Оформление подписки</h1>
        <p className="text-muted-foreground">
          Вы выбрали подписку <strong>{product.name}</strong>
        </p>
      </div>

      {/* Детали подписки */}
      <Card>
        <CardHeader>
          <CardTitle>Детали подписки</CardTitle>
          <CardDescription>
            Что входит в выбранный тариф
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <p className="font-medium">{product.name}</p>
              <p className="text-sm text-muted-foreground">
                {product.description}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{product.price} ₽</p>
              <p className="text-sm text-muted-foreground">в месяц</p>
            </div>
          </div>

          {/* Преимущества */}
          <div className="space-y-3 pt-2">
            {getFeaturesList(product.tier_level || 1).map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <CheckCircle className="size-5 shrink-0 text-green-600 mt-0.5" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {/* Информация об оплате */}
          <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <Shield className="size-4" />
              <strong>Безопасная оплата</strong>
            </p>
            <p className="text-muted-foreground">
              • Подписка активируется мгновенно
            </p>
            <p className="text-muted-foreground">
              • Доступ на 30 дней с момента оплаты
            </p>
            <p className="text-muted-foreground">
              • Можно отменить в любой момент
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Форма оплаты */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="size-5" />
            Оплата
          </CardTitle>
          <CardDescription>
            Это демо-версия. Реальные платежи не производятся.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Мок-форма */}
          <div className="space-y-4 rounded-lg border-2 border-dashed p-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                💳 Имитация платёжной формы
              </p>
              <p className="text-xs text-muted-foreground">
                В продакшене здесь будет интеграция с CloudPayments/YooMoney/T-Pay
              </p>
            </div>
            
            <div className="space-y-3 opacity-50 pointer-events-none">
              <div>
                <label className="text-sm font-medium">Номер карты</label>
                <input 
                  type="text" 
                  className="w-full rounded-md border p-2 mt-1" 
                  placeholder="1234 5678 9012 3456"
                  disabled
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Срок</label>
                  <input 
                    type="text" 
                    className="w-full rounded-md border p-2 mt-1" 
                    placeholder="MM/YY"
                    disabled
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">CVV</label>
                  <input 
                    type="text" 
                    className="w-full rounded-md border p-2 mt-1" 
                    placeholder="123"
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Кнопки */}
          <div className="space-y-3">
            <PaymentButton 
              productId={productId}
              productName={product.name}
              amount={product.price}
            />
            
            <Link href="/pricing" className="block">
              <Button variant="outline" className="w-full">
                Отмена
              </Button>
            </Link>
          </div>

          {/* Предупреждение */}
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm dark:bg-amber-950/20 dark:border-amber-900">
            <p className="text-amber-900 dark:text-amber-100">
              <strong>⚠️ Демо-режим</strong>
            </p>
            <p className="text-amber-700 dark:text-amber-300 mt-1">
              При нажатии "Оплатить" подписка активируется без реальной оплаты. 
              В продакшене здесь будет интеграция с платёжной системой.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getFeaturesList(tier: number): string[] {
  const features: Record<number, string[]> = {
    1: [
      '2 тренировки в неделю',
      'HD качество видео',
      'Трекинг прогресса',
      'Мобильное приложение',
      'Поддержка по email'
    ],
    2: [
      '3 тренировки в неделю (всё из Basic + дополнительная)',
      'Продвинутые техники',
      'Персональные рекомендации',
      'Программы питания',
      'Приоритетная поддержка'
    ],
    3: [
      '3 тренировки в неделю + эксклюзивный контент',
      'Персональные консультации',
      'Индивидуальные программы',
      'VIP поддержка 24/7',
      'Закрытое комьюнити',
      'Ранний доступ к новинкам'
    ]
  }
  return features[tier] || []
}

