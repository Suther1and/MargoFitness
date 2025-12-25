/**
 * API Route: Расчет конвертации при апгрейде
 * GET /api/payments/calculate-upgrade?newProductId=xxx
 * 
 * Возвращает информацию о конвертации дней БЕЗ создания платежа
 * Используется для отображения информации пользователю перед оплатой
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  calculateUpgradeConversion, 
  getRemainingDays, 
  canUpgrade,
  getProductById,
  getActualSubscriptionPrice
} from '@/lib/services/subscription-manager'

export async function GET(request: NextRequest) {
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
    const searchParams = request.nextUrl.searchParams
    const newProductId = searchParams.get('newProductId')

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

    // Получить новый продукт
    const newProduct = await getProductById(newProductId)
    if (!newProduct || newProduct.type !== 'subscription_tier') {
      return NextResponse.json(
        { error: 'New product not found or invalid type' },
        { status: 404 }
      )
    }

    // Проверка: это должен быть апгрейд (не даунгрейд)
    const currentTierLevel = profile.subscription_tier === 'basic' ? 1 : 
                             profile.subscription_tier === 'pro' ? 2 : 
                             profile.subscription_tier === 'elite' ? 3 : 0
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

    // Получить ФАКТИЧЕСКИ оплаченную цену текущего продукта (защита от манипуляций)
    const actualPrice = await getActualSubscriptionPrice({
      userId: user.id,
      tierLevel: currentTierLevel,
      durationMonths: profile.subscription_duration_months
    })
    
    // Fallback: если не найдена транзакция (старые подписки) - используем цену из products
    let currentPrice = actualPrice
    
    if (!currentPrice) {
      console.log('[CalculateUpgrade] No actual price found, using product price as fallback')
      const { data: currentProductData } = await supabase
        .from('products')
        .select('price')
        .eq('type', 'subscription_tier')
        .eq('tier_level', currentTierLevel)
        .eq('duration_months', profile.subscription_duration_months)
        .single()
      
      currentPrice = currentProductData?.price || 0
    }
    
    console.log(`[CalculateUpgrade] Using price for conversion: ${currentPrice}₽ (actual: ${!!actualPrice})`)

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

    console.log('[CalculateUpgrade] Conversion calculated:', conversion)

    return NextResponse.json({
      success: true,
      conversion,
      currentPrice,
      newPrice: newProduct.price,
      currentTier: profile.subscription_tier,
      newTier: newProduct.tier_level === 1 ? 'basic' : 
               newProduct.tier_level === 2 ? 'pro' : 'elite',
      productName: newProduct.name
    })

  } catch (error) {
    console.error('Error in calculate-upgrade API:', error)
    return NextResponse.json(
      { error: 'Failed to calculate upgrade', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

