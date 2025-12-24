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
    const { productId, savePaymentMethod, confirmationType = 'embedded' } = body

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

    // Проверка: нельзя купить подписку если уже есть активная того же или более высокого уровня
    if (product.type === 'subscription_tier' && profile.subscription_status === 'active') {
      const currentTierLevel = profile.subscription_tier === 'basic' ? 1 : 
                                profile.subscription_tier === 'pro' ? 2 : 
                                profile.subscription_tier === 'elite' ? 3 : 0
      const newTierLevel = product.tier_level || 1
      
      // Если новый уровень такой же или ниже - запрещаем
      if (newTierLevel <= currentTierLevel) {
        return NextResponse.json(
          { 
            error: 'Нельзя купить подписку того же или более низкого уровня',
            details: `У вас уже активна подписка ${profile.subscription_tier.toUpperCase()}. Используйте апгрейд для повышения тарифа.`,
            currentTier: profile.subscription_tier,
            suggestUpgrade: true
          },
          { status: 400 }
        )
      }
      
      // Если новый уровень выше - предлагаем использовать апгрейд
      return NextResponse.json(
        { 
          error: 'Используйте апгрейд для повышения тарифа',
          details: 'У вас уже есть активная подписка. При апгрейде оставшиеся дни конвертируются в бонус!',
          suggestUpgrade: true,
          upgradeAvailable: true
        },
        { status: 400 }
      )
    }

    // Создать платеж через ЮKassa
    const payment = await createPayment({
      amount: product.price,
      description: `Оплата: ${product.name}`,
      savePaymentMethod: savePaymentMethod || (product.type === 'subscription_tier'),
      confirmationType: confirmationType as 'embedded' | 'redirect',
      metadata: {
        userId: user.id,
        productId: product.id,
        productType: product.type,
        tierLevel: product.tier_level,
        durationMonths: product.duration_months
      }
    })

    // Сохранить транзакцию в БД (используем service role для обхода RLS)
    const supabaseAdmin = createServiceClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { error: transactionError } = await supabaseAdmin
      .from('payment_transactions')
      .insert({
        user_id: user.id,
        product_id: productId,
        yookassa_payment_id: payment.id,
        amount: product.price,
        currency: 'RUB',
        status: 'pending',
        payment_type: 'initial',
        metadata: {
          productName: product.name,
          productType: product.type
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

