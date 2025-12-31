/**
 * API Route: Создание платежа
 * POST /api/payments/create
 * 
 * Создает новый платеж через ЮKassa и возвращает confirmation_token для виджета
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createPayment } from '@/lib/services/yookassa'
import { calculateFinalPrice } from '@/lib/services/price-calculator'
import type { Database } from '@/types/supabase'

export async function POST(request: NextRequest) {
  try {
    // Получить текущего пользователя
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Получить параметры из запроса
    const body = await request.json()
    const { 
      productId, 
      savePaymentMethod, 
      confirmationType = 'embedded',
      promoCode,
      bonusToUse
    } = body

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Получить профиль пользователя
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Получить информацию о продукте
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('is_active', true)
      .single()

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found or inactive' },
        { status: 404 }
      )
    }

    // Проверка: нельзя купить подписку если уже есть активная
    if (product.type === 'subscription_tier' && profile.subscription_status === 'active') {
      return NextResponse.json(
        { 
          error: 'У вас уже есть активная подписка',
          details: `У вас активна подписка ${profile.subscription_tier.toUpperCase()}. Дождитесь её окончания или обратитесь в поддержку.`,
          currentTier: profile.subscription_tier
        },
        { status: 400 }
      )
    }

    // Рассчитать финальную цену с учетом промокода и бонусов
    const priceCalculation = await calculateFinalPrice({
      productId: product.id,
      userId: user.id,
      promoCode,
      bonusToUse
    })

    if (!priceCalculation.success || !priceCalculation.data) {
      return NextResponse.json(
        { error: 'Ошибка расчета цены', details: priceCalculation.error },
        { status: 400 }
      )
    }

    const calculation = priceCalculation.data

    // Проверка минимальной суммы
    if (calculation.finalPrice < 1) {
      return NextResponse.json(
        { error: 'Минимальная сумма платежа - 1 рубль' },
        { status: 400 }
      )
    }

    // Создать платеж через ЮKassa на финальную сумму
    const payment = await createPayment({
      amount: calculation.finalPrice,
      description: `Оплата: ${product.name}`,
      savePaymentMethod: savePaymentMethod || (product.type === 'subscription_tier'),
      confirmationType: confirmationType as 'embedded' | 'redirect',
      metadata: {
        userId: user.id,
        productId: product.id,
        productType: product.type,
        tierLevel: product.tier_level,
        durationMonths: product.duration_months,
        promoCode: promoCode || null,
        bonusUsed: bonusToUse || 0,
        originalPrice: product.price,
        finalPrice: calculation.finalPrice
      }
    })

    // Сохранить транзакцию в БД (используем service role для обхода RLS)
    const supabaseAdmin = createServiceClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Определить payment_type
    const paymentType: 'initial' | 'recurring' | 'one_time' = 
      product.type === 'one_time_pack' ? 'one_time' : 'initial'
    
    const { error: transactionError } = await supabaseAdmin
      .from('payment_transactions')
      .insert({
        user_id: user.id,
        product_id: productId,
        yookassa_payment_id: payment.id,
        amount: calculation.finalPrice,
        currency: 'RUB',
        status: 'pending',
        payment_type: paymentType,
        metadata: {
          productName: product.name,
          productType: product.type,
          originalPrice: product.price,
          promoCode: promoCode || null,
          bonusUsed: bonusToUse || 0,
          promoDiscount: calculation.promoDiscountAmount,
          bonusDiscount: calculation.bonusToUse
        } as any
      })

    if (transactionError) {
      console.error('Error creating transaction record:', transactionError)
      // Не критично, продолжаем
    }

    // Вернуть данные для подтверждения (token для embedded или url для redirect)
    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      confirmationToken: payment.confirmation?.confirmation_token,
      confirmationUrl: payment.confirmation?.confirmation_url,
      confirmationType: payment.confirmation?.type,
      amount: payment.amount.value,
      currency: payment.amount.currency
    })

  } catch (error) {
    console.error('Error in create payment API:', error)
    return NextResponse.json(
      { error: 'Failed to create payment', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

