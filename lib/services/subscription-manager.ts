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

function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

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
  
  let expiresAt: Date
  let updateData: any
  
  // ЛОГИКА ДЛЯ ПРОДЛЕНИЯ (RENEWAL)
  if (action === 'renewal') {
    console.log(`[ProcessPayment] Processing RENEWAL for user ${userId}`)
    
    const currentExpires = profile.subscription_expires_at ? new Date(profile.subscription_expires_at) : new Date()
    const now = new Date()
    
    // Если подписка еще активна - добавляем к expires_at
    // Если истекла - добавляем к текущей дате
    const baseDate = currentExpires > now ? currentExpires : now
    expiresAt = addDays(baseDate, product.duration_months * 30)
    
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
    console.log(`[ProcessPayment] Processing UPGRADE for user ${userId}`)
    
    // Импортируем функцию расчета конвертации
    const { calculateUpgradeConversion } = await import('@/lib/actions/subscription-actions')
    const conversion = await calculateUpgradeConversion(userId, product.tier_level || 1)
    
    if (!conversion.success || !conversion.data) {
      console.error('[ProcessPayment] Failed to calculate conversion:', conversion.error)
      // Fallback: просто даем купленные дни без конвертации
      expiresAt = addDays(new Date(), product.duration_months * 30)
    } else {
      // Купленные дни + конвертированные дни
      const totalDays = (product.duration_months * 30) + conversion.data.convertedDays
      expiresAt = addDays(new Date(), totalDays)
      console.log(`[ProcessPayment] Upgrade conversion: ${conversion.data.remainingDays} days → ${conversion.data.convertedDays} days. Total: ${totalDays} days`)
    }
    
    updateData = {
      subscription_tier: tier,
      subscription_status: 'active',
      subscription_duration_months: product.duration_months,
      subscription_expires_at: expiresAt.toISOString(),
      next_billing_date: expiresAt.toISOString(),
      payment_method_id: paymentMethodId || profile.payment_method_id,
      auto_renew_enabled: !!paymentMethodId || profile.auto_renew_enabled,
      failed_payment_attempts: 0,
      last_payment_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }
  // ЛОГИКА ДЛЯ ОБЫЧНОЙ ПОКУПКИ (PURCHASE)
  else {
    console.log(`[ProcessPayment] Processing PURCHASE for user ${userId}`)
    
    expiresAt = addMonths(new Date(), product.duration_months)
    const nextBillingDate = expiresAt
    
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
  console.log(`[ProcessPayment] Updating profile for user ${userId}, action: ${action}, tier: ${tier}, expires: ${expiresAt.toISOString()}`)
  
  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', userId)
  
  if (error) {
    console.error('[ProcessPayment] Error updating profile:', error)
    return { success: false, error: 'Failed to update subscription' }
  }
  
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
  
  const { error: purchaseError } = await supabase
    .from('user_purchases')
    .insert(purchaseData)
  
  if (purchaseError) {
    console.error('[ProcessPayment] Error creating purchase record:', purchaseError)
    // Не критично, продолжаем
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

