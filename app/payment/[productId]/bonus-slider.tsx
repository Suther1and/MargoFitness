'use client'

import { useState, useEffect } from 'react'
import { Slider } from '@/components/ui/slider'
import { calculateMaxBonusUsage } from '@/lib/actions/bonuses'

interface BonusSliderProps {
  userId: string
  priceAfterDiscounts: number
  onBonusChange: (amount: number) => void
}

export function BonusSlider({ userId, priceAfterDiscounts, onBonusChange }: BonusSliderProps) {
  const [maxBonus, setMaxBonus] = useState(0)
  const [availableBalance, setAvailableBalance] = useState(0)
  const [bonusToUse, setBonusToUse] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBonusData()
  }, [priceAfterDiscounts])

  const loadBonusData = async () => {
    setLoading(true)
    const result = await calculateMaxBonusUsage(priceAfterDiscounts, userId)
    
    if (result.success) {
      setMaxBonus(result.maxAmount || 0)
      setAvailableBalance(result.availableBalance || 0)
    }
    
    setLoading(false)
  }

  const handleSliderChange = (values: number[]) => {
    const amount = values[0]
    setBonusToUse(amount)
    onBonusChange(amount)
  }

  if (loading || availableBalance === 0 || maxBonus === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Использовать шаги (доступно: {availableBalance.toLocaleString('ru-RU')} 👟)
        </span>
        <span className="font-medium">
          {bonusToUse > 0 ? `-${bonusToUse.toLocaleString('ru-RU')} ₽` : '0 ₽'}
        </span>
      </div>
      
      <Slider
        value={[bonusToUse]}
        onValueChange={handleSliderChange}
        max={maxBonus}
        step={10}
        className="w-full"
      />
      
      <div className="text-xs text-muted-foreground text-center">
        Можно использовать до {maxBonus.toLocaleString('ru-RU')} шагов (30% от суммы)
      </div>
    </div>
  )
}


