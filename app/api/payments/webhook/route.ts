/**
 * API Route: Webhook от ЮKassa
 * POST /api/payments/webhook
 * 
 * Принимает уведомления о статусе платежей от ЮKassa
 * Обрабатывает события: payment.succeeded, payment.canceled
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { verifyWebhookSignature } from '@/lib/services/yookassa'
import { processSuccessfulPayment, getProductById } from '@/lib/services/subscription-manager'
import { sendPaymentSuccessEmail } from '@/lib/services/email'
import type { Database } from '@/types/supabase'

export async function POST(request: NextRequest) {
  try {
    // Получить тело запроса
    const body = await request.text()
    const signature = request.headers.get('x-yookassa-signature')
    
    // Проверка подписи (безопасность)
    if (!verifyWebhookSignature(body, signature)) {
      console.error('Invalid webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 403 }
      )
    }

    // Парсинг JSON с обработкой ошибок
    let webhookData
    try {
      webhookData = JSON.parse(body)
    } catch (parseError) {
      console.error('Failed to parse webhook body:', parseError)
      console.error('Body content:', body)
      return NextResponse.json(
        { error: 'Invalid JSON in webhook body' },
        { status: 400 }
      )
    }
    const { event, object: payment } = webhookData

    console.log(`[Webhook] Received event: ${event}, payment: ${payment.id}`)
    console.log('[Webhook] Full payment object:', JSON.stringify(payment, null, 2))
    console.log('[Webhook] Payment method:', payment.payment_method)

    // Создать Supabase клиент с service role (обходим RLS)
    const supabase = createServiceClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Найти транзакцию в БД
    const { data: transaction, error: txError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('yookassa_payment_id', payment.id)
      .single()

    if (txError || !transaction) {
      console.error('Transaction not found:', payment.id)
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Обработка событий
    switch (event) {
      case 'payment.succeeded': {
        console.log(`[Webhook] Payment succeeded: ${payment.id}`)

        // Обновить статус транзакции
        await supabase
          .from('payment_transactions')
          .update({
            status: 'succeeded',
            payment_method_id: payment.payment_method?.id || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', transaction.id)

        // Обработать успешный платеж (обновить подписку)
        const result = await processSuccessfulPayment({
          userId: transaction.user_id,
          productId: transaction.product_id!,
          paymentMethodId: payment.payment_method?.id
        })

        if (!result.success) {
          console.error('Failed to process successful payment:', result.error)
          return NextResponse.json(
            { error: 'Failed to process payment' },
            { status: 500 }
          )
        }

        console.log(`[Webhook] Successfully processed payment for user ${transaction.user_id}`)
        
        // Отправка email уведомления об успешной оплате
        const product = await getProductById(transaction.product_id!)
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, full_name, subscription_expires_at')
          .eq('id', transaction.user_id)
          .single()
        
        if (product && profile) {
          sendPaymentSuccessEmail({
            to: profile.email!,
            userName: profile.full_name || undefined,
            planName: product.name,
            amount: Number(transaction.amount),
            duration: product.duration_months,
            expiresAt: profile.subscription_expires_at!
          }).catch(err => {
            console.error('[Webhook] Failed to send payment success email:', err)
          })
        }
        
        break
      }

      case 'payment.canceled': {
        console.log(`[Webhook] Payment canceled: ${payment.id}`)

        // Обновить статус транзакции
        await supabase
          .from('payment_transactions')
          .update({
            status: 'canceled',
            error_message: payment.cancellation_details?.reason || 'Canceled',
            updated_at: new Date().toISOString()
          })
          .eq('id', transaction.id)

        break
      }

      default:
        console.log(`[Webhook] Unknown event: ${event}`)
    }

    // Вернуть успех (важно для ЮKassa)
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error in webhook handler:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Отключаем проверку body size для webhook
export const config = {
  api: {
    bodyParser: false,
  },
}

