'use client'

import { useState, useEffect, useCallback } from 'react'
import { calculateMaxBonusUsage } from '@/lib/actions/bonuses'
import { Sparkles } from 'lucide-react'

interface BonusToggleProps {
  userId: string
  priceAfterDiscounts: number
  onBonusChange: (amount: number) => void
  currentBonusAmount?: number
}

export function BonusToggle({ userId, priceAfterDiscounts, onBonusChange, currentBonusAmount = 0 }: BonusToggleProps) {
  const [availableBalance, setAvailableBalance] = useState(0)
  const [useBonuses, setUseBonuses] = useState(false)
  const [loading, setLoading] = useState(true)

  // Рассчитываем maxBonus на лету без перезагрузки
  const maxBonus = Math.min(
    Math.floor(priceAfterDiscounts * 0.3), // 30% от суммы
    availableBalance
  )

  const loadBonusData = useCallback(async () => {
    setLoading(true)
    const result = await calculateMaxBonusUsage(priceAfterDiscounts, userId)
    
    if (result.success) {
      setAvailableBalance(result.availableBalance || 0)
    }
    
    setLoading(false)
  }, [priceAfterDiscounts, userId])

  // Загружаем баланс только один раз
  useEffect(() => {
    loadBonusData()
  }, [userId, loadBonusData])

  // Синхронизируем внутреннее состояние с внешним
  useEffect(() => {
    setUseBonuses(currentBonusAmount > 0)
  }, [currentBonusAmount])

  // Обновляем бонусы при изменении цены, если toggle включен
  useEffect(() => {
    if (useBonuses && maxBonus !== currentBonusAmount) {
      onBonusChange(maxBonus)
    }
  }, [priceAfterDiscounts, useBonuses, maxBonus, currentBonusAmount, onBonusChange])

  const handleToggle = () => {
    const newState = !useBonuses
    setUseBonuses(newState)
    onBonusChange(newState ? maxBonus : 0)
  }

  if (loading || availableBalance === 0) {
    return null
  }

  if (maxBonus === 0) {
    return null
  }

  return (
    <button
      onClick={handleToggle}
      className={`w-full rounded-xl p-3.5 transition-all ${
        useBonuses 
          ? 'bg-orange-500/10 ring-1 ring-orange-400/30' 
          : 'bg-white/[0.04] ring-1 ring-white/10 hover:bg-white/[0.06]'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="text-left">
          <div className="text-sm font-medium text-white flex items-center gap-2">
            <span>Использовать шаги</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xs text-white/60 mt-0.5">
            Доступно: {availableBalance.toLocaleString('ru-RU')}
          </div>
        </div>
        <div className={`text-sm font-semibold ${useBonuses ? 'text-orange-400' : 'text-white/40'}`}>
          {useBonuses ? `-${maxBonus.toLocaleString('ru-RU')} ₽` : 'Применить'}
        </div>
      </div>
    </button>
  )
}

// Экспорт под старым именем для обратной совместимости
export { BonusToggle as BonusSlider }


