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
  const [isExpanded, setIsExpanded] = useState(false)

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
    setIsExpanded(false)
  }

  return (
    <div className="py-2">
      {!isExpanded && !appliedPromo ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Tag className="size-4" />
          <span>У меня есть промокод</span>
        </button>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Введите промокод"
                disabled={loading}
                readOnly={!!appliedPromo}
                className={`font-mono text-sm ${appliedPromo ? 'bg-muted' : ''}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !appliedPromo) {
                    handleApply()
                  }
                }}
                autoFocus={!appliedPromo}
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
                variant="ghost"
                size="sm"
                className="flex-shrink-0 h-9"
              >
                <X className="size-4 mr-1" />
                Отменить
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleApply}
                  disabled={!code.trim() || loading}
                  size="sm"
                  className="flex-shrink-0 h-9"
                >
                  {loading ? 'Проверка...' : 'Применить'}
                </Button>
                <Button
                  onClick={() => {
                    setIsExpanded(false)
                    setCode('')
                    setError('')
                  }}
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0 h-9 w-9"
                >
                  <X className="size-4" />
                </Button>
              </>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 dark:bg-red-950 p-2 text-xs text-red-800 dark:text-red-300">
              <X className="size-3 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

