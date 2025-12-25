'use client'

import { useState, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import { calculateMaxBonusUsage } from '@/lib/actions/bonuses'

interface BonusSliderProps {
  userId: string
  priceAfterDiscounts: number
  onBonusChange: (amount: number) => void
  currentBonusAmount?: number
}

export function BonusSlider({ userId, priceAfterDiscounts, onBonusChange, currentBonusAmount = 0 }: BonusSliderProps) {
  const [availableBalance, setAvailableBalance] = useState(0)
  const [useBonuses, setUseBonuses] = useState(false)
  const [loading, setLoading] = useState(true)

  // Рассчитываем maxBonus на лету без перезагрузки
  const maxBonus = Math.min(
    Math.floor(priceAfterDiscounts * 0.3), // 30% от суммы
    availableBalance
  )

  // Загружаем баланс только один раз
  useEffect(() => {
    loadBonusData()
  }, [userId])

  // Синхронизируем внутреннее состояние с внешним
  useEffect(() => {
    setUseBonuses(currentBonusAmount > 0)
  }, [currentBonusAmount])

  // Обновляем бонусы при изменении цены, если toggle включен
  useEffect(() => {
    if (useBonuses && maxBonus !== currentBonusAmount) {
      onBonusChange(maxBonus)
    }
  }, [priceAfterDiscounts])

  const loadBonusData = async () => {
    setLoading(true)
    const result = await calculateMaxBonusUsage(priceAfterDiscounts, userId)
    
    if (result.success) {
      setAvailableBalance(result.availableBalance || 0)
    }
    
    setLoading(false)
  }

  const handleToggle = (checked: boolean) => {
    setUseBonuses(checked)
    onBonusChange(checked ? maxBonus : 0)
  }

  if (loading || availableBalance === 0) {
    return null
  }

  if (maxBonus === 0) {
    return null
  }

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <div className="text-sm font-medium">
          Использовать шаги 👟 
          <span className="text-muted-foreground font-normal ml-2">
            (доступно: {availableBalance.toLocaleString('ru-RU')})
          </span>
        </div>
      </div>
      <Switch
        checked={useBonuses}
        onCheckedChange={handleToggle}
      />
    </div>
  )
}


