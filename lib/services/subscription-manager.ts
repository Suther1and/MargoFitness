/**
 * Менеджер подписок - вся бизнес-логика для управления подписками
 * 
 * Функции:
 * - Обработка успешных платежей
 * - Обработка неудачных попыток оплаты
 * - Работа с продуктами
 */

import { createClient } from '@/lib/supabase/server'
import type { Profile, Product, SubscriptionTier } from '@/types/database'
import { TIER_LEVELS } from '@/types/database'

// ============================================
// Типы
// ============================================

export interface ProcessPaymentResult {
  success: boolean
  error?: string
  subscriptionUpdated?: boolean
}

// ============================================
// Утилиты для работы с датами
// ============================================

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

// ============================================
// Маппинг тарифов
// ============================================

const tierToLevel: Record<SubscriptionTier, number> = {
  'free': 0,
  'basic': 1,
  'pro': 2,
  'elite': 3
}

const levelToTier: Record<number, SubscriptionTier> = {
  0: 'free',
  1: 'basic',
  2: 'pro',
  3: 'elite'
}

// ============================================
// Функции для работы с продуктами
// ============================================

/**
 * Найти продукт по уровню тарифа и длительности
 */
export async function findProductByTierAndDuration(
  tier: SubscriptionTier,
  durationMonths: number
): Promise<Product | null> {
  const supabase = await createClient()
  
  const tierLevel = tierToLevel[tier]
  
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('type', 'subscription_tier')
    .eq('tier_level', tierLevel)
    .eq('duration_months', durationMonths)
    .eq('is_active', true)
    .single()
  
  if (error) {
    console.error('Error finding product:', error)
    return null
  }
  
  return product
}

/**
 * Получить продукт по ID
 */
export async function getProductById(productId: string): Promise<Product | null> {
  const supabase = await createClient()
  
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single()
  
  if (error) {
    console.error('Error getting product:', error)
    return null
  }
  
  return product
}


// ============================================
// Обработка платежей
// ============================================

/**
 * Обработать успешный платеж
 * Обновляет подписку пользователя в БД
 */
export async function processSuccessfulPayment(params: {
  userId: string
  productId: string
  paymentMethodId?: string
  action?: 'purchase' | 'renewal' | 'upgrade'
  actualPaidAmount?: number
  paymentId?: string
}): Promise<ProcessPaymentResult> {
  const { userId, productId, paymentMethodId, action = 'purchase', actualPaidAmount, paymentId } = params
  
  // Используем service client для обхода RLS (вызывается из webhook)
  const { createClient: createServiceClient } = await import('@supabase/supabase-js')
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  // Получить продукт
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single()
    
  if (productError || !product) {
    console.error('[ProcessPayment] Product not found:', productId, productError)
    return { success: false, error: 'Product not found' }
  }
  
  // Получить профиль
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (profileError || !profile) {
    console.error('[ProcessPayment] Profile not found:', userId, profileError)
    return { success: false, error: 'Profile not found' }
  }
  
  // Определить тариф
  const tier = levelToTier[product.tier_level || 1]
  console.log(`[ProcessPayment] ========================================`)
  console.log(`[ProcessPayment] Starting payment processing`)
  console.log(`[ProcessPayment] User ID: ${userId}`)
  console.log(`[ProcessPayment] Product: ${product.id} - ${product.name}`)
  console.log(`[ProcessPayment] Product tier: ${tier} (level ${product.tier_level})`)
  console.log(`[ProcessPayment] ACTION: ${action}`)
  console.log(`[ProcessPayment] actualPaidAmount: ${actualPaidAmount}`)
  console.log(`[ProcessPayment] ========================================`)
  
  let expiresAt: Date
  let updateData: any
  
  // ЛОГИКА ДЛЯ ПРОДЛЕНИЯ (RENEWAL)
  if (action === 'renewal') {
    console.log(`[ProcessPayment] ========== RENEWAL PROCESSING ==========`)
    console.log(`[ProcessPayment] User: ${userId}`)
    console.log(`[ProcessPayment] Current Tier: ${profile.subscription_tier}`)
    console.log(`[ProcessPayment] Current Expires: ${profile.subscription_expires_at}`)
    console.log(`[ProcessPayment] Product: ${product.name}`)
    
    const currentExpires = profile.subscription_expires_at ? new Date(profile.subscription_expires_at) : new Date()
    const now = new Date()
    
    // Если подписка еще активна - добавляем к expires_at
    // Если истекла - добавляем к текущей дате
    const baseDate = currentExpires > now ? currentExpires : now
    const additionalDays = product.duration_months * 30
    expiresAt = new Date(baseDate.getTime() + (additionalDays * 24 * 60 * 60 * 1000))
    
    console.log(`[ProcessPayment] Base date: ${baseDate.toISOString()} (${currentExpires > now ? 'active' : 'expired'})`)
    console.log(`[ProcessPayment] Adding days: ${additionalDays}`)
    console.log(`[ProcessPayment] New expiration: ${expiresAt.toISOString()}`)
    console.log(`[ProcessPayment] =======================================`)
    
    updateData = {
      subscription_status: 'active',
      subscription_expires_at: expiresAt.toISOString(),
      next_billing_date: expiresAt.toISOString(),
      payment_method_id: paymentMethodId || profile.payment_method_id,
      auto_renew_enabled: !!paymentMethodId || profile.auto_renew_enabled,
      failed_payment_attempts: 0,
      last_payment_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }
  // ЛОГИКА ДЛЯ АПГРЕЙДА (UPGRADE)
  else if (action === 'upgrade') {
    console.log(`[ProcessPayment] ========== UPGRADE PROCESSING ==========`)
    console.log(`[ProcessPayment] User: ${userId}`)
    console.log(`[ProcessPayment] Current Tier: ${profile.subscription_tier}`)
    console.log(`[ProcessPayment] Current Expires: ${profile.subscription_expires_at}`)
    console.log(`[ProcessPayment] New Product: ${product.name} (Level ${product.tier_level})`)
    
    // ВАЖНО: Сохраняем старые данные профиля ДО конвертации
    const oldTier = profile.subscription_tier
    const oldExpiresAt = profile.subscription_expires_at
    const oldTierLevel = TIER_LEVELS[oldTier as SubscriptionTier] || 0
    
    console.log(`[ProcessPayment] OLD PROFILE DATA (before conversion):`)
    console.log(`[ProcessPayment]   - Old tier: ${oldTier} (level ${oldTierLevel})`)
    console.log(`[ProcessPayment]   - Old expires_at: ${oldExpiresAt}`)
    
    // Импортируем функцию расчета конвертации
    const { calculateUpgradeConversion } = await import('@/lib/actions/subscription-actions')
    const conversion = await calculateUpgradeConversion(userId, product.tier_level || 1, supabase)
    
    console.log(`[ProcessPayment] CONVERSION RESULT:`)
    console.log(`[ProcessPayment]   - Success: ${conversion.success}`)
    console.log(`[ProcessPayment]   - Error: ${conversion.error || 'none'}`)
    console.log(`[ProcessPayment]   - Data: ${conversion.data ? JSON.stringify(conversion.data, null, 2) : 'null'}`)
    
    if (!conversion.success || !conversion.data) {
      console.error('[ProcessPayment] ❌❌❌ CRITICAL: Failed to calculate conversion!')
      console.error('[ProcessPayment] Error:', conversion.error)
      console.error('[ProcessPayment] ⚠️ FALLBACK: Giving only new product days WITHOUT conversion!')
      console.error('[ProcessPayment] THIS MEANS USER IS LOSING THEIR REMAINING DAYS!')
      // Fallback: просто даем купленные дни без конвертации
      expiresAt = addDays(new Date(), product.duration_months * 30)
    } else {
      // Купленные дни + конвертированные дни
      const productDays = product.duration_months * 30;
      const convertedDays = conversion.data.convertedDays || 0;
      const remainingDays = conversion.data.remainingDays || 0;
      const totalDays = productDays + convertedDays;
      
      console.log(`[ProcessPayment] ✅✅✅ Conversion calculated successfully!`)
      console.log(`[ProcessPayment] CONVERSION DATA:`, JSON.stringify(conversion.data, null, 2))
      console.log(`[ProcessPayment] `)
      console.log(`[ProcessPayment] CALCULATION:`)
      console.log(`[ProcessPayment]   - Remaining OLD days: ${remainingDays}`)
      console.log(`[ProcessPayment]   - Remaining value: ${conversion.data.remainingValue} RUB`)
      console.log(`[ProcessPayment]   - Converted to NEW days: ${convertedDays}`)
      console.log(`[ProcessPayment]   - Product days (purchased): ${productDays}`)
      console.log(`[ProcessPayment]   - TOTAL days to add: ${totalDays}`)
      console.log(`[ProcessPayment] `)
      
      // ВАЖНО: Проверка - если есть оставшиеся дни, но конвертация дает 0 - это ошибка!
      if (remainingDays > 0 && convertedDays === 0) {
        console.error(`[ProcessPayment] ⚠️⚠️⚠️ WARNING: Remaining days (${remainingDays}) > 0 but convertedDays = 0!`)
        console.error(`[ProcessPayment] This means conversion calculation is wrong!`)
        console.error(`[ProcessPayment] Using fallback: adding remaining days directly (not converted)`)
        // Fallback: если конвертация дает 0, но есть оставшиеся дни - добавляем их напрямую
        // Это не идеально, но лучше чем потерять дни
        const fallbackTotalDays = productDays + remainingDays
        console.log(`[ProcessPayment] FALLBACK: totalDays = ${fallbackTotalDays} (${productDays} new + ${remainingDays} old)`)
        const now = new Date()
        expiresAt = new Date(now.getTime() + (fallbackTotalDays * 24 * 60 * 60 * 1000))
        console.log(`[ProcessPayment] FALLBACK: expiresAt = ${expiresAt.toISOString()}`)
        console.log(`[ProcessPayment] FALLBACK: Expected days from NOW: ${((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)).toFixed(4)}`)
      } else {
        // РАСЧЕТ ДАТЫ ДЛЯ АПГРЕЙДА:
        // При апгрейде мы заменяем старую подписку на новую, поэтому:
        // 1. Берем ТЕКУЩУЮ дату (сейчас), а не дату окончания старой подписки
        // 2. Добавляем конвертированные дни (замена оставшихся дней старой подписки)
        // 3. Добавляем новые дни (купленный продукт)
        // Итого: totalDays от текущего момента
        const now = new Date();
        const currentExpires = profile.subscription_expires_at ? new Date(profile.subscription_expires_at) : now;
        
        console.log(`[ProcessPayment]   - Current expires_at (old subscription): ${currentExpires.toISOString()}`)
        console.log(`[ProcessPayment]   - Now: ${now.toISOString()}`)
        console.log(`[ProcessPayment]   - Remaining old days: ${remainingDays}`)
        console.log(`[ProcessPayment]   - Converted days: ${convertedDays}`)
        console.log(`[ProcessPayment]   - New product days: ${productDays}`)
        console.log(`[ProcessPayment]   - TOTAL days from NOW: ${totalDays} (${productDays} new + ${convertedDays} converted)`)
        console.log(`[ProcessPayment]   - Adding milliseconds: ${totalDays * 24 * 60 * 60 * 1000}`)
        
        // ВАЖНО: Используем ТЕКУЩУЮ дату, а не дату окончания старой подписки
        // Потому что мы заменяем старую подписку на новую с конвертацией
        expiresAt = new Date(now.getTime() + (totalDays * 24 * 60 * 60 * 1000));
        
        console.log(`[ProcessPayment]   - Calculated expiration: ${expiresAt.toISOString()}`)
        console.log(`[ProcessPayment]   - Expected days from NOW: ${((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)).toFixed(4)}`)
        console.log(`[ProcessPayment]   - Old subscription would expire: ${currentExpires.toISOString()}`)
        console.log(`[ProcessPayment]   - Days difference (new - old): ${((expiresAt.getTime() - currentExpires.getTime()) / (1000 * 60 * 60 * 24)).toFixed(4)}`)
        
        // КРИТИЧЕСКАЯ ПРОВЕРКА: убеждаемся, что totalDays правильно рассчитан
        if (totalDays !== (productDays + convertedDays)) {
          console.error(`[ProcessPayment] ❌❌❌ CRITICAL ERROR: totalDays (${totalDays}) != productDays (${productDays}) + convertedDays (${convertedDays}) = ${productDays + convertedDays}`)
          console.error(`[ProcessPayment] FORCING CORRECT CALCULATION!`)
          const correctTotalDays = productDays + convertedDays
          expiresAt = new Date(now.getTime() + (correctTotalDays * 24 * 60 * 60 * 1000))
          console.log(`[ProcessPayment] CORRECTED: expiresAt = ${expiresAt.toISOString()}`)
          console.log(`[ProcessPayment] CORRECTED: Expected days from NOW: ${((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)).toFixed(4)}`)
        }
      }
    }
    
    console.log(`[ProcessPayment] =======================================`)
    
    // ФИНАЛЬНАЯ ПРОВЕРКА ПЕРЕД СОХРАНЕНИЕМ (только для upgrade)
    if (action === 'upgrade') {
      const finalNow = new Date()
      const finalDaysFromNow = Math.round((expiresAt.getTime() - finalNow.getTime()) / (1000 * 60 * 60 * 24))
      const productDays = product.duration_months * 30
      
      console.log(`[ProcessPayment] FINAL CHECK BEFORE SAVE (UPGRADE):`)
      console.log(`[ProcessPayment]   - expiresAt: ${expiresAt.toISOString()}`)
      console.log(`[ProcessPayment]   - Current time: ${finalNow.toISOString()}`)
      console.log(`[ProcessPayment]   - Days from now: ${finalDaysFromNow}`)
      console.log(`[ProcessPayment]   - Product days: ${productDays}`)
      
      if (conversion?.success && conversion?.data) {
        const convertedDays = conversion.data.convertedDays || 0
        const expectedDays = productDays + convertedDays
        console.log(`[ProcessPayment]   - Converted days: ${convertedDays}`)
        console.log(`[ProcessPayment]   - Expected days: ${expectedDays} (${productDays} new + ${convertedDays} converted)`)
        
        if (finalDaysFromNow !== expectedDays) {
          console.error(`[ProcessPayment] ❌❌❌ CRITICAL: Days mismatch! Expected ${expectedDays}, got ${finalDaysFromNow}`)
          console.error(`[ProcessPayment] FORCING CORRECT EXPIRATION DATE!`)
          expiresAt = new Date(finalNow.getTime() + (expectedDays * 24 * 60 * 60 * 1000))
          console.log(`[ProcessPayment] CORRECTED expiresAt: ${expiresAt.toISOString()}`)
          const correctedDays = Math.round((expiresAt.getTime() - finalNow.getTime()) / (1000 * 60 * 60 * 24))
          console.log(`[ProcessPayment] CORRECTED days from now: ${correctedDays}`)
        }
      } else {
        console.warn(`[ProcessPayment] ⚠️ No conversion data available for final check`)
      }
    }
    
    // При апгрейде не перезаписываем subscription_duration_months, так как это может быть некорректно
    // Срок подписки определяется по subscription_expires_at
    updateData = {
      subscription_tier: tier,
      subscription_status: 'active',
      subscription_expires_at: expiresAt.toISOString(),
      next_billing_date: expiresAt.toISOString(),
      payment_method_id: paymentMethodId || profile.payment_method_id,
      auto_renew_enabled: !!paymentMethodId || profile.auto_renew_enabled,
      failed_payment_attempts: 0,
      last_payment_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    console.log(`[ProcessPayment] Will set expires_at to: ${expiresAt.toISOString()}`)
    console.log(`[ProcessPayment] Update data:`, JSON.stringify(updateData, null, 2))
  }
  // ЛОГИКА ДЛЯ ОБЫЧНОЙ ПОКУПКИ (PURCHASE)
  else {
    console.log(`[ProcessPayment] ========== NEW PURCHASE ==========`)
    console.log(`[ProcessPayment] User: ${userId}`)
    console.log(`[ProcessPayment] Product: ${product.name} (Level ${product.tier_level})`)
    console.log(`[ProcessPayment] Duration: ${product.duration_months} months`)
    
    // Ровно 30 дней на месяц от текущего момента
    const now = new Date()
    const durationDays = product.duration_months * 30
    
    console.log(`[ProcessPayment] Current time: ${now.toISOString()}`)
    console.log(`[ProcessPayment] Calculated days: ${durationDays} (${product.duration_months} months * 30 days)`)
    console.log(`[ProcessPayment] Adding milliseconds: ${durationDays * 24 * 60 * 60 * 1000}`)
    
    // Устанавливаем срок: ровно durationDays от текущего момента
    expiresAt = new Date(now.getTime() + (durationDays * 24 * 60 * 60 * 1000))
    const nextBillingDate = expiresAt
    
    console.log(`[ProcessPayment] Expiration date: ${expiresAt.toISOString()}`)
    console.log(`[ProcessPayment] Expected days: ${((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)).toFixed(4)}`)
    console.log(`[ProcessPayment] ===================================`)
    
    updateData = {
      subscription_tier: tier,
      subscription_status: 'active',
      subscription_duration_months: product.duration_months,
      subscription_expires_at: expiresAt.toISOString(),
      next_billing_date: nextBillingDate.toISOString(),
      payment_method_id: paymentMethodId || null,
      auto_renew_enabled: !!paymentMethodId,
      failed_payment_attempts: 0,
      last_payment_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }
  
  // Обновить профиль
  console.log(`[ProcessPayment] ========== UPDATING PROFILE ==========`)
  console.log(`[ProcessPayment] User ID: ${userId}`)
  console.log(`[ProcessPayment] Update data:`, JSON.stringify(updateData, null, 2))
  
  const { data: updatedProfile, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single()
  
  if (error) {
    console.error('[ProcessPayment] ❌ Error updating profile:', error)
    return { success: false, error: 'Failed to update subscription' }
  }
  
  console.log(`[ProcessPayment] ✅ Profile updated successfully`)
  console.log(`[ProcessPayment] New expires_at: ${updatedProfile?.subscription_expires_at}`)
  console.log(`[ProcessPayment] New tier: ${updatedProfile?.subscription_tier}`)
  
  // Проверим сколько дней теперь осталось
  if (updatedProfile?.subscription_expires_at) {
    const checkExpires = new Date(updatedProfile.subscription_expires_at)
    const checkNow = new Date()
    const checkDiff = checkExpires.getTime() - checkNow.getTime()
    const checkDays = Math.floor(checkDiff / (1000 * 60 * 60 * 24))
    console.log(`[ProcessPayment] Verification: ${checkDays} days remaining after update`)
    console.log(`[ProcessPayment] Time diff: ${(checkDiff / (1000 * 60 * 60 * 24)).toFixed(4)} days`)
  }
  
  console.log(`[ProcessPayment] =======================================`)
  
  // Создать запись о покупке
  const purchaseData: any = {
    user_id: userId,
    product_id: productId,
    payment_provider: 'yookassa',
    payment_id: paymentId || `payment_${Date.now()}`,
    amount: product.price,
    actual_paid_amount: actualPaidAmount || product.price,
    purchased_days: product.duration_months * 30
  }
  
  console.log(`[ProcessPayment] Creating/updating purchase record:`, JSON.stringify(purchaseData, null, 2))
  
  // Используем upsert чтобы обновить существующую запись если пользователь покупает тот же продукт снова
  const { error: purchaseError } = await supabase
    .from('user_purchases')
    .upsert(purchaseData, {
      onConflict: 'user_id,product_id',
      ignoreDuplicates: false
    })
  
  if (purchaseError) {
    console.error('[ProcessPayment] ❌ Error creating/updating purchase record:', purchaseError)
    // Не критично, продолжаем
  } else {
    console.log(`[ProcessPayment] ✅ Purchase record created/updated`)
  }
  
  console.log(`[ProcessPayment] Successfully updated profile for user ${userId}`)
  return { success: true, subscriptionUpdated: true }
}


/**
 * Увеличить счетчик неудачных попыток оплаты
 */
export async function incrementFailedPaymentAttempts(
  userId: string
): Promise<number> {
  const supabase = await createClient()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('failed_payment_attempts')
    .eq('id', userId)
    .single()
  
  const newAttempts = (profile?.failed_payment_attempts || 0) + 1
  
  await supabase
    .from('profiles')
    .update({ 
      failed_payment_attempts: newAttempts,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
  
  return newAttempts
}

/**
 * Перевести пользователя на Free тариф после неудачных попыток
 */
export async function downgradeToFree(userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_tier: 'free',
      subscription_status: 'inactive',
      subscription_expires_at: new Date().toISOString(),
      auto_renew_enabled: false,
      failed_payment_attempts: 0,
      next_billing_date: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
  
  if (error) {
    console.error('Error downgrading to free:', error)
    return false
  }
  
  return true
}


// ============================================
// Вспомогательные функции
// ============================================

/**
 * Рассчитать экономию от скидки
 */
export function calculateSavings(
  basePrice: number,
  months: number,
  discountPercentage: number
): number {
  const fullPrice = basePrice * months
  const discountedPrice = fullPrice * (1 - discountPercentage / 100)
  return Math.round(fullPrice - discountedPrice)
}

/**
 * Получить цену за день
 */
export function getPricePerDay(price: number, months: number): number {
  const days = months * 30
  return Math.round((price / days) * 100) / 100
}

