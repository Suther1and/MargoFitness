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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[850px] w-[90vw] bg-[#0a0a0f] border-white/10 text-white p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-white/10">
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
              <DialogTitle className="text-xl font-oswald uppercase tracking-tight">
                Продление подписки {currentTier.toUpperCase()}
              </DialogTitle>
              <p className="text-sm text-white/60 mt-0.5">Выберите срок продления</p>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
          </div>
        ) : (
          <div className="px-6 pb-6 space-y-5">
            {/* Текущая подписка - компактная строка */}
            <div className="flex items-center gap-3 text-sm text-white/60 pt-4">
              <span className="text-white font-medium">{currentTier.toUpperCase()}</span>
              <span>•</span>
              <span>{remainingDays} дней осталось</span>
              {currentExpires && (
                <>
                  <span>•</span>
                  <span>до {formatDate(new Date(currentExpires))}</span>
                </>
              )}
            </div>

            {/* Выбор срока */}
            <div>
              <h3 className="text-sm font-medium text-white/80 mb-3">Выберите срок продления:</h3>
              <div className="grid grid-cols-4 gap-3">
                {products.map((product) => {
                  const isSelected = selectedProduct?.id === product.id
                  const isBest = product.duration_months >= 6
                  
                  return (
                    <button
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className={`
                        relative rounded-xl p-3.5 transition-all duration-200
                        ${isSelected 
                          ? 'ring-2 ring-orange-400 bg-gradient-to-br from-orange-500/10 to-red-500/10' 
                          : 'ring-1 ring-white/10 bg-white/[0.04] hover:bg-white/[0.06] hover:ring-white/20'
                        }
                        hover:scale-[1.02] active:scale-[0.98]
                      `}
                    >
                      {isBest && (
                        <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-[10px] font-bold text-white shadow-lg">
                          ВЫГОДНО
                        </div>
                      )}
                      
                      <div className="text-center space-y-1.5">
                        <p className="text-sm font-semibold text-white/90">
                          {product.duration_months} {product.duration_months === 1 ? 'мес' : 'мес'}
                        </p>
                        <p className="text-xl font-bold text-white">
                          {product.price.toLocaleString('ru-RU')} ₽
                        </p>
                        {product.discount_percentage > 0 && (
                          <p className="text-xs text-emerald-400 font-medium">
                            -{product.discount_percentage}%
                          </p>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Preview результата */}
            {selectedProduct && newExpiryDate && (
              <div className="rounded-xl bg-emerald-500/10 ring-1 ring-emerald-400/30 p-4">
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400 flex-shrink-0 mt-0.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <div className="flex-1 text-sm">
                    <p className="text-white font-medium">
                      После оплаты: {remainingDays} дней + {selectedProduct.duration_months * 30} дней = <span className="text-emerald-300 font-bold">{newTotalDays} дней</span>
                    </p>
                    <p className="text-white/70 mt-1.5 flex items-center gap-2">
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
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-sm uppercase tracking-wide transition-all hover:brightness-110 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
