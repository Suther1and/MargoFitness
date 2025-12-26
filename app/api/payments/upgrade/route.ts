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
  getProductById,
  getActualSubscriptionPrice
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

    // Получить ФАКТИЧЕСКИ оплаченную цену текущего продукта (защита от манипуляций с промокодами)
    const actualPrice = await getActualSubscriptionPrice({
      userId: user.id,
      tierLevel: currentTierLevel,
      durationMonths: profile.subscription_duration_months
    })
    
    // Fallback: если не найдена транзакция (старые подписки) - используем цену из products
    let currentPrice = actualPrice
    
    if (!currentPrice) {
      console.log('[Upgrade] No actual price found, using product price as fallback')
      const { data: currentProductData } = await supabase
        .from('products')
        .select('price')
        .eq('type', 'subscription_tier')
        .eq('tier_level', currentTierLevel)
        .eq('duration_months', profile.subscription_duration_months)
        .single()
      
      currentPrice = currentProductData?.price || 0
    }
    
    console.log(`[Upgrade] Using price for conversion: ${currentPrice}₽ (actual: ${!!actualPrice})`)

    // Получить базовую месячную цену нового тарифа (1 месяц без скидки)
    const { data: newBaseProduct } = await supabase
      .from('products')
      .select('price')
      .eq('type', 'subscription_tier')
      .eq('tier_level', newTierLevel)
      .eq('duration_months', 1)
      .single()
    
    const newBaseMonthlyPrice = newBaseProduct?.price || newProduct.price

    // Рассчитать конвертацию дней
    const conversion = calculateUpgradeConversion({
      currentTierLevel,
      currentDurationMonths: profile.subscription_duration_months,
      currentPrice,
      remainingDays,
      newTierLevel,
      newDurationMonths: newProduct.duration_months,
      newPrice: newProduct.price,
      newBaseMonthlyPrice
    })

    console.log('[Upgrade] Conversion calculated:', conversion)

    // DEPRECATED: Этот API больше не создает платежи
    // Используйте /api/payments/calculate-upgrade для получения информации о конвертации
    // и /payment/[productId]?action=upgrade для оплаты
    
    return NextResponse.json({
      success: true,
      conversion,
      currentPrice,
      newPrice: newProduct.price,
      message: `Для апгрейда перейдите на страницу оплаты: /payment/${newProduct.id}?action=upgrade`
    })

  } catch (error) {
    console.error('Error in upgrade API:', error)
    return NextResponse.json(
      { error: 'Failed to process upgrade', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

