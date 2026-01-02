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
  newTierLevel: number,
  supabaseClient?: any
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
  console.log(`[ConversionCalc] ==========================================`)
  console.log(`[ConversionCalc] FUNCTION CALLED: calculateUpgradeConversion`)
  console.log(`[ConversionCalc] userId: ${userId}`)
  console.log(`[ConversionCalc] newTierLevel: ${newTierLevel}`)
  console.log(`[ConversionCalc] ==========================================`)
  
  // Используем переданный клиент или создаем новый (стандартный)
  const supabase = supabaseClient || await createClient()
  
  // Получить профиль пользователя
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (profileError || !profile) {
    console.error(`[ConversionCalc] ❌ Profile not found:`, profileError)
    return { success: false, error: 'Профиль не найден' }
  }
  
  console.log(`[ConversionCalc] Profile found:`)
  console.log(`[ConversionCalc]   - Current tier: ${profile.subscription_tier}`)
  console.log(`[ConversionCalc]   - Expires at: ${profile.subscription_expires_at}`)
  
  const currentTierLevel = TIER_LEVELS[profile.subscription_tier as SubscriptionTier]
  console.log(`[ConversionCalc]   - Current tier level: ${currentTierLevel}`)
  
  // Проверка: нельзя апгрейдиться на тот же или ниже
  if (newTierLevel <= currentTierLevel) {
    console.error(`[ConversionCalc] ❌ Cannot upgrade to same/lower tier: ${newTierLevel} <= ${currentTierLevel}`)
    return { success: false, error: 'Новый тариф должен быть выше текущего' }
  }
  
  // Рассчитать оставшиеся дни
  const now = new Date()
  const expiresAt = profile.subscription_expires_at ? new Date(profile.subscription_expires_at) : now
  
  // Если дата в прошлом, считаем как 0
  const diffTime = expiresAt.getTime() - now.getTime()
  const diffDays = diffTime / (1000 * 60 * 60 * 24)
  // Используем ceil чтобы не терять дни (даже если прошло несколько часов, считаем как полный день)
  const remainingDays = diffTime > 0 ? Math.ceil(diffDays) : 0
  
  console.log(`[ConversionCalc] Expires at: ${expiresAt.toISOString()}`)
  console.log(`[ConversionCalc] Now: ${now.toISOString()}`)
  console.log(`[ConversionCalc] Diff time: ${diffTime} ms`)
  console.log(`[ConversionCalc] Diff days (raw): ${diffDays.toFixed(4)}`)
  console.log(`[ConversionCalc] Remaining days (floor): ${remainingDays}`)
  
  // Если нет оставшихся дней - нет конвертации
  if (remainingDays <= 0) {
    console.log(`[ConversionCalc] ⚠️ No remaining days, no conversion needed`)
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
  
  // УПРОЩЕННАЯ ЛОГИКА КОНВЕРТАЦИИ
  // Конвертируем оставшиеся дни по базовым ценам тарифов
  // Не зависит от истории покупок - просто конвертируем дни по справедливой стоимости
  
  const pricePerDayOld = BASE_PRICES_PER_MONTH[currentTierLevel] / 30
  const remainingValue = remainingDays * pricePerDayOld
  
  const basePricePerDayNew = BASE_PRICES_PER_MONTH[newTierLevel] / 30
  // Используем Math.round для честной конвертации (не теряем дни)
  const conversionRatio = remainingValue / basePricePerDayNew
  const roundedConvertedDays = Math.round(conversionRatio)
  
  console.log(`[ConversionCalc] Conversion ratio: ${conversionRatio.toFixed(4)}`)
  console.log(`[ConversionCalc] Rounded converted days: ${roundedConvertedDays}`)
  
  // Если остались неиспользованные дни, не теряем их полностью (даже если новый тариф дороже)
  // Если конвертация дает 0, но есть оставшиеся дни - даем минимум 1 день
  // Иначе используем рассчитанное значение
  let convertedDays = remainingDays > 0
    ? (roundedConvertedDays === 0 ? 1 : roundedConvertedDays)
    : 0
  
  // ДОПОЛНИТЕЛЬНАЯ ПРОВЕРКА: если конвертация дает слишком мало дней по сравнению с оставшимися,
  // используем более справедливый расчет (минимум 50% от оставшихся дней)
  if (remainingDays > 0 && convertedDays > 0 && convertedDays < Math.ceil(remainingDays * 0.5)) {
    console.log(`[ConversionCalc] ⚠️ Converted days (${convertedDays}) seems too low compared to remaining (${remainingDays})`)
    console.log(`[ConversionCalc] Using minimum: ${Math.ceil(remainingDays * 0.5)} days`)
    convertedDays = Math.max(convertedDays, Math.ceil(remainingDays * 0.5))
  }
  
  
  console.log(`[ConversionCalc] ========== SIMPLIFIED CONVERSION ==========`)
  console.log(`[ConversionCalc] Current tier level: ${currentTierLevel}`)
  console.log(`[ConversionCalc] New tier level: ${newTierLevel}`)
  console.log(`[ConversionCalc] Remaining days: ${remainingDays}`)
  console.log(`[ConversionCalc] Base price per day OLD: ${pricePerDayOld.toFixed(2)} RUB`)
  console.log(`[ConversionCalc] Remaining value: ${remainingValue.toFixed(2)} RUB`)
  console.log(`[ConversionCalc] Base price per day NEW: ${basePricePerDayNew.toFixed(2)} RUB`)
  console.log(`[ConversionCalc] Converted days (rounded): ${roundedConvertedDays}`)
  console.log(`[ConversionCalc] Converted days (final): ${convertedDays}`)
  console.log(`[ConversionCalc] =======================================`)
  
  const finalConvertedDays = Math.max(0, convertedDays)
  const result = {
    success: true,
    data: {
      currentTier: profile.subscription_tier,
      currentTierLevel,
      remainingDays,
      actualPaidAmount: Math.round(remainingValue), // Стоимость оставшихся дней
      purchasedDays: remainingDays, // Для обратной совместимости
      usedDays: 0, // Для обратной совместимости
      remainingValue: Math.round(remainingValue),
      newTierLevel,
      basePricePerDayNew: Math.round(basePricePerDayNew * 100) / 100,
      convertedDays: finalConvertedDays
    }
  }
  
  console.log(`[ConversionCalc] ✅✅✅ CONVERSION SUCCESSFUL!`)
  console.log(`[ConversionCalc] INPUT: ${remainingDays} old days of tier ${currentTierLevel}`)
  console.log(`[ConversionCalc] OUTPUT: ${finalConvertedDays} new days of tier ${newTierLevel}`)
  console.log(`[ConversionCalc] RETURNING DATA:`, JSON.stringify(result.data, null, 2))
  console.log(`[ConversionCalc] ================================================`)
  
  return result
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

