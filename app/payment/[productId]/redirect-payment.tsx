'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ExternalLink, Loader2, AlertCircle } from "lucide-react"
import type { Product, Profile } from "@/types/database"

interface RedirectPaymentProps {
  product: Product
  profile: Profile
}

export function RedirectPayment({ product, profile }: RedirectPaymentProps) {
  const [saveCard, setSaveCard] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const handlePayment = async () => {
    setProcessing(true)
    setError('')

    try {
      console.log('[YooKassa Redirect] Creating payment...')
      
      // Создаем платеж с типом подтверждения redirect
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          savePaymentMethod: saveCard,
          confirmationType: 'redirect' // Указываем тип подтверждения
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.details || 'Не удалось создать платеж')
      }

      const data = await response.json()

      if (!data.success || !data.confirmationUrl) {
        throw new Error(data.error || 'Не удалось получить URL для оплаты')
      }

      console.log('[YooKassa Redirect] Redirecting to:', data.confirmationUrl)
      
      // Перенаправляем пользователя на страницу оплаты ЮКассы
      window.location.href = data.confirmationUrl

    } catch (err: any) {
      console.error('[YooKassa Redirect] Payment creation error:', err)
      setError(err.message || 'Произошла ошибка при создании платежа')
      setProcessing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Оплата (Redirect)</CardTitle>
        <CardDescription>
          Вы будете перенаправлены на безопасную страницу оплаты ЮKassa
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Чекбокс сохранения карты */}
        <div className="flex items-start space-x-3">
          <Checkbox 
            id="save-card" 
            checked={saveCard}
            onCheckedChange={(checked) => setSaveCard(checked as boolean)}
            disabled={processing}
          />
          <div className="space-y-1">
            <label
              htmlFor="save-card"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Сохранить карту для автопродления
            </label>
            <p className="text-xs text-muted-foreground">
              Рекомендуется для автоматического продления подписки
            </p>
          </div>
        </div>

        {/* Итого */}
        <div className="rounded-lg bg-muted p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Подписка:</span>
            <span className="font-medium">{product.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Период:</span>
            <span className="font-medium">
              {product.duration_months} {product.duration_months === 1 ? 'месяц' : product.duration_months! < 5 ? 'месяца' : 'месяцев'}
            </span>
          </div>
          <div className="border-t pt-2 flex justify-between">
            <span className="font-semibold">Итого:</span>
            <span className="text-xl font-bold">{product.price} ₽</span>
          </div>
        </div>

        {/* Информация о процессе */}
        <div className="rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 p-4 space-y-2 text-sm">
          <p className="font-medium text-blue-900 dark:text-blue-100">
            📋 Как это работает:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-200">
            <li>Нажмите кнопку "Перейти к оплате"</li>
            <li>Вы будете перенаправлены на страницу ЮКасса</li>
            <li>Введите данные карты и подтвердите оплату</li>
            <li>После оплаты вы автоматически вернетесь на сайт</li>
          </ol>
        </div>

        {/* Сообщение об ошибке */}
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 p-3 text-sm text-red-800 dark:text-red-300 flex items-start gap-2">
            <AlertCircle className="size-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Кнопка оплаты */}
        <Button
          className="w-full"
          size="lg"
          onClick={handlePayment}
          disabled={processing}
        >
          {processing ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Перенаправление...
            </>
          ) : (
            <>
              <ExternalLink className="mr-2 size-4" />
              Перейти к оплате {product.price} ₽
            </>
          )}
        </Button>

        {/* Информация о безопасности */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>✓ Безопасное соединение SSL</p>
          <p>✓ Оплата на защищенной странице ЮКасса</p>
          <p>✓ Автопродление можно отключить в любое время</p>
        </div>
      </CardContent>
    </Card>
  )
}

