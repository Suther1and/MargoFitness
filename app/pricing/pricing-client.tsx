'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Crown, Zap, Sparkles } from "lucide-react"
import Link from "next/link"
import type { Product, Profile } from "@/types/database"

interface PricingClientProps {
  profile: Profile | null
}

type Duration = 1 | 3 | 6 | 12

const DURATIONS: { value: Duration; label: string; discount: number }[] = [
  { value: 1, label: '1 месяц', discount: 0 },
  { value: 3, label: '3 месяца', discount: 5 },
  { value: 6, label: '6 месяцев', discount: 10 },
  { value: 12, label: '12 месяцев', discount: 15 },
]

export function PricingClient({ profile }: PricingClientProps) {
  const [selectedDuration, setSelectedDuration] = useState<Duration>(1)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const loadProducts = async (duration: Duration) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/products/by-duration?duration=${duration}`)
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts(selectedDuration)
  }, [selectedDuration])

  const handleDurationChange = (duration: Duration) => {
    setSelectedDuration(duration)
    loadProducts(duration)
  }

  const calculateOriginalPrice = (product: Product): number => {
    const discount = product.discount_percentage || 0
    if (discount === 0) return product.price
    return Math.round(product.price / (1 - discount / 100))
  }

  const calculateSavings = (product: Product): number => {
    const originalPrice = calculateOriginalPrice(product)
    return originalPrice - product.price
  }

  const getPricePerMonth = (product: Product): number => {
    const duration = product.duration_months || 1
    return Math.round(product.price / duration)
  }

  const tierIcons: Record<number, any> = {
    1: Zap,
    2: Crown,
    3: Sparkles
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 rounded-lg bg-muted p-1">
          {DURATIONS.map((duration) => (
            <button
              key={duration.value}
              onClick={() => handleDurationChange(duration.value)}
              className={`relative rounded-md px-6 py-2.5 text-sm font-medium transition-all ${
                selectedDuration === duration.value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {duration.label}
              {duration.discount > 0 && (
                <span className="absolute -top-2 -right-2 rounded-full bg-green-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  -{duration.discount}%
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {loading ? (
          <div className="col-span-3 text-center py-12">
            <p className="text-muted-foreground">Загрузка...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="col-span-3 text-center py-12">
            <p className="text-muted-foreground">Нет доступных тарифов</p>
          </div>
        ) : (
          products.map((product) => {
            const Icon = tierIcons[product.tier_level || 1] || Zap
            const currentTierLevel = profile?.subscription_tier === 'basic' ? 1 :
                                    profile?.subscription_tier === 'pro' ? 2 :
                                    profile?.subscription_tier === 'elite' ? 3 : 0
            const productTierLevel = product.tier_level || 1
            const isCurrentTier = profile?.subscription_tier === (
              product.tier_level === 1 ? 'basic' :
              product.tier_level === 2 ? 'pro' :
              product.tier_level === 3 ? 'elite' : 'free'
            )
            const isLowerTier = profile?.subscription_status === 'active' && 
                               productTierLevel <= currentTierLevel
            const isUpgrade = profile?.subscription_status === 'active' && 
                             productTierLevel > currentTierLevel
            const originalPrice = calculateOriginalPrice(product)
            const savings = calculateSavings(product)
            const pricePerMonth = getPricePerMonth(product)
            const hasDiscount = (product.discount_percentage || 0) > 0

            return (
              <Card 
                key={product.id}
                className={`relative ${
                  product.tier_level === 2 
                    ? 'border-primary shadow-lg' 
                    : ''
                }`}
              >
                {product.tier_level === 2 && (
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
                  <CardTitle className="text-2xl">{product.name}</CardTitle>
                  <CardDescription className="min-h-[40px]">
                    {product.description}
                  </CardDescription>
                  
                  <div className="pt-4 space-y-2">
                    {hasDiscount && (
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-2xl font-bold line-through text-muted-foreground">
                          {originalPrice} ₽
                        </span>
                        <span className="rounded-full bg-green-500 px-2 py-0.5 text-xs font-bold text-white">
                          -{product.discount_percentage}%
                        </span>
                      </div>
                    )}
                    
                    <div>
                      <span className="text-4xl font-bold">{product.price} ₽</span>
                      {(product.duration_months || 1) > 1 && (
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
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {getFeaturesList(product.tier_level || 1).map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Check className="size-4 text-green-600 flex-shrink-0" />
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
                    ) : isLowerTier ? (
                      <div className="space-y-2">
                        <Button 
                          className="w-full" 
                          variant="outline"
                          disabled
                        >
                          Недоступен
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                          У вас активна подписка выше уровнем
                        </p>
                      </div>
                    ) : isUpgrade ? (
                      <Link href="/dashboard">
                        <Button className="w-full" variant="default">
                          Апгрейд в Dashboard
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/payment/${product.id}`}>
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
          })
        )}
      </div>
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

