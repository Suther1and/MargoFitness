'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, X, Trash2 } from 'lucide-react'
import { activatePromoCode, deactivatePromoCode, deletePromoCode } from '@/lib/actions/promo-codes'
import { useRouter } from 'next/navigation'
import type { PromoCode } from '@/types/database'

interface PromoCodesListProps {
  promoCodes: PromoCode[]
}

export function PromoCodesList({ promoCodes: initialPromoCodes }: PromoCodesListProps) {
  const router = useRouter()
  const [promoCodes] = useState(initialPromoCodes)

  const handleToggle = async (id: string, isActive: boolean) => {
    if (isActive) {
      await deactivatePromoCode(id)
    } else {
      await activatePromoCode(id)
    }
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот промокод?')) {
      await deletePromoCode(id)
      router.refresh()
    }
  }

  if (promoCodes.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Промокодов пока нет. Создайте первый!
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Все промокоды</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {promoCodes.map((promo) => {
            const isExpired = promo.expires_at && new Date(promo.expires_at) < new Date()
            const isLimitReached = promo.usage_limit !== null && promo.usage_count >= promo.usage_limit

            return (
              <div
                key={promo.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-lg">{promo.code}</span>
                    {promo.is_active ? (
                      <Badge variant="default" className="bg-green-600">Активен</Badge>
                    ) : (
                      <Badge variant="secondary">Неактивен</Badge>
                    )}
                    {isExpired && (
                      <Badge variant="destructive">Истек</Badge>
                    )}
                    {isLimitReached && (
                      <Badge variant="destructive">Исчерпан</Badge>
                    )}
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {promo.discount_type === 'percentage'
                      ? `${promo.discount_value}% скидка`
                      : `${promo.discount_value}₽ скидка`
                    }
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Использований: {promo.usage_count}{promo.usage_limit ? ` / ${promo.usage_limit}` : ''}</span>
                    {promo.expires_at && (
                      <span>
                        Истекает: {new Date(promo.expires_at).toLocaleDateString('ru-RU')}
                      </span>
                    )}
                    <span>
                      Создан: {new Date(promo.created_at).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleToggle(promo.id, promo.is_active)}
                    variant="outline"
                    size="sm"
                  >
                    {promo.is_active ? (
                      <>
                        <X className="mr-1 size-4" />
                        Деактивировать
                      </>
                    ) : (
                      <>
                        <Check className="mr-1 size-4" />
                        Активировать
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleDelete(promo.id)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

