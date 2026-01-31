'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, ArrowUpCircle, Calendar, Zap, ChevronRight } from 'lucide-react'
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
      newDate.setDate(newDate.getDate() + ((product.duration_months || 1) * 30))
      return newDate
    } else if (action === 'upgrade' && conversionData) {
      const totalDays = ((product.duration_months || 1) * 30) + conversionData.convertedDays
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

  // Расчет дней для Renewal
  const getRemainingDays = () => {
    if (!profile.subscription_expires_at) return 0
    const expiresAt = new Date(profile.subscription_expires_at)
    const now = new Date()
    const diffTime = expiresAt.getTime() - now.getTime()
    return diffTime > 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0
  }

  const currentRemainingDays = getRemainingDays()
  const addedDays = (product.duration_months || 1) * 30
  const totalDaysAfterRenewal = currentRemainingDays + addedDays

  // Динамические цвета для апгрейда
  const targetTierLevel = product.tier_level || 1
  const isElite = targetTierLevel === 3
  const isPro = targetTierLevel === 2
  
  const tierColor = isElite ? 'text-[#FFD700]' : isPro ? 'text-purple-400' : 'text-orange-400'
  const tierBg = isElite ? 'bg-amber-500/10' : isPro ? 'bg-purple-500/10' : 'bg-orange-500/10'
  const tierRing = isElite ? 'ring-amber-400/20' : isPro ? 'ring-purple-400/20' : 'ring-orange-400/20'
  const tierAccent = isElite ? 'text-amber-300' : isPro ? 'text-purple-300' : 'text-orange-300'

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
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl bg-white/[0.03] ring-1 ring-white/10 p-5 group"
            >
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <RefreshCw className={`size-24 ${tierColor}`} />
              </div>
              
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center gap-3 mb-1">
                  <div className={`size-10 rounded-xl ${tierBg} flex items-center justify-center ring-1 ${tierRing} shadow-inner`}>
                    <RefreshCw className={`size-5 ${tierColor}`} />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-bold text-white uppercase tracking-wider leading-none">Продление подписки</h3>
                    <p className="text-[10px] text-white/30 uppercase mt-1.5 font-medium">Добавление дней к текущему сроку</p>
                  </div>
                </div>

                <div className="py-3 px-4 rounded-xl bg-white/[0.04] ring-1 ring-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Текущий остаток</span>
                    <span className="text-sm font-bold text-white/60 font-oswald">{currentRemainingDays} дн</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Новые дни</span>
                    <span className={`text-sm font-bold ${tierAccent}`}>+{addedDays} дн</span>
                  </div>
                </div>

                <div className="flex items-end justify-between pt-1">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.15em] leading-none mb-2">Итоговый срок</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className={`text-4xl font-bold font-oswald leading-none ${tierColor}`}>
                        {totalDaysAfterRenewal}
                      </span>
                      <span className={`text-sm font-bold uppercase ${tierColor} opacity-30`}>дней</span>
                    </div>
                  </div>
                  {newExpiryDate && (
                    <div className="text-right flex flex-col items-end">
                      <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.15em] leading-none mb-2">Доступ до</span>
                      <span className="text-xs font-medium text-white/50 uppercase tracking-tight">
                        {formatDate(newExpiryDate).split('г.')[0]}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Баннер для Upgrade */}
          {action === 'upgrade' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl bg-white/[0.03] ring-1 ring-white/10 p-5 group"
            >
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Zap className={`size-24 ${tierColor}`} />
              </div>

              {!conversionData ? (
                <div className="flex flex-col items-center justify-center gap-3 py-4 text-white/10">
                  <RefreshCw className="size-6 animate-spin" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Расчет условий...</span>
                </div>
              ) : (
                <div className="relative z-10 flex flex-col gap-4">
                  <div className="flex items-center gap-3 mb-1">
                    <div className={`size-10 rounded-xl ${tierBg} flex items-center justify-center ring-1 ${tierRing} shadow-inner`}>
                      <Zap className={`size-5 fill-current ${tierColor}`} />
                    </div>
                    <div>
                      <h3 className="text-[13px] font-bold text-white uppercase tracking-wider leading-none">Апгрейд тарифа</h3>
                      <p className="text-[10px] text-white/30 uppercase mt-1.5 font-medium">Оптимизация дней при переходе</p>
                    </div>
                  </div>

                  <div className="py-3 px-4 rounded-xl bg-white/[0.04] ring-1 ring-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Конверсия остатка</span>
                      <div className={`flex items-center gap-2 text-sm font-bold ${tierAccent}`}>
                        <span className="text-white/30 font-medium">{conversionData.remainingDays} дн</span>
                        <ChevronRight className="size-3 text-white/10" />
                        <span>{conversionData.convertedDays} дн</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Новая покупка</span>
                      <span className={`text-sm font-bold ${tierAccent}`}>+{addedDays} дн</span>
                    </div>
                  </div>

                  <div className="flex items-end justify-between pt-1">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.15em] leading-none mb-2">Итоговый срок</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className={`text-4xl font-bold font-oswald leading-none ${tierColor}`}>
                          {((product.duration_months || 1) * 30) + conversionData.convertedDays}
                        </span>
                        <span className={`text-sm font-bold uppercase ${tierColor} opacity-30`}>дней</span>
                      </div>
                    </div>
                    {newExpiryDate && (
                      <div className="text-right flex flex-col items-end">
                        <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.15em] leading-none mb-2">Доступ до</span>
                        <span className="text-xs font-medium text-white/50 uppercase tracking-tight">
                          {formatDate(newExpiryDate).split('г.')[0]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
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
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-2xl bg-white/[0.03] ring-1 ring-white/10 p-4 group flex flex-col justify-center"
          >
            <div className="absolute -right-2 -top-2 opacity-5">
              <RefreshCw className={`size-16 ${tierColor}`} />
            </div>
            
            <div className="relative z-10 flex flex-col gap-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`size-7 rounded-lg ${tierBg} flex items-center justify-center ring-1 ${tierRing} shadow-inner ${tierColor}`}>
                    <RefreshCw className="size-3.5" />
                  </div>
                  <h3 className="text-[11px] font-bold text-white uppercase tracking-wider leading-none">Продление</h3>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest leading-none mb-1">Итого</span>
                  <span className={`text-2xl font-bold font-oswald leading-none ${tierColor}`}>
                    {totalDaysAfterRenewal} дней
                  </span>
                </div>
              </div>

              <div className="py-2.5 px-3.5 rounded-xl bg-white/[0.04] ring-1 ring-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-white/30 uppercase tracking-tight">Текущий остаток</span>
                  <span className="text-xs font-bold text-white/60">{currentRemainingDays} дн</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-[10px] font-semibold text-white/30 uppercase tracking-tight">Добавляем</span>
                  <span className={`text-xs font-bold ${tierAccent}`}>+{addedDays} дн</span>
                </div>
              </div>

              {newExpiryDate && (
                <div className="text-center pt-1 border-t border-white/5">
                  <span className="text-[10px] text-white/40 font-medium uppercase tracking-tighter italic">
                    Доступ до {formatDate(newExpiryDate).split('г.')[0]}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Баннер для Upgrade (Mobile) */}
        {action === 'upgrade' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-2xl bg-white/[0.03] ring-1 ring-white/10 p-4 group"
          >
            <div className="absolute -right-2 -top-2 opacity-5">
              <Zap className={`size-16 ${tierColor}`} />
            </div>

            {!conversionData ? (
              <div className="flex items-center gap-3 text-white/10 w-full justify-center py-4">
                <RefreshCw className="size-3.5 animate-spin" />
                <span className="text-[9px] font-bold uppercase tracking-widest">Расчет...</span>
              </div>
            ) : (
              <div className="relative z-10 flex flex-col gap-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`size-8 rounded-lg ${tierBg} flex items-center justify-center ring-1 ${tierRing} shadow-inner`}>
                      <Zap className={`size-4 fill-current ${tierColor}`} />
                    </div>
                    <h3 className="text-[11px] font-bold text-white uppercase tracking-wider leading-none">Апгрейд</h3>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest leading-none mb-1">Итого</span>
                    <span className={`text-2xl font-bold font-oswald leading-none ${tierColor}`}>
                      {((product.duration_months || 1) * 30) + conversionData.convertedDays} дней
                    </span>
                  </div>
                </div>

                <div className="py-2.5 px-3.5 rounded-xl bg-white/[0.04] ring-1 ring-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-white/30 uppercase tracking-tight">Конверсия {conversionData.currentTier[0].toUpperCase()}</span>
                    <div className={`flex items-center gap-1.5 text-xs font-bold ${tierAccent}`}>
                      <span className="text-white/20 font-medium">{conversionData.remainingDays}д</span>
                      <ChevronRight className="size-2 text-white/10" />
                      <span>{conversionData.convertedDays}д</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-[10px] font-semibold text-white/30 uppercase tracking-tight">Новая покупка</span>
                    <span className={`text-xs font-bold ${tierAccent}`}>+{addedDays} дн</span>
                  </div>
                </div>

                {newExpiryDate && (
                  <div className="text-center pt-1 border-t border-white/5">
                    <span className="text-[10px] text-white/40 font-medium uppercase tracking-tighter italic">
                      Доступ до {formatDate(newExpiryDate).split('г.')[0]}
                    </span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
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
