'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { YooKassaWidget } from './yookassa-widget'
import { RedirectPayment } from './redirect-payment'
import { CreditCard, ExternalLink } from 'lucide-react'
import type { Product, Profile } from "@/types/database"
import type { PriceCalculation } from '@/lib/services/price-calculator'

interface PaymentWidgetSwitcherProps {
  product: Product
  profile: Profile
  onCalculationChange?: (calculation: PriceCalculation | null) => void
  action?: 'renewal' | 'upgrade'
}

type PaymentMode = 'embedded' | 'redirect'

export function PaymentWidgetSwitcher({ product, profile, onCalculationChange, action }: PaymentWidgetSwitcherProps) {
  const searchParams = useSearchParams()
  const modeParam = searchParams.get('mode') as PaymentMode | null
  
  const [mode, setMode] = useState<PaymentMode>(modeParam || 'embedded')

  useEffect(() => {
    if (modeParam && (modeParam === 'embedded' || modeParam === 'redirect')) {
      setMode(modeParam)
    }
  }, [modeParam])

  return (
    <div className="space-y-4">
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
          </div>
        </CardContent>
      </Card>

      {mode === 'embedded' && (
        <YooKassaWidget 
          product={product} 
          profile={profile}
          onCalculationChange={onCalculationChange}
          action={action}
        />
      )}
      
      {mode === 'redirect' && (
        <RedirectPayment 
          product={product} 
          profile={profile}
          onCalculationChange={onCalculationChange}
          action={action}
        />
      )}
    </div>
  )
}
