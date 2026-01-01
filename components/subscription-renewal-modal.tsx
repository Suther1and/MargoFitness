'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getRenewalOptions } from '@/lib/actions/subscription-actions'
import { Product, SubscriptionTier } from '@/types/database'
import { Loader2 } from 'lucide-react'

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

  // Загрузить продукты при открытии
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
      // По умолчанию выбираем 12 месяцев (самый выгодный)
      const twelveMonths = result.products.find(p => p.duration_months === 12)
      setSelectedProduct(twelveMonths || result.products[result.products.length - 1])
    }
    setLoading(false)
  }

  // Рассчитать оставшиеся дни
  const remainingDays = currentExpires
    ? Math.max(0, Math.ceil((new Date(currentExpires).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  // Рассчитать процент прогресса (условно, для визуализации)
  const progressPercent = remainingDays > 0 ? Math.min(100, (remainingDays / 90) * 100) : 0

  // Рассчитать новую дату окончания
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

  // Цвета тарифов
  const tierColors = {
    basic: 'orange',
    pro: 'purple',
    elite: 'amber',
    free: 'gray'
  }
  const tierColor = tierColors[currentTier] || 'gray'

  // Форматирование даты
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  // Обработка продления
  const handleRenewal = () => {
    if (!selectedProduct) return
    // Редирект на страницу оплаты с action=renewal
    router.push(`/payment/${selectedProduct.id}?action=renewal`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-[#0a0a0f] border-white/10 text-white p-0 overflow-hidden">
        {/* Заголовок */}
        <DialogHeader className="p-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-300">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                <path d="M16 16h5v5"></path>
              </svg>
            </div>
            <div>
              <DialogTitle className="text-2xl font-oswald uppercase tracking-tight">
                Продление подписки {currentTier.toUpperCase()}
              </DialogTitle>
              <p className="text-sm text-white/60 mt-1">Выберите срок продления</p>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Текущая подписка - компактная версия */}
            <div className="flex items-center gap-3 text-sm text-white/60">
              <span className={`inline-flex items-center gap-1.5 rounded-full bg-${tierColor}-500/15 px-2.5 py-1 text-xs ring-1 ring-${tierColor}-400/30`}>
                <span className="font-semibold text-white">{currentTier.toUpperCase()}</span>
              </span>
              <span>•</span>
              <span>{remainingDays} дней осталось</span>
              {currentExpires && (
                <>
                  <span>•</span>
                  <span>до {formatDate(new Date(currentExpires))}</span>
                </>
              )}
            </div>

            {/* Выбор срока - новый компактный дизайн */}
            <div>
              <h3 className="text-sm font-medium text-white/80 mb-3">Выберите срок продления:</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {products.map((product) => {
                  const isSelected = selectedProduct?.id === product.id
                  const isBest = product.duration_months >= 6
                  const savings = product.discount_percentage > 0 
                    ? Math.round(product.price / (1 - product.discount_percentage / 100) - product.price)
                    : 0
                  
                  return (
                    <button
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className={`
                        relative rounded-xl p-4 transition-all duration-200 text-left
                        ${isSelected 
                          ? 'ring-2 ring-orange-400 bg-gradient-to-br from-orange-500/10 to-red-500/10' 
                          : 'ring-1 ring-white/10 bg-white/[0.04] hover:bg-white/[0.06] hover:ring-white/20'
                        }
                        hover:scale-[1.02] active:scale-[0.98]
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl font-bold text-white">
                              {product.duration_months} {product.duration_months === 1 ? 'мес' : 'мес'}
                            </span>
                            {isBest && (
                              <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-[10px] font-bold text-white">
                                ВЫГОДНО
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-white/50">
                            {Math.round(product.price / (product.duration_months * 30))} ₽/день
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-white">
                              {product.price.toLocaleString('ru-RU')}
                            </span>
                            <span className="text-sm text-white/50">₽</span>
                          </div>
                          {product.discount_percentage > 0 && (
                            <p className="text-xs text-emerald-400 mt-0.5">
                              Экономия {savings.toLocaleString('ru-RU')} ₽
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Preview результата */}
            {selectedProduct && newExpiryDate && (
              <div className="rounded-xl bg-emerald-500/10 ring-1 ring-emerald-400/30 p-4 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400 flex-shrink-0 mt-0.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">
                      После оплаты: {remainingDays} дней + {selectedProduct.duration_months * 30} дней = <span className="text-emerald-300 font-bold">{newTotalDays} дней</span>
                    </p>
                    <p className="text-sm text-white/70 mt-1 flex items-center gap-2">
                      <span>📅</span>
                      Новая дата окончания: <span className="font-semibold text-white">{formatDate(newExpiryDate)}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* CTA кнопка */}
            <button
              onClick={handleRenewal}
              disabled={!selectedProduct}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-base uppercase tracking-wide transition-all hover:brightness-110 hover:scale-[1.02] active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
              Продлить подписку
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

