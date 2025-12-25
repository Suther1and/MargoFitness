'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CreditCard, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { useRouter } from 'next/navigation'
import { PromoInput } from './promo-input'
import { BonusSlider } from './bonus-slider'
import { calculateFinalPrice } from '@/lib/services/price-calculator'
import type { Product, Profile, PromoCode } from "@/types/database"
import type { PriceCalculation } from '@/lib/services/price-calculator'

interface YooKassaWidgetProps {
  product: Product
  profile: Profile
  onCalculationChange?: (calculation: PriceCalculation | null) => void
}

declare global {
  interface Window {
    YooMoneyCheckoutWidget: any
  }
}

export function YooKassaWidget({ product, profile, onCalculationChange }: YooKassaWidgetProps) {
  const router = useRouter()
  const [saveCard, setSaveCard] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [widgetReady, setWidgetReady] = useState(false)
  const [confirmationToken, setConfirmationToken] = useState<string | null>(null)
  
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
      onCalculationChange?.(result.data)
    } else {
      setCalculation(null)
      onCalculationChange?.(null)
    }

    setLoadingCalc(false)
  }

  // Загрузка скрипта виджета ЮКассы
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://yookassa.ru/checkout-widget/v1/checkout-widget.js'
    script.async = true
    script.onload = () => {
      console.log('[YooKassa] Widget script loaded')
      setWidgetReady(true)
    }
    script.onerror = () => {
      console.error('[YooKassa] Failed to load widget script')
      setError('Не удалось загрузить платежный виджет')
    }
    document.body.appendChild(script)

    return () => {
      // Очистка скрипта при размонтировании
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  // Инициализация виджета после получения confirmation token
  useEffect(() => {
    if (!confirmationToken || !widgetReady) return

    try {
      console.log('[YooKassa] Initializing widget with token:', confirmationToken)
      
      const checkout = new window.YooMoneyCheckoutWidget({
        confirmation_token: confirmationToken,
        return_url: `${window.location.origin}/dashboard?payment=success`,
        error_callback: (error: any) => {
          console.error('[YooKassa] Widget error:', error)
          setError('Произошла ошибка при обработке платежа')
          setProcessing(false)
        }
      })

      // Рендерим виджет в контейнер
      checkout.render('payment-form')

      console.log('[YooKassa] Widget rendered successfully')
    } catch (err) {
      console.error('[YooKassa] Widget initialization error:', err)
      setError('Ошибка инициализации платежного виджета')
      setProcessing(false)
    }
  }, [confirmationToken, widgetReady])

  const handlePayment = async () => {
    if (!calculation) {
      setError('Ошибка расчета суммы')
      return
    }

    setProcessing(true)
    setError('')

    try {
      // Шаг 1: Создать платеж
      console.log('[YooKassa] Creating payment...')
      const createResponse = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          savePaymentMethod: saveCard,
          promoCode: appliedPromo?.code,
          bonusToUse: bonusToUse,
        })
      })

      if (!createResponse.ok) {
        const errorData = await createResponse.json()
        throw new Error(errorData.error || errorData.details || 'Не удалось создать платеж')
      }

      const createData = await createResponse.json()

      if (!createData.success || !createData.confirmationToken) {
        throw new Error(createData.error || 'Не удалось получить токен подтверждения')
      }

      console.log('[YooKassa] Payment created, token received')
      
      // Устанавливаем токен, что триггерит инициализацию виджета
      setConfirmationToken(createData.confirmationToken)

    } catch (err: any) {
      console.error('[YooKassa] Payment creation error:', err)
      setError(err.message || 'Произошла ошибка при создании платежа')
      setProcessing(false)
    }
  }

  // Обработка успешного возврата (если пользователь вернулся после оплаты)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('payment') === 'success') {
      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard?payment=success')
        router.refresh() // Обновить данные с сервера
      }, 2000)
    }
  }, [router])

  if (success) {
    return (
      <Card className="border-green-500 bg-green-50 dark:bg-green-950">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="rounded-full bg-green-500 p-3">
              <CheckCircle2 className="size-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-green-700 dark:text-green-300">
                Оплата прошла успешно!
              </h3>
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                Подписка активирована. Перенаправляем в личный кабинет...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
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
        <CardTitle>Оплата</CardTitle>
        <CardDescription>
          Безопасная оплата через ЮKassa
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!confirmationToken ? (
          <>
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
                currentBonusAmount={bonusToUse}
              />
            )}

            {/* Детальный расчет */}
            <div className="space-y-2 pt-3 border-t">
              {/* Базовая цена */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Базовая цена</span>
                <span className="text-muted-foreground">
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
                    ({calculation.promoDiscountType === 'percent' 
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
                id="save-card" 
                checked={saveCard}
                onCheckedChange={(checked) => setSaveCard(checked as boolean)}
                disabled={processing}
              />
              <div className="space-y-1">
                <label
                  htmlFor="save-card"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Сохранить карту для автопродления
                </label>
                <p className="text-xs text-muted-foreground">
                  Рекомендуется для автоматического продления подписки
                </p>
              </div>
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
              disabled={processing || !widgetReady || loadingCalc}
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Подготовка платежа...
                </>
              ) : !widgetReady ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Загрузка виджета...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 size-4" />
                  Перейти к оплате {calculation.finalPrice.toLocaleString('ru-RU')} ₽
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            {/* Кнопка назад */}
            <Button
              variant="outline"
              onClick={() => {
                setConfirmationToken(null)
                setProcessing(false)
                setError('')
                setBonusToUse(0)
              }}
              className="w-full"
            >
              ← Изменить параметры оплаты
            </Button>

            {/* Контейнер для виджета ЮКассы */}
            <div id="payment-form" className="min-h-[400px]"></div>
            
            {/* Сообщение об ошибке */}
            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 p-3 text-sm text-red-800 dark:text-red-300 flex items-start gap-2">
                <AlertCircle className="size-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </>
        )}

        {/* Информация */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>✓ Безопасное соединение SSL</p>
          <p>✓ Данные карты не сохраняются на нашем сервере</p>
          <p>✓ Автопродление можно отключить в любое время</p>
        </div>
      </CardContent>
    </Card>
  )
}

