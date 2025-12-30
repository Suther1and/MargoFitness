'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import type { Product } from '@/types/database'

interface ProductHeroCardProps {
  product: Product
  pricePerMonth: number
  finalPrice: number
}

// Иконки для разных тарифов
const tierIcons = {
  1: (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-300">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
  ),
  2: (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-300">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
      <path d="M4 22h16"></path>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
    </svg>
  ),
  3: (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-300">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
      <path d="M5 3v4"></path>
      <path d="M19 17v4"></path>
      <path d="M3 5h4"></path>
      <path d="M17 19h4"></path>
    </svg>
  )
}

// Градиенты для разных тарифов
const tierGradients = {
  1: { from: 'from-orange-500/15', to: 'to-orange-600/5', blur: 'bg-orange-500/15' },
  2: { from: 'from-purple-500/15', to: 'to-purple-600/5', blur: 'bg-purple-500/15' },
  3: { from: 'from-amber-500/15', to: 'to-amber-600/5', blur: 'bg-amber-500/15' }
}

export function ProductHeroCard({ product, pricePerMonth, finalPrice }: ProductHeroCardProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 1024)
  }, [])

  const tierLevel = (product.tier_level || 1) as 1 | 2 | 3
  const Icon = tierIcons[tierLevel]
  const gradient = tierGradients[tierLevel]

  // Извлекаем benefits из metadata - только 3 для компактности
  const metadata = product.metadata as { benefits?: string[] } | null
  const benefits = metadata?.benefits?.slice(0, 3) || []

  // Определяем текст длительности
  const getDurationText = (months: number) => {
    if (months === 1) return '1 месяц'
    if (months < 5) return `${months} месяца`
    return `${months} месяцев`
  }

  // Есть ли скидка (сравниваем finalPrice с базовой ценой за этот период)
  const hasDiscount = finalPrice < product.price

  // Условный wrapper - на мобильных без framer-motion
  const Wrapper = isMobile ? 'div' : motion.div
  const wrapperProps = isMobile ? {} : {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }

  return (
    <Wrapper
      {...wrapperProps}
      className="relative overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-5"
    >
      {/* Фоновый градиент */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient.from} via-transparent ${gradient.to} pointer-events-none`} />
      
      {/* Blur blobs - скрыты на мобильных */}
      {!isMobile && (
        <>
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={`absolute -right-24 -top-24 h-72 w-72 rounded-full ${gradient.blur} blur-3xl pointer-events-none`}
          />
          
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className={`absolute -left-16 -bottom-16 h-64 w-64 rounded-full ${gradient.blur} blur-3xl pointer-events-none`}
          />
        </>
      )}

      {/* Контент */}
      <div className="rounded-2xl bg-gradient-to-b from-white/5 to-white/[0.03] p-4 ring-1 ring-white/10 backdrop-blur relative z-10">
        {/* Заголовок с иконкой */}
        <div className="flex items-start gap-3 mb-4">
          {/* Иконка - анимация только на desktop */}
          <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-white/10 to-white/5 ring-1 ring-white/20 flex-shrink-0">
            {Icon}
          </div>

          {/* Название и длительность */}
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white font-oswald uppercase tracking-tight leading-tight">
              {product.name} · {getDurationText(product.duration_months || 1)}
            </h2>
          </div>
        </div>

        {/* Цена */}
        <div className="mb-4">
          {hasDiscount && (
            <div className="text-lg text-white/40 line-through font-oswald mb-1">
              {product.price.toLocaleString('ru-RU')} ₽
            </div>
          )}
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white font-oswald transition-all duration-300">
              {finalPrice.toLocaleString('ru-RU')}
            </span>
            <span className="text-xl text-white/60 font-oswald">₽</span>
          </div>
        </div>

        {/* Преимущества */}
        {benefits.length > 0 && (
          <div className="space-y-2 pt-3 border-t border-white/10">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-start gap-2"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span className="text-xs text-white/80 leading-relaxed">{benefit}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Wrapper>
  )
}

