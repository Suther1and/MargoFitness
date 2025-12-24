'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import { PaymentCalculator } from './payment-calculator'
import { PaymentWidgetSwitcher } from './payment-widget-switcher'
import type { Product, Profile } from '@/types/database'
import type { PriceCalculation } from '@/lib/services/price-calculator'

interface PaymentPageClientProps {
  product: Product
  profile: Profile
  Icon: any
  pricePerMonth: number
}

export function PaymentPageClient({ product, profile, Icon, pricePerMonth }: PaymentPageClientProps) {
  const [calculation, setCalculation] = useState<PriceCalculation | null>(null)

  const benefits = product.metadata?.benefits as string[] || [
    "Доступ ко всем тренировкам",
    "Персональная программа",
    "Техподдержка 24/7"
  ]

  return (
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
          <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-6">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2">
                {product.duration_months} {product.duration_months === 1 ? 'месяц' : 
                 product.duration_months < 5 ? 'месяца' : 'месяцев'}
              </div>
              <div className="text-4xl font-bold text-primary mb-2">
                {pricePerMonth.toLocaleString('ru-RU')} ₽
              </div>
              <div className="text-sm text-muted-foreground">
                в месяц
              </div>
            </div>
          </div>

          {/* Преимущества */}
          <div className="space-y-3">
            <div className="font-semibold text-sm">Что входит:</div>
            <div className="space-y-2">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="size-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Детали подписки */}
          <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
            <div className="font-semibold">ℹ️ Детали подписки</div>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Подписка активируется сразу после оплаты</li>
              <li>• Вы получите доступ ко всем материалам</li>
              <li>• Можно отменить в любое время</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Правая колонка - Калькулятор и оплата */}
      <div className="space-y-6">
        <PaymentCalculator
          productId={product.id}
          userId={profile.id}
          basePrice={product.price}
          onCalculationChange={setCalculation}
        />

        {/* Виджет оплаты */}
        {calculation && (
          <PaymentWidgetSwitcher 
            productId={product.id}
            amount={calculation.finalPrice}
            metadata={{
              promo_code_id: calculation.promoCode ? undefined : undefined, // TODO: передавать ID промокода
              promo_code: calculation.promoCode,
              bonus_used: calculation.bonusToUse,
              actual_paid_amount: calculation.finalPrice,
            }}
          />
        )}
      </div>
    </div>
  )
}

