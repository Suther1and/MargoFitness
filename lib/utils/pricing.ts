import type { Product } from '@/types/database'

export type Period = 30 | 90 | 180 | 365

export interface PricingData {
  basic: { original: number; current: number }
  pro: { original: number; current: number }
  elite: { original: number; current: number }
}

// Базовые цены за месяц (без скидки)
export const BASE_PRICES = {
  basic: 3990,
  pro: 4990,
  elite: 9990,
} as const

// Маппинг дней к месяцам
export const DAYS_TO_MONTHS: Record<Period, number> = {
  30: 1,
  90: 3,
  180: 6,
  365: 12,
} as const

/**
 * Рассчитать цену за месяц для продукта
 */
export function calculatePricePerMonth(
  product: Product | undefined,
  tierLevel: 1 | 2 | 3
): { original: number; current: number } {
  if (!product) {
    const originalPricePerMonth =
      tierLevel === 1 ? BASE_PRICES.basic :
      tierLevel === 2 ? BASE_PRICES.pro :
      BASE_PRICES.elite
    return { original: originalPricePerMonth, current: originalPricePerMonth }
  }
  
  const duration = product.duration_months || 1
  const currentPricePerMonth = Math.round(product.price / duration)
  const originalPricePerMonth =
    product.tier_level === 1 ? BASE_PRICES.basic :
    product.tier_level === 2 ? BASE_PRICES.pro :
    BASE_PRICES.elite
  
  return { original: originalPricePerMonth, current: currentPricePerMonth }
}

/**
 * Обновить pricing data на основе выбранного периода и списка продуктов
 */
export function updatePricing(days: Period, allProducts: Product[]): PricingData {
  const months = DAYS_TO_MONTHS[days]
  const productsForDuration = allProducts.filter(p => p.duration_months === months)
  
  const basicProduct = productsForDuration.find(p => p.tier_level === 1)
  const proProduct = productsForDuration.find(p => p.tier_level === 2)
  const eliteProduct = productsForDuration.find(p => p.tier_level === 3)
  
  return {
    basic: calculatePricePerMonth(basicProduct, 1),
    pro: calculatePricePerMonth(proProduct, 2),
    elite: calculatePricePerMonth(eliteProduct, 3),
  }
}

