/**
 * Сервис для работы с API ЮKassa (Яндекс.Касса)
 * 
 * Поддерживает:
 * - Создание платежей с сохранением карты
 * - Рекуррентные платежи
 * - Проверка webhook подписи (HMAC-SHA256)
 * - Mock-режим для разработки без реальных ключей
 */

import { YooCheckout, ICreatePayment, Payment } from '@a2seven/yoo-checkout'
import { createHmac } from 'crypto'

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
  confirmationType?: 'embedded' | 'redirect'
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
  const confirmationType = params.confirmationType || 'embedded'
  
  return {
    id: paymentId,
    status: 'pending',
    paid: false,
    amount: {
      value: params.amount.toFixed(2),
      currency: 'RUB'
    },
    confirmation: confirmationType === 'embedded' 
      ? {
          type: 'embedded',
          confirmation_token: `mock_token_${paymentId}`
        }
      : {
          type: 'redirect',
          confirmation_url: `https://yoomoney.ru/checkout/payments/v2/contract?orderId=${paymentId}`
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
    const confirmationType = params.confirmationType || 'embedded'
    
    const paymentData: ICreatePayment = {
      amount: {
        value: params.amount.toFixed(2),
        currency: 'RUB'
      },
      confirmation: confirmationType === 'embedded'
        ? {
            type: 'embedded' // Виджет на нашей странице
          }
        : {
            type: 'redirect', // Перенаправление на страницу ЮКассы
            return_url: process.env.NEXT_PUBLIC_YOOKASSA_RETURN_URL || `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?payment=success`
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
 * 
 * ЮКасса отправляет подпись в заголовке X-Yookassa-Signature
 * Подпись - это HMAC-SHA256 хеш от тела запроса с использованием webhook secret
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

  // Проверка наличия подписи и секрета
  if (!signature || !process.env.YOOKASSA_WEBHOOK_SECRET) {
    console.error('[YooKassa] Missing signature or webhook secret')
    return false
  }

  try {
    // Создаем HMAC-SHA256 хеш от тела запроса
    const hmac = createHmac('sha256', process.env.YOOKASSA_WEBHOOK_SECRET)
    hmac.update(requestBody)
    const calculatedSignature = hmac.digest('hex')

    // Сравниваем подписи (защита от timing attacks)
    const signatureBuffer = Buffer.from(signature, 'hex')
    const calculatedBuffer = Buffer.from(calculatedSignature, 'hex')

    if (signatureBuffer.length !== calculatedBuffer.length) {
      console.error('[YooKassa] Signature length mismatch')
      return false
    }

    // Используем crypto.timingSafeEqual для защиты от timing attacks
    const { timingSafeEqual } = require('crypto')
    const isValid = timingSafeEqual(signatureBuffer, calculatedBuffer)

    if (!isValid) {
      console.error('[YooKassa] Invalid webhook signature')
    }

    return isValid
  } catch (error) {
    console.error('[YooKassa] Error verifying webhook signature:', error)
    return false
  }
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

