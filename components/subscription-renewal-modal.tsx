'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { getRenewalOptions } from '@/lib/actions/subscription-actions'
import { Product, SubscriptionTier } from '@/types/database'
import { Calendar, CheckCircle2, Zap, Clock, Plus } from 'lucide-react'

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

  useEffect(() => {
    if (open) {
      loadProducts()
    }
  }, [open, userId])

  const loadProducts = async () => {
    setLoading(true)
    const result = await getRenewalOptions(userId)
    if (result.success && result.products) {
      setProducts(result.products)
      const twelveMonths = result.products.find(p => p.duration_months === 12)
      setSelectedProduct(twelveMonths || result.products[result.products.length - 1])
    }
    setLoading(false)
  }

  const remainingDays = currentExpires
    ? Math.max(0, Math.ceil((new Date(currentExpires).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0

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
        <DialogContent className="sm:max-w-[800px] w-[95vw] md:h-[640px] h-auto max-h-[95vh] bg-[#1a1a24] md:bg-[#1a1a24]/95 border-0 md:border-white/10 text-white p-0 overflow-hidden md:shadow-2xl md:ring-1 md:ring-white/10 md:backdrop-blur-xl flex flex-col md:flex-row rounded-3xl">
          <DialogTitle className="sr-only">Продление подписки</DialogTitle>
          <DialogDescription className="sr-only">Выберите период продления</DialogDescription>
          
          {loading ? (
              <div className="flex flex-col md:flex-row w-full h-full min-h-[450px] md:min-h-[500px] bg-[#1a1a24] rounded-3xl overflow-hidden"
              >
                {/* Левая панель skeleton */}
                <div className="md:w-[280px] bg-gradient-to-b from-orange-500/10 via-orange-900/5 to-transparent pt-5 md:pt-6 px-6 md:px-8 pb-3 md:pb-6 flex-shrink-0 relative border-b md:border-b-0 md:border-r border-white/5">
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
              <div className="flex flex-col md:flex-row w-full h-full bg-[#1a1a24] rounded-3xl overflow-hidden"
              >
                {/* Левая панель */}
                <div className="md:w-[280px] bg-gradient-to-b from-orange-500/10 via-orange-900/5 to-transparent pt-5 md:pt-6 px-6 md:px-8 pb-3 md:pb-6 flex-shrink-0 relative border-b md:border-b-0 md:border-r border-white/5 h-auto">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-500/15 rounded-full blur-3xl pointer-events-none hidden md:block" />
                  
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Close button */}
                    <button
                      onClick={() => onOpenChange(false)}
                      className="absolute top-0 right-0 md:top-2 md:right-2 z-20 w-8 h-8 flex items-center justify-center transition-all hover:opacity-70 active:scale-95"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white/60 hover:text-white/80">
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                      </svg>
                      <span className="sr-only">Закрыть</span>
                    </button>
                    
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center ring-1 ring-orange-500/30 shadow-lg">
                        <Calendar className="w-5 h-5 md:w-6 md:h-6 text-orange-300" />
                      </div>
                      <div>
                        <h3 className="text-xl md:text-2xl font-oswald uppercase leading-none text-white">Продление</h3>
                        <p className="text-[10px] md:text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
                          Подписка активна
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
                        Тариф: <span className="text-orange-400/80 uppercase">{currentTier}</span>
                      </p>
                    </div>
                    
                    <div className="space-y-4 flex-1 hidden md:block">
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Преимущества:</p>
                      <div className="relative min-h-[160px]">
                        <div className="space-y-3" key={selectedProduct?.id}>
                          {productBenefits.slice(0, 3).map((text, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm text-white/70">
                              <div className="flex-shrink-0 w-4 h-4 rounded-full bg-orange-500/20 flex items-center justify-center">
                                <CheckCircle2 className="w-3 h-3 text-orange-400" />
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
                      
                      <div className="mt-auto space-y-2 pt-4">
                        {[
                          { icon: CheckCircle2, text: 'Мгновенный доступ', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                          { icon: Calendar, text: 'Дни суммируются', color: 'text-blue-400', bg: 'bg-blue-500/10' },
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
                <div className="flex-1 p-6 md:p-10 flex flex-col min-h-0">
                  <div className="flex items-center justify-between mb-5 md:mb-6">
                    <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                      Выберите срок продления:
                    </h4>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 md:hidden">
                      <span className="text-[10px] font-bold text-white/40 uppercase">У вас:</span>
                      <span className="text-sm font-bold text-orange-400">{remainingDays} дн.</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 md:gap-4 mb-5 md:mb-8">
                    {products.map((p, index) => {
                      const isSelected = selectedProduct?.id === p.id
                      return (
                        <button
                          key={p.id}
                          onClick={() => setSelectedProduct(p)}
                          className={`relative p-4 md:p-5 rounded-2xl md:rounded-3xl text-left border transition-all duration-200 smooth-transition ${isSelected ? 'bg-gradient-to-br from-orange-500/15 to-orange-600/10 border-orange-500/50 ring-2 ring-orange-500/30 shadow-lg shadow-orange-500/10' : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20 active:scale-[0.98]'}`}
                          style={{ touchAction: 'manipulation', animationDelay: `${index * 60}ms` }}
                        >
                          {p.discount_percentage > 0 && (
                            <span className="absolute top-2 right-2 inline-flex items-center rounded-full bg-orange-500/20 px-2 py-0.5 text-xs text-orange-100 ring-1 ring-orange-400/40 font-medium overflow-hidden">
                              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-300/20 to-transparent animate-shimmer"></span>
                              <span className="relative">−{p.discount_percentage}%</span>
                            </span>
                          )}
                          <p className={`text-[10px] font-bold uppercase mb-1 tracking-wider transition-colors ${isSelected ? 'text-orange-300' : 'text-white/40'}`}>
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
                          <p className="text-3xl md:text-3xl font-oswald font-bold text-emerald-400">
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
                      className="w-full py-4 md:py-5 rounded-xl md:rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm md:text-sm uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/30 hover:brightness-110 active:scale-[0.98]"
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
