'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Crown, CreditCard, History, AlertCircle } from "lucide-react"
import Link from "next/link"
import type { Profile } from "@/types/database"
import { UpgradeDialog } from './upgrade-dialog'

interface Transaction {
  id: string
  yookassa_payment_id: string
  status: string
  amount: number
  created_at: string
}

interface SubscriptionManagerProps {
  profile: Profile
}

export function SubscriptionManager({ profile }: SubscriptionManagerProps) {
  const [autoRenew, setAutoRenew] = useState(profile.auto_renew_enabled || false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showTransactions, setShowTransactions] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  // Загрузить транзакции
  const loadTransactions = async () => {
    if (transactions.length > 0) {
      setShowTransactions(!showTransactions)
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/payments/transactions')
      const data = await response.json()
      setTransactions(data)
      setShowTransactions(true)
    } catch (error) {
      console.error('Error loading transactions:', error)
      setMessage('❌ Ошибка загрузки истории')
    } finally {
      setLoading(false)
    }
  }

  // Переключить автопродление
  const handleToggleAutoRenew = async (enabled: boolean) => {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/payments/toggle-auto-renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      })

      const data = await response.json()

      if (data.success) {
        setAutoRenew(enabled)
        setMessage(`✅ ${data.message}`)
      } else {
        setMessage(`❌ ${data.error || 'Не удалось изменить настройки'}`)
        setAutoRenew(!enabled) // Вернуть назад
      }
    } catch (error) {
      console.error('Error toggling auto-renew:', error)
      setMessage('❌ Ошибка при изменении настроек')
      setAutoRenew(!enabled)
    } finally {
      setLoading(false)
    }
  }

  // Полностью отменить подписку (для тестирования)
  const handleCancelSubscription = async () => {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/payments/cancel-full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()

      if (data.success) {
        setMessage(`✅ ${data.message}`)
        // Перезагрузить страницу через 2 секунды
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setMessage(`❌ ${data.error || 'Не удалось отменить подписку'}`)
      }
    } catch (error) {
      console.error('Error canceling subscription:', error)
      setMessage('❌ Ошибка при отмене подписки')
    } finally {
      setLoading(false)
      setShowCancelConfirm(false)
    }
  }

  const hasActiveSubscription = profile.subscription_status === 'active'
  const hasPaymentMethod = !!profile.payment_method_id
  const subscriptionExpires = profile.subscription_expires_at 
    ? new Date(profile.subscription_expires_at).toLocaleDateString('ru-RU')
    : null

  return (
    <div className="space-y-6">
      {/* Информация о подписке */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="size-5" />
            Управление подпиской
          </CardTitle>
          <CardDescription>
            Информация о вашей текущей подписке и настройки
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Текущий тариф */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">
                {profile.subscription_tier === 'basic' ? 'Basic' :
                 profile.subscription_tier === 'pro' ? 'Pro' :
                 profile.subscription_tier === 'elite' ? 'Elite' : 'Free'}
              </p>
              <p className="text-sm text-muted-foreground">
                {hasActiveSubscription 
                  ? `Активна до ${subscriptionExpires}`
                  : 'Подписка неактивна'}
              </p>
            </div>
            <Link href="/pricing">
              <Button variant="outline">
                {profile.subscription_tier === 'free' ? 'Оформить подписку' : 'Изменить план'}
              </Button>
            </Link>
          </div>

          {/* Апгрейд подписки */}
          {hasActiveSubscription && profile.subscription_tier !== 'elite' && (
            <div className="rounded-lg border-2 border-dashed border-primary/50 bg-primary/5 p-4">
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-sm">🚀 Хотите больше возможностей?</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Повысьте тариф и получите бонусные дни за остаток текущей подписки
                  </p>
                </div>
                <UpgradeDialog profile={profile} />
              </div>
            </div>
          )}

          {/* Автопродление */}
          {hasActiveSubscription && (
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-medium">Автоматическое продление</p>
                  <p className="text-sm text-muted-foreground">
                    {autoRenew 
                      ? 'Подписка будет продлеваться автоматически'
                      : 'Подписка завершится в конце периода'}
                  </p>
                </div>
                <Switch
                  checked={autoRenew}
                  onCheckedChange={handleToggleAutoRenew}
                  disabled={loading || !hasPaymentMethod}
                />
              </div>

              {!hasPaymentMethod && (
                <div className="flex items-start gap-2 rounded-md bg-yellow-50 dark:bg-yellow-950 p-3 text-sm text-yellow-800 dark:text-yellow-300">
                  <AlertCircle className="size-4 mt-0.5 flex-shrink-0" />
                  <p>
                    Для включения автопродления необходимо привязать карту. Оформите новую подписку с сохранением карты.
                  </p>
                </div>
              )}

              {message && (
                <div className="rounded-md bg-muted p-3 text-sm">
                  {message}
                </div>
              )}
            </div>
          )}

          {/* Привязанная карта */}
          {hasPaymentMethod && (
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <CreditCard className="size-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium text-sm">Привязанная карта</p>
                <p className="text-xs text-muted-foreground">
                  Карта сохранена для автоматических платежей
                </p>
              </div>
              <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                ✓ Активна
              </div>
            </div>
          )}

          {/* Кнопка истории */}
          <Button
            variant="outline"
            className="w-full"
            onClick={loadTransactions}
            disabled={loading}
          >
            <History className="mr-2 size-4" />
            {showTransactions ? 'Скрыть историю платежей' : 'Показать историю платежей'}
          </Button>
        </CardContent>
      </Card>

      {/* История транзакций */}
      {showTransactions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="size-5" />
              История платежей
            </CardTitle>
            <CardDescription>
              Последние транзакции по вашему аккаунту
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Нет платежей
              </p>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {tx.amount} ₽
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleString('ru-RU')}
                      </p>
                    </div>
                    <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                      tx.status === 'succeeded' 
                        ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
                        : tx.status === 'pending'
                        ? 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300'
                        : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                    }`}>
                      {tx.status === 'succeeded' ? 'Успешно' :
                       tx.status === 'pending' ? 'В обработке' :
                       'Отменен'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Информация и отмена */}
      {hasActiveSubscription && (
        <Card className="border-dashed">
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              💡 Вы можете отменить подписку в любое время. Доступ сохранится до конца оплаченного периода
              {subscriptionExpires && ` (до ${subscriptionExpires})`}.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

