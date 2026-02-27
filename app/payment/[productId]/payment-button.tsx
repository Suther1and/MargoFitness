'use client'

import { useState } from 'react'
import { mockPurchaseSubscription } from '@/lib/actions/payments'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PaymentButtonProps {
  productId: string
  productName: string
  amount: number
}

export default function PaymentButton({ productId, productName, amount }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handlePayment = async () => {
    setLoading(true)
    setError('')

    // Имитация задержки платёжной системы
    await new Promise(resolve => setTimeout(resolve, 1500))

    const result = await mockPurchaseSubscription(productId)

    if (result.success) {
      // Показываем успех и редиректим
      router.push('/dashboard?tab=subscription&payment=success')
    } else {
      setError(result.error || 'Ошибка оплаты')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button
        onClick={handlePayment}
        disabled={loading}
        size="lg"
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 size-5 animate-spin" />
            Обработка платежа...
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 size-5" />
            Оплатить {amount} ₽
          </>
        )}
      </Button>

      {loading && (
        <div className="text-center text-sm text-muted-foreground animate-pulse">
          Подключаемся к платёжной системе...
        </div>
      )}
    </div>
  )
}

