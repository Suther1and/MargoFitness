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

