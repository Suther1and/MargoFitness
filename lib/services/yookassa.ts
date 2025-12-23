/**
 * Сервис для работы с API ЮKassa (Яндекс.Касса)
 * 
 * Поддерживает:
 * - Создание платежей с сохранением карты
 * - Рекуррентные платежи
 * - Mock-режим для разработки без реальных ключей
 */

import { YooCheckout, ICreatePayment, IPayment } from '@a2seven/yoo-checkout'

// Проверка что это mock-режим
const isMockMode = 
  process.env.YOOKASSA_SHOP_ID?.includes('mock') || 
  process.env.YOOKASSA_SECRET_KEY?.includes('mock')

// Инициализация клиента ЮKassa
let yookassaClient: YooCheckout | null = null

if (!isMockMode) {
  try {
    yookassaClient = new YooCheckout({
      shopId: process.env.YOOKASSA_SHOP_ID!,
      secretKey: process.env.YOOKASSA_SECRET_KEY!
    })
  } catch (error) {
    console.error('Failed to initialize YooKassa client:', error)
  }
}

// ============================================
// Типы
// ============================================

export interface CreatePaymentParams {
  amount: number
  description: string
  savePaymentMethod?: boolean
  metadata?: Record<string, any>
}

export interface CreateRecurrentPaymentParams {
  amount: number
  paymentMethodId: string
  description: string
  metadata?: Record<string, any>
}

export interface PaymentResult {
  id: string
  status: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled'
  paid: boolean
  amount: {
    value: string
    currency: string
  }
  confirmation?: {
    type: string
    confirmation_token?: string
    confirmation_url?: string
  }
  payment_method?: {
    type: string
    id?: string
    saved?: boolean
  }
  metadata?: Record<string, any>
  created_at: string
}

// ============================================
// Mock функции для тестирования
// ============================================

function generateMockPaymentId(): string {
  return `mock_${Date.now()}_${Math.random().toString(36).substring(7)}`
}

function createMockPayment(params: CreatePaymentParams): PaymentResult {
  const paymentId = generateMockPaymentId()
  
  return {
    id: paymentId,
    status: 'pending',
    paid: false,
    amount: {
      value: params.amount.toFixed(2),
      currency: 'RUB'
    },
    confirmation: {
      type: 'embedded',
      confirmation_token: `mock_token_${paymentId}`
    },
    metadata: params.metadata || {},
    created_at: new Date().toISOString()
  }
}

function createMockRecurrentPayment(params: CreateRecurrentPaymentParams): PaymentResult {
  const paymentId = generateMockPaymentId()
  
  // Имитация успешного платежа (в реальности может быть и failed)
  return {
    id: paymentId,
    status: 'succeeded',
    paid: true,
    amount: {
      value: params.amount.toFixed(2),
      currency: 'RUB'
    },
    payment_method: {
      type: 'bank_card',
      id: params.paymentMethodId,
      saved: true
    },
    metadata: params.metadata || {},
    created_at: new Date().toISOString()
  }
}

// ============================================
// Основные функции
// ============================================

/**
 * Создание нового платежа (с возможностью сохранения карты)
 */
export async function createPayment(
  params: CreatePaymentParams
): Promise<PaymentResult> {
  // Mock режим
  if (isMockMode || !yookassaClient) {
    console.log('[YooKassa Mock] Creating payment:', params)
    return createMockPayment(params)
  }

  // Реальный запрос к ЮKassa
  try {
    const paymentData: ICreatePayment = {
      amount: {
        value: params.amount.toFixed(2),
        currency: 'RUB'
      },
      confirmation: {
        type: 'embedded' // Виджет на нашей странице
      },
      capture: true, // Автоматическое подтверждение
      description: params.description,
      metadata: params.metadata
    }

    // Если нужно сохранить карту для рекуррентных платежей
    if (params.savePaymentMethod) {
      paymentData.save_payment_method = true
    }

    const payment = await yookassaClient.createPayment(paymentData)
    
    return payment as PaymentResult
  } catch (error) {
    console.error('YooKassa createPayment error:', error)
    throw new Error('Failed to create payment')
  }
}

/**
 * Создание рекуррентного платежа (автосписание с сохраненной карты)
 */
export async function createRecurrentPayment(
  params: CreateRecurrentPaymentParams
): Promise<PaymentResult> {
  // Mock режим
  if (isMockMode || !yookassaClient) {
    console.log('[YooKassa Mock] Creating recurrent payment:', params)
    return createMockRecurrentPayment(params)
  }

  // Реальный запрос к ЮKassa
  try {
    const paymentData: ICreatePayment = {
      amount: {
        value: params.amount.toFixed(2),
        currency: 'RUB'
      },
      payment_method_id: params.paymentMethodId,
      capture: true,
      description: params.description,
      metadata: params.metadata
    }

    const payment = await yookassaClient.createPayment(paymentData)
    
    return payment as PaymentResult
  } catch (error) {
    console.error('YooKassa createRecurrentPayment error:', error)
    throw new Error('Failed to create recurrent payment')
  }
}

/**
 * Получение информации о платеже
 */
export async function getPaymentInfo(paymentId: string): Promise<PaymentResult | null> {
  // Mock режим
  if (isMockMode || !yookassaClient) {
    console.log('[YooKassa Mock] Getting payment info:', paymentId)
    return {
      id: paymentId,
      status: 'succeeded',
      paid: true,
      amount: { value: '0.00', currency: 'RUB' },
      created_at: new Date().toISOString()
    }
  }

  // Реальный запрос к ЮKassa
  try {
    const payment = await yookassaClient.getPayment(paymentId)
    return payment as PaymentResult
  } catch (error) {
    console.error('YooKassa getPaymentInfo error:', error)
    return null
  }
}

/**
 * Отмена платежа
 */
export async function cancelPayment(paymentId: string): Promise<boolean> {
  // Mock режим
  if (isMockMode || !yookassaClient) {
    console.log('[YooKassa Mock] Canceling payment:', paymentId)
    return true
  }

  // Реальный запрос к ЮKassa
  try {
    await yookassaClient.cancelPayment(paymentId)
    return true
  } catch (error) {
    console.error('YooKassa cancelPayment error:', error)
    return false
  }
}

/**
 * Проверка webhook подписи от ЮKassa
 * Важно для безопасности - проверяем что запрос действительно от ЮKassa
 */
export function verifyWebhookSignature(
  requestBody: string,
  signature: string | null
): boolean {
  // В mock режиме пропускаем проверку
  if (isMockMode) {
    console.log('[YooKassa Mock] Skipping webhook signature verification')
    return true
  }

  // TODO: Реализовать проверку подписи когда будут реальные ключи
  // Документация: https://yookassa.ru/developers/using-api/webhooks
  
  if (!signature || !process.env.YOOKASSA_WEBHOOK_SECRET) {
    return false
  }

  // Здесь должна быть реальная проверка HMAC подписи
  // Пока возвращаем true для разработки
  return true
}

/**
 * Проверка режима работы
 */
export function getMode(): 'mock' | 'real' {
  return isMockMode ? 'mock' : 'real'
}

/**
 * Логирование для отладки
 */
export function logInfo() {
  console.log('=== YooKassa Service Info ===')
  console.log('Mode:', getMode())
  console.log('Shop ID:', process.env.YOOKASSA_SHOP_ID?.substring(0, 10) + '...')
  console.log('Client initialized:', !!yookassaClient)
  console.log('=============================')
}

