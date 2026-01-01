'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { getRenewalOptions } from '@/lib/actions/subscription-actions'
import { Product, SubscriptionTier } from '@/types/database'
import { Calendar, CheckCircle2 } from 'lucide-react'

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
  
  // Извлекаем benefits из metadata выбранного продукта
  const metadata = selectedProduct?.metadata as { benefits?: string[] } | null
  const productBenefits = metadata?.benefits || ['Мгновенный доступ', 'Безопасная оплата', 'Дни суммируются']

  // Skeleton loader для загрузки
  if (loading && open) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] w-[95vw] bg-[#1a1a24]/95 border-white/10 text-white p-0 overflow-hidden shadow-2xl ring-1 ring-white/10 backdrop-blur-xl max-h-[90vh] flex flex-col md:flex-row rounded-3xl">
          <DialogTitle className="sr-only">Продление подписки</DialogTitle>
          <DialogDescription className="sr-only">Загрузка...</DialogDescription>
          
          {/* Левая панель skeleton */}
          <div className="md:w-[280px] bg-gradient-to-b from-orange-500/10 via-orange-900/5 to-transparent p-8 flex-shrink-0 relative overflow-hidden border-b md:border-b-0 md:border-r border-white/5">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10 space-y-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5" />
                <div className="flex-1 space-y-2">
                  <div className="h-6 bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Правая панель skeleton */}
          <div className="flex-1 p-6 md:p-10 animate-pulse space-y-6">
            <div className="h-4 bg-white/5 rounded w-1/3" />
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-white/5 rounded-2xl" />
              ))}
            </div>
            <div className="h-32 bg-white/5 rounded-2xl mt-auto" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] w-[95vw] bg-[#1a1a24]/95 border-white/10 text-white p-0 overflow-hidden shadow-2xl ring-1 ring-white/10 backdrop-blur-xl max-h-[90vh] flex flex-col md:flex-row rounded-3xl">
        <DialogTitle className="sr-only">Продление подписки</DialogTitle>
        <DialogDescription className="sr-only">Выберите период продления</DialogDescription>
        
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
        <div className="md:w-[280px] bg-gradient-to-b from-orange-500/10 via-orange-900/5 to-transparent p-8 flex-shrink-0 relative overflow-hidden border-b md:border-b-0 md:border-r border-white/5">
          {/* Фоновые эффекты */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-500/15 rounded-full blur-3xl pointer-events-none hidden md:block" />
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center ring-1 ring-orange-500/30 shadow-lg">
                <Calendar className="w-6 h-6 text-orange-300" />
              </div>
              <div>
                <h3 className="text-2xl font-oswald uppercase leading-none text-white">Продление</h3>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
                  {currentTier} • {remainingDays} дн.
                </p>
              </div>
            </div>
            
            {/* Преимущества - из metadata продукта */}
            <div className="space-y-4 hidden md:block">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Преимущества:</p>
              <div className="space-y-3" key={selectedProduct?.id}>
                {productBenefits.slice(0, 4).map((text, i) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-3 text-sm text-white/70 smooth-transition"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="flex-shrink-0 w-4 h-4 rounded-full bg-orange-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-orange-400" />
                    </div>
                    {text}
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
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                  </div>
                  Моментальный доступ
                </div>
                <div className="flex items-center gap-3 text-xs text-white/70 smooth-transition" style={{ animationDelay: '280ms' }}>
                  <div className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Calendar className="w-2.5 h-2.5 text-blue-400" />
                  </div>
                  Дни суммируются
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
          <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-6">
            Выберите срок продления:
          </h4>
          
          {/* Карточки продуктов */}
          <div className="grid grid-cols-2 gap-3 md:gap-4 mb-8">
            {products.map((p, index) => {
              const isSelected = selectedProduct?.id === p.id
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedProduct(p)}
                  className={`
                    relative p-4 md:p-5 rounded-2xl md:rounded-3xl text-left border transition-all duration-200 smooth-transition
                    ${isSelected 
                      ? 'bg-gradient-to-br from-orange-500/15 to-orange-600/10 border-orange-500/50 ring-2 ring-orange-500/30 shadow-lg shadow-orange-500/10' 
                      : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20 active:scale-[0.98]'
                    }
                  `}
                  style={{ touchAction: 'manipulation', animationDelay: `${index * 60}ms` }}
                >
                  {p.discount_percentage > 0 && (
                    <span className="absolute top-2 right-2 inline-flex items-center rounded-full bg-orange-500/20 px-2 py-0.5 text-xs text-orange-100 ring-1 ring-orange-400/40 font-medium overflow-hidden">
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-300/20 to-transparent animate-shimmer"></span>
                      <span className="relative">−{p.discount_percentage}%</span>
                    </span>
                  )}
                  <p className={`text-[10px] font-bold uppercase mb-1 tracking-wider transition-colors ${
                    isSelected ? 'text-orange-300' : 'text-white/40'
                  }`}>
                    {p.duration_months} {p.duration_months === 1 ? 'мес.' : 'мес.'}
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

          {/* Итоговая информация */}
          <div className="mt-auto space-y-4">
            <div className="rounded-2xl md:rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/[0.04] ring-1 ring-white/10 backdrop-blur p-5 md:p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">
                    Итоговый срок:
                  </p>
                  <p className="text-2xl md:text-3xl font-oswald font-bold text-emerald-400">
                    <AnimatedNumber value={newTotalDays} /> дн.
                  </p>
                </div>
                <div className="text-right flex-1">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">
                    Активность до:
                  </p>
                  <p 
                    key={`renewal-date-${newExpiryDate?.getTime()}`}
                    className="text-sm md:text-base font-semibold text-white/90 smooth-transition"
                  >
                    {newExpiryDate ? formatDate(newExpiryDate) : '...'}
                  </p>
                </div>
              </div>
            </div>

            {/* Кнопка оплаты */}
            <button
              onClick={handleRenewal}
              className="w-full py-4 md:py-5 rounded-xl md:rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm md:text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/30 hover:brightness-110 active:scale-[0.98]"
              style={{ touchAction: 'manipulation' }}
            >
              Продлить подписку
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
