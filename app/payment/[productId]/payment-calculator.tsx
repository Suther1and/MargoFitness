'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PromoInput } from './promo-input'
import { BonusSlider } from './bonus-slider'
import { calculateFinalPrice } from '@/lib/services/price-calculator'
import type { PromoCode } from '@/types/database'
import type { PriceCalculation } from '@/lib/services/price-calculator'
import { Loader2 } from 'lucide-react'

interface PaymentCalculatorProps {
  productId: string
  userId: string
  basePrice: number
  onCalculationChange: (calculation: PriceCalculation | null) => void
}

export function PaymentCalculator({
  productId,
  userId,
  basePrice,
  onCalculationChange,
}: PaymentCalculatorProps) {
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null)
  const [bonusToUse, setBonusToUse] = useState(0)
  const [calculation, setCalculation] = useState<PriceCalculation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    recalculate()
  }, [appliedPromo, bonusToUse])

  const recalculate = async () => {
    setLoading(true)

    const result = await calculateFinalPrice({
      productId,
      userId,
      promoCode: appliedPromo?.code,
      bonusToUse,
    })

    if (result.success && result.data) {
      setCalculation(result.data)
      onCalculationChange(result.data)
    } else {
      setCalculation(null)
      onCalculationChange(null)
    }

    setLoading(false)
  }

  if (loading && !calculation) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Промокод */}
      <PromoInput
        productId={productId}
        onPromoApplied={setAppliedPromo}
      />

      {/* Шаги */}
      {calculation && (
        <BonusSlider
          userId={userId}
          priceAfterDiscounts={calculation.priceAfterDiscounts}
          onBonusChange={setBonusToUse}
        />
      )}

      {/* Расчет */}
      {calculation && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Итого к оплате</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Базовая цена */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Базовая цена</span>
              <span className="line-through text-muted-foreground">
                {calculation.basePrice.toLocaleString('ru-RU')} ₽
              </span>
            </div>

            {/* Скидка за срок */}
            {calculation.durationDiscountAmount > 0 && (
              <div className="flex items-center justify-between text-sm text-green-600 dark:text-green-400">
                <span>Скидка за срок ({calculation.durationDiscountPercent}%)</span>
                <span>-{calculation.durationDiscountAmount.toLocaleString('ru-RU')} ₽</span>
              </div>
            )}

            {/* Промокод */}
            {calculation.promoDiscountAmount > 0 && (
              <div className="flex items-center justify-between text-sm text-green-600 dark:text-green-400">
                <span>
                  Промокод {calculation.promoCode} 
                  ({calculation.promoDiscountType === 'percentage' 
                    ? `${calculation.promoDiscountValue}%` 
                    : `${calculation.promoDiscountValue}₽`
                  })
                </span>
                <span>-{calculation.promoDiscountAmount.toLocaleString('ru-RU')} ₽</span>
              </div>
            )}

            {/* Шаги */}
            {calculation.bonusToUse > 0 && (
              <div className="flex items-center justify-between text-sm text-green-600 dark:text-green-400">
                <span>Использовано шагов 👟</span>
                <span>-{calculation.bonusToUse.toLocaleString('ru-RU')} ₽</span>
              </div>
            )}

            <div className="border-t pt-3" />

            {/* Итого к оплате */}
            <div className="flex items-center justify-between text-lg font-bold">
              <span>К оплате</span>
              <span className="text-2xl text-primary">
                {calculation.finalPrice.toLocaleString('ru-RU')} ₽
              </span>
            </div>

            {/* Экономия */}
            {calculation.totalSavings > 0 && (
              <div className="rounded-lg bg-green-50 dark:bg-green-950 p-3 text-center">
                <div className="text-sm font-medium text-green-800 dark:text-green-300">
                  🎉 Вы экономите {calculation.totalSavings.toLocaleString('ru-RU')} ₽
                </div>
              </div>
            )}

            {/* Кешбек */}
            {calculation.cashbackAmount > 0 && (
              <div className="rounded-lg bg-primary/10 p-3">
                <div className="text-sm">
                  <span className="text-muted-foreground">Вы получите кешбек:</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-semibold">
                      {calculation.cashbackAmount.toLocaleString('ru-RU')} 👟 
                      <span className="text-muted-foreground ml-1">
                        ({calculation.cashbackPercent}%)
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

