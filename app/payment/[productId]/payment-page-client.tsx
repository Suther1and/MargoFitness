'use client'

import { useState, useEffect } from 'react'
import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Zap, Crown, Sparkles } from "lucide-react"
import { PaymentWidgetSwitcher } from './payment-widget-switcher'
import type { Product, Profile } from '@/types/database'
import type { PriceCalculation } from '@/lib/services/price-calculator'

interface PaymentPageClientProps {
  product: Product
  profile: Profile
  tierLevel: number
  pricePerMonth: number
  action?: 'renewal' | 'upgrade'
}

export function PaymentPageClient({ product, profile, tierLevel, pricePerMonth, action }: PaymentPageClientProps) {
  const [calculation, setCalculation] = useState<PriceCalculation | null>(null)
  const [upgradeInfo, setUpgradeInfo] = useState<any>(null)
  const [loadingUpgradeInfo, setLoadingUpgradeInfo] = useState(false)
  
  // Выбираем иконку в зависимости от уровня
  const tierIcons = {
    1: Zap,
    2: Crown,
    3: Sparkles
  }
  const Icon = tierIcons[tierLevel as keyof typeof tierIcons] || Zap
  
  // Вычисляем финальную цену в месяц с учетом всех скидок
  const finalPricePerMonth = calculation 
    ? Math.round(calculation.finalPrice / (product.duration_months || 1))
    : pricePerMonth

  // Безопасное извлечение benefits из metadata
  const metadata = product.metadata as { benefits?: string[] } | null
  const benefits = metadata?.benefits || [
    "Доступ ко всем тренировкам",
    "Персональная программа",
    "Техподдержка 24/7"
  ]

  // Загрузить информацию об апгрейде при монтировании
  React.useEffect(() => {
    if (action === 'upgrade') {
      const loadUpgradeInfo = async () => {
        setLoadingUpgradeInfo(true)
        try {
          const response = await fetch(`/api/payments/calculate-upgrade?newProductId=${product.id}`)
          const data = await response.json()
          if (data.success) {
            setUpgradeInfo(data)
          }
        } catch (error) {
          console.error('Error loading upgrade info:', error)
        } finally {
          setLoadingUpgradeInfo(false)
        }
      }
      loadUpgradeInfo()
    }
  }, [action, product.id])

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
                {finalPricePerMonth.toLocaleString('ru-RU')} ₽
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

          {/* Детали подписки или апгрейда */}
          <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
            <div className="font-semibold">
              {action === 'renewal' ? '🔄 Продление' : action === 'upgrade' ? '🚀 Апгрейд' : 'ℹ️ Детали подписки'}
            </div>
            {action === 'renewal' ? (
              <ul className="space-y-1 text-muted-foreground">
                <li>• Время добавится к текущей подписке</li>
                <li>• Ваш тариф останется прежним</li>
                <li>• Оплата проходит сразу</li>
              </ul>
            ) : action === 'upgrade' && upgradeInfo ? (
              <ul className="space-y-1 text-muted-foreground">
                <li>• Базовый период: <strong>{upgradeInfo.conversion.baseDays} дней</strong></li>
                <li>• Бонусные дни: <strong>+{upgradeInfo.conversion.convertedDays} дней</strong></li>
                <li className="text-primary font-semibold">• Всего: <strong>{upgradeInfo.conversion.totalDays} дней</strong></li>
              </ul>
            ) : (
              <ul className="space-y-1 text-muted-foreground">
                <li>• Подписка активируется сразу после оплаты</li>
                <li>• Вы получите доступ ко всем материалам</li>
                <li>• Можно отменить в любое время</li>
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Правая колонка - Виджет оплаты */}
      <div>
        <PaymentWidgetSwitcher 
          product={product}
          profile={profile}
          onCalculationChange={setCalculation}
          action={action}
        />
      </div>
    </div>
  )
}

