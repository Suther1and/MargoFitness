'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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

  const handleChange = (value: string) => {
    const num = parseInt(value) || 0
    const clamped = Math.min(num, maxBonus, availableBalance)
    setBonusToUse(clamped)
    onBonusChange(clamped)
  }

  const handleQuickSelect = (percent: number) => {
    const amount = Math.floor(maxBonus * (percent / 100))
    setBonusToUse(amount)
    onBonusChange(amount)
  }

  if (loading) {
    return (
      <Card className="p-4">
        <div className="text-sm text-muted-foreground">Загрузка данных...</div>
      </Card>
    )
  }

  if (availableBalance === 0) {
    return (
      <Card className="p-4 border-dashed">
        <div className="text-sm text-muted-foreground text-center">
          У вас пока нет шагов 👟
        </div>
      </Card>
    )
  }

  const canUseBonus = maxBonus > 0

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-sm">Использовать шаги</div>
          <div className="text-xs text-muted-foreground">
            Доступно: {availableBalance.toLocaleString('ru-RU')} 👟
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-primary">
            -{bonusToUse.toLocaleString('ru-RU')} ₽
          </div>
        </div>
      </div>

      {canUseBonus ? (
        <>
          <div className="space-y-2">
            <Input
              type="number"
              value={bonusToUse || ''}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="0"
              min={0}
              max={maxBonus}
              className="text-center text-lg font-mono"
            />
            <div className="text-xs text-muted-foreground text-center">
              Можно использовать до {maxBonus.toLocaleString('ru-RU')} шагов (30% от суммы)
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickSelect(25)}
              className="flex-1"
            >
              25%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickSelect(50)}
              className="flex-1"
            >
              50%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickSelect(75)}
              className="flex-1"
            >
              75%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickSelect(100)}
              className="flex-1"
            >
              Макс
            </Button>
          </div>
        </>
      ) : (
        <div className="text-sm text-muted-foreground text-center py-2">
          Минимальная сумма для использования шагов не достигнута
        </div>
      )}
    </Card>
  )
}


