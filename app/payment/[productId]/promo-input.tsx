'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Check, X, Tag } from 'lucide-react'
import { validatePromoCode } from '@/lib/actions/promo-codes'
import type { PromoCode } from '@/types/database'

interface PromoInputProps {
  productId: string
  onPromoApplied: (promo: PromoCode | null) => void
}

export function PromoInput({ productId, onPromoApplied }: PromoInputProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null)
  const [error, setError] = useState('')

  const handleApply = async () => {
    if (!code.trim()) return

    setLoading(true)
    setError('')

    const result = await validatePromoCode(code.trim().toUpperCase(), productId)

    if (result.success && result.data) {
      setAppliedPromo(result.data)
      onPromoApplied(result.data)
      setError('')
    } else {
      setError(result.error || 'Ошибка применения промокода')
      setAppliedPromo(null)
      onPromoApplied(null)
    }

    setLoading(false)
  }

  const handleRemove = () => {
    setCode('')
    setAppliedPromo(null)
    setError('')
    onPromoApplied(null)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Tag className="size-4 text-muted-foreground" />
        <label className="text-sm font-medium">Промокод</label>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Введите промокод"
            disabled={loading}
            readOnly={!!appliedPromo}
            className={`font-mono ${appliedPromo ? 'bg-muted' : ''}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !appliedPromo) {
                handleApply()
              }
            }}
          />
          {appliedPromo && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Check className="size-4 text-green-600 dark:text-green-400" />
            </div>
          )}
        </div>
        {appliedPromo ? (
          <Button
            onClick={handleRemove}
            variant="outline"
            size="icon"
            className="flex-shrink-0"
          >
            <X className="size-4" />
          </Button>
        ) : (
          <Button
            onClick={handleApply}
            disabled={!code.trim() || loading}
            className="flex-shrink-0"
          >
            {loading ? 'Проверка...' : 'Применить'}
          </Button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 dark:bg-red-950 p-3 text-sm text-red-800 dark:text-red-300">
          <X className="size-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

