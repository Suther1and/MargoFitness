'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ExternalLink, Loader2, AlertCircle } from "lucide-react"
import { PromoInput } from './promo-input'
import { BonusSlider } from './bonus-slider'
import { calculateFinalPrice } from '@/lib/services/price-calculator'
import type { Product, Profile, PromoCode } from "@/types/database"
import type { PriceCalculation } from '@/lib/services/price-calculator'

interface RedirectPaymentProps {
  product: Product
  profile: Profile
}

export function RedirectPayment({ product, profile }: RedirectPaymentProps) {
  const [saveCard, setSaveCard] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  
  // Расчет цены
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null)
  const [bonusToUse, setBonusToUse] = useState(0)
  const [calculation, setCalculation] = useState<PriceCalculation | null>(null)
  const [loadingCalc, setLoadingCalc] = useState(true)

  // Расчет цены при изменении промокода или бонусов
  useEffect(() => {
    recalculate()
  }, [appliedPromo, bonusToUse])

  const recalculate = async () => {
    setLoadingCalc(true)

    const result = await calculateFinalPrice({
      productId: product.id,
      userId: profile.id,
      promoCode: appliedPromo?.code,
      bonusToUse,
    })

    if (result.success && result.data) {
      setCalculation(result.data)
    } else {
      setCalculation(null)
    }

    setLoadingCalc(false)
  }

  const handlePayment = async () => {
    if (!calculation) {
      setError('Ошибка расчета суммы')
      return
    }

    setProcessing(true)
    setError('')

    try {
      console.log('[YooKassa Redirect] Creating payment...')
      
      // Создаем платеж с типом подтверждения redirect
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          savePaymentMethod: saveCard,
          confirmationType: 'redirect',
          promoCode: appliedPromo?.code,
          bonusToUse: bonusToUse,
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.details || 'Не удалось создать платеж')
      }

      const data = await response.json()

      if (!data.success || !data.confirmationUrl) {
        throw new Error(data.error || 'Не удалось получить URL для оплаты')
      }

      console.log('[YooKassa Redirect] Redirecting to:', data.confirmationUrl)
      
      // Перенаправляем пользователя на страницу оплаты ЮКассы
      window.location.href = data.confirmationUrl

    } catch (err: any) {
      console.error('[YooKassa Redirect] Payment creation error:', err)
      setError(err.message || 'Произошла ошибка при создании платежа')
      setProcessing(false)
    }
  }

  if (loadingCalc && !calculation) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (!calculation) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Ошибка расчета стоимости
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Оплата (Redirect)</CardTitle>
        <CardDescription>
          Вы будете перенаправлены на безопасную страницу оплаты ЮKassa
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Промокод */}
        <PromoInput
          productId={product.id}
          onPromoApplied={setAppliedPromo}
        />

        {/* Бонусный слайдер */}
        {calculation && (
          <BonusSlider
            userId={profile.id}
            priceAfterDiscounts={calculation.priceAfterDiscounts}
            onBonusChange={setBonusToUse}
          />
        )}

        {/* Детальный расчет */}
        <div className="space-y-3 pt-4 border-t">
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
        </div>

        {/* Чекбокс сохранения карты */}
        <div className="flex items-start space-x-3 pt-4">
          <Checkbox 
            id="save-card-redirect" 
            checked={saveCard}
            onCheckedChange={(checked) => setSaveCard(checked as boolean)}
            disabled={processing}
          />
          <div className="space-y-1">
            <label
              htmlFor="save-card-redirect"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Сохранить карту для автопродления
            </label>
            <p className="text-xs text-muted-foreground">
              Рекомендуется для автоматического продления подписки
            </p>
          </div>
        </div>

        {/* Информация о процессе */}
        <div className="rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 p-4 space-y-2 text-sm">
          <p className="font-medium text-blue-900 dark:text-blue-100">
            📋 Как это работает:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-200">
            <li>Нажмите кнопку "Перейти к оплате"</li>
            <li>Вы будете перенаправлены на страницу ЮКасса</li>
            <li>Введите данные карты и подтвердите оплату</li>
            <li>После оплаты вы автоматически вернетесь на сайт</li>
          </ol>
        </div>

        {/* Сообщение об ошибке */}
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 p-3 text-sm text-red-800 dark:text-red-300 flex items-start gap-2">
            <AlertCircle className="size-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Кнопка оплаты */}
        <Button
          className="w-full"
          size="lg"
          onClick={handlePayment}
          disabled={processing || loadingCalc}
        >
          {processing ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Перенаправление...
            </>
          ) : (
            <>
              <ExternalLink className="mr-2 size-4" />
              Перейти к оплате {calculation.finalPrice.toLocaleString('ru-RU')} ₽
            </>
          )}
        </Button>

        {/* Информация о безопасности */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>✓ Безопасное соединение SSL</p>
          <p>✓ Оплата на защищенной странице ЮКасса</p>
          <p>✓ Автопродление можно отключить в любое время</p>
        </div>
      </CardContent>
    </Card>
  )
}

