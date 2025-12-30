'use client'

import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import type { PriceCalculation } from '@/lib/services/price-calculator'

interface PriceBreakdownProps {
  calculation: PriceCalculation | null
  loading?: boolean
}

// Компонент для анимированного числа
function AnimatedNumber({ value, format = true }: { value: number; format?: boolean }) {
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    // Анимируем изменение числа
    const duration = 300 // ms
    const steps = 20
    const stepValue = (value - displayValue) / steps
    let currentStep = 0

    const interval = setInterval(() => {
      currentStep++
      setDisplayValue(prev => {
        const newValue = prev + stepValue
        if (currentStep >= steps) {
          clearInterval(interval)
          return value
        }
        return newValue
      })
    }, duration / steps)

    return () => clearInterval(interval)
  }, [value])

  const formatted = format ? Math.round(displayValue).toLocaleString('ru-RU') : Math.round(displayValue).toString()
  
  return <span>{formatted}</span>
}

export function PriceBreakdown({ calculation, loading }: PriceBreakdownProps) {
  // Не показываем skeleton - обновляем in-place
  if (!calculation) {
    return null
  }

  const hasDiscounts = calculation.durationDiscountAmount > 0 || 
                       calculation.promoDiscountAmount > 0 || 
                       calculation.bonusToUse > 0

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-6"
      style={{ minHeight: '320px' }} // Фиксированная минимальная высота
    >
      {/* Фон для секции */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="rounded-xl bg-gradient-to-b from-white/5 to-white/[0.03] p-5 ring-1 ring-white/10 backdrop-blur relative z-10" style={{ minHeight: '280px' }}>
        {/* Заголовок */}
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="9" y1="21" x2="9" y2="9"></line>
          </svg>
          <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">Расчет стоимости</span>
        </div>

        <div className="space-y-3 text-sm">
          {/* Базовая цена */}
          <div className="flex justify-between text-white/60">
            <span>Базовая цена</span>
            <span className="font-medium">
              <AnimatedNumber value={calculation.basePrice} /> ₽
            </span>
          </div>

          {/* Скидка за срок */}
          {calculation.durationDiscountAmount > 0 && (
            <div className="flex justify-between text-orange-400">
              <span>Скидка {calculation.durationDiscountPercent}%</span>
              <span className="font-medium">
                −<AnimatedNumber value={calculation.durationDiscountAmount} /> ₽
              </span>
            </div>
          )}

          {/* Промокод */}
          {calculation.promoDiscountAmount > 0 && (
            <div className="flex justify-between text-orange-400">
              <span className="flex items-center gap-1">
                <span>Промокод</span>
                <span className="text-xs font-mono bg-orange-500/20 px-1.5 py-0.5 rounded">
                  {calculation.promoCode}
                </span>
              </span>
              <span className="font-medium">
                −<AnimatedNumber value={calculation.promoDiscountAmount} /> ₽
              </span>
            </div>
          )}

          {/* Шаги */}
          {calculation.bonusToUse > 0 && (
            <div className="flex justify-between text-orange-400">
              <span className="flex items-center gap-1">
                <span>Шаги</span>
                <span>👟</span>
              </span>
              <span className="font-medium">
                −<AnimatedNumber value={calculation.bonusToUse} /> ₽
              </span>
            </div>
          )}

          {/* Разделитель перед итогом */}
          <div className="border-t border-white/10 pt-3 mt-3" />

          {/* Итого - Hero элемент */}
          <div className="flex justify-between items-baseline py-2">
            <span className="text-base text-white font-semibold">К оплате</span>
            <span className="text-3xl md:text-4xl text-orange-400 font-bold font-oswald">
              <AnimatedNumber value={calculation.finalPrice} /> ₽
            </span>
          </div>

          {/* Разделитель после итога */}
          <div className="border-t border-white/10 pt-3" />

          {/* Экономия и кешбек */}
          <div className="space-y-2">
            {calculation.totalSavings > 0 && (
              <div className="flex items-center gap-2 text-xs bg-green-500/10 px-3 py-2 rounded-lg text-green-400">
                <Sparkles className="size-3" />
                <span>
                  Экономия: <span className="font-bold"><AnimatedNumber value={calculation.totalSavings} /> ₽</span>
                </span>
              </div>
            )}

            {calculation.cashbackAmount > 0 && (
              <div className="flex items-center gap-2 text-xs text-white/60">
                <span className="text-base">🎁</span>
                <span>
                  +<AnimatedNumber value={calculation.cashbackAmount} format={false} /> 👟 кешбек ({calculation.cashbackPercent}%)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

