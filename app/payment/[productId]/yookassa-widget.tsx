'use client'

import { useState, useEffect } from 'react'
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"
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
  action?: 'renewal' | 'upgrade'
}

declare global {
  interface Window {
    YooMoneyCheckoutWidget: any
  }
}

export function YooKassaWidget({ product, profile, onCalculationChange, action }: YooKassaWidgetProps) {
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
        locale: 'ru',
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
          action: action || 'purchase',
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
      <section className="relative overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-green-400/30 p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          <div className="flex size-16 items-center justify-center rounded-full bg-green-500/20 ring-1 ring-green-400/30">
            <CheckCircle2 className="size-8 text-green-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-oswald uppercase tracking-tight">
              Оплата прошла успешно!
            </h3>
            <p className="text-sm text-white/70 mt-2">
              Подписка активирована. Перенаправляем в личный кабинет...
            </p>
          </div>
        </div>
      </section>
    )
  }

  if (loadingCalc && !calculation) {
    return (
      <section className="relative overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-8">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-6 animate-spin text-orange-400" />
        </div>
      </section>
    )
  }

  if (!calculation) {
    return (
      <section className="relative overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-8">
        <div className="py-8 text-center text-white/60">
          Ошибка расчета стоимости
        </div>
      </section>
    )
  }

  return (
    <section className="relative overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-6 md:p-8">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />

      <div className="rounded-2xl bg-gradient-to-b from-white/5 to-white/[0.03] p-6 ring-1 ring-white/10 backdrop-blur relative z-10 space-y-6">
        {!confirmationToken ? (
          <>
            {/* Заголовок */}
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className="flex size-10 items-center justify-center rounded-lg bg-orange-500/10 ring-1 ring-orange-400/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-300">
                  <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                  <line x1="2" y1="10" x2="22" y2="10"></line>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white font-oswald uppercase tracking-tight">Оплата</h3>
                <p className="text-xs text-white/60">Безопасная оплата через ЮKassa</p>
              </div>
            </div>

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
            <div className="space-y-3 pt-3 border-t border-white/10">
              {/* Базовая цена */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Базовая цена</span>
                <span className="text-white/60">
                  {calculation.basePrice.toLocaleString('ru-RU')} ₽
                </span>
              </div>

              {/* Скидка за срок */}
              {calculation.durationDiscountAmount > 0 && (
                <div className="flex items-center justify-between text-sm text-orange-400">
                  <span>Скидка за срок ({calculation.durationDiscountPercent}%)</span>
                  <span>-{calculation.durationDiscountAmount.toLocaleString('ru-RU')} ₽</span>
                </div>
              )}

              {/* Промокод */}
              {calculation.promoDiscountAmount > 0 && (
                <div className="flex items-center justify-between text-sm text-orange-400">
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
                <div className="flex items-center justify-between text-sm text-orange-400">
                  <span>Использовано шагов 👟</span>
                  <span>-{calculation.bonusToUse.toLocaleString('ru-RU')} ₽</span>
                </div>
              )}

              <div className="border-t border-white/10 pt-3" />

              {/* Итого к оплате */}
              <div className="flex items-center justify-between text-lg font-bold">
                <span className="text-white">К оплате</span>
                <span className="text-2xl text-orange-400 font-oswald">
                  {calculation.finalPrice.toLocaleString('ru-RU')} ₽
                </span>
              </div>

              {/* Экономия */}
              {calculation.totalSavings > 0 && (
                <div className="rounded-lg bg-orange-500/10 ring-1 ring-orange-400/20 p-3 text-center">
                  <div className="text-sm font-medium text-orange-300">
                    🎉 Вы экономите {calculation.totalSavings.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
              )}

              {/* Кешбек */}
              {calculation.cashbackAmount > 0 && (
                <div className="rounded-lg bg-orange-500/10 ring-1 ring-orange-400/20 p-3">
                  <div className="text-sm">
                    <span className="text-white/70">Вы получите кешбек:</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-semibold text-white">
                        {calculation.cashbackAmount.toLocaleString('ru-RU')} 👟 
                        <span className="text-white/60 ml-1">
                          ({calculation.cashbackPercent}%)
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Чекбокс сохранения карты */}
            <div className="flex items-start space-x-3 pt-4 border-t border-white/10">
              <Checkbox 
                id="save-card" 
                checked={saveCard}
                onCheckedChange={(checked) => setSaveCard(checked as boolean)}
                disabled={processing}
                className="border-white/20"
              />
              <div className="space-y-1">
                <label
                  htmlFor="save-card"
                  className="text-sm font-medium leading-none text-white cursor-pointer"
                >
                  Сохранить карту для автопродления
                </label>
                <p className="text-xs text-white/60">
                  Рекомендуется для автоматического продления подписки
                </p>
              </div>
            </div>

            {/* Сообщение об ошибке */}
            {error && (
              <div className="rounded-lg bg-red-500/10 ring-1 ring-red-400/30 p-3 text-sm text-red-300 flex items-start gap-2">
                <AlertCircle className="size-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Кнопка оплаты */}
            <button
              className="group relative w-full rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 disabled:from-white/5 disabled:to-white/5 p-4 ring-1 ring-orange-400/30 disabled:ring-white/10 transition-all duration-300 overflow-hidden shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 disabled:shadow-none active:scale-95 disabled:cursor-not-allowed"
              onClick={handlePayment}
              disabled={processing || !widgetReady || loadingCalc}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 ease-in-out" />
              <div className="relative flex items-center justify-center gap-2">
                {processing || !widgetReady ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                    <span className="font-semibold text-white text-lg">
                      {processing ? 'Обработка...' : 'Загрузка...'}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-white text-lg font-oswald uppercase tracking-wide">
                      Оплатить {calculation.finalPrice.toLocaleString('ru-RU')} ₽
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white group-hover:translate-x-1 transition-transform">
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </>
                )}
              </div>
            </button>

            {/* Информация */}
            <div className="text-xs text-white/50 space-y-1 pt-2">
              <p>✓ Безопасное соединение SSL</p>
              <p>✓ Данные карты не сохраняются на нашем сервере</p>
              <p>✓ Автопродление можно отключить в любое время</p>
            </div>
          </>
        ) : (
          <>
            {/* Кнопка назад */}
            <button
              onClick={() => {
                setConfirmationToken(null)
                setProcessing(false)
                setError('')
                setBonusToUse(0)
              }}
              className="w-full rounded-xl bg-white/[0.04] ring-1 ring-white/10 px-4 py-2.5 text-sm text-white/80 transition-all hover:bg-white/[0.08] hover:ring-white/20 active:scale-95"
            >
              ← Изменить параметры оплаты
            </button>

            {/* Контейнер для виджета ЮКассы */}
            <div id="payment-form" className="min-h-[400px]"></div>
            
            {/* Сообщение об ошибке */}
            {error && (
              <div className="rounded-lg bg-red-500/10 ring-1 ring-red-400/30 p-3 text-sm text-red-300 flex items-start gap-2">
                <AlertCircle className="size-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
