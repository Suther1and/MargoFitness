'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { getUpgradeOptions, calculateUpgradeConversion } from '@/lib/actions/subscription-actions'
import { Product, SubscriptionTier } from '@/types/database'
import { Zap, CheckCircle2, ArrowRight, Sparkles, Trophy, Star } from 'lucide-react'

// Компонент для плавной анимации чисел (как в checkout)
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
    const frameInterval = isMobile ? 32 : 16

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
  currentExpires: string | null
  userId: string
}

const tierConfig = {
  basic: {
    gradient: 'from-blue-500/10 to-blue-500/5',
    color: 'text-blue-400',
    ring: 'ring-blue-500/30',
    bg: 'bg-blue-500/20',
    shadow: 'shadow-blue-500/20',
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
    gradient: 'from-amber-500/10 to-amber-600/5',
    color: 'text-amber-400',
    ring: 'ring-amber-500/30',
    bg: 'bg-amber-500/20',
    shadow: 'shadow-amber-500/20',
    icon: <Trophy className="w-5 h-5" />,
    benefits: ['Всё из PRO', 'Личное ведение с Марго', 'Индивидуальный план питания', 'Коррекция техники по видео', 'Прямая связь в Telegram']
  }
}

export function SubscriptionUpgradeModal({ open, onOpenChange, currentTier, currentExpires, userId }: UpgradeModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)
  
  const [availableTiersData, setAvailableTiersData] = useState<{
    tier: SubscriptionTier
    tierLevel: number
    products: Product[]
  }[]>([])
  
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [conversionData, setConversionData] = useState<{
    newExpirationDate: string
    bonusDays: number
    totalDays: number
    remainingDays: number
  } | null>(null)

  useEffect(() => {
    if (open) loadData()
  }, [open, userId])

  const loadData = async () => {
    setLoading(true)
    const result = await getUpgradeOptions(userId)
    if (result.success && result.data && result.data.availableTiers.length > 0) {
      setAvailableTiersData(result.data.availableTiers)
      const initialTier = result.data.availableTiers[0]
      setSelectedTier(initialTier.tier)
      const initialProd = initialTier.products.find(p => p.duration_months === 6) || initialTier.products[0]
      setSelectedProduct(initialProd)
      
      const conv = await calculateUpgradeConversion(userId, initialProd.tier_level)
      if (conv.success && conv.data) {
        setConversionData({
          newExpirationDate: new Date(new Date().getTime() + (conv.data.convertedDays + initialProd.duration_months * 30) * 86400000).toISOString(),
          bonusDays: conv.data.convertedDays,
          totalDays: conv.data.convertedDays + initialProd.duration_months * 30,
          remainingDays: conv.data.remainingDays
        })
      }
    }
    setLoading(false)
  }

  const handleTierChange = async (tier: SubscriptionTier) => {
    if (tier === selectedTier || calculating) return
    
    setCalculating(true)
    setSelectedTier(tier)
    
    const tierData = availableTiersData.find(t => t.tier === tier)
    if (!tierData) {
      setCalculating(false)
      return
    }
    
    const prod = tierData.products.find(p => p.duration_months === 6) || tierData.products[0]
    setSelectedProduct(prod)
    
    const res = await calculateUpgradeConversion(userId, prod.tier_level)
    if (res.success && res.data) {
      setConversionData({
        newExpirationDate: new Date(new Date().getTime() + (res.data.convertedDays + prod.duration_months * 30) * 86400000).toISOString(),
        bonusDays: res.data.convertedDays,
        totalDays: res.data.convertedDays + prod.duration_months * 30,
        remainingDays: res.data.remainingDays
      })
    }
    
    setCalculating(false)
  }

  const handleProductChange = async (product: Product) => {
    if (product.id === selectedProduct?.id || calculating) return
    
    setCalculating(true)
    setSelectedProduct(product)
    
    const res = await calculateUpgradeConversion(userId, product.tier_level)
    if (res.success && res.data) {
      setConversionData({
        newExpirationDate: new Date(new Date().getTime() + (res.data.convertedDays + product.duration_months * 30) * 86400000).toISOString(),
        bonusDays: res.data.convertedDays,
        totalDays: res.data.convertedDays + product.duration_months * 30,
        remainingDays: res.data.remainingDays
      })
    }
    
    setCalculating(false)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const currentConfig = selectedTier ? tierConfig[selectedTier as keyof typeof tierConfig] : null
  const products = availableTiersData.find(t => t.tier === selectedTier)?.products || []
  
  // Извлекаем benefits из metadata выбранного продукта
  const metadata = selectedProduct?.metadata as { benefits?: string[] } | null
  const productBenefits = metadata?.benefits || currentConfig?.benefits || []

  // Skeleton loader для загрузки
  if (loading && open) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] w-[95vw] bg-[#1a1a24]/95 border-white/10 text-white p-0 overflow-hidden shadow-2xl ring-1 ring-white/10 backdrop-blur-xl max-h-[90vh] flex flex-col md:flex-row rounded-3xl">
          <DialogTitle className="sr-only">Апгрейд тарифа</DialogTitle>
          <DialogDescription className="sr-only">Загрузка...</DialogDescription>
          
          {/* Левая панель skeleton */}
          <div className="md:w-[280px] bg-gradient-to-b from-purple-500/10 via-purple-900/5 to-transparent p-8 flex-shrink-0 relative overflow-hidden border-b md:border-b-0 md:border-r border-white/5">
            <div className="relative z-10 space-y-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5" />
                <div className="flex-1 space-y-2">
                  <div className="h-6 bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-4 bg-white/5 rounded" />
                ))}
              </div>
            </div>
          </div>
          
          {/* Правая панель skeleton */}
          <div className="flex-1 p-6 md:p-10 animate-pulse space-y-6">
            <div className="h-12 bg-white/5 rounded-xl" />
            <div className="h-24 bg-white/5 rounded-2xl" />
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-white/5 rounded-2xl" />
              ))}
            </div>
            <div className="h-32 bg-white/5 rounded-2xl" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] w-[95vw] bg-[#1a1a24]/95 border-white/10 text-white p-0 overflow-hidden shadow-2xl ring-1 ring-white/10 backdrop-blur-xl max-h-[90vh] flex flex-col md:flex-row rounded-3xl">
        <DialogTitle className="sr-only">Апгрейд тарифа</DialogTitle>
        <DialogDescription className="sr-only">Перейдите на новый уровень</DialogDescription>
        
        {/* Стили для плавных анимаций */}
        <style jsx>{`
          @keyframes smoothFadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          
          @keyframes textFade {
            0% {
              opacity: 0;
              transform: translateY(-2px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .smooth-transition {
            animation: textFade 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }
          
          .tabular-nums {
            font-variant-numeric: tabular-nums;
          }
          
          /* Оптимизация для мобильных */
          @media (max-width: 768px) {
            .mobile-blur-off {
              backdrop-filter: none !important;
            }
          }
        `}</style>
        
        {/* Левая панель */}
        <div 
          className={`md:w-[280px] p-8 bg-gradient-to-b ${currentConfig?.gradient || 'from-purple-500/10'} to-transparent border-b md:border-b-0 md:border-r border-white/5 flex-shrink-0 relative overflow-hidden transition-all duration-500`}
        >
          {/* Фоновые эффекты */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
          <div 
            className={`absolute -bottom-24 -left-24 w-64 h-64 rounded-full blur-3xl pointer-events-none hidden md:block transition-all duration-700 ${
              selectedTier === 'pro' ? 'bg-purple-500/15' : selectedTier === 'elite' ? 'bg-amber-500/15' : 'bg-blue-500/15'
            }`} 
          />
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-4 mb-8">
              <div className={`w-12 h-12 rounded-2xl ${currentConfig?.bg || 'bg-purple-500/20'} flex items-center justify-center ring-1 ${currentConfig?.ring || 'ring-purple-500/30'} shadow-lg transition-all duration-300`}>
                <Sparkles className={`w-6 h-6 transition-colors duration-300 ${currentConfig?.color || 'text-purple-300'}`} />
              </div>
              <div>
                <h3 className="text-2xl font-oswald uppercase leading-none text-white">Апгрейд</h3>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
                  New Level
                </p>
              </div>
            </div>
            
            {/* Преимущества - из metadata продукта */}
            <div className="space-y-4 hidden md:block">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                Преимущества:
              </p>
              <div className="space-y-3" key={selectedProduct?.id}>
                {productBenefits.slice(0, 5).map((b, i) => (
                  <div 
                    key={i}
                    className="flex items-center gap-3 text-sm text-white/70 smooth-transition"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className={`flex-shrink-0 w-4 h-4 rounded-full ${currentConfig?.bg || 'bg-purple-500/20'} flex items-center justify-center transition-colors duration-300`}>
                      <CheckCircle2 className={`w-3 h-3 ${currentConfig?.color || 'text-purple-400'} transition-colors duration-300`} />
                    </div>
                    {b === '2→3 тренировки в неделю' ? (
                      <span className="flex items-center gap-1.5">
                        <span className="opacity-40">2</span>
                        <ArrowRight className="w-3 h-3 opacity-40" />
                        <span>3</span>
                        <span className="ml-0.5">тренировки в неделю</span>
                      </span>
                    ) : (
                      b
                    )}
                  </div>
                ))}
              </div>
              
              {/* Красивый разделитель */}
              <div className="flex items-center gap-3 py-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="w-1 h-1 rounded-full bg-white/30" />
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>
              
              {/* Дополнительные гарантии */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs text-white/70 smooth-transition" style={{ animationDelay: '240ms' }}>
                  <div className="flex-shrink-0 w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Zap className="w-2.5 h-2.5 text-emerald-400" />
                  </div>
                  Моментальный доступ
                </div>
                <div className="flex items-center gap-3 text-xs text-white/70 smooth-transition" style={{ animationDelay: '280ms' }}>
                  <div className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <ArrowRight className="w-2.5 h-2.5 text-blue-400" />
                  </div>
                  Умная конвертация
                </div>
                <div className="flex items-center gap-3 text-xs text-white/70 smooth-transition" style={{ animationDelay: '320ms' }}>
                  <div className="flex-shrink-0 w-4 h-4 rounded-full bg-orange-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-2.5 h-2.5 text-orange-400" />
                  </div>
                  Безопасная оплата
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Правая панель */}
        <div className="flex-1 p-6 md:p-10 flex flex-col overflow-y-auto scrollbar-hide min-h-0">
          {/* Табы тарифов */}
          <div className="flex p-1.5 bg-gradient-to-b from-white/[0.08] to-white/[0.04] rounded-2xl border border-white/10 mb-6">
            {availableTiersData.map(t => {
              const isSelected = selectedTier === t.tier
              const config = tierConfig[t.tier as keyof typeof tierConfig]
              
              return (
                <button
                  key={t.tier}
                  onClick={() => handleTierChange(t.tier)}
                  className={`
                    flex-1 py-3 px-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200
                    ${isSelected 
                      ? `bg-gradient-to-br ${config.bg} ring-1 ${config.ring} text-white shadow-lg ${config.shadow}` 
                      : 'text-white/40 hover:text-white/60 hover:bg-white/[0.03] active:scale-[0.97]'
                    }
                  `}
                  style={{ touchAction: 'manipulation' }}
                >
                  {t.tier}
                </button>
              )
            })}
          </div>

          {/* Блок конверсии (Smart Convert) */}
          <div className="rounded-2xl md:rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/[0.04] ring-1 ring-white/10 backdrop-blur p-5 md:p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                Smart Convert
              </span>
              <Zap className={`w-4 h-4 transition-colors duration-300 ${currentConfig?.color || 'text-blue-400'}`} />
            </div>
            
            {/* Контент с плавной анимацией чисел */}
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
              <div className="flex-1 w-full">
                <p className="text-xs text-white/40 line-through font-medium mb-1.5">
                  <AnimatedNumber value={conversionData?.remainingDays || 0} /> дн.{' '}
                  <span key={`current-tier`} className="smooth-transition inline-block">
                    {currentTier}
                  </span>
                </p>
                <p className="text-xl md:text-2xl font-oswald text-white font-bold">
                  +<AnimatedNumber value={conversionData?.bonusDays || 0} /> дн.{' '}
                  <span key={`selected-tier-${selectedTier}`} className="smooth-transition inline-block">
                    {selectedTier}
                  </span>
                </p>
              </div>
              
              <div className="hidden md:flex flex-shrink-0">
                <ArrowRight className="w-5 h-5 text-white/20" />
              </div>
              
              <div className="flex-1 w-full md:text-right">
                <p className="text-[10px] font-bold text-white/40 uppercase mb-1.5 tracking-wider">
                  Итого доступ
                </p>
                <p className="text-xl md:text-2xl font-oswald text-emerald-400 font-bold">
                  <AnimatedNumber value={conversionData?.totalDays || 0} /> дн.
                </p>
              </div>
            </div>
          </div>

          {/* Пакеты (продукты) - БЕЗ блокировки при пересчете */}
          <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6" key={`products-${selectedTier}`}>
            {products.map((p, index) => {
              const isSelected = selectedProduct?.id === p.id
              
              return (
                <button
                  key={p.id}
                  onClick={() => handleProductChange(p)}
                  className={`
                    relative p-4 md:p-5 rounded-2xl md:rounded-3xl text-left border transition-all duration-200 smooth-transition
                    ${isSelected 
                      ? `bg-gradient-to-br ${currentConfig?.bg || 'bg-purple-500/15'} border-transparent ring-2 ${currentConfig?.ring || 'ring-purple-500/30'} shadow-lg ${currentConfig?.shadow || 'shadow-purple-500/10'}` 
                      : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20 active:scale-[0.98]'
                    }
                  `}
                  style={{ touchAction: 'manipulation', animationDelay: `${index * 60}ms` }}
                >
                  {p.discount_percentage > 0 && (
                    <span className={`
                      absolute top-2 right-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs ring-1 font-medium overflow-hidden
                      ${selectedTier === 'elite' 
                        ? 'bg-amber-500/20 text-amber-100 ring-amber-400/40' 
                        : 'bg-purple-500/20 text-purple-100 ring-purple-400/40'
                      }
                    `}>
                      <span className={`absolute inset-0 bg-gradient-to-r from-transparent to-transparent animate-shimmer ${
                        selectedTier === 'elite' ? 'via-amber-300/20' : 'via-purple-300/20'
                      }`}></span>
                      <span className="relative">−{p.discount_percentage}%</span>
                    </span>
                  )}
                  <p className={`
                    text-[10px] font-bold uppercase mb-1.5 tracking-wider transition-colors
                    ${isSelected ? currentConfig?.color : 'text-white/40'}
                  `}>
                    {p.duration_months} мес.
                  </p>
                  <p 
                    key={`price-${p.id}-${isSelected}`}
                    className="text-2xl md:text-3xl font-oswald font-bold text-white"
                  >
                    {p.price.toLocaleString('ru-RU')} <span className="text-base text-white/50">₽</span>
                  </p>
                </button>
              )
            })}
          </div>

          {/* Футер с итоговой информацией и кнопкой */}
          <div className="mt-auto space-y-4">
            {/* Итоговая информация */}
            <div className="rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.03] ring-1 ring-white/10 p-4 md:p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1.5">
                    Доступ до:
                  </p>
                  <p 
                    key={`date-${conversionData?.newExpirationDate}`}
                    className={`text-sm font-semibold text-white/90 smooth-transition transition-opacity duration-300 ${calculating ? 'opacity-0' : 'opacity-100'}`}
                  >
                    {conversionData ? formatDate(conversionData.newExpirationDate) : '...'}
                  </p>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1.5">
                    Общий срок:
                  </p>
                  <p className={`text-lg font-bold transition-colors duration-300 ${currentConfig?.color || 'text-purple-400'}`}>
                    <AnimatedNumber value={conversionData?.totalDays || 0} /> дн.
                  </p>
                </div>
              </div>
            </div>

            {/* Кнопка апгрейда - блокируем ТОЛЬКО во время calculating */}
            <button
              onClick={() => selectedProduct && router.push(`/payment/${selectedProduct.id}?action=upgrade`)}
              disabled={calculating || !selectedProduct}
              className={`
                w-full py-4 md:py-5 rounded-xl md:rounded-2xl text-white font-bold text-sm md:text-xs uppercase tracking-wider 
                shadow-lg transition-all duration-300
                ${selectedTier === 'pro' 
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30' 
                  : selectedTier === 'elite'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30'
                }
                ${calculating || !selectedProduct 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:brightness-110 active:scale-[0.98]'
                }
              `}
              style={{ touchAction: 'manipulation' }}
            >
              {calculating ? 'Подсчет...' : `Апгрейд до ${selectedTier}`}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
