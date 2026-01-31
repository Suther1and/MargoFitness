'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Product, SubscriptionTier, TIER_LEVELS, TIER_NAMES } from '@/types/database'
import { Zap, CheckCircle2, ArrowRight, Sparkles, Trophy, Star, ArrowBigRightDash, Plus, Gift, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { SUBSCRIPTION_PLANS, SubscriptionLevel } from '@/lib/constants/subscriptions'
import { cn } from '@/lib/utils'

// Базовые цены за месяц (без скидок) - для конвертации
const BASE_PRICES_PER_MONTH: Record<number, number> = {
  1: 3990, // Basic
  2: 4990, // Pro
  3: 9990, // Elite
}

// Компонент для плавной анимации чисел
function AnimatedNumber({ value, format = true }: { value: number; format?: boolean }) {
  const spanRef = useRef<HTMLSpanElement>(null)
  const prevValueRef = useRef(value)
  const requestRef = useRef<number | null>(null)

  useEffect(() => {
    const isMobile = window.innerWidth < 1024
    const DURATION = isMobile ? 600 : 900
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

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / DURATION, 1)

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
    <span ref={spanRef} className="tabular-nums">
      {format ? value.toLocaleString('ru-RU') : value}
    </span>
  )
}

interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentTier: SubscriptionTier
  userId: string
  onOpenRenewal?: () => void
  initialTier?: SubscriptionTier // Для предварительного выбора тарифа (например, Elite)
}

const tierConfig = {
  basic: {
    gradient: 'from-amber-700/10 to-amber-800/5',
    color: 'text-amber-600',
    ring: 'ring-amber-700/30',
    bg: 'bg-amber-700/20',
    shadow: 'shadow-amber-700/20',
    icon: <Star className="w-5 h-5" />,
    benefits: ['Базовые тренировки', 'Доступ к сообществу']
  },
  pro: {
    gradient: 'from-purple-500/10 to-purple-600/5',
    color: 'text-purple-400',
    ring: 'ring-purple-500/30',
    bg: 'bg-purple-500/20',
    shadow: 'shadow-purple-500/20',
    icon: <Star className="w-5 h-5" />,
    benefits: ['Всё из Basic', '2→3 тренировки в неделю', 'Дневник здоровья', 'Доступ в Telegram сообщество навсегда']
  },
  elite: {
    gradient: 'from-yellow-400/10 to-yellow-500/5',
    color: 'text-yellow-400',
    ring: 'ring-yellow-400/30',
    bg: 'bg-yellow-400/20',
    shadow: 'shadow-yellow-400/20',
    icon: <Trophy className="w-5 h-5" />,
    benefits: ['Всё из PRO', 'Личное ведение с Марго', 'Индивидуальный план питания', 'Коррекция техники по видео', 'Прямая связь в Telegram']
  }
}

export function SubscriptionUpgradeModal({ open, onOpenChange, currentTier, userId, onOpenRenewal, initialTier }: UpgradeModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)
  const [showMobileTooltip, setShowMobileTooltip] = useState(false)
  
  const [availableTiersData, setAvailableTiersData] = useState<{
    tier: SubscriptionTier
    tierLevel: number
    products: Product[]
  }[]>([])
  
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [conversionData, setConversionData] = useState<{
    newExpirationDate: string
    convertedDays: number
    newProductDays: number
    totalDays: number
    remainingDays: number
    currentTier: SubscriptionTier
  } | null>(null)
  
  // Данные профиля для локального расчета конвертации
  const profileDataRef = useRef<{
    currentTier: SubscriptionTier
    currentTierLevel: number
    expiresAt: string | null
    remainingDays: number
  } | null>(null)
  
  // Клиентская функция расчета конвертации (без Server Action!)
  const calculateConversion = (newTierLevel: number, productDurationMonths: number) => {
    if (!profileDataRef.current) return null
    
    const { currentTierLevel, remainingDays } = profileDataRef.current
    
    if (remainingDays <= 0) {
      return {
        convertedDays: 0,
        newProductDays: productDurationMonths * 30,
        totalDays: productDurationMonths * 30,
        remainingDays: 0,
      }
    }
    
    // Конвертация по базовым ценам тарифов
    const pricePerDayOld = BASE_PRICES_PER_MONTH[currentTierLevel] / 30
    const remainingValue = remainingDays * pricePerDayOld
    const basePricePerDayNew = BASE_PRICES_PER_MONTH[newTierLevel] / 30
    const conversionRatio = remainingValue / basePricePerDayNew
    const roundedConvertedDays = Math.round(conversionRatio)
    
    // Если конвертация дает 0, но есть оставшиеся дни - даем минимум 1 день
    const convertedDays = roundedConvertedDays === 0 ? 1 : roundedConvertedDays
    const newProductDays = (productDurationMonths || 1) * 30
    
    return {
      convertedDays: Math.max(0, convertedDays),
      newProductDays,
      totalDays: Math.max(0, convertedDays) + newProductDays,
      remainingDays,
    }
  }

  const loadData = useCallback(async () => {
    setLoading(true)
    
    try {
      const supabase = createClient()
      
      // Получить профиль пользователя (один раз!)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_expires_at')
        .eq('id', userId)
        .single()
      
      if (profileError || !profile) {
        console.error('[UpgradeModal] Profile not found:', profileError)
        setLoading(false)
        return
      }
      
      const currentTierLevel = TIER_LEVELS[profile.subscription_tier as SubscriptionTier]
      
      // Рассчитать оставшиеся дни
      const now = new Date()
      const expiresAt = profile.subscription_expires_at ? new Date(profile.subscription_expires_at) : now
      const diffTime = expiresAt.getTime() - now.getTime()
      const remainingDays = diffTime > 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0
      
      // Сохраняем данные профиля для локальных расчетов
      profileDataRef.current = {
        currentTier: profile.subscription_tier as SubscriptionTier,
        currentTierLevel,
        expiresAt: profile.subscription_expires_at,
        remainingDays,
      }
      
      // Если уже Elite - апгрейда нет
      if (currentTierLevel >= 3) {
        setAvailableTiersData([])
        setLoading(false)
        return
      }
      
      // Получить продукты всех тарифов выше текущего
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('type', 'subscription_tier')
        .gt('tier_level', currentTierLevel)
        .eq('is_active', true)
        .order('tier_level', { ascending: true })
        .order('duration_months', { ascending: true })
      
      if (productsError || !products || products.length === 0) {
        console.error('[UpgradeModal] Products not found:', productsError)
        setAvailableTiersData([])
        setLoading(false)
        return
      }
      
      // Группируем продукты по tier_level
      const groupedByTier: Record<number, Product[]> = {}
      products.forEach(product => {
        const level = product.tier_level || 1
        if (!groupedByTier[level]) {
          groupedByTier[level] = []
        }
        groupedByTier[level].push(product)
      })
      
      // Преобразуем в массив
      const availableTiers: {
        tier: SubscriptionTier
        tierLevel: number
        products: Product[]
      }[] = []
      
      Object.entries(groupedByTier).forEach(([level, prods]) => {
        const tierLevel = parseInt(level)
        availableTiers.push({
          tier: TIER_NAMES[tierLevel] as SubscriptionTier,
          tierLevel,
          products: prods
        })
      })
      
      if (availableTiers.length > 0) {
        setAvailableTiersData(availableTiers)
        
        // Если указан initialTier, используем его, иначе первый доступный
        const targetTier = availableTiers.find(t => t.tier === initialTier) || availableTiers[0]
        
        const initialProd = targetTier.products.find(p => p.duration_months === 6) || targetTier.products[0]
        
        // ЛОКАЛЬНЫЙ расчет без Server Action!
        const conversion = calculateConversion(initialProd.tier_level || 0, initialProd.duration_months || 0)
        
        setSelectedTier(targetTier.tier)
        setSelectedProduct(initialProd)
        
        if (conversion) {
          setConversionData({
            newExpirationDate: new Date(new Date().getTime() + conversion.totalDays * 86400000).toISOString(),
            convertedDays: conversion.convertedDays,
            newProductDays: conversion.newProductDays,
            totalDays: conversion.totalDays,
            remainingDays: conversion.remainingDays,
            currentTier: profile.subscription_tier as SubscriptionTier
          })
        }
      }
    } catch (error) {
      console.error('[UpgradeModal] Error loading data:', error)
    }
    
    setLoading(false)
  }, [userId, initialTier])

  useEffect(() => {
    if (open) loadData()
  }, [open, userId, initialTier, loadData])

  const handleTierChange = (tier: SubscriptionTier) => {
    if (tier === selectedTier || calculating || !profileDataRef.current) return
    
    setCalculating(true)
    setSelectedTier(tier)
    
    const tierData = availableTiersData.find(t => t.tier === tier)
    if (!tierData) {
      setCalculating(false)
      return
    }
    
    const prod = tierData.products.find(p => p.duration_months === 6) || tierData.products[0]
    setSelectedProduct(prod)
    
    // ЛОКАЛЬНЫЙ расчет без Server Action!
    const conversion = calculateConversion(prod.tier_level || 0, prod.duration_months || 0)
    
    if (conversion) {
      setConversionData({
        newExpirationDate: new Date(new Date().getTime() + conversion.totalDays * 86400000).toISOString(),
        convertedDays: conversion.convertedDays,
        newProductDays: conversion.newProductDays,
        totalDays: conversion.totalDays,
        remainingDays: conversion.remainingDays,
        currentTier: profileDataRef.current.currentTier
      })
    }
    
    setCalculating(false)
  }

  const handleProductChange = (product: Product) => {
    if (product.id === selectedProduct?.id || calculating || !profileDataRef.current) return
    
    setCalculating(true)
    setSelectedProduct(product)
    
    // ЛОКАЛЬНЫЙ расчет без Server Action!
    const conversion = calculateConversion(product.tier_level || 0, product.duration_months || 0)
    
    if (conversion) {
      setConversionData({
        newExpirationDate: new Date(new Date().getTime() + conversion.totalDays * 86400000).toISOString(),
        convertedDays: conversion.convertedDays,
        newProductDays: conversion.newProductDays,
        totalDays: conversion.totalDays,
        remainingDays: conversion.remainingDays,
        currentTier: profileDataRef.current.currentTier
      })
    }
    
    setCalculating(false)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const isFreeUser = profileDataRef.current?.currentTier?.toUpperCase() === 'FREE' || currentTier?.toUpperCase() === 'FREE'
  const currentConfig = selectedTier 
    ? tierConfig[selectedTier as keyof typeof tierConfig] 
    : (availableTiersData.length === 0 ? tierConfig.elite : null)
  const products = availableTiersData.find(t => t.tier === selectedTier)?.products || []
  
  const selectedPlanInfo = selectedTier ? SUBSCRIPTION_PLANS[selectedTier.toUpperCase() as SubscriptionLevel] : null

  return (
    <>
      <style jsx global>{`
        .tabular-nums { 
          font-variant-numeric: tabular-nums; 
        }

        /* Force hide Dialog default close button */
        [data-slot="dialog-close"] {
          display: none !important;
        }

        @media (max-width: 1023px) {
          [data-slot="dialog-content"] {
            background-color: #1a1a24 !important;
            border: none !important;
          }
        }
      `}</style>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          className="sm:max-w-[760px] w-[95vw] md:h-[620px] h-auto max-h-[95vh] bg-transparent border-0 p-0 overflow-visible shadow-none ring-0"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">Апгрейд тарифа</DialogTitle>
          <DialogDescription className="sr-only">Перейдите на новый уровень</DialogDescription>
          
          {loading ? (
              <div className="relative flex flex-col md:flex-row w-full h-full min-h-[450px] md:min-h-[500px] bg-[#1a1a24] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10 backdrop-blur-xl"
              >
                {/* Кнопка закрытия */}
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  style={{ position: 'absolute', zIndex: 70, width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', outline: 'none' }}
                  className="top-4 right-4 md:top-[6px] md:right-[6px] transition-all hover:opacity-70 active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white/40 hover:text-white/80">
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                  </svg>
                </button>

                {/* Левая панель skeleton */}
                <div className={`md:w-[280px] bg-gradient-to-b from-white/10 to-transparent pt-5 md:pt-6 px-6 md:px-8 pb-3 md:pb-6 flex-shrink-0 relative border-b md:border-b-0 md:border-r border-white/5`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
                  <div className="relative z-10 space-y-6 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 md:h-5 bg-white/5 rounded w-2/3" />
                        <div className="h-3 bg-white/5 rounded w-1/3" />
                      </div>
                    </div>
                    <div className="space-y-3 pt-4 hidden md:block">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full bg-white/5 flex-shrink-0" />
                          <div className="h-3 bg-white/5 rounded w-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Правая панель skeleton */}
                <div className="flex-1 px-6 pt-5 pb-6 md:px-10 md:pt-7 md:pb-10 animate-pulse flex flex-col">
                  <div className="h-12 bg-white/5 rounded-xl mb-5" />
                  <div className="h-24 bg-white/5 rounded-3xl mb-5" />
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-24 md:h-24 bg-white/5 rounded-[22px]" />
                    ))}
                  </div>
                  <div className="mt-auto h-32 bg-white/5 rounded-3xl" />
                </div>
              </div>
            ) : (
              <div className="relative flex flex-col md:flex-row w-full h-full bg-[#1a1a24] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10 backdrop-blur-xl"
              >
                {/* Кнопка закрытия */}
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  style={{ position: 'absolute', zIndex: 70, width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', outline: 'none' }}
                  className="top-4 right-4 md:top-[6px] md:right-[6px] transition-all hover:opacity-70 active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white/40 hover:text-white/80">
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                  </svg>
                </button>

                {/* Левая панель */}
                <div className={`md:w-[280px] pt-5 md:pt-6 px-6 md:px-8 pb-3 md:pb-6 bg-gradient-to-b ${currentConfig?.gradient || 'from-purple-500/10'} to-transparent border-b md:border-b-0 md:border-r border-white/5 flex-shrink-0 relative transition-all duration-500`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
                  <div className={`absolute -bottom-24 -left-24 w-64 h-64 rounded-full blur-3xl pointer-events-none hidden md:block transition-all duration-700 ${
                    (selectedTier === 'pro' || (availableTiersData.length === 0 && currentTier === 'pro')) ? 'bg-purple-500/15' : 
                    (selectedTier === 'elite' || (availableTiersData.length === 0 && currentTier === 'elite')) ? 'bg-yellow-400/15' : 'bg-amber-500/15'
                  }`} />
                  
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl ${currentConfig?.bg || 'bg-purple-500/20'} flex items-center justify-center ring-1 ${currentConfig?.ring || 'ring-purple-500/30'} shadow-lg transition-all duration-300`}>
                        {currentConfig?.icon || <Sparkles className={`w-6 h-6 md:w-6 md:h-6 transition-colors duration-300 ${currentConfig?.color || 'text-purple-300'}`} />}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl md:text-2xl font-oswald uppercase leading-none text-white">
                          {isFreeUser ? 'Выбор тарифа' : 'Апгрейд'}
                        </h3>
                        <p className="text-xs md:text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1 md:hidden">
                          <button 
                            onClick={() => setShowMobileTooltip(!showMobileTooltip)}
                            className="underline hover:text-white/60 transition-colors"
                          >
                            {isFreeUser ? 'что я получу?' : 'как это работает?'}
                          </button>
                        </p>
                        <p className="text-[10px] md:text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1 hidden md:block">New Level</p>
                      </div>
                    </div>

                    {/* Mobile tooltip */}
                    {showMobileTooltip && (
                      <div className="md:hidden mt-4 p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                        {isFreeUser && selectedPlanInfo ? (
                          selectedPlanInfo.benefits.map((benefit, i) => (
                            <div key={i} className={`flex items-center gap-2 text-xs ${benefit.included ? 'text-white/70' : 'text-white/30'}`}>
                              <div className={`flex-shrink-0 w-3 h-3 rounded-full ${benefit.included ? (currentConfig?.bg || 'bg-white/10') : 'bg-white/5'} flex items-center justify-center`}>
                                <CheckCircle2 className={`w-2 h-2 ${benefit.included ? (currentConfig?.color || 'text-white/40') : 'text-white/10'}`} />
                              </div>
                              <span className="leading-tight">{benefit.text}</span>
                            </div>
                          ))
                        ) : (availableTiersData.length === 0 
                          ? [
                              'У тебя максимальный уровень подписки Elite',
                              'Все функции и личное ведение уже доступны',
                              'Продли тариф для сохранения доступа'
                            ]
                          : [
                              'Выбери срок новой подписки',
                              'Оставшиеся дни будут конвертированы',
                              `"Перейти на ${(selectedTier || currentTier).toUpperCase()}" перенесет к оплате`
                            ]
                        ).map((text, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-white/70">
                            <div className={`flex-shrink-0 w-3 h-3 rounded-full ${currentConfig?.bg || 'bg-white/10'} flex items-center justify-center`}>
                              <CheckCircle2 className={`w-2 h-2 ${currentConfig?.color || 'text-white/40'}`} />
                            </div>
                            <span className="leading-tight">{text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Как это работает / Преимущества - скрыто на мобильных */}
                    <div className="space-y-4 flex-1 hidden md:block pt-8">
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        {isFreeUser ? `Преимущества ${selectedTier}:` : (availableTiersData.length === 0 ? 'Твой статус:' : 'Как это работает:')}
                      </p>
                      <div className="relative min-h-[220px]">
                        <div className="space-y-3">
                          {isFreeUser && selectedPlanInfo ? (
                            selectedPlanInfo.benefits.map((benefit, i) => (
                              <div key={i} className={`flex items-center gap-3 text-sm ${benefit.included ? 'text-white/70' : 'text-white/20'}`}>
                                <div className={`flex-shrink-0 w-4 h-4 rounded-full ${benefit.included ? (currentConfig?.bg || 'bg-white/10') : 'bg-white/5'} flex items-center justify-center`}>
                                  <CheckCircle2 className={`w-3 h-3 ${benefit.included ? (currentConfig?.color || 'text-white/40') : 'text-white/10'}`} />
                                </div>
                                <span className={`leading-tight ${benefit.highlight ? 'text-white font-bold' : ''}`}>{benefit.text}</span>
                              </div>
                            ))
                          ) : (availableTiersData.length === 0 
                            ? [
                                'У тебя максимальный уровень подписки Elite',
                                'Все функции и личное ведение уже доступны',
                                'Продли тариф для сохранения доступа'
                              ]
                            : [
                                'Выбери срок новой подписки',
                                'Оставшиеся дни будут конвертированы',
                                `"Перейти на ${(selectedTier || currentTier).toUpperCase()}" перенесет к оплате`
                              ]
                          ).map((text, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm text-white/70">
                              <div className={`flex-shrink-0 w-4 h-4 rounded-full ${currentConfig?.bg || 'bg-white/10'} flex items-center justify-center`}>
                                <CheckCircle2 className={`w-3 h-3 ${currentConfig?.color || 'text-white/40'}`} />
                              </div>
                              <span className="leading-tight">{text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 py-4">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        <div className="w-1 h-1 rounded-full bg-white/30" />
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                      </div>
                      
                      <div className="mt-auto space-y-2 pt-4">
                        {[
                          { icon: Zap, text: 'Моментальный доступ', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                          isFreeUser 
                            ? { icon: Gift, text: 'Бонусная программа', color: 'text-purple-400', bg: 'bg-purple-500/10' }
                            : { icon: ArrowRight, text: 'Умная конвертация', color: 'text-blue-400', bg: 'bg-blue-500/10' },
                          { icon: CheckCircle2, text: 'Безопасная оплата', color: 'text-orange-400', bg: 'bg-orange-500/10' }
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-2 rounded-2xl bg-white/[0.03] border border-white/5">
                            <div className={`w-8 h-8 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0`}>
                              <item.icon className={`w-4 h-4 ${item.color}`} />
                            </div>
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-tight">{item.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Правая панель */}
                <div className="flex-1 px-6 pt-5 md:pt-7 pb-6 md:px-10 md:pb-10 flex flex-col min-h-0">
                  {availableTiersData.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                      <div className="w-20 h-20 rounded-full bg-yellow-400/10 flex items-center justify-center ring-1 ring-yellow-400/20">
                        <Trophy className="w-10 h-10 text-yellow-400" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white uppercase tracking-tight">У тебя уже максимальный уровень!</h3>
                        <p className="text-sm text-white/60">Хочешь продлить текущую подписку?</p>
                      </div>
                      <button
                        onClick={() => {
                          onOpenChange(false);
                          onOpenRenewal?.();
                        }}
                        className="px-8 py-3 rounded-2xl bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-bold text-sm uppercase tracking-widest shadow-lg shadow-yellow-500/20 transition-all hover:brightness-110 active:scale-95"
                      >
                        Перейти к продлению
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex p-1.5 bg-gradient-to-b from-white/[0.08] to-white/[0.04] rounded-2xl border border-white/10 mb-5 md:mb-5">
                        {availableTiersData.map(t => {
                          const isSelected = selectedTier === t.tier
                          const config = tierConfig[t.tier as keyof typeof tierConfig]
                          return (
                            <button
                              key={t.tier}
                              onClick={() => handleTierChange(t.tier)}
                              className={`flex-1 py-2.5 md:py-2.5 px-2 rounded-xl text-xs md:text-xs font-bold uppercase tracking-wider transition-all duration-200 ${isSelected ? `bg-gradient-to-br ${config.bg} ring-1 ${config.ring} text-white shadow-lg ${config.shadow}` : 'text-white/40 hover:text-white/60 hover:bg-white/[0.03] active:scale-[0.97]'}`}
                              style={{ touchAction: 'manipulation' }}
                            >
                              {t.tier}
                            </button>
                          )
                        })}
                      </div>

                      {!isFreeUser && (
                        <div className="mb-5 md:mb-5">
                          <div className="flex items-center justify-between mb-2 px-2">
                            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                              <Zap className="w-3 h-3 text-emerald-400" />
                              <span className="text-[10px] md:text-[9px] font-bold text-emerald-400 uppercase tracking-tight">Smart Convert</span>
                            </div>
                            <p className="text-[10px] md:text-[9px] font-bold text-white/50 md:text-white/20 uppercase tracking-widest">Автоматический пересчет</p>
                          </div>
                          
                          <div className="flex items-center gap-4 p-4 md:p-3.5 rounded-2xl md:rounded-3xl bg-white/[0.02] border border-white/5 relative w-full">
                            <div className="flex-1 flex flex-col items-center">
                              <p className="text-[10px] md:text-[9px] font-bold text-white/50 md:text-white/30 uppercase mb-1">
                                Осталось дней <span className={conversionData?.currentTier === 'pro' ? 'text-purple-400' : conversionData?.currentTier === 'elite' ? 'text-yellow-400' : 'text-amber-600'}>{conversionData?.currentTier?.toUpperCase() || currentTier.toUpperCase()}</span>:
                              </p>
                              <p className="text-xl md:text-xl font-oswald font-bold text-white/40 line-through leading-none">
                                <AnimatedNumber value={conversionData?.remainingDays || 0} /> дн.
                              </p>
                            </div>
                            <div className="w-px h-8 md:h-8 bg-white/5" />
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 md:w-8 md:h-8 rounded-full bg-[#1a1a24] border border-white/5 flex items-center justify-center z-10">
                              <ArrowBigRightDash className="w-4 h-4 md:w-4 md:h-4 text-white/20" />
                            </div>
                            <div className="flex-1 flex flex-col items-center">
                              <p className="text-[10px] md:text-[9px] font-bold text-white/50 md:text-white/30 uppercase mb-1">
                                Будет добавлено <span className={currentConfig?.color}>{selectedTier}</span>:
                              </p>
                              <p className={`text-xl md:text-xl font-oswald font-bold ${currentConfig?.color} leading-none`}>
                                <AnimatedNumber value={conversionData?.convertedDays || 0} /> дн.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className={cn("mb-5 md:mb-5", isFreeUser && "mt-4")}>
                        <div className="rounded-2xl md:rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.01] ring-1 ring-white/10 p-3 md:p-3 backdrop-blur-sm">
                          <div className="grid grid-cols-2 gap-3 md:gap-3" key={`products-${selectedTier}`}>
                            {products.map((p) => {
                              const isSelected = selectedProduct?.id === p.id
                              return (
                                <button
                                  key={p.id}
                                  onClick={() => handleProductChange(p)}
                                  className={`relative p-4 md:p-4 rounded-xl md:rounded-[22px] text-left border transition-all duration-200 ${isSelected ? `bg-gradient-to-br ${currentConfig?.bg || 'bg-white/10'} border-white/20 ring-2 ${currentConfig?.ring || 'ring-white/20'} shadow-lg ${currentConfig?.shadow || ''}` : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10 active:scale-[0.98]'}`}
                                  style={{ touchAction: 'manipulation' }}
                                >
                                  {(p.discount_percentage || 0) > 0 && (
                                    <span className={`absolute top-2 right-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] ring-1 font-bold overflow-hidden ${
                                      selectedTier === 'elite' ? 'bg-amber-500/20 text-amber-100 ring-amber-400/40' : 
                                      selectedTier === 'pro' ? 'bg-purple-500/20 text-purple-100 ring-purple-400/40' :
                                      'bg-amber-600/20 text-amber-100 ring-amber-600/40'
                                    }`}>
                                      −{p.discount_percentage}%
                                    </span>
                                  )}
                                  <p className={`text-[10px] font-bold uppercase mb-1 tracking-wider transition-colors ${isSelected ? currentConfig?.color : 'text-white/40'}`}>
                                    {p.duration_months} мес.
                                  </p>
                                  <p className="text-xl md:text-xl font-oswald font-bold text-white">
                                    {p.price.toLocaleString('ru-RU')} <span className="text-sm md:text-sm text-white/50 font-normal">₽</span>
                                  </p>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="mt-auto pt-4 md:pt-4 border-t border-white/5">
                        {isFreeUser ? (
                          <div className="mb-4">
                            <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5 flex items-center justify-between relative overflow-hidden">
                              <div className={`absolute left-0 top-0 bottom-0 w-1 ${currentConfig?.bg?.replace('bg-', 'bg-') || 'bg-white/10'}`} />
                              
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Срок доступа</span>
                                <div className="flex items-baseline gap-2">
                                  <span className={`text-3xl font-oswald font-bold leading-none ${currentConfig?.color}`}>
                                    <AnimatedNumber value={selectedProduct?.duration_months ? (selectedProduct.duration_months || 1) * 30 : 0} />
                                  </span>
                                  <span className="text-sm font-medium text-white/50">дней</span>
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-1">
                                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Тариф</span>
                                <div className="flex items-center gap-2">
                                  <span className={`text-lg font-oswald font-bold uppercase tracking-wide ${currentConfig?.color}`}>
                                    {selectedTier}
                                  </span>
                                  {selectedProduct && (selectedProduct.discount_percentage || 0) > 0 && (
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm ring-1 ${
                                      selectedTier === 'elite' ? 'bg-amber-500/20 text-amber-100 ring-amber-400/40' : 
                                      selectedTier === 'pro' ? 'bg-purple-500/20 text-purple-100 ring-purple-400/40' :
                                      'bg-amber-600/20 text-amber-100 ring-amber-600/40'
                                    }`}>
                                      -{selectedProduct.discount_percentage}%
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex justify-center mt-3">
                              <div className="flex items-center gap-1.5 text-[10px] font-medium text-white/30">
                                <Calendar className="w-3 h-3" />
                                <span>Доступ до {conversionData ? formatDate(conversionData.newExpirationDate) : '...'}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-2xl md:rounded-3xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] ring-1 ring-white/10 p-4 md:p-4 relative backdrop-blur-sm mb-4 md:mb-4 overflow-hidden">
                            <div className="relative z-10 flex items-center justify-between gap-3 md:gap-4">
                              <div className="flex flex-col">
                                <p className="text-[10px] font-bold text-white/60 md:text-white/30 uppercase tracking-widest mb-1 leading-none">Итоговый срок:</p>
                                <div className="flex items-baseline gap-2">
                                  <span className={`text-3xl md:text-3xl font-oswald font-bold leading-none ${currentConfig?.color}`}>
                                    <AnimatedNumber value={conversionData?.totalDays || 0} />
                                  </span>
                                  <div className="flex flex-col leading-none">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">дней</span>
                                      <span className={`text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-white/5 border border-white/5 ${currentConfig?.color}`}>{selectedTier}</span>
                                    </div>
                                    <span className="text-[11px] md:text-[9px] font-medium text-white/40 md:text-white/20 mt-1">
                                      до {conversionData ? formatDate(conversionData.newExpirationDate) : '...'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 md:gap-2.5 py-1.5 px-2 md:py-2 md:px-3 rounded-2xl bg-white/[0.04] border border-white/10">
                                <div className="text-center">
                                  <p className="text-[10px] md:text-[9px] font-bold text-white/40 md:text-white/20 uppercase mb-0.5">Конв.</p>
                                  <p className={`font-oswald font-bold ${currentConfig?.color} text-lg md:text-lg leading-none`}>
                                    +<AnimatedNumber value={conversionData?.convertedDays || 0} format={false} />
                                  </p>
                                </div>
                                <Plus className="w-3 h-3 text-white/10 mt-2 flex-shrink-0" />
                                <div className="text-center">
                                  <p className="text-[10px] md:text-[9px] font-bold text-white/40 md:text-white/20 uppercase mb-0.5">Новый</p>
                                  <p className="text-white font-oswald font-bold text-lg md:text-lg leading-none">
                                    +<AnimatedNumber value={conversionData?.newProductDays || 0} format={false} />
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => selectedProduct && router.push(`/payment/${selectedProduct.id}?action=upgrade`)}
                          disabled={calculating || !selectedProduct}
                          className={`w-full py-4 md:py-3.5 rounded-2xl text-white font-bold text-sm md:text-xs uppercase tracking-widest shadow-lg transition-all duration-300 relative overflow-hidden group ${
                            selectedTier === 'pro' 
                              ? 'bg-gradient-to-r from-purple-600 to-purple-500 shadow-purple-500/25' 
                              : selectedTier === 'elite' 
                                ? 'bg-gradient-to-r from-amber-600 to-amber-500 shadow-amber-500/25' 
                                : 'bg-gradient-to-r from-amber-700 to-amber-600 shadow-amber-700/25'
                          } ${calculating || !selectedProduct ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl hover:brightness-110 active:scale-[0.98]'}`}
                        >
                          <span className="relative z-10">{calculating ? 'Подсчет...' : `Перейти на ${selectedTier}`}</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
        </DialogContent>
      </Dialog>
    </>
  )
}
