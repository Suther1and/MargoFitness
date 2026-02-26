'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, Check, X, Tag, Sparkles } from 'lucide-react'
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
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < 1024
  })

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

  const loadBonusData = useCallback(async () => {
    setBonusesLoading(true)
    const result = await calculateMaxBonusUsage(priceAfterDiscounts, userId)
    
    if (result.success) {
      setAvailableBalance(result.availableBalance || 0)
    }
    
    setBonusesLoading(false)
  }, [priceAfterDiscounts, userId])

  // Загружаем баланс бонусов
  useEffect(() => {
    loadBonusData()
  }, [userId, loadBonusData])

  // Синхронизируем внутреннее состояние с внешним
  useEffect(() => {
    setUseBonuses(currentBonusAmount > 0)
  }, [currentBonusAmount])

  // Обновляем бонусы при изменении цены, если toggle включен
  useEffect(() => {
    if (useBonuses && maxBonus !== currentBonusAmount && maxBonus > 0) {
      onBonusChange(maxBonus)
    }
  }, [priceAfterDiscounts, useBonuses, maxBonus, currentBonusAmount, onBonusChange])

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

  return (
    <>
      <style jsx>{`
        .optimizer-card {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .promo-input {
          transition: all 0.2s ease;
        }
        .bonus-button {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          -webkit-tap-highlight-color: transparent;
        }
        .status-icon-enter {
          animation: iconIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes iconIn {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {isMobile ? (
        <div className="optimizer-card relative overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-2">
          <div className="flex items-stretch gap-2">
            <div className="relative flex-1 group">
              <input
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value.toUpperCase())
                  if (promoError) setPromoError('')
                }}
                placeholder={appliedPromo ? appliedPromo.code : "ПРОМОКОД"}
                disabled={promoLoading || !!appliedPromo}
                className={`promo-input w-full h-full bg-white/[0.06] text-white placeholder-white/30 outline-none font-mono text-[10px] px-3 py-2.5 rounded-xl ring-1 ${
                  appliedPromo ? 'ring-green-500/30 text-green-400 font-bold' : promoError ? 'ring-red-500/30' : 'ring-white/10'
                }`}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {promoLoading ? (
                  <Loader2 className="size-3 animate-spin text-orange-400" />
                ) : appliedPromo ? (
                  <button onClick={handlePromoRemove} className="p-1 hover:bg-white/10 rounded-full status-icon-enter">
                    <X className="size-3 text-white/40" />
                  </button>
                ) : promoCode.trim() ? (
                  <button onClick={handlePromoApply} className="text-[10px] font-bold text-orange-400 px-1.5 status-icon-enter">
                    OK
                  </button>
                ) : (
                  <Tag className="size-3 text-white/20" />
                )}
              </div>
            </div>

            {!bonusesLoading && availableBalance > 0 && maxBonus > 0 && (
              <button
                onClick={handleBonusToggle}
                className={`bonus-button flex items-center gap-2 px-4 rounded-xl active:scale-95 ${
                  useBonuses 
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                    : 'bg-white/[0.06] text-white/50 ring-1 ring-white/10'
                }`}
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                  Шаги
                </span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="optimizer-card relative overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-4">
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
                    className={`promo-input w-full bg-white/[0.06] text-white placeholder-white/40 outline-none font-mono text-sm px-3 py-2.5 rounded-xl ring-1 ${
                      appliedPromo ? 'ring-green-500/50 text-green-400' : promoError ? 'ring-red-500/50' : 'ring-white/10'
                    }`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !appliedPromo) {
                        handlePromoApply()
                      }
                    }}
                  />
                  {appliedPromo && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 status-icon-enter">
                      <Check className="size-4 text-green-400" />
                    </div>
                  )}
                  {promoError && !appliedPromo && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 status-icon-enter">
                      <X className="size-4 text-red-400" />
                    </div>
                  )}
                </div>
                
                {!appliedPromo ? (
                  <button 
                    onClick={handlePromoApply}
                    disabled={!promoCode.trim() || promoLoading}
                    className="px-4 py-2.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {promoLoading ? <Loader2 className="size-4 animate-spin" /> : 'OK'}
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

          {!bonusesLoading && availableBalance > 0 && maxBonus > 0 && (
            <button
              onClick={handleBonusToggle}
              className={`optimizer-card w-full relative overflow-hidden rounded-2xl p-4 transition-all text-left active:scale-[0.98] ${
                useBonuses 
                  ? 'bg-orange-500/10 ring-1 ring-orange-400/40' 
                  : 'bg-white/[0.04] ring-1 ring-white/10 hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold text-white uppercase tracking-tight">Шаги</span>
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-[10px] text-white/40 uppercase tracking-widest font-medium">
                    Баланс: {availableBalance.toLocaleString('ru-RU')}
                  </div>
                </div>

                <div className={`text-sm font-bold transition-all ${
                  useBonuses ? 'text-orange-400' : 'text-white/20'
                }`}>
                  {useBonuses ? 'УБРАТЬ' : 'ПРИМЕНИТЬ'}
                </div>
              </div>
            </button>
          )}
        </div>
      )}
    </>
  )
}

