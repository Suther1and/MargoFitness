'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowUp, Clock, Loader2 } from "lucide-react"
import type { Profile, Product } from "@/types/database"
import { useRouter } from 'next/navigation'

interface SubscriptionActionsDialogProps {
  profile: Profile
}

const DURATIONS = [
  { months: 1, label: '1 мес' },
  { months: 3, label: '3 мес' },
  { months: 6, label: '6 мес' },
  { months: 12, label: '12 мес' },
]

export function SubscriptionActionsDialog({ profile }: SubscriptionActionsDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [action, setAction] = useState<'renewal' | 'upgrade'>('renewal')
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [selectedDuration, setSelectedDuration] = useState(3) // По умолчанию 3 месяца
  const [selectedUpgradeTier, setSelectedUpgradeTier] = useState<number | null>(null)
  const [upgradeInfo, setUpgradeInfo] = useState<any>(null)
  const [loadingUpgradeInfo, setLoadingUpgradeInfo] = useState(false)

  const currentTierLevel = profile.subscription_tier === 'basic' ? 1 :
                           profile.subscription_tier === 'pro' ? 2 :
                           profile.subscription_tier === 'elite' ? 3 : 0

  const availableUpgradeTiers = [
    { level: 2, name: 'Pro', available: currentTierLevel < 2 },
    { level: 3, name: 'Elite', available: currentTierLevel < 3 },
  ].filter(t => t.available)

  // Загрузить продукты при открытии
  useEffect(() => {
    if (open && products.length === 0) {
      loadProducts()
    }
  }, [open])

  // Загрузить информацию об апгрейде
  useEffect(() => {
    if (action === 'upgrade' && selectedUpgradeTier && selectedDuration) {
      const product = products.find(p => 
        p.tier_level === selectedUpgradeTier && 
        p.duration_months === selectedDuration
      )
      if (product) {
        loadUpgradeInfo(product.id)
      }
    }
  }, [action, selectedUpgradeTier, selectedDuration, products])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/products/by-duration?duration=all')
      const data = await response.json()
      setProducts(data)
      
      // Установить первый доступный tier для апгрейда
      if (availableUpgradeTiers.length > 0) {
        setSelectedUpgradeTier(availableUpgradeTiers[0].level)
      }
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUpgradeInfo = async (productId: string) => {
    setLoadingUpgradeInfo(true)
    setUpgradeInfo(null)
    try {
      const response = await fetch(`/api/payments/calculate-upgrade?newProductId=${productId}`)
      const data = await response.json()
      
      if (data.success) {
        setUpgradeInfo(data)
      }
    } catch (error) {
      console.error('Error loading upgrade info:', error)
    } finally {
      setLoadingUpgradeInfo(false)
    }
  }

  const handleProceed = () => {
    let product: Product | undefined
    
    if (action === 'renewal') {
      product = products.find(p => 
        p.tier_level === currentTierLevel && 
        p.duration_months === selectedDuration
      )
    } else {
      product = products.find(p => 
        p.tier_level === selectedUpgradeTier && 
        p.duration_months === selectedDuration
      )
    }
    
    if (!product) return
    
    router.push(`/payment/${product.id}?action=${action}`)
  }

  const selectedProduct = action === 'renewal'
    ? products.find(p => p.tier_level === currentTierLevel && p.duration_months === selectedDuration)
    : products.find(p => p.tier_level === selectedUpgradeTier && p.duration_months === selectedDuration)

  const getTierName = (level: number) => {
    return level === 1 ? 'Basic' : level === 2 ? 'Pro' : level === 3 ? 'Elite' : 'Free'
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Clock className="mr-2 size-4" />
          Продлить
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Продление и апгрейд подписки</DialogTitle>
          <DialogDescription>
            Продлите текущий тариф или повысьте уровень с бонусными днями
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Выбор действия */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Выберите действие</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setAction('renewal')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    action === 'renewal'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="size-4" />
                    <span className="font-semibold">Продлить</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Текущий тариф {getTierName(currentTierLevel)}
                  </p>
                </button>

                {availableUpgradeTiers.length > 0 && (
                  <button
                    onClick={() => setAction('upgrade')}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      action === 'upgrade'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <ArrowUp className="size-4" />
                      <span className="font-semibold">Апгрейд</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      + бонусные дни за остаток
                    </p>
                  </button>
                )}
              </div>
            </div>

            {/* Выбор тарифа для апгрейда */}
            {action === 'upgrade' && availableUpgradeTiers.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-medium">Выберите тариф</label>
                <div className="flex gap-3">
                  {availableUpgradeTiers.map(tier => (
                    <button
                      key={tier.level}
                      onClick={() => setSelectedUpgradeTier(tier.level)}
                      className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                        selectedUpgradeTier === tier.level
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <span className="font-semibold">{tier.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Выбор срока */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Выберите срок</label>
              <div className="grid grid-cols-4 gap-2">
                {DURATIONS.map(duration => (
                  <button
                    key={duration.months}
                    onClick={() => setSelectedDuration(duration.months)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedDuration === duration.months
                        ? 'border-primary bg-primary/5 font-semibold'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {duration.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Информация о выбранном варианте */}
            {selectedProduct && (
              <Card className="p-4 bg-muted/50">
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-muted-foreground">Стоимость:</span>
                    <span className="text-2xl font-bold">{selectedProduct.price.toLocaleString('ru-RU')} ₽</span>
                  </div>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="text-muted-foreground">В месяц:</span>
                    <span className="font-medium">
                      {Math.round(selectedProduct.price / selectedProduct.duration_months).toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                  
                  {action === 'upgrade' && upgradeInfo && !loadingUpgradeInfo && (
                    <div className="pt-2 mt-2 border-t space-y-1">
                      <p className="text-sm font-medium text-primary">🎁 Бонус при апгрейде:</p>
                      <p className="text-xs text-muted-foreground">
                        • Базовый период: {upgradeInfo.conversion.baseDays} дней
                      </p>
                      <p className="text-xs text-muted-foreground">
                        • Бонусные дни: +{upgradeInfo.conversion.convertedDays} дней
                      </p>
                      <p className="text-sm font-semibold">
                        = Всего {upgradeInfo.conversion.totalDays} дней подписки
                      </p>
                    </div>
                  )}
                  
                  {action === 'upgrade' && loadingUpgradeInfo && (
                    <div className="flex items-center gap-2 pt-2">
                      <Loader2 className="size-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Расчет бонуса...</span>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Кнопки */}
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={handleProceed}
                disabled={!selectedProduct}
              >
                {action === 'renewal' ? 'Продлить' : 'Апгрейд'} за {selectedProduct?.price.toLocaleString('ru-RU') || 0} ₽
              </Button>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Отмена
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
