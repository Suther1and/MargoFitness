'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CreditCard, Loader2, CheckCircle2 } from "lucide-react"
import { useRouter } from 'next/navigation'
import type { Product, Profile } from "@/types/database"

interface MockPaymentWidgetProps {
  product: Product
  profile: Profile
}

export function MockPaymentWidget({ product, profile }: MockPaymentWidgetProps) {
  const router = useRouter()
  const [saveCard, setSaveCard] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handlePayment = async () => {
    setProcessing(true)
    setError('')

    try {
      // Шаг 1: Создать платеж
      const createResponse = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          savePaymentMethod: saveCard
        })
      })

      if (!createResponse.ok) {
        const errorText = await createResponse.text()
        console.error('Create payment failed:', errorText)
        throw new Error('Не удалось создать платеж. Проверьте консоль для деталей.')
      }

      let createData
      try {
        createData = await createResponse.json()
      } catch (parseError) {
        console.error('Failed to parse create response:', parseError)
        throw new Error('Ошибка парсинга ответа от сервера')
      }

      if (!createData.success || !createData.paymentId) {
        throw new Error(createData.error || createData.details || 'Не удалось создать платеж')
      }

      // Имитация задержки (как будто пользователь вводит данные карты)
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Шаг 2: Имитировать успешный webhook
      const webhookData = {
        event: 'payment.succeeded',
        object: {
          id: createData.paymentId,
          status: 'succeeded',
          paid: true,
          amount: {
            value: product.price.toString() + '.00',
            currency: 'RUB'
          },
          payment_method: {
            type: 'bank_card',
            id: `mock_card_${Date.now()}`,
            saved: saveCard
          }
        }
      }

      const webhookResponse = await fetch('/api/payments/webhook', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-yookassa-signature': 'mock_signature' // Для mock режима
        },
        body: JSON.stringify(webhookData)
      })

      if (!webhookResponse.ok) {
        const errorText = await webhookResponse.text()
        console.error('Webhook failed:', errorText)
        throw new Error('Ошибка обработки платежа на сервере')
      }

      let webhookResult
      try {
        webhookResult = await webhookResponse.json()
      } catch (parseError) {
        console.error('Failed to parse webhook response:', parseError)
        throw new Error('Ошибка парсинга ответа webhook')
      }

      if (!webhookResult.success) {
        throw new Error(webhookResult.error || 'Ошибка обработки платежа')
      }

      // Успех!
      setSuccess(true)
      
      // Перенаправить на dashboard через 2 секунды
      setTimeout(() => {
        router.push('/dashboard?payment=success')
      }, 2000)

    } catch (err: any) {
      console.error('Payment error:', err)
      setError(err.message || 'Произошла ошибка при оплате')
      setProcessing(false)
    }
  }

  if (success) {
    return (
      <Card className="border-green-500 bg-green-50 dark:bg-green-950">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="rounded-full bg-green-500 p-3">
              <CheckCircle2 className="size-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-green-700 dark:text-green-300">
                Оплата прошла успешно!
              </h3>
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                Подписка активирована. Перенаправляем в личный кабинет...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Оплата</CardTitle>
        <CardDescription>
          {process.env.NODE_ENV === 'development' 
            ? '🧪 Тестовый режим - платеж будет имитирован'
            : 'Безопасная оплата через ЮKassa'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mock карточка */}
        <div className="rounded-lg border-2 border-dashed p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <CreditCard className="size-4" />
            Данные карты (mock)
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>💳 Карта: •••• •••• •••• 4242</p>
            <p>📅 Срок: 12/25</p>
            <p>🔒 CVV: •••</p>
          </div>
        </div>

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

        {/* Сообщение об ошибке */}
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 p-3 text-sm text-red-800 dark:text-red-300">
            {error}
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
              Обработка платежа...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 size-4" />
              Оплатить {product.price} ₽
            </>
          )}
        </Button>

        {/* Подсказка для теста */}
        {process.env.NODE_ENV === 'development' && (
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 p-3 text-xs text-blue-800 dark:text-blue-300">
            <p className="font-medium mb-1">ℹ️ Тестовый режим</p>
            <p>
              При нажатии "Оплатить" будет создан mock-платеж и автоматически активирована подписка.
              Реальные деньги не списываются.
            </p>
          </div>
        )}

        {/* Информация */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>✓ Безопасное соединение SSL</p>
          <p>✓ Данные карты не сохраняются на нашем сервере</p>
          <p>✓ Автопродление можно отключить в любое время</p>
        </div>
      </CardContent>
    </Card>
  )
}

