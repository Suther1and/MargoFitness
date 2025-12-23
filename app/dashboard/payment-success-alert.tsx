'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PaymentSuccessAlert() {
  const searchParams = useSearchParams()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      setShow(true)
      // Убрать параметр из URL через 100ms
      setTimeout(() => {
        const url = new URL(window.location.href)
        url.searchParams.delete('payment')
        window.history.replaceState({}, '', url.toString())
      }, 100)
    }
  }, [searchParams])

  if (!show) return null

  return (
    <Card className="border-2 border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20 animate-in fade-in slide-in-from-top-4 duration-500">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <CheckCircle className="size-6 text-green-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-green-900 dark:text-green-100">
                Оплата прошла успешно!
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Ваша подписка активирована. Теперь у вас есть доступ ко всем тренировкам вашего уровня!
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => setShow(false)}
          >
            <X className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

