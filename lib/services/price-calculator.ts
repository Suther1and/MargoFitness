'use server'

import { createClient } from '@/lib/supabase/server'
import { Product, BONUS_CONSTANTS } from '@/types/database'
import { calculatePromoDiscount } from '@/lib/actions/promo-codes'
import { calculateMaxBonusUsage } from '@/lib/actions/bonuses'

/**
 * Детальный расчет итоговой цены с учетом всех скидок
 */
export interface PriceCalculation {
  // Базовые данные
  product: Product
  basePrice: number // Полная цена продукта
  
  // Скидки
  durationDiscountPercent: number // Процент скидки за срок (уже в цене продукта)
  durationDiscountAmount: number // Сумма скидки за срок
  
  promoCode?: string
  promoDiscountType?: 'percent' | 'fixed_amount'
  promoDiscountValue?: number
  promoDiscountAmount: number // Сумма скидки по промокоду
  
  priceAfterDiscounts: number // Цена после всех скидок
  
  // Бонусы
  maxBonusUsage: number // Максимум шагов (30% от priceAfterDiscounts)
  availableBonusBalance: number // Доступный баланс пользователя
  bonusToUse: number // Фактически используется шагов
  bonusDiscountAmount: number // Сумма скидки от шагов
  
  // Итого
  finalPrice: number // Финальная сумма к оплате
  totalSavings: number // Общая экономия
  
  // Кешбек (который получит пользователь)
  cashbackPercent: number
  cashbackAmount: number // Целое число шагов
}

/**
 * Рассчитать итоговую цену с учетом всех скидок и бонусов
 */
export async function calculateFinalPrice(params: {
  productId: string
  userId?: string
  promoCode?: string
  bonusToUse?: number
}): Promise<{
  success: boolean
  data?: PriceCalculation
  error?: string
}> {
  const supabase = await createClient()

  try {
    // 1. Получаем продукт
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', params.productId)
      .single()

    if (productError || !product) {
      return { success: false, error: 'Продукт не найден' }
    }

    // 2. Базовая цена (полная до скидок)
    // Используем фиксированные базовые цены за месяц для точности
    const basePricePerMonth = product.tier_level === 1 ? 3990 :
                              product.tier_level === 2 ? 4990 :
                              product.tier_level === 3 ? 9990 : 0
    const duration = product.duration_months || 1
    const basePrice = basePricePerMonth * duration
    const durationDiscountAmount = basePrice - product.price
    
    // 3. Применяем промокод (если есть)
    let promoDiscountAmount = 0
    let promoData: any = null
    
    if (params.promoCode) {
      const promoResult = await calculatePromoDiscount(
        params.promoCode,
        product.price,
        product.id
      )
      
      if (promoResult.success && promoResult.discount) {
        promoDiscountAmount = promoResult.discount
        promoData = promoResult.promoData
      }
    }
    
    // 4. Цена после скидок (до бонусов)
    const priceAfterDiscounts = product.price - promoDiscountAmount
    
    // 5. Рассчитываем бонусы
    let maxBonusUsage = 0
    let availableBonusBalance = 0
    let bonusToUse = 0
    
    if (params.userId) {
      const bonusResult = await calculateMaxBonusUsage(priceAfterDiscounts, params.userId)
      
      if (bonusResult.success) {
        maxBonusUsage = bonusResult.maxAmount || 0
        availableBonusBalance = bonusResult.availableBalance || 0
        
        // Используем запрошенное количество или максимум доступное
        if (params.bonusToUse !== undefined) {
          bonusToUse = Math.min(
            params.bonusToUse,
            maxBonusUsage,
            availableBonusBalance
          )
        }
      }
    }
    
    // 6. Финальная цена
    const finalPrice = priceAfterDiscounts - bonusToUse
    const totalSavings = basePrice - finalPrice
    
    // 7. Рассчитываем кешбек (от finalPrice)
    let cashbackPercent = 3 // По умолчанию Bronze
    let cashbackAmount = 0
    
    if (params.userId) {
      const { data: bonusAccount } = await supabase
        .from('user_bonuses')
        .select('cashback_level')
        .eq('user_id', params.userId)
        .single()
      
      if (bonusAccount) {
        // Используем getCashbackLevelData из types/database.ts
        const { getCashbackLevelData } = await import('@/types/database')
        const levelData = getCashbackLevelData(bonusAccount.cashback_level)
        cashbackPercent = levelData.percent
      }
      
      cashbackAmount = Math.floor(finalPrice * (cashbackPercent / 100))
    }
    
    // 8. Формируем результат
    const calculation: PriceCalculation = {
      product,
      basePrice: Math.round(basePrice),
      
      durationDiscountPercent: product.discount_percentage || 0,
      durationDiscountAmount: Math.round(durationDiscountAmount),
      
      promoCode: params.promoCode,
      promoDiscountType: promoData?.discount_type,
      promoDiscountValue: promoData?.discount_value,
      promoDiscountAmount: Math.round(promoDiscountAmount),
      
      priceAfterDiscounts: Math.round(priceAfterDiscounts),
      
      maxBonusUsage: Math.round(maxBonusUsage),
      availableBonusBalance: Math.round(availableBonusBalance),
      bonusToUse: Math.round(bonusToUse),
      bonusDiscountAmount: Math.round(bonusToUse),
      
      finalPrice: Math.round(finalPrice),
      totalSavings: Math.round(totalSavings),
      
      cashbackPercent,
      cashbackAmount,
    }
    
    return { success: true, data: calculation }
  } catch (error) {
    console.error('Error calculating final price:', error)
    return { success: false, error: 'Ошибка при расчете цены' }
  }
}

/**
 * Быстрый расчет цены без бонусов (для отображения в каталоге)
 */
export async function calculateProductPrice(
  productId: string,
  promoCode?: string
): Promise<{
  success: boolean
  data?: {
    basePrice: number
    discountedPrice: number
    promoDiscount: number
    finalPrice: number
  }
  error?: string
}> {
  const supabase = await createClient()

  try {
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

    if (error || !product) {
      return { success: false, error: 'Продукт не найден' }
    }

    // Используем фиксированные базовые цены за месяц
    const basePricePerMonth = product.tier_level === 1 ? 3990 :
                              product.tier_level === 2 ? 4990 :
                              product.tier_level === 3 ? 9990 : 0
    const duration = product.duration_months || 1
    const basePrice = Math.round(basePricePerMonth * duration)
    let promoDiscount = 0

    if (promoCode) {
      const promoResult = await calculatePromoDiscount(promoCode, product.price, product.id)
      if (promoResult.success && promoResult.discount) {
        promoDiscount = promoResult.discount
      }
    }

    const finalPrice = product.price - promoDiscount

    return {
      success: true,
      data: {
        basePrice,
        discountedPrice: product.price,
        promoDiscount: Math.round(promoDiscount),
        finalPrice: Math.round(finalPrice),
      },
    }
  } catch (error) {
    console.error('Error calculating product price:', error)
    return { success: false, error: 'Ошибка при расчете цены' }
  }
}

/**
 * Валидация применения скидок (проверка перед оплатой)
 */
export async function validatePriceCalculation(params: {
  productId: string
  userId: string
  promoCode?: string
  bonusToUse?: number
}): Promise<{
  success: boolean
  error?: string
  warnings?: string[]
}> {
  const warnings: string[] = []

  // Рассчитываем цену
  const calcResult = await calculateFinalPrice(params)
  
  if (!calcResult.success || !calcResult.data) {
    return { success: false, error: calcResult.error }
  }

  const calc = calcResult.data

  // Проверяем минимальную цену
  if (calc.finalPrice < 1) {
    return { success: false, error: 'Итоговая сумма должна быть не менее 1₽' }
  }

  // Проверяем бонусы
  if (params.bonusToUse && params.bonusToUse > calc.maxBonusUsage) {
    warnings.push(`Максимум можно использовать ${calc.maxBonusUsage} шагов (30% от суммы)`)
  }

  if (params.bonusToUse && params.bonusToUse > calc.availableBonusBalance) {
    return { success: false, error: `Недостаточно шагов. Доступно: ${calc.availableBonusBalance}` }
  }

  return { success: true, warnings: warnings.length > 0 ? warnings : undefined }
}

