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

// Импорт бонусной системы
import { awardCashback, spendBonusesOnPayment } from '@/lib/actions/bonuses'
import { handleReferralPurchase } from '@/lib/actions/referrals'
import { incrementPromoUsage } from '@/lib/actions/promo-codes'

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
        console.log(`[Webhook] Payment type: ${transaction.payment_type}`)
        
        // Получаем action из metadata
        const metadata = transaction.metadata as any
        const action = metadata?.action || 'purchase'
        const actualPaidAmount = metadata?.finalPrice || Number(transaction.amount)
        
        console.log(`[Webhook] Processing payment with action: ${action}, actualPaidAmount: ${actualPaidAmount}`)
        
        const result = await processSuccessfulPayment({
          userId: transaction.user_id,
          productId: transaction.product_id!,
          paymentMethodId: payment.payment_method?.id,
          action: action as 'purchase' | 'renewal' | 'upgrade',
          actualPaidAmount: actualPaidAmount,
          paymentId: payment.id
        })

        if (!result.success) {
          console.error('Failed to process successful payment:', result.error)
          return NextResponse.json(
            { error: 'Failed to process payment' },
            { status: 500 }
          )
        }

        console.log(`[Webhook] Successfully processed payment for user ${transaction.user_id}`)

        // Принудительная ревалидация кеша для пользователя
        try {
          const { revalidatePath } = await import('next/cache')
          revalidatePath('/dashboard')
          console.log(`[Webhook] Cache revalidated for /dashboard`)
        } catch (revalidateError) {
          console.error('[Webhook] Revalidation error:', revalidateError)
        }

        // ============================================
        // БОНУСНАЯ СИСТЕМА: Начисление кешбека и реферальных бонусов
        // ============================================
        
        try {
          // Получаем информацию из метаданных (уже получено выше)
          const bonusUsed = metadata?.bonusUsed || 0
          // actualPaidAmount уже получен выше
          
          console.log(`[Webhook] Processing bonuses - metadata:`, JSON.stringify(metadata, null, 2))
          console.log(`[Webhook] Processing bonuses for amount: ${actualPaidAmount}, bonusUsed: ${bonusUsed}`)
          
          // 1. Списать использованные бонусы (если были)
          if (bonusUsed > 0) {
            const spendResult = await spendBonusesOnPayment(
              {
                userId: transaction.user_id,
                amount: bonusUsed,
                paymentId: payment.id,
              },
              supabase // Передаем admin client для обхода RLS
            )
            
            if (spendResult.success) {
              console.log(`[Webhook] Bonuses spent: ${bonusUsed} шагов`)
            } else {
              console.error('[Webhook] Failed to spend bonuses:', spendResult.error)
            }
          }
          
          // 2. Начислить кешбек пользователю (от фактически оплаченной суммы)
          console.log(`[Webhook] Awarding cashback for user ${transaction.user_id}, amount: ${actualPaidAmount}`)
          const cashbackResult = await awardCashback(
            {
              userId: transaction.user_id,
              paidAmount: actualPaidAmount,
              paymentId: payment.id,
            },
            supabase // Передаем admin client для обхода RLS
          )
          
          if (cashbackResult.success) {
            console.log(`[Webhook] ✅ Cashback awarded: ${cashbackResult.cashbackAmount} шагов`)
            
            if (cashbackResult.newLevel && cashbackResult.newLevel > 1) {
              console.log(`[Webhook] 🎉 User leveled up to level ${cashbackResult.newLevel}!`)
            }
          } else {
            console.error('[Webhook] ❌ Failed to award cashback:', cashbackResult.error)
          }
          
          // 3. Обработать реферальную программу (передаем service client)
          const referralResult = await handleReferralPurchase(
            transaction.user_id,
            actualPaidAmount,
            supabase // Передаем admin client для обхода RLS
          )
          
          if (referralResult.success && referralResult.bonusAwarded) {
            console.log(`[Webhook] Referral bonus awarded: ${referralResult.bonusAwarded} шагов`)
            
            if (referralResult.isFirstPurchase) {
              console.log('[Webhook] First referral purchase bonus included!')
            }
          } else if (!referralResult.success) {
            console.error('[Webhook] Failed to process referral:', referralResult.error)
          }
          
          // 4. Увеличить счетчик использований промокода (если был)
          if (metadata?.promo_code_id) {
            await incrementPromoUsage(metadata.promo_code_id)
            console.log(`[Webhook] Promo code usage incremented: ${metadata.promo_code_id}`)
          }
          
        } catch (bonusError) {
          // Не прерываем обработку платежа, если бонусы не начислились
          console.error('[Webhook] Error processing bonuses:', bonusError)
        }
        
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

