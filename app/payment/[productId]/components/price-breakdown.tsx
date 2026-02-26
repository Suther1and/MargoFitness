'use client'

import { useEffect, useState, useRef } from 'react'
import { Sparkles } from 'lucide-react'
import type { PriceCalculation } from '@/lib/services/price-calculator'

interface PriceBreakdownProps {
  calculation: PriceCalculation | null
  loading?: boolean
}

// Оптимизированный компонент для анимированного числа согласно DESIGN_ANIMATION_GUIDE.md
function AnimatedNumber({ value, format = true }: { value: number; format?: boolean }) {
  const spanRef = useRef<HTMLSpanElement>(null)
  const prevValueRef = useRef(value)
  const requestRef = useRef<number | null>(null)

  useEffect(() => {
    const isMobile = window.innerWidth < 1024
    const DURATION = isMobile ? 800 : 1200
    const startValue = prevValueRef.current
    const diff = value - startValue
    
    if (diff === 0) {
      if (spanRef.current) {
        spanRef.current.textContent = format 
          ? Math.round(value).toLocaleString('ru-RU')
          : Math.round(value).toString()
      }
      return
    }

    const startTime = performance.now()
    const frameInterval = isMobile ? 32 : 16 // 30fps на мобильных
    let lastFrameTime = startTime

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / DURATION, 1)

      // Throttling для мобильных
      if (progress < 1 && currentTime - lastFrameTime < frameInterval) {
        requestRef.current = requestAnimationFrame(animate)
        return
      }

      lastFrameTime = currentTime

      // Easing function (easeInOutCubic для большей плавности)
      const easeProgress = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2

      const currentValue = startValue + diff * easeProgress
      
      if (spanRef.current) {
        spanRef.current.textContent = format 
          ? Math.round(currentValue).toLocaleString('ru-RU')
          : Math.round(currentValue).toString()
      }

      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animate)
      } else {
        prevValueRef.current = value
        if (spanRef.current) {
          spanRef.current.textContent = format 
            ? Math.round(value).toLocaleString('ru-RU')
            : Math.round(value).toString()
        }
      }
    }

    requestRef.current = requestAnimationFrame(animate)
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [value, format])

  return (
    <span ref={spanRef} className="tabular-nums transition-all duration-300">
      {format ? value.toLocaleString('ru-RU') : value}
    </span>
  )
}

export function PriceBreakdown({ calculation }: PriceBreakdownProps) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < 1024
  })

  if (!calculation) return (
    <div className={`relative overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-white/10 ${isMobile ? 'p-4' : 'p-6'}`} style={{ minHeight: isMobile ? '120px' : '320px' }}>
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
      </div>
    </div>
  )

  return (
    <>
      <style jsx>{`
        .breakdown-row {
          max-height: 0;
          opacity: 0;
          overflow: hidden;
          transition: max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
        }
        .breakdown-row.active {
          max-height: 60px;
          opacity: 1;
        }
        .savings-badge {
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @media (max-width: 1023px) {
          .breakdown-row {
            transition-duration: 0.3s;
          }
        }
      `}</style>
      
      <div
        className={`relative overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-white/10 ${isMobile ? 'p-4' : 'p-6'} transition-all duration-500`}
        style={{ minHeight: isMobile ? 'auto' : '320px' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent pointer-events-none" />
        
        <div 
          className={`rounded-xl bg-gradient-to-b from-white/5 to-white/[0.03] ring-1 ring-white/10 backdrop-blur relative z-10 ${isMobile ? 'p-4' : 'p-5'}`} 
          style={{ minHeight: isMobile ? 'auto' : '280px' }}
        >
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
            <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">Расчет стоимости</span>
          </div>

          <div className="text-sm">
            <div className="flex justify-between text-white/60 mb-1">
              <span>Базовая цена</span>
              <span className="font-medium"><AnimatedNumber value={calculation.basePrice} /> ₽</span>
            </div>

            <div className={`breakdown-row ${calculation.durationDiscountAmount > 0 ? 'active' : ''}`}>
              <div className="flex justify-between text-orange-400 pt-3">
                <span>Скидка {calculation.durationDiscountPercent}%</span>
                <span className="font-medium">−<AnimatedNumber value={calculation.durationDiscountAmount} /> ₽</span>
              </div>
            </div>

            <div className={`breakdown-row ${calculation.promoDiscountAmount > 0 ? 'active' : ''}`}>
              <div className="flex justify-between text-orange-400 pt-3">
                <span className="flex items-center gap-1">
                  <span>Промокод</span>
                  <span className="text-[10px] font-mono bg-orange-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider">
                    {calculation.promoCode}
                  </span>
                  {calculation.promoDiscountType === 'percent' && calculation.promoDiscountValue && (
                    <span className="text-[10px] font-bold text-orange-400/60 ml-1">
                      {calculation.promoDiscountValue}%
                    </span>
                  )}
                </span>
                <span className="font-medium">−<AnimatedNumber value={calculation.promoDiscountAmount} /> ₽</span>
              </div>
            </div>

            <div className={`breakdown-row ${calculation.bonusToUse > 0 ? 'active' : ''}`}>
              <div className="flex justify-between text-orange-400 pt-3">
                <span className="flex items-center gap-1"><span>Шаги</span><Sparkles className="w-3 h-3 text-amber-400" /></span>
                <span className="font-medium">−<AnimatedNumber value={calculation.bonusToUse} /> ₽</span>
              </div>
            </div>

            <div className="border-t border-white/10 pt-3 mt-3" />

            <div className="flex justify-between items-baseline py-2">
              <span className="text-base text-white font-semibold">К оплате</span>
              <span className="text-3xl md:text-4xl text-orange-400 font-bold font-oswald">
                <AnimatedNumber value={calculation.finalPrice} /> ₽
              </span>
            </div>

            <div className="flex items-center gap-2 mt-1 mb-4 min-h-[24px]">
              <div className={`savings-badge flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-500/10 ring-1 ring-orange-500/20 text-orange-400 ${calculation.cashbackAmount > 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  +{calculation.cashbackAmount} кешбэк
                </span>
              </div>

              <div className={`savings-badge flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-500/10 ring-1 ring-green-500/20 text-green-400 ${calculation.totalSavings > 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Выгода {calculation.totalSavings.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            </div>

            <div className="border-t border-white/10 pt-3" />
          </div>
        </div>
      </div>
    </>
  )
}
