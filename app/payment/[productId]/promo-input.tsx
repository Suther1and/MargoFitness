'use client'

import { useState } from 'react'
import { Check, X, Tag, Loader2 } from 'lucide-react'
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
      setError(result.error || 'Неверный промокод')
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

  if (!isExpanded && !appliedPromo) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="text-sm text-white/60 hover:text-orange-400 flex items-center gap-2 transition-colors"
      >
        <Tag className="size-4" />
        <span>Есть промокод?</span>
      </button>
    )
  }

  return (
    <div className="rounded-xl bg-white/[0.04] ring-1 ring-white/10 p-3 space-y-2.5">
      <input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="ПРОМОКОД"
        disabled={loading || !!appliedPromo}
        readOnly={!!appliedPromo}
        className={`w-full bg-transparent text-white placeholder-white/40 outline-none font-mono text-sm ${appliedPromo ? 'text-green-400' : ''}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !appliedPromo) {
            handleApply()
          }
        }}
        autoFocus={!appliedPromo}
      />
      
      {appliedPromo && (
        <div className="flex items-center gap-2 text-xs text-green-400">
          <Check className="size-3" />
          <span>Промокод применен</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-400">
          <X className="size-3" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <button 
          onClick={handleRemove}
          className="text-xs text-white/60 hover:text-white transition-colors"
        >
          Отменить
        </button>
        {!appliedPromo && (
          <button 
            onClick={handleApply}
            disabled={!code.trim() || loading}
            className="text-xs text-orange-400 hover:text-orange-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {loading ? (
              <>
                <Loader2 className="size-3 animate-spin" />
                <span>Проверка...</span>
              </>
            ) : (
              <span>Применить</span>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

