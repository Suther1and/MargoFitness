'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowUp, Clock, Loader2, Check } from "lucide-react"
import type { Profile, Product } from "@/types/database"
import { useRouter } from 'next/navigation'

interface SubscriptionActionsDialogProps {
  profile: Profile
}

const DURATIONS = [
  { months: 1, label: '1 месяц' },
  { months: 3, label: '3 месяца' },
  { months: 6, label: '6 месяцев' },
  { months: 12, label: '12 месяцев' },
]

export function SubscriptionActionsDialog({ profile }: SubscriptionActionsDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'renewal' | 'upgrade'>('renewal')
  const [loading, setLoading] = useState(false)
  const [renewalProducts, setRenewalProducts] = useState<Product[]>([])
  const [upgradeProducts, setUpgradeProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [upgradeInfo, setUpgradeInfo] = useState<any>(null)
  const [loadingUpgradeInfo, setLoadingUpgradeInfo] = useState(false)

  const currentTierLevel = profile.subscription_tier === 'basic' ? 1 :
                           profile.subscription_tier === 'pro' ? 2 :
                           profile.subscription_tier === 'elite' ? 3 : 0

  // Загрузить продукты при открытии
  useEffect(() => {
    if (open && renewalProducts.length === 0) {
      loadProducts()
    }
  }, [open])

  const loadProducts = async () => {
    setLoading(true)
    try {
      // Загрузить все активные продукты подписки
      const response = await fetch('/api/products/by-duration?duration=all')
      const data = await response.json()

      // Продления: тот же tier_level
      const renewals = data.filter((p: Product) => p.tier_level === currentTierLevel)
      setRenewalProducts(renewals)

      // Апгрейды: tier_level выше текущего
      const upgrades = data.filter((p: Product) => (p.tier_level || 0) > currentTierLevel)
      setUpgradeProducts(upgrades)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  // Загрузить информацию о конвертации при выборе апгрейда
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

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product)
    
    // Если это апгрейд - загрузить информацию о конвертации
    if (tab === 'upgrade') {
      loadUpgradeInfo(product.id)
    }
  }

  const handleProceed = () => {
    if (!selectedProduct) return
    
    const action = tab === 'renewal' ? 'renewal' : 'upgrade'
    router.push(`/payment/${selectedProduct.id}?action=${action}`)
  }

  const getTierName = (level: number) => {
    return level === 1 ? 'Basic' : level === 2 ? 'Pro' : level === 3 ? 'Elite' : 'Free'
  }

  const getTierColor = (level: number) => {
    return level === 1 ? 'bg-green-500' : level === 2 ? 'bg-blue-500' : 'bg-yellow-500'
  }

  const groupByDuration = (products: Product[]) => {
    return products.reduce((acc, product) => {
      const duration = product.duration_months
      if (!acc[duration]) acc[duration] = []
      acc[duration].push(product)
      return acc
    }, {} as Record<number, Product[]>)
  }

  const renewalsByDuration = groupByDuration(renewalProducts)
  const upgradesByDuration = groupByDuration(upgradeProducts)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" variant="default">
          <Clock className="mr-2 size-4" />
          Продлить или улучшить
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Управление подпиской</DialogTitle>
          <DialogDescription>
            Продлите текущую подписку или повысьте тариф
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => {
              setTab('renewal')
              setSelectedProduct(null)
              setUpgradeInfo(null)
            }}
            className={`px-4 py-2 font-medium transition-colors ${
              tab === 'renewal'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Clock className="inline mr-2 size-4" />
            Продлить
          </button>
          <button
            onClick={() => {
              setTab('upgrade')
              setSelectedProduct(null)
              setUpgradeInfo(null)
            }}
            className={`px-4 py-2 font-medium transition-colors ${
              tab === 'upgrade'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ArrowUp className="inline mr-2 size-4" />
            Апгрейд
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Renewal Tab */}
            {tab === 'renewal' && (
              <div className="space-y-4">
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm">
                    💡 Продление добавляет время к вашей текущей подписке <strong>{getTierName(currentTierLevel)}</strong>
                  </p>
                </div>

                {Object.keys(renewalsByDuration).length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Нет доступных вариантов продления
                  </p>
                ) : (
                  Object.keys(renewalsByDuration).sort((a, b) => Number(a) - Number(b)).map(duration => (
                    <div key={duration} className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        {DURATIONS.find(d => d.months === Number(duration))?.label || `${duration} месяцев`}
                      </p>
                      <div className="grid gap-3 md:grid-cols-2">
                        {renewalsByDuration[Number(duration)].map(product => (
                          <Card
                            key={product.id}
                            className={`p-4 cursor-pointer transition-all ${
                              selectedProduct?.id === product.id
                                ? 'ring-2 ring-primary shadow-md'
                                : 'hover:shadow-md'
                            }`}
                            onClick={() => handleProductSelect(product)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-2xl font-bold">{product.price.toLocaleString('ru-RU')} ₽</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {Math.round(product.price / product.duration_months)} ₽/месяц
                                </p>
                              </div>
                              {selectedProduct?.id === product.id && (
                                <Check className="size-6 text-primary" />
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Upgrade Tab */}
            {tab === 'upgrade' && (
              <div className="space-y-4">
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm">
                    🚀 При апгрейде оставшиеся дни текущей подписки конвертируются в бонусные дни нового тарифа
                  </p>
                </div>

                {Object.keys(upgradesByDuration).length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    У вас уже максимальный тариф! 🎉
                  </p>
                ) : (
                  Object.keys(upgradesByDuration).sort((a, b) => Number(a) - Number(b)).map(duration => (
                    <div key={duration} className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        {DURATIONS.find(d => d.months === Number(duration))?.label || `${duration} месяцев`}
                      </p>
                      <div className="grid gap-3 md:grid-cols-2">
                        {upgradesByDuration[Number(duration)].map(product => (
                          <Card
                            key={product.id}
                            className={`p-4 cursor-pointer transition-all ${
                              selectedProduct?.id === product.id
                                ? 'ring-2 ring-primary shadow-md'
                                : 'hover:shadow-md'
                            }`}
                            onClick={() => handleProductSelect(product)}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${getTierColor(product.tier_level || 1)}`} />
                                <p className="font-semibold">{getTierName(product.tier_level || 1)}</p>
                                {selectedProduct?.id === product.id && (
                                  <Check className="size-5 text-primary ml-auto" />
                                )}
                              </div>
                              <p className="text-2xl font-bold">{product.price.toLocaleString('ru-RU')} ₽</p>
                              <p className="text-sm text-muted-foreground">
                                {Math.round(product.price / product.duration_months)} ₽/месяц
                              </p>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))
                )}

                {/* Upgrade Info */}
                {selectedProduct && tab === 'upgrade' && (
                  <Card className="p-4 bg-primary/5 border-primary/20">
                    {loadingUpgradeInfo ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="size-6 animate-spin" />
                      </div>
                    ) : upgradeInfo ? (
                      <div className="space-y-2">
                        <p className="font-semibold text-sm">📊 Детали апгрейда:</p>
                        <div className="text-sm space-y-1">
                          <p>• Базовый период: <strong>{upgradeInfo.conversion.baseDays} дней</strong></p>
                          <p>• Бонусные дни: <strong>+{upgradeInfo.conversion.convertedDays} дней</strong></p>
                          <p className="text-primary font-semibold">
                            • Всего: <strong>{upgradeInfo.conversion.totalDays} дней {upgradeInfo.newTier.toUpperCase()}</strong>
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </Card>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                className="flex-1"
                onClick={handleProceed}
                disabled={!selectedProduct}
              >
                {tab === 'renewal' ? 'Продлить' : 'Перейти к апгрейду'}
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

