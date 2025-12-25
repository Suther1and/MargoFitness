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
  const [maxBonus, setMaxBonus] = useState(0)
  const [availableBalance, setAvailableBalance] = useState(0)
  const [useBonuses, setUseBonuses] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBonusData()
  }, [priceAfterDiscounts])

  // Синхронизируем внутреннее состояние с внешним
  useEffect(() => {
    setUseBonuses(currentBonusAmount > 0)
  }, [currentBonusAmount])

  const loadBonusData = async () => {
    setLoading(true)
    const result = await calculateMaxBonusUsage(priceAfterDiscounts, userId)
    
    if (result.success) {
      setMaxBonus(result.maxAmount || 0)
      setAvailableBalance(result.availableBalance || 0)
    }
    
    setLoading(false)
  }

  const handleToggle = (checked: boolean) => {
    setUseBonuses(checked)
    onBonusChange(checked ? maxBonus : 0)
  }

  if (loading || availableBalance === 0 || maxBonus === 0) {
    return null
  }

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <div className="text-sm font-medium">
          Использовать шаги 👟
        </div>
        <div className="text-xs text-muted-foreground">
          Доступно: {availableBalance.toLocaleString('ru-RU')}, будет списано: {maxBonus.toLocaleString('ru-RU')} (30% от суммы)
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-primary">
          {useBonuses ? `-${maxBonus.toLocaleString('ru-RU')} ₽` : ''}
        </span>
        <Switch
          checked={useBonuses}
          onCheckedChange={handleToggle}
        />
      </div>
    </div>
  )
}


