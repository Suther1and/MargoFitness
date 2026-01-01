'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getUpgradeOptions, calculateUpgradeConversion } from '@/lib/actions/subscription-actions'
import { Product, SubscriptionTier, TIER_LEVELS } from '@/types/database'
import { Loader2 } from 'lucide-react'

interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentTier: SubscriptionTier
  userId: string
}

type TierData = {
  tier: SubscriptionTier
  tierLevel: number
  products: Product[]
}

export function SubscriptionUpgradeModal({
  open,
  onOpenChange,
  currentTier,
  userId
}: UpgradeModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [availableTiers, setAvailableTiers] = useState<TierData[]>([])
  const [selectedTierData, setSelectedTierData] = useState<TierData | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [conversion, setConversion] = useState<any>(null)

  const currentTierLevel = TIER_LEVELS[currentTier]
  const isElite = currentTierLevel >= 3

  useEffect(() => {
    if (open) {
      loadUpgradeOptions()
    }
  }, [open, userId])

  useEffect(() => {
    if (selectedTierData) {
      loadConversion(selectedTierData.tierLevel)
      const sixMonths = selectedTierData.products.find(p => p.duration_months === 6)
      setSelectedProduct(sixMonths || selectedTierData.products[0])
    }
  }, [selectedTierData])

  const loadUpgradeOptions = async () => {
    setLoading(true)
    const result = await getUpgradeOptions(userId)
    if (result.success && result.data) {
      setAvailableTiers(result.data.availableTiers)
      if (result.data.availableTiers.length > 0) {
        setSelectedTierData(result.data.availableTiers[0])
      }
    }
    setLoading(false)
  }

  const loadConversion = async (newTierLevel: number) => {
    const result = await calculateUpgradeConversion(userId, newTierLevel)
    if (result.success && result.data) {
      setConversion(result.data)
    }
  }

  const tierConfig: Record<string, { color: string; icon: string; name: string }> = {
    pro: { color: 'purple', icon: '⭐', name: 'PRO' },
    elite: { color: 'amber', icon: '👑', name: 'ELITE' }
  }

  const getTotalDays = () => {
    if (!selectedProduct || !conversion) return 0
    return (selectedProduct.duration_months * 30) + conversion.convertedDays
  }

  const getNewExpiryDate = () => {
    const totalDays = getTotalDays()
    if (totalDays === 0) return null
    const newDate = new Date()
    newDate.setDate(newDate.getDate() + totalDays)
    return newDate
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const handleUpgrade = () => {
    if (!selectedProduct) return
    router.push(`/payment/${selectedProduct.id}?action=upgrade`)
  }

  // Elite специальный случай
  if (isElite) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="!max-w-[480px] w-[90vw] bg-[#0a0a0f] border-white/10 text-white p-0 overflow-hidden">
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-4xl">
              👑
            </div>
            <div>
              <h2 className="text-2xl font-oswald uppercase tracking-tight mb-2">
                У вас максимальный тариф!
              </h2>
              <p className="text-white/70">
                Вы используете Elite - наш лучший план с полным доступом ко всем возможностям.
              </p>
            </div>
            <p className="text-white/60">Хотите продлить подписку?</p>
            <button
              onClick={() => {
                onOpenChange(false)
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold uppercase tracking-wide hover:brightness-110 transition-all"
            >
              🚀 Продлить Elite
            </button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const newExpiryDate = getNewExpiryDate()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[850px] w-[90vw] bg-[#0a0a0f] border-white/10 text-white p-0 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-300">
                <path d="M9 19h6"></path>
                <path d="M9 15v-3H5l7-7 7 7h-4v3H9z"></path>
              </svg>
            </div>
            <div>
              <DialogTitle className="text-xl font-oswald uppercase tracking-tight">
                Апгрейд тарифа
              </DialogTitle>
              <p className="text-sm text-white/60 mt-0.5">Получи больше возможностей</p>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          </div>
        ) : (
          <div className="px-6 pb-6 space-y-5 overflow-y-auto flex-1">
            {/* Текущая подписка - компактная строка */}
            {conversion && (
              <div className="flex items-center gap-3 text-sm text-white/60 pt-4">
                <span className="text-white font-medium">{currentTier.toUpperCase()}</span>
                <span>•</span>
                <span>{conversion.remainingDays} дней осталось</span>
                <span>•</span>
                <span>~{conversion.remainingValue.toLocaleString('ru-RU')} ₽</span>
              </div>
            )}

            {/* Tabs - компактный сегментированный контрол */}
            {availableTiers.length > 0 && (
              <div className="bg-white/[0.03] rounded-lg p-1 flex gap-1">
                {availableTiers.map((tierData) => {
                  const config = tierConfig[tierData.tier]
                  const isSelected = selectedTierData?.tier === tierData.tier
                  const isRecommended = tierData.tierLevel === currentTierLevel + 1
                  
                  return (
                    <button
                      key={tierData.tier}
                      onClick={() => setSelectedTierData(tierData)}
                      className={`
                        flex-1 relative py-2 px-3 rounded-md transition-all duration-200
                        ${isSelected
                          ? `bg-gradient-to-br from-${config.color}-500/20 to-${config.color}-600/20 ring-1 ring-${config.color}-400/50 text-white`
                          : 'text-white/60 hover:bg-white/5 hover:text-white/80'
                        }
                      `}
                    >
                      {isRecommended && (
                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-orange-500 text-[9px] font-bold text-white whitespace-nowrap">
                          Рекомендуем
                        </div>
                      )}
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-base">{config.icon}</span>
                        <span className="font-bold text-sm">{config.name}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Блок конвертации - элегантный и компактный */}
            {conversion && selectedTierData && (
              <div className={`rounded-xl bg-white/[0.08] ring-1 ring-${tierConfig[selectedTierData.tier].color}-400/40 p-4`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">💎</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-white/60 mb-1">Бонус за оставшиеся дни:</p>
                    <p className="text-sm font-bold text-white">
                      <span className="text-orange-300">{conversion.remainingDays} дней {currentTier.toUpperCase()}</span>
                      {' → '}
                      <span className={`text-${tierConfig[selectedTierData.tier].color}-300`}>
                        {conversion.convertedDays} дней {selectedTierData.tier.toUpperCase()}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Выбор срока */}
            {selectedTierData && (
              <div>
                <h3 className="text-sm font-medium text-white/80 mb-3">Выберите срок:</h3>
                <div className="grid grid-cols-4 gap-3">
                  {selectedTierData.products.map((product) => {
                    const isSelected = selectedProduct?.id === product.id
                    const isBest = product.duration_months >= 6
                    
                    return (
                      <button
                        key={product.id}
                        onClick={() => setSelectedProduct(product)}
                        className={`
                          relative rounded-xl p-3.5 transition-all duration-200
                          ${isSelected
                            ? `ring-2 ring-${tierConfig[selectedTierData.tier].color}-400 bg-gradient-to-br from-${tierConfig[selectedTierData.tier].color}-500/10 to-transparent`
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
            )}

            {/* Preview результата */}
            {selectedProduct && conversion && (
              <div className="rounded-xl bg-emerald-500/10 ring-1 ring-emerald-400/30 p-4">
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400 flex-shrink-0 mt-0.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <div className="flex-1 text-sm space-y-1.5">
                    <p className="text-white font-medium">
                      Итого: <span className="text-emerald-300 font-bold">{getTotalDays()} дней</span> ({selectedProduct.duration_months * 30} дней + {conversion.convertedDays} дней бонус)
                    </p>
                    {newExpiryDate && (
                      <p className="text-white/70 flex items-center gap-2">
                        <span>📅</span>
                        До: <span className="font-semibold text-white">{formatDate(newExpiryDate)}</span>
                      </p>
                    )}
                    <p className="text-white/70">
                      Цена: <span className="font-bold text-white">{selectedProduct.price.toLocaleString('ru-RU')} ₽</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* CTA кнопка */}
            {selectedTierData && (
              <button
                onClick={handleUpgrade}
                disabled={!selectedProduct}
                className={`
                  w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wide transition-all
                  bg-gradient-to-r from-${tierConfig[selectedTierData.tier].color}-500 to-${tierConfig[selectedTierData.tier].color}-600
                  hover:brightness-110 hover:scale-[1.01] active:scale-[0.99]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2 text-white
                `}
              >
                Выбрать {selectedTierData.tier.toUpperCase()}
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
