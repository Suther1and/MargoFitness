'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { YooKassaWidget } from './yookassa-widget'
import { RedirectPayment } from './redirect-payment'
import { MockPaymentWidget } from './mock-payment-widget'
import { CreditCard, ExternalLink, TestTube } from 'lucide-react'
import type { Product, Profile } from "@/types/database"

interface PaymentWidgetSwitcherProps {
  product: Product
  profile: Profile
}

type PaymentMode = 'embedded' | 'redirect' | 'mock'

export function PaymentWidgetSwitcher({ product, profile }: PaymentWidgetSwitcherProps) {
  const searchParams = useSearchParams()
  const modeParam = searchParams.get('mode') as PaymentMode | null
  
  // Определяем режим: из URL параметра или дефолтный (embedded для production, mock для dev)
  const defaultMode: PaymentMode = process.env.NODE_ENV === 'development' ? 'mock' : 'embedded'
  const [mode, setMode] = useState<PaymentMode>(modeParam || defaultMode)

  // Обновляем mode при изменении URL параметра
  useEffect(() => {
    if (modeParam && (modeParam === 'embedded' || modeParam === 'redirect' || modeParam === 'mock')) {
      setMode(modeParam)
    }
  }, [modeParam])

  return (
    <div className="space-y-4">
      {/* Переключатель режимов */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Способ оплаты</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2">
            <Button
              variant={mode === 'embedded' ? 'default' : 'outline'}
              className="justify-start"
              onClick={() => setMode('embedded')}
            >
              <CreditCard className="mr-2 size-4" />
              <div className="text-left flex-1">
                <div className="font-medium">Embedded виджет</div>
                <div className="text-xs opacity-80">Оплата на этой странице</div>
              </div>
            </Button>
            
            <Button
              variant={mode === 'redirect' ? 'default' : 'outline'}
              className="justify-start"
              onClick={() => setMode('redirect')}
            >
              <ExternalLink className="mr-2 size-4" />
              <div className="text-left flex-1">
                <div className="font-medium">Redirect</div>
                <div className="text-xs opacity-80">Перенаправление на ЮКасса</div>
              </div>
            </Button>

            {process.env.NODE_ENV === 'development' && (
              <Button
                variant={mode === 'mock' ? 'default' : 'outline'}
                className="justify-start"
                onClick={() => setMode('mock')}
              >
                <TestTube className="mr-2 size-4" />
                <div className="text-left flex-1">
                  <div className="font-medium">Mock (Тест)</div>
                  <div className="text-xs opacity-80">Без реальной оплаты</div>
                </div>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Рендер соответствующего виджета */}
      {mode === 'embedded' && (
        <YooKassaWidget product={product} profile={profile} />
      )}
      
      {mode === 'redirect' && (
        <RedirectPayment product={product} profile={profile} />
      )}
      
      {mode === 'mock' && (
        <MockPaymentWidget product={product} profile={profile} />
      )}
    </div>
  )
}

