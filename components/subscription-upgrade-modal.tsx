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
  const [loadingConversion, setLoadingConversion] = useState(false)

  const currentTierLevel = TIER_LEVELS[currentTier]
  const isElite = currentTierLevel >= 3

  // Загрузить доступные тарифы
  useEffect(() => {
    if (open) {
      loadUpgradeOptions()
    }
  }, [open, userId])

  // Рассчитать конвертацию при смене тарифа
  useEffect(() => {
    if (selectedTierData) {
      loadConversion(selectedTierData.tierLevel)
      // Выбрать продукт по умолчанию (6 месяцев или первый)
      const sixMonths = selectedTierData.products.find(p => p.duration_months === 6)
      setSelectedProduct(sixMonths || selectedTierData.products[0])
    }
  }, [selectedTierData])

  const loadUpgradeOptions = async () => {
    setLoading(true)
    const result = await getUpgradeOptions(userId)
    if (result.success && result.data) {
      setAvailableTiers(result.data.availableTiers)
      // По умолчанию выбрать первый доступный тариф (ближайший апгрейд)
      if (result.data.availableTiers.length > 0) {
        setSelectedTierData(result.data.availableTiers[0])
      }
    }
    setLoading(false)
  }

  const loadConversion = async (newTierLevel: number) => {
    setLoadingConversion(true)
    const result = await calculateUpgradeConversion(userId, newTierLevel)
    if (result.success && result.data) {
      setConversion(result.data)
    }
    setLoadingConversion(false)
  }

  // Цвета и иконки тарифов
  const tierConfig: Record<string, { color: string; icon: string; name: string }> = {
    pro: { color: 'purple', icon: '⭐', name: 'PRO' },
    elite: { color: 'amber', icon: '👑', name: 'ELITE' }
  }

  // Рассчитать итоговые дни
  const getTotalDays = () => {
    if (!selectedProduct || !conversion) return 0
    return (selectedProduct.duration_months * 30) + conversion.convertedDays
  }

  // Рассчитать новую дату окончания
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

  // Если Elite - показать специальное сообщение
  if (isElite) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md bg-[#0a0a0f] border-white/10 text-white p-0 overflow-hidden">
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
                // Можно открыть renewal modal
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-[#0a0a0f] border-white/10 text-white p-0 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Заголовок */}
        <DialogHeader className="p-6 pb-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-300">
                <path d="M9 19h6"></path>
                <path d="M9 15v-3H5l7-7 7 7h-4v3H9z"></path>
              </svg>
            </div>
            <div>
              <DialogTitle className="text-2xl font-oswald uppercase tracking-tight">
                Апгрейд тарифа
              </DialogTitle>
              <p className="text-sm text-white/60 mt-1">Получи больше возможностей</p>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          </div>
        ) : (
          <div className="p-6 space-y-6 overflow-y-auto flex-1">

            {/* Tabs переключения тарифов - улучшенный дизайн */}
            {availableTiers.length > 0 && (
              <div>
                {conversion && (
                  <div className="flex items-center gap-3 text-sm text-white/60 mb-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/15 px-2.5 py-1 text-xs ring-1 ring-orange-400/30">
                      <span className="font-semibold text-white">{currentTier.toUpperCase()}</span>
                    </span>
                    <span>•</span>
                    <span>{conversion.remainingDays} дней осталось</span>
                    <span>•</span>
                    <span>~{conversion.remainingValue.toLocaleString('ru-RU')} ₽</span>
                  </div>
                )}
                <div className="bg-white/[0.03] rounded-xl p-1 flex gap-1">
                  {availableTiers.map((tierData) => {
                    const config = tierConfig[tierData.tier]
                    const isSelected = selectedTierData?.tier === tierData.tier
                    const isRecommended = tierData.tierLevel === currentTierLevel + 1
                    
                    return (
                      <button
                        key={tierData.tier}
                        onClick={() => setSelectedTierData(tierData)}
                        className={`
                          flex-1 relative py-3 px-4 rounded-lg transition-all duration-200
                          ${isSelected
                            ? `bg-gradient-to-br from-${config.color}-500/20 to-${config.color}-600/20 ring-1 ring-${config.color}-400/50 text-white`
                            : 'text-white/60 hover:bg-white/5 hover:text-white/80'
                          }
                        `}
                      >
                        {isRecommended && (
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-orange-500 text-[10px] font-bold text-white whitespace-nowrap">
                            Рекомендуем
                          </div>
                        )}
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-xl">{config.icon}</span>
                          <span className="font-bold text-base">{config.name}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Контент выбранного тарифа */}
            {selectedTierData && (
              <div className={`rounded-2xl bg-gradient-to-br from-${tierConfig[selectedTierData.tier].color}-500/5 to-transparent ring-1 ring-${tierConfig[selectedTierData.tier].color}-400/30 p-5 space-y-4`}>

                {/* Калькулятор конвертации - главный элемент */}
                {conversion && !loadingConversion && (
                  <div className={`rounded-xl bg-gradient-to-br from-${tierConfig[selectedTierData.tier].color}-500/20 to-transparent ring-2 ring-${tierConfig[selectedTierData.tier].color}-400 p-5 shadow-lg shadow-${tierConfig[selectedTierData.tier].color}-500/20`}>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center flex-shrink-0">
                        <span className="text-3xl">💎</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-white/60 mb-2 uppercase tracking-wide">Бонус за оставшиеся дни</p>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex-1">
                            <p className="text-sm text-white/70 mb-1">У вас сейчас:</p>
                            <p className="text-xl font-bold text-orange-300">{conversion.remainingDays} дней</p>
                            <p className="text-xs text-white/50">{currentTier.toUpperCase()}</p>
                          </div>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40">
                            <path d="M5 12h14"></path>
                            <path d="m12 5 7 7-7 7"></path>
                          </svg>
                          <div className="flex-1">
                            <p className="text-sm text-white/70 mb-1">Получите:</p>
                            <p className={`text-xl font-bold text-${tierConfig[selectedTierData.tier].color}-300`}>{conversion.convertedDays} дней</p>
                            <p className="text-xs text-white/50">{selectedTierData.tier.toUpperCase()}</p>
                          </div>
                        </div>
                        <div className="rounded-lg bg-white/5 px-3 py-2 flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M12 16v-4"></path>
                            <path d="M12 8h.01"></path>
                          </svg>
                          <p className="text-xs text-white/70">Конвертация по справедливой формуле</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Выбор срока - новый компактный дизайн */}
                <div>
                  <h3 className="text-sm font-semibold text-white/80 mb-3">Выберите срок:</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {selectedTierData.products.map((product) => {
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
                              ? `ring-2 ring-${tierConfig[selectedTierData.tier].color}-400 bg-gradient-to-br from-${tierConfig[selectedTierData.tier].color}-500/10 to-transparent`
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
                {selectedProduct && conversion && (
                  <div className="rounded-xl bg-emerald-500/10 ring-1 ring-emerald-400/30 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>
                        Итого: <span className="font-bold">{selectedProduct.duration_months * 30} дней</span> + <span className="font-bold">{conversion.convertedDays} дней</span> = <span className="text-emerald-300 font-bold">{getTotalDays()} дней</span>
                      </span>
                    </div>
                    {getNewExpiryDate() && (
                      <p className="text-sm text-white/70 flex items-center gap-2">
                        <span>📅</span>
                        До: <span className="font-semibold text-white">{formatDate(getNewExpiryDate()!)}</span>
                      </p>
                    )}
                    <p className="text-sm text-white/70">
                      Цена: <span className="font-bold text-white">{selectedProduct.price.toLocaleString('ru-RU')} ₽</span>
                    </p>
                  </div>
                )}

                {/* CTA кнопка */}
                <button
                  onClick={handleUpgrade}
                  disabled={!selectedProduct}
                  className={`
                    w-full py-4 rounded-xl font-bold text-base uppercase tracking-wide transition-all
                    bg-gradient-to-r from-${tierConfig[selectedTierData.tier].color}-500 to-${tierConfig[selectedTierData.tier].color}-600
                    hover:brightness-110 hover:scale-[1.02] active:scale-98
                    disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center justify-center gap-3
                  `}
                >
                  Выбрать {selectedTierData.tier.toUpperCase()}
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

