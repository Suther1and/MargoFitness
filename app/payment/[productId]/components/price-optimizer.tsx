'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tag, Loader2, Check, X, Sparkles } from 'lucide-react'
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
  // Промокод state
  const [promoExpanded, setPromoExpanded] = useState(false)
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
    setPromoExpanded(false)
  }

  const handleBonusToggle = () => {
    const newState = !useBonuses
    setUseBonuses(newState)
    onBonusChange(newState ? maxBonus : 0)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-3"
    >
      {/* Промокод секция */}
      <div className="relative overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-white/10">
        <AnimatePresence mode="wait">
          {!promoExpanded && !appliedPromo ? (
            // Компактный бейдж
            <motion.button
              key="compact"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPromoExpanded(true)}
              className="w-full p-4 flex items-center justify-between group hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Tag className="size-5 text-orange-400" />
                <span className="text-sm font-medium text-white/80">Есть промокод?</span>
              </div>
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40">
                  <path d="m9 18 6-6-6-6"></path>
                </svg>
              </motion.div>
            </motion.button>
          ) : (
            // Развернутая форма
            <motion.div
              key="expanded"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 space-y-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <Tag className="size-4 text-orange-400" />
                <span className="text-sm font-semibold text-white/80 uppercase tracking-wider">Промокод</span>
              </div>

              {/* Поле ввода */}
              <div className="relative">
                <input
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="ВВЕДИТЕ КОД"
                  disabled={promoLoading || !!appliedPromo}
                  readOnly={!!appliedPromo}
                  className={`w-full bg-white/[0.06] text-white placeholder-white/40 outline-none font-mono text-sm px-4 py-3 rounded-xl ring-1 ${
                    appliedPromo ? 'ring-green-500/50' : promoError ? 'ring-red-500/50' : 'ring-white/10'
                  } transition-all ${appliedPromo ? 'text-green-400' : ''}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !appliedPromo) {
                      handlePromoApply()
                    }
                  }}
                  autoFocus={!appliedPromo}
                />
                {appliedPromo && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <Check className="size-5 text-green-400" />
                  </motion.div>
                )}
              </div>

              {/* Success message */}
              <AnimatePresence>
                {appliedPromo && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 px-3 py-2 rounded-lg"
                  >
                    <Sparkles className="size-3" />
                    <span>Промокод применен</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error message */}
              <AnimatePresence>
                {promoError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg"
                  >
                    <X className="size-3" />
                    <span>{promoError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Кнопки действий */}
              <div className="flex items-center justify-between pt-2">
                <button 
                  onClick={handlePromoRemove}
                  className="text-xs text-white/60 hover:text-white transition-colors"
                >
                  Отменить
                </button>
                {!appliedPromo && (
                  <button 
                    onClick={handlePromoApply}
                    disabled={!promoCode.trim() || promoLoading}
                    className="text-xs text-orange-400 hover:text-orange-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 font-medium"
                  >
                    {promoLoading ? (
                      <>
                        <Loader2 className="size-3 animate-spin" />
                        <span>Проверка...</span>
                      </>
                    ) : (
                      <span>Применить</span>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Бонусы секция */}
      {!bonusesLoading && availableBalance > 0 && maxBonus > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={handleBonusToggle}
          className={`w-full rounded-2xl p-4 transition-all relative overflow-hidden ${
            useBonuses 
              ? 'bg-orange-500/15 ring-1 ring-orange-400/40' 
              : 'bg-white/[0.04] ring-1 ring-white/10 hover:bg-white/[0.06]'
          }`}
        >
          {/* Анимированный фон при активации */}
          <AnimatePresence>
            {useBonuses && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 2, opacity: 0.1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute inset-0 bg-orange-500 rounded-full blur-2xl"
              />
            )}
          </AnimatePresence>

          <div className="relative z-10 flex items-center justify-between">
            <div className="text-left">
              <div className="text-sm font-semibold text-white flex items-center gap-2 mb-1">
                <span>Использовать шаги</span>
                <motion.span
                  animate={{ rotate: useBonuses ? [0, -10, 10, -10, 0] : 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-base"
                >
                  👟
                </motion.span>
              </div>
              <div className="text-xs text-white/60">
                Доступно: <span className="font-semibold">{availableBalance.toLocaleString('ru-RU')}</span> шагов
              </div>
            </div>
            <div className={`text-sm font-bold ${useBonuses ? 'text-orange-400' : 'text-white/40'}`}>
              {useBonuses ? (
                <motion.span
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1"
                >
                  <span>−{maxBonus.toLocaleString('ru-RU')} ₽</span>
                </motion.span>
              ) : (
                'Применить'
              )}
            </div>
          </div>
        </motion.button>
      )}
    </motion.div>
  )
}

