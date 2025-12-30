'use client'

import { useState, useEffect } from 'react'
import { Loader2, Check, X, Tag } from 'lucide-react'
import { validatePromoCode } from '@/lib/actions/promo-codes'
import { calculateMaxBonusUsage } from '@/lib/actions/bonuses'
import type { PromoCode } from '@/types/database'

interface PriceOptimizerProps {
  productId: string
  userId: string
  priceAfterDiscounts: number
  onPromoApplied: (promo: PromoCode | null) => void
  onBonusChange: (amount: number) => void
  currentBonusAmount?: number
}

export function PriceOptimizer({
  productId,
  userId,
  priceAfterDiscounts,
  onPromoApplied,
  onBonusChange,
  currentBonusAmount = 0
}: PriceOptimizerProps) {
  const [isMobile, setIsMobile] = useState(false)

  // Промокод state
  const [promoCode, setPromoCode] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null)
  const [promoError, setPromoError] = useState('')

  // Бонусы state
  const [availableBalance, setAvailableBalance] = useState(0)
  const [useBonuses, setUseBonuses] = useState(false)
  const [bonusesLoading, setBonusesLoading] = useState(true)

  // Рассчитываем maxBonus на лету
  const maxBonus = Math.min(
    Math.floor(priceAfterDiscounts * 0.3), // 30% от суммы
    availableBalance
  )

  useEffect(() => {
    setIsMobile(window.innerWidth < 1024)
  }, [])

  // Загружаем баланс бонусов
  useEffect(() => {
    loadBonusData()
  }, [userId])

  // Синхронизируем внутреннее состояние с внешним
  useEffect(() => {
    setUseBonuses(currentBonusAmount > 0)
  }, [currentBonusAmount])

  // Обновляем бонусы при изменении цены, если toggle включен
  useEffect(() => {
    if (useBonuses && maxBonus !== currentBonusAmount && maxBonus > 0) {
      onBonusChange(maxBonus)
    }
  }, [priceAfterDiscounts])

  const loadBonusData = async () => {
    setBonusesLoading(true)
    const result = await calculateMaxBonusUsage(priceAfterDiscounts, userId)
    
    if (result.success) {
      setAvailableBalance(result.availableBalance || 0)
    }
    
    setBonusesLoading(false)
  }

  const handlePromoApply = async () => {
    if (!promoCode.trim()) return

    setPromoLoading(true)
    setPromoError('')

    const result = await validatePromoCode(promoCode.trim().toUpperCase(), productId)

    if (result.success && result.data) {
      setAppliedPromo(result.data)
      onPromoApplied(result.data)
      setPromoError('')
    } else {
      setPromoError(result.error || 'Неверный промокод')
      setAppliedPromo(null)
      onPromoApplied(null)
    }

    setPromoLoading(false)
  }

  const handlePromoRemove = () => {
    setPromoCode('')
    setAppliedPromo(null)
    setPromoError('')
    onPromoApplied(null)
  }

  const handleBonusToggle = () => {
    const newState = !useBonuses
    setUseBonuses(newState)
    onBonusChange(newState ? maxBonus : 0)
  }

  if (isMobile) {
    // Mobile: "Toolbar" style - компактная горизонтальная панель
    return (
      <div className="relative overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-2">
        <div className="flex items-stretch gap-2">
          {/* Промокод - компактный инпут */}
          <div className="relative flex-1 group">
            <input
              value={promoCode}
              onChange={(e) => {
                setPromoCode(e.target.value.toUpperCase())
                if (promoError) setPromoError('')
              }}
              placeholder={appliedPromo ? appliedPromo.code : "ПРОМОКОД"}
              disabled={promoLoading || !!appliedPromo}
              className={`w-full h-full bg-white/[0.06] text-white placeholder-white/30 outline-none font-mono text-[10px] px-3 py-2.5 rounded-xl ring-1 ${
                appliedPromo ? 'ring-green-500/30' : promoError ? 'ring-red-500/30' : 'ring-white/10'
              } transition-all ${appliedPromo ? 'text-green-400 font-bold' : ''}`}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {promoLoading ? (
                <Loader2 className="size-3 animate-spin text-orange-400" />
              ) : appliedPromo ? (
                <button 
                  onClick={handlePromoRemove}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="size-3 text-white/40" />
                </button>
              ) : promoCode.trim() ? (
                <button 
                  onClick={handlePromoApply}
                  className="text-[10px] font-bold text-orange-400 px-1.5"
                >
                  OK
                </button>
              ) : (
                <Tag className="size-3 text-white/20" />
              )}
            </div>
          </div>

          {/* Шаги - Акцентная кнопка-переключатель */}
          {!bonusesLoading && availableBalance > 0 && maxBonus > 0 && (
            <button
              onClick={handleBonusToggle}
              className={`flex items-center gap-2 px-4 rounded-xl transition-all ${
                useBonuses 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                  : 'bg-white/[0.06] text-white/50 ring-1 ring-white/10'
              }`}
            >
              <span className="text-sm">👟</span>
              <span className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                {useBonuses ? 'Активны' : 'Шаги'}
              </span>
            </button>
          )}
        </div>
      </div>
    )
  }

  // Desktop: Две отдельные карточки, input всегда виден
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {/* Промокод секция - desktop */}
      <div className="relative overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-4">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white/80">🏷️ Промокод</span>
          </div>
          
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value.toUpperCase())
                  if (promoError) setPromoError('')
                }}
                placeholder="ПРОМОКОД"
                disabled={promoLoading || !!appliedPromo}
                className={`w-full bg-white/[0.06] text-white placeholder-white/40 outline-none font-mono text-sm px-3 py-2.5 rounded-xl ring-1 ${
                  appliedPromo ? 'ring-green-500/50' : promoError ? 'ring-red-500/50' : 'ring-white/10'
                } transition-all ${appliedPromo ? 'text-green-400' : ''}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !appliedPromo) {
                    handlePromoApply()
                  }
                }}
              />
              {appliedPromo && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Check className="size-4 text-green-400" />
                </div>
              )}
              {promoError && !appliedPromo && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="size-4 text-red-400" />
                </div>
              )}
            </div>
            
            {!appliedPromo ? (
              <button 
                onClick={handlePromoApply}
                disabled={!promoCode.trim() || promoLoading}
                className="px-4 py-2.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {promoLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  'OK'
                )}
              </button>
            ) : (
              <button 
                onClick={handlePromoRemove}
                className="px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.08] text-white/70 rounded-xl text-sm font-medium transition-colors"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Бонусы секция - desktop */}
      {!bonusesLoading && availableBalance > 0 && maxBonus > 0 && (
        <button
          onClick={handleBonusToggle}
          className={`w-full rounded-2xl p-4 transition-all relative overflow-hidden ${
            useBonuses 
              ? 'bg-orange-500/15 ring-1 ring-orange-400/40' 
              : 'bg-white/[0.04] ring-1 ring-white/10 hover:bg-white/[0.06]'
          }`}
        >
          <div className="relative z-10 flex items-center justify-between">
            <div className="text-left">
              <div className="text-sm font-semibold text-white flex items-center gap-1.5 mb-1">
                <span>Шаги</span>
                <span className="text-base">👟</span>
              </div>
              <div className="text-xs text-white/60">
                Баланс: {availableBalance.toLocaleString('ru-RU')}
              </div>
            </div>
            <div className={`text-sm font-bold ${useBonuses ? 'text-orange-400' : 'text-white/40'}`}>
              {useBonuses ? 'ПРИМЕНЕНО' : 'ПРИМЕНИТЬ'}
            </div>
          </div>
        </button>
      )}
    </div>
  )
}

