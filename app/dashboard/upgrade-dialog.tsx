'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowUp, Loader2 } from "lucide-react"
import type { Profile } from "@/types/database"

interface Product {
  id: string
  name: string
  price: number
  tier_level: number
  duration_months: number
}

interface UpgradeDialogProps {
  profile: Profile
}

export function UpgradeDialog({ profile }: UpgradeDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [message, setMessage] = useState('')
  const [upgradeInfo, setUpgradeInfo] = useState<any>(null)

  // Текущий уровень тарифа
  const currentTierLevel = profile.subscription_tier === 'basic' ? 1 : 
                           profile.subscription_tier === 'pro' ? 2 : 
                           profile.subscription_tier === 'elite' ? 3 : 0

  // Загрузить доступные апгрейды при открытии
  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen)
    
    if (isOpen && products.length === 0) {
      setLoadingProducts(true)
      try {
        // Получить все активные продукты подписки
        const response = await fetch('/api/products/by-duration?duration=all')
        const data = await response.json()
        
        // Фильтровать только апгрейды (уровень выше текущего)
        const availableUpgrades = data.filter((p: Product) => 
          p.tier_level > currentTierLevel
        )
        
        setProducts(availableUpgrades)
      } catch (error) {
        console.error('Error loading products:', error)
        setMessage('❌ Ошибка загрузки тарифов')
      } finally {
        setLoadingProducts(false)
      }
    }
  }

  // Выполнить апгрейд
  const handleUpgrade = async () => {
    if (!selectedProduct) return

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/payments/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newProductId: selectedProduct.id })
      })

      const data = await response.json()

      if (data.success) {
        if (data.paid) {
          // Платеж прошел автоматически
          setMessage(`✅ Апгрейд успешен! ${data.message}`)
          setTimeout(() => {
            window.location.reload()
          }, 2000)
        } else if (data.requiresPayment) {
          // Нужно оплатить вручную
          setUpgradeInfo(data)
          setMessage(`💳 Для апгрейда необходимо оплатить ${selectedProduct.price} ₽`)
        }
      } else {
        setMessage(`❌ ${data.error || 'Не удалось выполнить апгрейд'}`)
      }
    } catch (error) {
      console.error('Error upgrading:', error)
      setMessage('❌ Ошибка при апгрейде')
    } finally {
      setLoading(false)
    }
  }

  // Группировать продукты по длительности
  const productsByDuration = products.reduce((acc, product) => {
    const duration = product.duration_months
    if (!acc[duration]) acc[duration] = []
    acc[duration].push(product)
    return acc
  }, {} as Record<number, Product[]>)

  const durations = Object.keys(productsByDuration).sort((a, b) => Number(a) - Number(b))

  const getTierName = (level: number) => {
    return level === 1 ? 'Basic' : level === 2 ? 'Pro' : level === 3 ? 'Elite' : 'Free'
  }

  const getTierColor = (level: number) => {
    return level === 1 ? 'bg-green-500' : level === 2 ? 'bg-blue-500' : 'bg-yellow-500'
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full" variant="default">
          <ArrowUp className="mr-2 size-4" />
          Улучшить план
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Апгрейд подписки</DialogTitle>
          <DialogDescription>
            Повысьте свой тариф и получите бонусные дни за остаток текущей подписки
          </DialogDescription>
        </DialogHeader>

        {loadingProducts ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              У вас уже максимальный тариф! 🎉
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Информация о текущей подписке */}
            <Card className="p-4 bg-muted/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Текущий тариф</p>
                  <p className="font-semibold text-lg">{getTierName(currentTierLevel)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Оставшиеся дни</p>
                  <p className="font-semibold text-lg">
                    {profile.subscription_expires_at 
                      ? Math.max(0, Math.ceil((new Date(profile.subscription_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                      : 0}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                💡 При апгрейде оставшиеся дни конвертируются в бонусные дни новой подписки
              </p>
            </Card>

            {/* Выбор нового тарифа */}
            <div className="space-y-4">
              <h3 className="font-semibold">Выберите новый тариф</h3>
              
              {durations.map(duration => (
                <div key={duration} className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {duration} {duration === '1' ? 'месяц' : duration === '3' ? 'месяца' : 'месяцев'}
                  </p>
                  <div className="grid gap-3 md:grid-cols-2">
                    {productsByDuration[Number(duration)].map(product => (
                      <Card
                        key={product.id}
                        className={`p-4 cursor-pointer transition-all ${
                          selectedProduct?.id === product.id
                            ? 'ring-2 ring-primary shadow-md'
                            : 'hover:shadow-md'
                        }`}
                        onClick={() => setSelectedProduct(product)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`w-3 h-3 rounded-full ${getTierColor(product.tier_level)}`} />
                              <p className="font-semibold">{getTierName(product.tier_level)}</p>
                            </div>
                            <p className="text-2xl font-bold">{product.price.toLocaleString('ru-RU')} ₽</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              + бонусные дни за остаток
                            </p>
                          </div>
                          {selectedProduct?.id === product.id && (
                            <div className="text-primary font-medium text-sm">✓</div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Сообщения */}
            {message && (
              <div className="rounded-md bg-muted p-3 text-sm">
                {message}
              </div>
            )}

            {/* Кнопки действий */}
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={handleUpgrade}
                disabled={!selectedProduct || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Обработка...
                  </>
                ) : (
                  <>
                    Апгрейд за {selectedProduct?.price.toLocaleString('ru-RU') || 0} ₽
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
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

