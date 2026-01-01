'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { getUpgradeOptions, calculateUpgradeConversion } from '@/lib/actions/subscription-actions'
import { Product, SubscriptionTier } from '@/types/database'
import { Zap, CheckCircle2, ArrowRight, Sparkles, Trophy, Star, ArrowBigRightDash, Plus, Clock, Calendar } from 'lucide-react'

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
    convertedDays: number
    newProductDays: number
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
      const tiers = result.data.availableTiers
      setAvailableTiersData(tiers)
      
      const initialTier = tiers[0]
      const initialProd = initialTier.products.find(p => p.duration_months === 6) || initialTier.products[0]
      
      const conv = await calculateUpgradeConversion(userId, initialProd.tier_level)
      
      setSelectedTier(initialTier.tier)
      setSelectedProduct(initialProd)
      
      if (conv.success && conv.data) {
        const newProductDays = initialProd.duration_months * 30
        setConversionData({
          newExpirationDate: new Date(new Date().getTime() + (conv.data.convertedDays + newProductDays) * 86400000).toISOString(),
          convertedDays: conv.data.convertedDays,
          newProductDays: newProductDays,
          totalDays: conv.data.convertedDays + newProductDays,
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
      const newProductDays = prod.duration_months * 30
      setConversionData({
        newExpirationDate: new Date(new Date().getTime() + (res.data.convertedDays + newProductDays) * 86400000).toISOString(),
        convertedDays: res.data.convertedDays,
        newProductDays: newProductDays,
        totalDays: res.data.convertedDays + newProductDays,
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
      const newProductDays = product.duration_months * 30
      setConversionData({
        newExpirationDate: new Date(new Date().getTime() + (res.data.convertedDays + newProductDays) * 86400000).toISOString(),
        convertedDays: res.data.convertedDays,
        newProductDays: newProductDays,
        totalDays: res.data.convertedDays + newProductDays,
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
  
  const metadata = selectedProduct?.metadata as { benefits?: string[] } | null
  const productBenefits = metadata?.benefits || currentConfig?.benefits || []

  return (
    <>
      <style jsx global>{`
        @keyframes modalFadeIn {
          from { 
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.96);
          }
          to { 
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        
        @keyframes modalFadeOut {
          from { 
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          to { 
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.98);
          }
        }

        [data-slot="dialog-content"][data-state="open"] {
          animation: modalFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        [data-slot="dialog-content"][data-state="closed"] {
          animation: modalFadeOut 0.15s cubic-bezier(0.4, 0, 1, 1) forwards;
        }

        @media (max-width: 1023px) {
          [data-slot="dialog-content"] {
            background-color: #1a1a24 !important;
            border: none !important;
          }
        }
        
        .tabular-nums { 
          font-variant-numeric: tabular-nums; 
        }
      `}</style>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[760px] w-[95vw] md:h-[620px] h-auto max-h-[95vh] bg-[#1a1a24] md:bg-[#1a1a24]/95 border-0 md:border-white/10 text-white p-0 overflow-hidden md:shadow-2xl md:ring-1 md:ring-white/10 md:backdrop-blur-xl flex flex-col md:flex-row rounded-3xl">
          <DialogTitle className="sr-only">Апгрейд тарифа</DialogTitle>
          <DialogDescription className="sr-only">Перейдите на новый уровень</DialogDescription>
          
          {loading ? (
              <div className="flex flex-col md:flex-row w-full h-full min-h-[450px] md:min-h-[500px] bg-[#1a1a24] rounded-3xl overflow-hidden"
              >
                {/* Левая панель skeleton */}
                <div className="md:w-[280px] bg-gradient-to-b from-purple-500/10 via-purple-900/5 to-transparent pt-5 md:pt-6 px-6 md:px-8 pb-3 md:pb-6 flex-shrink-0 relative border-b md:border-b-0 md:border-r border-white/5">
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
              <div className="flex flex-col md:flex-row w-full h-full bg-[#1a1a24] rounded-3xl overflow-hidden"
              >
                {/* Левая панель */}
                <div className={`md:w-[280px] pt-5 md:pt-6 px-6 md:px-8 pb-3 md:pb-6 bg-gradient-to-b ${currentConfig?.gradient || 'from-purple-500/10'} to-transparent border-b md:border-b-0 md:border-r border-white/5 flex-shrink-0 relative transition-all duration-500`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
                  <div className={`absolute -bottom-24 -left-24 w-64 h-64 rounded-full blur-3xl pointer-events-none hidden md:block transition-all duration-700 ${
                    selectedTier === 'pro' ? 'bg-purple-500/15' : selectedTier === 'elite' ? 'bg-amber-500/15' : 'bg-blue-500/15'
                  }`} />
                  
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl ${currentConfig?.bg || 'bg-purple-500/20'} flex items-center justify-center ring-1 ${currentConfig?.ring || 'ring-purple-500/30'} shadow-lg transition-all duration-300`}>
                        <Sparkles className={`w-6 h-6 md:w-6 md:h-6 transition-colors duration-300 ${currentConfig?.color || 'text-purple-300'}`} />
                      </div>
                      <div>
                        <h3 className="text-xl md:text-2xl font-oswald uppercase leading-none text-white">Апгрейд</h3>
                        <p className="text-[10px] md:text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">New Level</p>
                      </div>
                    </div>
                    
                    {/* Преимущества - скрыты на мобильных */}
                    <div className="space-y-4 flex-1 hidden md:block pt-8">
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Преимущества тарифа:</p>
                      <div className="relative min-h-[220px]">
                        <div 
                          key={selectedTier}
                          className="space-y-3"
                        >
                          {productBenefits.slice(0, 5).map((b, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm text-white/70">
                              <div className={`flex-shrink-0 w-4 h-4 rounded-full ${currentConfig?.bg || 'bg-purple-500/20'} flex items-center justify-center`}>
                                <CheckCircle2 className={`w-3 h-3 ${currentConfig?.color || 'text-purple-400'}`} />
                              </div>
                              <span className="leading-tight">{b}</span>
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
                          { icon: ArrowRight, text: 'Умная конвертация', color: 'text-blue-400', bg: 'bg-blue-500/10' },
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

                  <div className="mb-5 md:mb-5">
                    <div className="flex items-center justify-between mb-2 px-2">
                      <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <Zap className="w-3 h-3 text-emerald-400" />
                        <span className="text-[10px] md:text-[9px] font-bold text-emerald-400 uppercase tracking-tight">Smart Convert</span>
                      </div>
                      <p className="text-[10px] md:text-[9px] font-bold text-white/20 uppercase tracking-widest">Автоматический пересчет</p>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 md:p-3.5 rounded-2xl md:rounded-3xl bg-white/[0.02] border border-white/5 relative w-full">
                      <div className="flex-1 flex flex-col items-center">
                        <p className="text-[10px] md:text-[9px] font-bold text-white/30 uppercase mb-1">Остаток {currentTier}:</p>
                        <p className="text-xl md:text-xl font-oswald font-bold text-white/40 line-through leading-none">
                          <AnimatedNumber value={conversionData?.remainingDays || 0} /> дн.
                        </p>
                      </div>
                      <div className="w-px h-8 md:h-8 bg-white/5" />
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 md:w-8 md:h-8 rounded-full bg-[#1a1a24] border border-white/5 flex items-center justify-center z-10">
                        <ArrowBigRightDash className="w-4 h-4 md:w-4 md:h-4 text-white/20" />
                      </div>
                      <div className="flex-1 flex flex-col items-center">
                        <p className="text-[10px] md:text-[9px] font-bold text-white/30 uppercase mb-1">В эквиваленте {selectedTier}:</p>
                        <p className={`text-xl md:text-xl font-oswald font-bold ${currentConfig?.color} leading-none`}>
                          <AnimatedNumber value={conversionData?.convertedDays || 0} /> дн.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-5 md:mb-5">
                    <div className="rounded-2xl md:rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.01] ring-1 ring-white/10 p-3 md:p-3 backdrop-blur-sm">
                      <div className="grid grid-cols-2 gap-3 md:gap-3" key={`products-${selectedTier}`}>
                        {products.map((p) => {
                          const isSelected = selectedProduct?.id === p.id
                          return (
                            <button
                              key={p.id}
                              onClick={() => handleProductChange(p)}
                              className={`relative p-4 md:p-4 rounded-xl md:rounded-[22px] text-left border transition-all duration-200 ${isSelected ? `bg-gradient-to-br ${currentConfig?.bg || 'bg-purple-500/15'} border-white/20 ring-2 ${currentConfig?.ring || 'ring-purple-500/30'} shadow-lg ${currentConfig?.shadow || 'shadow-purple-500/10'}` : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10 active:scale-[0.98]'}`}
                              style={{ touchAction: 'manipulation' }}
                            >
                              {p.discount_percentage > 0 && (
                                <span className={`absolute top-2 right-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] ring-1 font-bold overflow-hidden ${selectedTier === 'elite' ? 'bg-amber-500/20 text-amber-100 ring-amber-400/40' : 'bg-purple-500/20 text-purple-100 ring-purple-400/40'}`}>
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
                    <div className="rounded-2xl md:rounded-3xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] ring-1 ring-white/10 p-4 md:p-4 relative backdrop-blur-sm mb-4 md:mb-4 overflow-hidden">
                      <div className="absolute -top-1 -right-1 p-2 opacity-[0.02] pointer-events-none">
                        <Clock className="w-12 h-12 md:w-12 md:h-12 text-white" />
                      </div>
                      <div className="relative z-10 flex items-center justify-between gap-4">
                        <div className="flex flex-col">
                          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1 leading-none">Итоговый срок:</p>
                          <div className="flex items-baseline gap-2">
                            <span className={`text-3xl md:text-3xl font-oswald font-bold leading-none ${currentConfig?.color}`}>
                              <AnimatedNumber value={conversionData?.totalDays || 0} />
                            </span>
                            <div className="flex flex-col leading-none">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">дней</span>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-white/5 border border-white/5 ${currentConfig?.color}`}>{selectedTier}</span>
                              </div>
                              <span className="text-[9px] font-medium text-white/20 mt-1">
                                до {conversionData ? formatDate(conversionData.newExpirationDate) : '...'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5 py-2 px-3 rounded-2xl bg-white/[0.04] border border-white/10">
                          <div className="text-center">
                            <p className="text-[9px] font-bold text-white/20 uppercase mb-0.5">Конв.</p>
                            <p className={`font-oswald font-bold ${currentConfig?.color} text-sm md:text-lg leading-none`}>
                              +<AnimatedNumber value={conversionData?.convertedDays || 0} format={false} />
                            </p>
                          </div>
                          <Plus className="w-3 h-3 text-white/10 mt-2 flex-shrink-0" />
                          <div className="text-center">
                            <p className="text-[9px] font-bold text-white/20 uppercase mb-0.5">Новый</p>
                            <p className="text-white font-oswald font-bold text-sm md:text-lg leading-none">
                              +<AnimatedNumber value={conversionData?.newProductDays || 0} format={false} />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => selectedProduct && router.push(`/payment/${selectedProduct.id}?action=upgrade`)}
                      disabled={calculating || !selectedProduct}
                      className={`w-full py-4 md:py-3.5 rounded-2xl text-white font-bold text-sm md:text-xs uppercase tracking-widest shadow-lg transition-all duration-300 relative overflow-hidden group ${selectedTier === 'pro' ? 'bg-gradient-to-r from-purple-600 to-purple-500 shadow-purple-500/25' : selectedTier === 'elite' ? 'bg-gradient-to-r from-amber-600 to-amber-500 shadow-amber-500/25' : 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-blue-500/25'} ${calculating || !selectedProduct ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl hover:brightness-110 active:scale-[0.98]'}`}
                    >
                      <span className="relative z-10">{calculating ? 'Подсчет...' : `Перейти на ${selectedTier}`}</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    </button>
                  </div>
                </div>
              </div>
            )}
        </DialogContent>
      </Dialog>
    </>
  )
}
