'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProductHeroCard } from './product-hero-card'
import { PriceOptimizer } from './price-optimizer'
import { PriceBreakdown } from './price-breakdown'
import { TrustBadges } from './trust-badges'
import { PaymentCTAButton } from './payment-cta-button'
import { calculateFinalPrice } from '@/lib/services/price-calculator'
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
  const router = useRouter()

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

  return (
    <>
      {/* Кнопка назад - Mobile (парящая) */}
      <button 
        onClick={() => router.back()}
        className="lg:hidden fixed top-2 left-4 z-50 inline-flex items-center gap-2 rounded-xl bg-white/[0.08] ring-1 ring-white/10 px-3 py-2 text-sm text-white/80 transition-all hover:bg-white/[0.12] backdrop-blur-xl active:scale-95"
        style={{ touchAction: 'manipulation' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 19-7-7 7-7"></path>
          <path d="M19 12H5"></path>
        </svg>
        <span className="font-medium">Назад</span>
      </button>

      {/* Desktop: 2 колонки */}
      <div className="hidden lg:grid lg:grid-cols-[360px_1fr] lg:gap-8 w-full">
        {/* Левая колонка */}
        <div className="space-y-6 relative">
          {/* Кнопка назад - Desktop (слева от карточки) */}
          <button 
            onClick={() => router.back()}
            className="hidden lg:inline-flex absolute right-[calc(100%+24px)] top-0 items-center gap-2 rounded-xl bg-white/[0.04] ring-1 ring-white/10 px-4 py-2.5 text-sm text-white/80 transition-all hover:bg-white/[0.08] hover:ring-white/20 active:scale-95 whitespace-nowrap"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 19-7-7 7-7"></path>
              <path d="M19 12H5"></path>
            </svg>
            <span className="font-medium">Назад</span>
          </button>

          <ProductHeroCard 
            product={product}
            pricePerMonth={displayPricePerMonth}
            finalPrice={displayPrice}
            isDiscountApplied={isDiscountApplied}
          />
          <TrustBadges />
        </div>

        {/* Правая колонка */}
        <div className="space-y-6">
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
      <div className="lg:hidden w-full max-w-2xl mx-auto space-y-4">
        <ProductHeroCard 
          product={product}
          pricePerMonth={displayPricePerMonth}
          finalPrice={displayPrice}
          isDiscountApplied={isDiscountApplied}
        />

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

        <PaymentCTAButton
          finalPrice={calculation?.finalPrice || product.price}
          processing={processing}
          disabled={loadingCalc || !calculation}
          error={error}
          onClick={handlePayment}
          action={action}
        />
      </div>
    </>
  )
}

