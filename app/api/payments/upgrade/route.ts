/**
 * API Route: Апгрейд подписки
 * POST /api/payments/upgrade
 * 
 * Обрабатывает апгрейд подписки с конвертацией оставшихся дней
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createPayment, createRecurrentPayment } from '@/lib/services/yookassa'
import type { Database } from '@/types/supabase'
import { 
  calculateUpgradeConversion, 
  getRemainingDays, 
  canUpgrade,
  processSuccessfulPayment,
  getProductById
} from '@/lib/services/subscription-manager'
import { sendSubscriptionUpgradeEmail } from '@/lib/services/email'

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

    // Получить параметры
    const body = await request.json()
    const { newProductId } = body

    if (!newProductId) {
      return NextResponse.json(
        { error: 'New product ID is required' },
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

    // Проверка: должна быть активная подписка
    if (profile.subscription_status !== 'active') {
      return NextResponse.json(
        { error: 'No active subscription to upgrade' },
        { status: 400 }
      )
    }

    // Получить текущий продукт
    const currentProduct = await getProductById(profile.subscription_tier)
    if (!currentProduct) {
      // Найти по tier_level и duration
      const { data: currentProd } = await supabase
        .from('products')
        .select('*')
        .eq('type', 'subscription_tier')
        .eq('tier_level', profile.subscription_tier === 'basic' ? 1 : profile.subscription_tier === 'pro' ? 2 : 3)
        .eq('duration_months', profile.subscription_duration_months)
        .single()
      
      if (!currentProd) {
        return NextResponse.json(
          { error: 'Current subscription product not found' },
          { status: 404 }
        )
      }
    }

    // Получить новый продукт
    const newProduct = await getProductById(newProductId)
    if (!newProduct || newProduct.type !== 'subscription_tier') {
      return NextResponse.json(
        { error: 'New product not found or invalid type' },
        { status: 404 }
      )
    }

    // Проверка: это должен быть апгрейд (не даунгрейд)
    const currentTierLevel = profile.subscription_tier === 'basic' ? 1 : profile.subscription_tier === 'pro' ? 2 : profile.subscription_tier === 'elite' ? 3 : 0
    const newTierLevel = newProduct.tier_level || 1

    if (!canUpgrade(currentTierLevel, newTierLevel)) {
      return NextResponse.json(
        { error: 'This is not an upgrade. Downgrades are not supported.' },
        { status: 400 }
      )
    }

    // Рассчитать оставшиеся дни
    const remainingDays = getRemainingDays(profile.subscription_expires_at)
    
    if (remainingDays <= 0) {
      return NextResponse.json(
        { error: 'Current subscription has expired' },
        { status: 400 }
      )
    }

    // Получить цену текущего продукта (нужна для конвертации)
    const { data: currentProductData } = await supabase
      .from('products')
      .select('price')
      .eq('type', 'subscription_tier')
      .eq('tier_level', currentTierLevel)
      .eq('duration_months', profile.subscription_duration_months)
      .single()

    const currentPrice = currentProductData?.price || 0

    // Рассчитать конвертацию дней
    const conversion = calculateUpgradeConversion({
      currentTierLevel,
      currentDurationMonths: profile.subscription_duration_months,
      currentPrice,
      remainingDays,
      newTierLevel,
      newDurationMonths: newProduct.duration_months,
      newPrice: newProduct.price
    })

    console.log('[Upgrade] Conversion calculated:', conversion)

    // Если есть сохраненная карта - списать автоматически
    if (profile.payment_method_id) {
      try {
        const payment = await createRecurrentPayment({
          amount: newProduct.price,
          paymentMethodId: profile.payment_method_id,
          description: `Апгрейд до ${newProduct.name}`,
          metadata: {
            userId: user.id,
            productId: newProduct.id,
            type: 'upgrade',
            conversion: conversion
          }
        })

        if (payment.status === 'succeeded' && payment.paid) {
          // Создать транзакцию (используем service role)
          const supabaseAdmin = createServiceClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          )
          
          await supabaseAdmin
            .from('payment_transactions')
            .insert({
              user_id: user.id,
              product_id: newProduct.id,
              yookassa_payment_id: payment.id,
              amount: newProduct.price,
              currency: 'RUB',
              status: 'succeeded',
              payment_type: 'upgrade',
              payment_method_id: profile.payment_method_id,
              metadata: { conversion }
            })

          // Обработать платеж с кастомным количеством дней
          await processSuccessfulPayment({
            userId: user.id,
            productId: newProduct.id,
            paymentMethodId: profile.payment_method_id,
            customExpiryDays: conversion.totalDays
          })

          // Отправка email уведомления об апгрейде
          sendSubscriptionUpgradeEmail({
            to: profile.email!,
            userName: profile.full_name || undefined,
            oldPlan: conversion.details.oldTierName,
            newPlan: conversion.details.newTierName,
            bonusDays: conversion.convertedDays,
            totalDays: conversion.totalDays
          }).catch(err => {
            console.error('[Upgrade] Failed to send upgrade email:', err)
          })

          return NextResponse.json({
            success: true,
            paid: true,
            conversion,
            message: `Апгрейд успешен! Вы получили ${conversion.totalDays} дней подписки ${newProduct.name}`
          })
        }
      } catch (error) {
        console.error('Auto-charge failed for upgrade:', error)
        // Fallback на ручную оплату через виджет
      }
    }

    // Если нет карты или автосписание не прошло - вернуть confirmation_token
    const payment = await createPayment({
      amount: newProduct.price,
      description: `Апгрейд до ${newProduct.name}`,
      savePaymentMethod: true,
      metadata: {
        userId: user.id,
        productId: newProduct.id,
        type: 'upgrade',
        conversion: conversion
      }
    })

    // Сохранить транзакцию (используем service role)
    const supabaseAdmin = createServiceClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    await supabaseAdmin
      .from('payment_transactions')
      .insert({
        user_id: user.id,
        product_id: newProduct.id,
        yookassa_payment_id: payment.id,
        amount: newProduct.price,
        currency: 'RUB',
        status: 'pending',
        payment_type: 'upgrade',
        metadata: { conversion }
      })

    return NextResponse.json({
      success: true,
      paid: false,
      requiresPayment: true,
      confirmationToken: payment.confirmation?.confirmation_token,
      paymentId: payment.id,
      conversion,
      message: `После оплаты вы получите ${conversion.totalDays} дней подписки ${newProduct.name}`
    })

  } catch (error) {
    console.error('Error in upgrade API:', error)
    return NextResponse.json(
      { error: 'Failed to process upgrade', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

