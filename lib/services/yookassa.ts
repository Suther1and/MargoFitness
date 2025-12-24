import { YooCheckout, ICreatePayment, Payment } from '@a2seven/yoo-checkout'
import { createHmac, timingSafeEqual } from 'crypto'

const yookassaClient = new YooCheckout({
  shopId: process.env.YOOKASSA_SHOP_ID!,
  secretKey: process.env.YOOKASSA_SECRET_KEY!
})

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

export async function createPayment(
  params: CreatePaymentParams
): Promise<PaymentResult> {
  try {
    const confirmationType = params.confirmationType || 'embedded'
    
    const paymentData: ICreatePayment = {
      amount: {
        value: params.amount.toFixed(2),
        currency: 'RUB'
      },
      confirmation: confirmationType === 'embedded'
        ? {
            type: 'embedded'
          }
        : {
            type: 'redirect',
            return_url: process.env.NEXT_PUBLIC_YOOKASSA_RETURN_URL || `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?payment=success`
          },
      capture: true,
      description: params.description,
      metadata: params.metadata
    }

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

export async function createRecurrentPayment(
  params: CreateRecurrentPaymentParams
): Promise<PaymentResult> {
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

export async function getPaymentInfo(paymentId: string): Promise<PaymentResult | null> {
  try {
    const payment = await yookassaClient.getPayment(paymentId)
    return payment as PaymentResult
  } catch (error) {
    console.error('YooKassa getPaymentInfo error:', error)
    return null
  }
}

export async function cancelPayment(paymentId: string): Promise<boolean> {
  try {
    await yookassaClient.cancelPayment(paymentId)
    return true
  } catch (error) {
    console.error('YooKassa cancelPayment error:', error)
    return false
  }
}

export function verifyWebhookSignature(
  requestBody: string,
  signature: string | null
): boolean {
  const isTestMode = process.env.YOOKASSA_SECRET_KEY?.startsWith('test_')
  
  if (isTestMode && !process.env.YOOKASSA_WEBHOOK_SECRET) {
    console.log('YooKassa test mode: skipping webhook signature verification')
    return true
  }

  if (!signature || !process.env.YOOKASSA_WEBHOOK_SECRET) {
    console.error('YooKassa: missing signature or webhook secret')
    return false
  }

  try {
    const hmac = createHmac('sha256', process.env.YOOKASSA_WEBHOOK_SECRET)
    hmac.update(requestBody)
    const calculatedSignature = hmac.digest('hex')

    const signatureBuffer = Buffer.from(signature, 'hex')
    const calculatedBuffer = Buffer.from(calculatedSignature, 'hex')

    if (signatureBuffer.length !== calculatedBuffer.length) {
      console.error('YooKassa: signature length mismatch')
      return false
    }

    const isValid = timingSafeEqual(signatureBuffer, calculatedBuffer)

    if (!isValid) {
      console.error('YooKassa: invalid webhook signature')
    }

    return isValid
  } catch (error) {
    console.error('YooKassa: error verifying webhook signature:', error)
    return false
  }
}
