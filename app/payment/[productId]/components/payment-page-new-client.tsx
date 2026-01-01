'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProductHeroCard } from './product-hero-card'
import { PriceOptimizer } from './price-optimizer'
import { PriceBreakdown } from './price-breakdown'
import { TrustBadges } from './trust-badges'
import { PaymentCTAButton } from './payment-cta-button'
import { calculateFinalPrice } from '@/lib/services/price-calculator'
import { calculateUpgradeConversion } from '@/lib/actions/subscription-actions'
import type { Product, Profile, PromoCode } from '@/types/database'
import type { PriceCalculation } from '@/lib/services/price-calculator'

interface PaymentPageNewClientProps {
  product: Product
  profile: Profile
  pricePerMonth: number
  action?: 'renewal' | 'upgrade'
}

export function PaymentPageNewClient({ 
  product, 
  profile, 
  pricePerMonth,
  action 
}: PaymentPageNewClientProps) {
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  
  // Расчет цены
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null)
  const [bonusToUse, setBonusToUse] = useState(0)
  const [calculation, setCalculation] = useState<PriceCalculation | null>(null)
  const [loadingCalc, setLoadingCalc] = useState(true)
  const [conversionData, setConversionData] = useState<any>(null)
  const router = useRouter()

  // Загрузить данные конвертации для upgrade
  useEffect(() => {
    if (action === 'upgrade' && product.tier_level) {
      loadConversionData()
    }
  }, [action, product.tier_level])

  const loadConversionData = async () => {
    if (!product.tier_level) return
    const result = await calculateUpgradeConversion(profile.id, product.tier_level)
    if (result.success && result.data) {
      setConversionData(result.data)
    }
  }

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
      console.log('[Payment] Creating payment...')
      
      // Создаем платеж с типом подтверждения redirect
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          savePaymentMethod: false,
          confirmationType: 'redirect',
          promoCode: appliedPromo?.code,
          bonusToUse: bonusToUse,
          action: action || 'purchase',
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

      console.log('[Payment] Redirecting to:', data.confirmationUrl)
      
      // Перенаправляем пользователя на страницу оплаты ЮКассы
      window.location.href = data.confirmationUrl

    } catch (err: any) {
      console.error('[Payment] Payment creation error:', err)
      setError(err.message || 'Произошла ошибка при создании платежа')
      setProcessing(false)
    }
  }

  // Вычисляем финальную цену для отображения в ProductHeroCard
  const displayPrice = calculation ? calculation.finalPrice : product.price
  const displayPricePerMonth = calculation 
    ? Math.round(calculation.finalPrice / (product.duration_months || 1))
    : pricePerMonth

  const isDiscountApplied = !!appliedPromo || bonusToUse > 0

  // Рассчитать новую дату окончания для renewal
  const getNewExpiryDate = () => {
    if (action === 'renewal' && profile.subscription_expires_at) {
      const currentExpires = new Date(profile.subscription_expires_at)
      const now = new Date()
      const baseDate = currentExpires > now ? currentExpires : now
      const newDate = new Date(baseDate)
      newDate.setDate(newDate.getDate() + (product.duration_months * 30))
      return newDate
    } else if (action === 'upgrade' && conversionData) {
      const totalDays = (product.duration_months * 30) + conversionData.convertedDays
      const newDate = new Date()
      newDate.setDate(newDate.getDate() + totalDays)
      return newDate
    }
    return null
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const newExpiryDate = getNewExpiryDate()

  return (
    <>
      {/* Desktop: 2 колонки */}
      <div className="hidden lg:grid lg:grid-cols-[360px_1fr] lg:gap-8 w-full">
        {/* Левая колонка */}
        <div className="space-y-6 relative">
          <ProductHeroCard 
            product={product}
            pricePerMonth={displayPricePerMonth}
            finalPrice={displayPrice}
            isDiscountApplied={isDiscountApplied}
          />

          {/* Баннер для Renewal */}
          {action === 'renewal' && (
            <div className="rounded-xl bg-blue-500/10 ring-1 ring-blue-400/30 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5h5"></path>
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                  <path d="M16 16h5v5"></path>
                </svg>
                <h3 className="text-sm font-bold text-white">Продление подписки</h3>
              </div>
              <p className="text-sm text-white/70">
                Новые дни будут добавлены к вашей текущей подписке
              </p>
              {newExpiryDate && (
                <p className="text-sm text-white/70 flex items-center gap-2">
                  <span>📅</span>
                  Новая дата окончания: <span className="font-semibold text-white">{formatDate(newExpiryDate)}</span>
                </p>
              )}
            </div>
          )}

          {/* Баннер для Upgrade */}
          {action === 'upgrade' && conversionData && (
            <div className="rounded-xl bg-purple-500/10 ring-1 ring-purple-400/30 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
                <h3 className="text-sm font-bold text-white">Апгрейд тарифа</h3>
              </div>
              <div className="rounded-lg bg-white/10 p-3">
                <p className="text-xs text-white/60 mb-1">Конвертация оставшихся дней:</p>
                <p className="text-sm font-bold text-white">
                  <span className="text-orange-300">{conversionData.remainingDays} дней {conversionData.currentTier.toUpperCase()}</span>
                  {' → '}
                  <span className="text-purple-300">{conversionData.convertedDays} дней {['FREE', 'BASIC', 'PRO', 'ELITE'][product.tier_level || 1]}</span>
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-white/70">
                  Итого дней: <span className="font-bold text-emerald-300">{(product.duration_months * 30) + conversionData.convertedDays}</span>
                </p>
                {newExpiryDate && (
                  <p className="text-sm text-white/70 flex items-center gap-2">
                    <span>📅</span>
                    До: <span className="font-semibold text-white">{formatDate(newExpiryDate)}</span>
                  </p>
                )}
              </div>
            </div>
          )}
          
          <PriceOptimizer
            productId={product.id}
            userId={profile.id}
            priceAfterDiscounts={calculation?.priceAfterDiscounts || product.price}
            onPromoApplied={setAppliedPromo}
            onBonusChange={setBonusToUse}
            currentBonusAmount={bonusToUse}
          />
        </div>

        {/* Правая колонка */}
        <div className="flex flex-col gap-3">
          <PriceBreakdown 
            calculation={calculation}
            loading={loadingCalc}
          />

          <TrustBadges />

          <PaymentCTAButton
            finalPrice={calculation?.finalPrice || product.price}
            processing={processing}
            disabled={loadingCalc || !calculation}
            error={error}
            onClick={handlePayment}
            action={action}
          />
        </div>
      </div>

      {/* Mobile: single column */}
      <div className="lg:hidden w-full max-w-2xl mx-auto space-y-4 pb-32">
        <ProductHeroCard 
          product={product}
          pricePerMonth={displayPricePerMonth}
          finalPrice={displayPrice}
          isDiscountApplied={isDiscountApplied}
        />

        {/* Баннер для Renewal (Mobile) */}
        {action === 'renewal' && (
          <div className="rounded-xl bg-blue-500/10 ring-1 ring-blue-400/30 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                <path d="M16 16h5v5"></path>
              </svg>
              <h3 className="text-sm font-bold text-white">Продление подписки</h3>
            </div>
            <p className="text-sm text-white/70">
              Новые дни будут добавлены к вашей текущей подписке
            </p>
            {newExpiryDate && (
              <p className="text-sm text-white/70 flex items-center gap-2">
                <span>📅</span>
                Новая дата: <span className="font-semibold text-white">{formatDate(newExpiryDate)}</span>
              </p>
            )}
          </div>
        )}

        {/* Баннер для Upgrade (Mobile) */}
        {action === 'upgrade' && conversionData && (
          <div className="rounded-xl bg-purple-500/10 ring-1 ring-purple-400/30 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
              <h3 className="text-sm font-bold text-white">Апгрейд тарифа</h3>
            </div>
            <div className="rounded-lg bg-white/10 p-3">
              <p className="text-xs text-white/60 mb-1">Конвертация:</p>
              <p className="text-sm font-bold text-white">
                {conversionData.remainingDays} дн. → {conversionData.convertedDays} дн.
              </p>
            </div>
            <p className="text-sm text-white/70">
              Итого: <span className="font-bold text-emerald-300">{(product.duration_months * 30) + conversionData.convertedDays} дней</span>
            </p>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <div className="h-px flex-1 bg-white/5" />
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Настройка цены</span>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          <PriceOptimizer
            productId={product.id}
            userId={profile.id}
            priceAfterDiscounts={calculation?.priceAfterDiscounts || product.price}
            onPromoApplied={setAppliedPromo}
            onBonusChange={setBonusToUse}
            currentBonusAmount={bonusToUse}
          />

          <PriceBreakdown 
            calculation={calculation}
            loading={loadingCalc}
          />
        </div>

        {/* Sticky Mobile Button Wrapper */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/95 to-transparent z-50 backdrop-blur-sm lg:hidden">
          <div className="max-w-2xl mx-auto">
            <PaymentCTAButton
              finalPrice={calculation?.finalPrice || product.price}
              processing={processing}
              disabled={loadingCalc || !calculation}
              error={error}
              onClick={handlePayment}
              action={action}
            />
          </div>
        </div>
      </div>
    </>
  )
}

