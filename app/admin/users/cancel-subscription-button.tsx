'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CancelSubscriptionButtonProps {
  userId: string
  userEmail: string
  hasActiveSubscription: boolean
}

export function CancelSubscriptionButton({ 
  userId, 
  userEmail,
  hasActiveSubscription 
}: CancelSubscriptionButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  if (!hasActiveSubscription) {
    return null
  }

  const handleCancel = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/payments/cancel-full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      const data = await response.json()

      if (data.success) {
        router.refresh()
        setShowConfirm(false)
      } else {
        alert(`Ошибка: ${data.error}`)
      }
    } catch (error) {
      console.error('Error canceling subscription:', error)
      alert('Произошла ошибка при отмене подписки')
    } finally {
      setLoading(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xs text-red-600">
          Отменить подписку для {userEmail}?
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="destructive"
            onClick={handleCancel}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 size-3 animate-spin" />}
            Да
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowConfirm(false)}
            disabled={loading}
          >
            Нет
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
      onClick={() => setShowConfirm(true)}
      disabled={loading}
    >
      <XCircle className="mr-1 size-3" />
      Отменить подписку
    </Button>
  )
}

