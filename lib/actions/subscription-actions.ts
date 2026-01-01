'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from './profile'
import { Product, SubscriptionTier, TIER_LEVELS } from '@/types/database'

// Базовые цены за месяц (без скидок)
const BASE_PRICES_PER_MONTH: Record<number, number> = {
  1: 3990, // Basic
  2: 4990, // Pro
  3: 9990, // Elite
}

/**
 * Получить продукты для продления текущего тарифа
 */
export async function getRenewalOptions(userId: string): Promise<{
  success: boolean
  products?: Product[]
  error?: string
}> {
  const supabase = await createClient()
  
  // Получить профиль пользователя
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single()
  
  if (profileError || !profile) {
    return { success: false, error: 'Профиль не найден' }
  }
  
  const currentTierLevel = TIER_LEVELS[profile.subscription_tier]
  
  // Получить все продукты текущего тарифа
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .eq('type', 'subscription_tier')
    .eq('tier_level', currentTierLevel)
    .eq('is_active', true)
    .order('duration_months', { ascending: true })
  
  if (productsError) {
    return { success: false, error: 'Ошибка получения продуктов' }
  }
  
  return { success: true, products: products || [] }
}

/**
 * Получить доступные тарифы для апгрейда (выше текущего)
 */
export async function getUpgradeOptions(userId: string): Promise<{
  success: boolean
  data?: {
    currentTier: SubscriptionTier
    currentTierLevel: number
    availableTiers: {
      tier: SubscriptionTier
      tierLevel: number
      products: Product[]
    }[]
  }
  error?: string
}> {
  const supabase = await createClient()
  
  // Получить профиль пользователя
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single()
  
  if (profileError || !profile) {
    return { success: false, error: 'Профиль не найден' }
  }
  
  const currentTierLevel = TIER_LEVELS[profile.subscription_tier]
  
  // Если уже Elite - апгрейда нет
  if (currentTierLevel >= 3) {
    return { 
      success: true, 
      data: {
        currentTier: profile.subscription_tier,
        currentTierLevel,
        availableTiers: []
      }
    }
  }
  
  // Получить продукты всех тарифов выше текущего
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .eq('type', 'subscription_tier')
    .gt('tier_level', currentTierLevel)
    .eq('is_active', true)
    .order('tier_level', { ascending: true })
    .order('duration_months', { ascending: true })
  
  if (productsError) {
    return { success: false, error: 'Ошибка получения продуктов' }
  }
  
  // Группировать по тарифам
  const tierMap: Record<string, SubscriptionTier> = {
    '1': 'basic',
    '2': 'pro',
    '3': 'elite',
  }
  
  const availableTiers: {
    tier: SubscriptionTier
    tierLevel: number
    products: Product[]
  }[] = []
  
  // Группируем продукты по tier_level
  const groupedByTier: Record<number, Product[]> = {}
  products?.forEach(product => {
    const level = product.tier_level || 1
    if (!groupedByTier[level]) {
      groupedByTier[level] = []
    }
    groupedByTier[level].push(product)
  })
  
  // Преобразуем в массив
  Object.entries(groupedByTier).forEach(([level, prods]) => {
    const tierLevel = parseInt(level)
    availableTiers.push({
      tier: tierMap[level] as SubscriptionTier,
      tierLevel,
      products: prods
    })
  })
  
  return {
    success: true,
    data: {
      currentTier: profile.subscription_tier,
      currentTierLevel,
      availableTiers
    }
  }
}

/**
 * Рассчитать конвертацию оставшихся дней при апгрейде
 */
export async function calculateUpgradeConversion(
  userId: string,
  newTierLevel: number
): Promise<{
  success: boolean
  data?: {
    currentTier: SubscriptionTier
    currentTierLevel: number
    remainingDays: number
    actualPaidAmount: number
    purchasedDays: number
    usedDays: number
    remainingValue: number
    newTierLevel: number
    basePricePerDayNew: number
    convertedDays: number
  }
  error?: string
}> {
  const supabase = await createClient()
  
  // Получить профиль пользователя
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (profileError || !profile) {
    return { success: false, error: 'Профиль не найден' }
  }
  
  const currentTierLevel = TIER_LEVELS[profile.subscription_tier]
  
  // Проверка: нельзя апгрейдиться на тот же или ниже
  if (newTierLevel <= currentTierLevel) {
    return { success: false, error: 'Новый тариф должен быть выше текущего' }
  }
  
  // Рассчитать оставшиеся дни
  const now = new Date()
  const expiresAt = profile.subscription_expires_at ? new Date(profile.subscription_expires_at) : now
  const remainingDays = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
  
  // Если нет оставшихся дней - нет конвертации
  if (remainingDays <= 0) {
    return {
      success: true,
      data: {
        currentTier: profile.subscription_tier,
        currentTierLevel,
        remainingDays: 0,
        actualPaidAmount: 0,
        purchasedDays: 0,
        usedDays: 0,
        remainingValue: 0,
        newTierLevel,
        basePricePerDayNew: BASE_PRICES_PER_MONTH[newTierLevel] / 30,
        convertedDays: 0
      }
    }
  }
  
  // Получить последнюю покупку для расчета фактически уплаченной суммы
  const { data: lastPurchase } = await supabase
    .from('user_purchases')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  // Если нет данных о покупке, используем стандартную цену
  let actualPaidAmount = 0
  let purchasedDays = 30
  
  if (lastPurchase && lastPurchase.actual_paid_amount > 0) {
    actualPaidAmount = lastPurchase.actual_paid_amount
    purchasedDays = lastPurchase.purchased_days || 30
  } else {
    // Fallback: используем базовую цену текущего тарифа
    actualPaidAmount = BASE_PRICES_PER_MONTH[currentTierLevel]
    purchasedDays = 30
  }
  
  // Расчет остатка стоимости
  const pricePerDayOld = actualPaidAmount / purchasedDays
  const usedDays = purchasedDays - remainingDays
  const remainingValue = actualPaidAmount - (pricePerDayOld * usedDays)
  
  // Конвертация по БАЗОВОЙ цене нового тарифа (без скидок)
  const basePricePerDayNew = BASE_PRICES_PER_MONTH[newTierLevel] / 30
  const convertedDays = Math.floor(remainingValue / basePricePerDayNew)
  
  return {
    success: true,
    data: {
      currentTier: profile.subscription_tier,
      currentTierLevel,
      remainingDays,
      actualPaidAmount,
      purchasedDays,
      usedDays,
      remainingValue: Math.round(remainingValue),
      newTierLevel,
      basePricePerDayNew: Math.round(basePricePerDayNew * 100) / 100,
      convertedDays: Math.max(0, convertedDays)
    }
  }
}

/**
 * Проверка возможности апгрейда
 */
export async function canUpgrade(userId: string): Promise<{
  canUpgrade: boolean
  reason?: string
}> {
  const profile = await getCurrentProfile()
  
  if (!profile) {
    return { canUpgrade: false, reason: 'Профиль не найден' }
  }
  
  const currentTierLevel = TIER_LEVELS[profile.subscription_tier]
  
  // Elite - максимальный тариф
  if (currentTierLevel >= 3) {
    return { canUpgrade: false, reason: 'У вас уже максимальный тариф' }
  }
  
  return { canUpgrade: true }
}

