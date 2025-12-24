'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import { createPromoCode } from '@/lib/actions/promo-codes'
import { useRouter } from 'next/navigation'

export function CreatePromoDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [code, setCode] = useState('')
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage')
  const [discountValue, setDiscountValue] = useState('')
  const [usageLimit, setUsageLimit] = useState('')
  const [expiresAt, setExpiresAt] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await createPromoCode({
      code: code.toUpperCase(),
      discountType,
      discountValue: parseFloat(discountValue),
      usageLimit: usageLimit ? parseInt(usageLimit) : null,
      expiresAt: expiresAt || null,
    })

    if (result.success) {
      setOpen(false)
      setCode('')
      setDiscountValue('')
      setUsageLimit('')
      setExpiresAt('')
      router.refresh()
    } else {
      setError(result.error || 'Ошибка создания промокода')
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 size-4" />
          Создать промокод
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Создать промокод</DialogTitle>
          <DialogDescription>
            Создайте новый промокод для предоставления скидок пользователям
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Код */}
          <div className="space-y-2">
            <Label htmlFor="code">Код промокода *</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="NEWYEAR2025"
              required
              className="font-mono"
            />
          </div>

          {/* Тип скидки */}
          <div className="space-y-2">
            <Label>Тип скидки *</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={discountType === 'percentage' ? 'default' : 'outline'}
                onClick={() => setDiscountType('percentage')}
                className="flex-1"
              >
                Процент
              </Button>
              <Button
                type="button"
                variant={discountType === 'fixed' ? 'default' : 'outline'}
                onClick={() => setDiscountType('fixed')}
                className="flex-1"
              >
                Фиксированная сумма
              </Button>
            </div>
          </div>

          {/* Значение скидки */}
          <div className="space-y-2">
            <Label htmlFor="value">
              {discountType === 'percentage' ? 'Процент скидки *' : 'Сумма скидки (₽) *'}
            </Label>
            <Input
              id="value"
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder={discountType === 'percentage' ? '10' : '500'}
              required
              min="0"
              max={discountType === 'percentage' ? '100' : undefined}
            />
          </div>

          {/* Лимит использований */}
          <div className="space-y-2">
            <Label htmlFor="limit">Лимит использований (опционально)</Label>
            <Input
              id="limit"
              type="number"
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
              placeholder="100"
              min="1"
            />
          </div>

          {/* Срок действия */}
          <div className="space-y-2">
            <Label htmlFor="expires">Срок действия (опционально)</Label>
            <Input
              id="expires"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-950 p-3 text-sm text-red-800 dark:text-red-300">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Создание...' : 'Создать промокод'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

