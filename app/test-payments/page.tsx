/**
 * Временная страница для тестирования Payment API
 * Доступна только в development режиме
 */

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  id: string
  email: string
  subscription_status: string
  subscription_tier: string | null
  auto_renew_enabled: boolean
  subscription_expires_at: string | null
  payment_method_id: string | null
  last_payment_date: string | null
}

interface Transaction {
  id: string
  yookassa_payment_id: string
  status: string
  amount: number
  created_at: string
}

export default function TestPaymentsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [lastPaymentId, setLastPaymentId] = useState('')

  // Загрузить профиль
  const loadProfile = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setMessage('❌ Вы не авторизованы')
      return
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      setMessage(`❌ Ошибка загрузки профиля: ${error.message}`)
    } else {
      setProfile(data)
    }
  }

  // Загрузить транзакции
  const loadTransactions = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    const { data, error } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    if (!error && data) {
      setTransactions(data)
    }
  }

  useEffect(() => {
    loadProfile()
    loadTransactions()
  }, [])

  // Тест 1: Создать платеж
  const handleCreatePayment = async () => {
    setLoading(true)
    setMessage('⏳ Создание платежа...')

    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: 'dd54b1a7-4d58-41f7-a54b-0dd6c324defb', // Basic 1 месяц
          savePaymentMethod: true
        })
      })

      const data = await response.json()

      if (data.paymentId) {
        setLastPaymentId(data.paymentId)
        setMessage(`✅ Платеж создан! ID: ${data.paymentId}`)
        await loadTransactions()
      } else {
        setMessage(`❌ Ошибка: ${data.error || 'Неизвестная ошибка'}`)
      }
    } catch (error) {
      setMessage(`❌ Ошибка: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  // Тест 3: Имитация webhook
  const handleSimulateWebhook = async () => {
    if (!lastPaymentId) {
      setMessage('❌ Сначала создайте платеж!')
      return
    }

    setLoading(true)
    setMessage('⏳ Имитация успешного платежа...')

    try {
      const webhookData = {
        event: 'payment.succeeded',
        object: {
          id: lastPaymentId,
          status: 'succeeded',
          paid: true,
          amount: {
            value: '3999.00',
            currency: 'RUB'
          },
          payment_method: {
            type: 'bank_card',
            id: 'mock_payment_method_123',
            saved: true
          }
        }
      }

      const response = await fetch('/api/payments/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookData)
      })

      const data = await response.json()

      if (data.success) {
        setMessage('✅ Webhook обработан! Подписка активирована!')
        await loadProfile()
        await loadTransactions()
      } else {
        setMessage(`❌ Ошибка: ${data.error || 'Неизвестная ошибка'}`)
      }
    } catch (error) {
      setMessage(`❌ Ошибка: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  // Тест 4: Переключить автопродление
  const handleToggleAutoRenew = async (enabled: boolean) => {
    setLoading(true)
    setMessage(`⏳ ${enabled ? 'Включение' : 'Отключение'} автопродления...`)

    try {
      const response = await fetch('/api/payments/toggle-auto-renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      })

      const data = await response.json()

      if (data.success) {
        setMessage(`✅ ${data.message}`)
        await loadProfile()
      } else {
        setMessage(`❌ Ошибка: ${data.error || 'Неизвестная ошибка'}`)
      }
    } catch (error) {
      setMessage(`❌ Ошибка: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  // Обновить данные
  const handleRefresh = async () => {
    setMessage('⏳ Обновление данных...')
    await loadProfile()
    await loadTransactions()
    setMessage('✅ Данные обновлены')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            🧪 Тестирование Payment API
          </h1>
          <p className="text-gray-300">
            Временная страница для тестирования платежной системы
          </p>
        </div>

        {/* Текущий профиль */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">👤 Ваш профиль</h2>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              🔄 Обновить
            </button>
          </div>
          
          {profile ? (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Email:</span>
                <p className="text-white font-medium">{profile.email}</p>
              </div>
              <div>
                <span className="text-gray-400">Статус подписки:</span>
                <p className="text-white font-medium">
                  {profile.subscription_status || 'inactive'}
                </p>
              </div>
              <div>
                <span className="text-gray-400">Тариф:</span>
                <p className="text-white font-medium">
                  {profile.subscription_tier || 'Free'}
                </p>
              </div>
              <div>
                <span className="text-gray-400">Автопродление:</span>
                <p className="text-white font-medium">
                  {profile.auto_renew_enabled ? '✅ Включено' : '❌ Отключено'}
                </p>
              </div>
              <div>
                <span className="text-gray-400">Истекает:</span>
                <p className="text-white font-medium">
                  {profile.subscription_expires_at 
                    ? new Date(profile.subscription_expires_at).toLocaleDateString('ru-RU')
                    : '-'
                  }
                </p>
              </div>
              <div>
                <span className="text-gray-400">Payment Method ID:</span>
                <p className="text-white font-medium text-xs">
                  {profile.payment_method_id || '-'}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">Загрузка...</p>
          )}
        </div>

        {/* Действия */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">⚡ Действия</h2>
          
          <div className="space-y-3">
            {/* Шаг 1 */}
            <div className="flex items-center gap-4">
              <span className="text-white font-bold w-8">1.</span>
              <button
                onClick={handleCreatePayment}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                💳 Создать платеж (Basic 1 месяц, 3999₽)
              </button>
            </div>

            {/* Шаг 2 */}
            <div className="flex items-center gap-4">
              <span className="text-white font-bold w-8">2.</span>
              <button
                onClick={handleSimulateWebhook}
                disabled={loading || !lastPaymentId}
                className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                ✅ Имитировать успешный платеж (webhook)
              </button>
            </div>

            {/* Шаг 3 */}
            <div className="flex items-center gap-4">
              <span className="text-white font-bold w-8">3.</span>
              <div className="flex-1 flex gap-2">
                <button
                  onClick={() => handleToggleAutoRenew(false)}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  ⏸️ Отключить автопродление
                </button>
                <button
                  onClick={() => handleToggleAutoRenew(true)}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  ▶️ Включить автопродление
                </button>
              </div>
            </div>
          </div>

          {/* Сообщение */}
          {message && (
            <div className="mt-4 p-4 bg-white/10 rounded-lg">
              <p className="text-white text-sm">{message}</p>
              {lastPaymentId && (
                <p className="text-gray-400 text-xs mt-2">
                  Last Payment ID: {lastPaymentId}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Последние транзакции */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            📋 Последние транзакции
          </h2>
          
          {transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="bg-white/5 rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="text-white font-medium text-sm">
                      {tx.yookassa_payment_id}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {new Date(tx.created_at).toLocaleString('ru-RU')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">{tx.amount}₽</p>
                    <p className={`text-xs ${
                      tx.status === 'succeeded' ? 'text-green-400' :
                      tx.status === 'pending' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {tx.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">
              Нет транзакций
            </p>
          )}
        </div>

        {/* Инструкция */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 mt-6">
          <h3 className="text-yellow-300 font-bold mb-2">ℹ️ Инструкция</h3>
          <ol className="text-yellow-200/80 text-sm space-y-1 list-decimal list-inside">
            <li>Создайте платеж кнопкой "Создать платеж"</li>
            <li>Имитируйте успешную оплату кнопкой "Имитировать успешный платеж"</li>
            <li>Проверьте что подписка активировалась (статус: active, тариф: basic)</li>
            <li>Попробуйте отключить/включить автопродление</li>
            <li>Нажимайте "Обновить" чтобы увидеть изменения</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

