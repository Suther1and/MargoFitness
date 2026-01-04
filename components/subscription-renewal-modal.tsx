'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { getRenewalOptions } from '@/lib/actions/subscription-actions'
import { Product, SubscriptionTier } from '@/types/database'
import { Calendar, CheckCircle2, Zap, Clock, Star } from 'lucide-react'

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

interface RenewalModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentTier: SubscriptionTier
  currentExpires: string | null
  userId: string
}

const tierConfig = {
  basic: {
    gradient: 'from-orange-500/10 to-orange-900/5',
    color: 'text-orange-400',
    ring: 'ring-orange-500/30',
    bg: 'bg-orange-500/20',
    button: 'from-orange-500 to-orange-600 shadow-orange-500/25',
    icon: <Calendar className="w-5 h-5 md:w-6 md:h-6 text-orange-300" />
  },
  pro: {
    gradient: 'from-purple-500/10 to-purple-900/5',
    color: 'text-purple-400',
    ring: 'ring-purple-500/30',
    bg: 'bg-purple-500/20',
    button: 'from-purple-600 to-purple-500 shadow-purple-500/25',
    icon: <Zap className="w-5 h-5 md:w-6 md:h-6 text-purple-300" />
  },
  elite: {
    gradient: 'from-yellow-400/10 to-yellow-900/5',
    color: 'text-yellow-400',
    ring: 'ring-yellow-400/30',
    bg: 'bg-yellow-400/20',
    button: 'from-yellow-500 to-yellow-600 shadow-yellow-500/25',
    icon: <Star className="w-5 h-5 md:w-6 md:h-6 text-yellow-300" />
  },
  free: {
    gradient: 'from-gray-500/10 to-gray-900/5',
    color: 'text-gray-400',
    ring: 'ring-gray-500/30',
    bg: 'bg-gray-500/20',
    button: 'from-gray-500 to-gray-600 shadow-gray-500/25',
    icon: <Clock className="w-5 h-5 md:w-6 md:h-6 text-gray-300" />
  }
}

export function SubscriptionRenewalModal({
  open,
  onOpenChange,
  currentTier,
  currentExpires,
  userId
}: RenewalModalProps) {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const loadProducts = useCallback(async () => {
    setLoading(true)
    const result = await getRenewalOptions(userId)
    if (result.success && result.products) {
      setProducts(result.products)
      const twelveMonths = result.products.find(p => p.duration_months === 12)
      setSelectedProduct(twelveMonths || result.products[result.products.length - 1])
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    if (open) {
      loadProducts()
    }
  }, [open, userId, loadProducts])

  const [remainingDays, setRemainingDays] = useState(0)

  useEffect(() => {
    if (currentExpires) {
      setRemainingDays(Math.max(0, Math.ceil((new Date(currentExpires).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))))
    }
  }, [currentExpires])

  const getNewExpiryDate = (product: Product | null) => {
    if (!product) return null
    const baseDate = currentExpires && new Date(currentExpires) > new Date()
      ? new Date(currentExpires)
      : new Date()
    const newDate = new Date(baseDate)
    newDate.setDate(newDate.getDate() + (product.duration_months * 30))
    return newDate
  }

  const newExpiryDate = getNewExpiryDate(selectedProduct)
  const newTotalDays = selectedProduct ? remainingDays + (selectedProduct.duration_months * 30) : 0

  const currentConfig = tierConfig[currentTier as keyof typeof tierConfig] || tierConfig.free

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const handleRenewal = () => {
    if (!selectedProduct) return
    router.push(`/payment/${selectedProduct.id}?action=renewal`)
  }
  
  const metadata = selectedProduct?.metadata as { benefits?: string[] } | null
  const productBenefits = metadata?.benefits || ['Мгновенный доступ', 'Безопасная оплата', 'Дни суммируются']

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
          className="sm:max-w-[800px] w-[95vw] md:h-[640px] h-auto max-h-[95vh] bg-transparent border-0 p-0 overflow-visible shadow-none ring-0"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">Продление подписки</DialogTitle>
          <DialogDescription className="sr-only">Выбери период продления</DialogDescription>
          
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
                <div className={`md:w-[280px] bg-gradient-to-b ${currentConfig.gradient} pt-5 md:pt-6 px-6 md:px-8 pb-3 md:pb-6 flex-shrink-0 relative border-b md:border-b-0 md:border-r border-white/5`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
                  <div className="relative z-10 space-y-6 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 md:h-5 bg-white/5 rounded w-2/3" />
                        <div className="h-3 bg-white/5 rounded w-1/3" />
                      </div>
                    </div>
                    <div className="h-24 md:h-24 bg-white/5 rounded-xl hidden md:block mt-8" />
                    <div className="space-y-3 pt-2 hidden md:block">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full bg-white/5 flex-shrink-0" />
                          <div className="h-3 bg-white/5 rounded w-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              
                {/* Правая панель skeleton */}
                <div className="flex-1 p-6 md:p-10 animate-pulse flex flex-col h-full">
                  <div className="h-6 bg-white/5 rounded w-1/3 mb-6" />
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-24 md:h-32 bg-white/5 rounded-3xl" />
                    ))}
                  </div>
                  <div className="mt-auto h-32 bg-white/5 rounded-3xl" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row w-full h-full bg-[#1a1a24] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10 backdrop-blur-xl"
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
                <div className={`md:w-[280px] bg-gradient-to-b ${currentConfig.gradient} pt-5 md:pt-6 px-6 md:px-8 pb-3 md:pb-6 flex-shrink-0 relative border-b md:border-b-0 md:border-r border-white/5 h-auto`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
                  <div className={`absolute -bottom-24 -left-24 w-64 h-64 ${currentConfig.bg.replace('bg-', 'bg-').replace('20', '15')} rounded-full blur-3xl pointer-events-none hidden md:block`} />
                  
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br ${currentConfig.bg} flex items-center justify-center ring-1 ${currentConfig.ring} shadow-lg`}>
                        {currentConfig.icon}
                      </div>
                      <div>
                        <h3 className="text-xl md:text-2xl font-oswald uppercase leading-none text-white">Продление</h3>
                        <p className={`text-[10px] md:text-[10px] font-bold ${currentConfig.color} uppercase tracking-widest mt-1`}>
                          <span className="md:hidden">{currentTier} активна</span>
                          <span className="hidden md:inline">Подписка активна</span>
                        </p>
                      </div>
                    </div>

                    <div className="mb-4 md:mb-8 p-4 md:p-4 rounded-2xl bg-white/5 border border-white/10 hidden md:block mt-8">
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Осталось:</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl md:text-3xl font-oswald font-bold text-white">
                          <AnimatedNumber value={remainingDays} />
                        </span>
                        <span className="text-sm font-medium text-white/50">дн.</span>
                      </div>
                      <p className="text-[10px] font-medium text-white/40 mt-1">
                        Тариф: <span className={`uppercase ${currentConfig.color}`}>{currentTier}</span>
                      </p>
                    </div>
                    
                    <div className="space-y-4 flex-1 hidden md:block">
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Преимущества:</p>
                      <div className="relative min-h-[160px]">
                        <div className="space-y-3" key={selectedProduct?.id}>
                          {productBenefits.slice(0, 3).map((text, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm text-white/70">
                              <div className={`flex-shrink-0 w-4 h-4 rounded-full ${currentConfig.bg} flex items-center justify-center`}>
                                <CheckCircle2 className={`w-3 h-3 ${currentConfig.color}`} />
                              </div>
                              {text}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 py-4">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        <div className="w-1 h-1 rounded-full bg-white/30" />
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Правая панель */}
                <div className="flex-1 p-6 md:p-10 flex flex-col min-h-0">
                  <div className="flex items-center justify-between mb-5 md:mb-6">
                    <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                      Выбери срок продления:
                    </h4>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 md:hidden">
                      <span className="text-[10px] font-bold text-white/40 uppercase">У тебя:</span>
                      <span className={`text-sm font-bold ${currentConfig.color}`}>{remainingDays} дн.</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 md:gap-4 mb-5 md:mb-8">
                    {products.map((p, index) => {
                      const isSelected = selectedProduct?.id === p.id
                      return (
                        <button
                          key={p.id}
                          onClick={() => setSelectedProduct(p)}
                          className={`relative p-4 md:p-5 rounded-2xl md:rounded-3xl text-left border transition-all duration-200 smooth-transition ${isSelected ? `bg-gradient-to-br ${currentConfig.bg.replace('20', '15')} ${currentConfig.ring.replace('30', '50')} ring-2 ${currentConfig.ring} shadow-lg ${currentConfig.bg.replace('bg-', 'shadow-').replace('20', '10')}` : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20 active:scale-[0.98]'}`}
                          style={{ touchAction: 'manipulation', animationDelay: `${index * 60}ms` }}
                        >
                          {p.discount_percentage > 0 && (
                            <span className={`absolute top-2 right-2 inline-flex items-center rounded-full ${currentConfig.bg} px-2 py-0.5 text-xs text-white ring-1 ${currentConfig.ring} font-medium overflow-hidden`}>
                              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></span>
                              <span className="relative">−{p.discount_percentage}%</span>
                            </span>
                          )}
                          <p className={`text-[10px] font-bold uppercase mb-1 tracking-wider transition-colors ${isSelected ? currentConfig.color : 'text-white/40'}`}>
                            {p.duration_months} мес.
                          </p>
                          <p key={`price-${p.id}-${isSelected}`} className="text-2xl md:text-3xl font-oswald font-bold text-white">
                            {p.price.toLocaleString('ru-RU')} <span className="text-base text-white/50">₽</span>
                          </p>
                        </button>
                      )
                    })}
                  </div>

                  <div className="mt-auto space-y-4">
                    <div className="rounded-2xl md:rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/[0.04] ring-1 ring-white/10 backdrop-blur p-5 md:p-6">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1 md:mb-2">Итоговый срок:</p>
                          <p className={`text-3xl md:text-3xl font-oswald font-bold ${currentConfig.color}`}>
                            <AnimatedNumber value={newTotalDays} /> дн.
                          </p>
                        </div>
                        <div className="text-right flex-1">
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1 md:mb-2">Активность до:</p>
                          <p key={`renewal-date-${newExpiryDate?.getTime()}`} className="text-sm md:text-base font-semibold text-white/90 smooth-transition">
                            {newExpiryDate ? formatDate(newExpiryDate) : '...'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleRenewal}
                      className={`w-full py-4 md:py-5 rounded-xl md:rounded-2xl bg-gradient-to-r ${currentConfig.button} text-white font-bold text-sm md:text-sm uppercase tracking-wider shadow-lg transition-all duration-300 hover:shadow-xl hover:brightness-110 active:scale-[0.98]`}
                      style={{ touchAction: 'manipulation' }}
                    >
                      Продлить подписку
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
