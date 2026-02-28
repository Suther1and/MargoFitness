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
import { getFreezeLimits } from '@/lib/constants/subscriptions'

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
  console.log(`[ProcessPayment] Processing ${action} for user ${userId}, product: ${product.name}`)
  
  let expiresAt: Date
  let updateData: any
  
  // ЛОГИКА ДЛЯ ПРОДЛЕНИЯ (RENEWAL)
  if (action === 'renewal') {
    const currentExpires = profile.subscription_expires_at ? new Date(profile.subscription_expires_at) : new Date()
    const now = new Date()
    const baseDate = currentExpires > now ? currentExpires : now
    const additionalDays = product.duration_months * 30
    expiresAt = new Date(baseDate.getTime() + (additionalDays * 24 * 60 * 60 * 1000))
    
    updateData = {
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
  // ЛОГИКА ДЛЯ АПГРЕЙДА (UPGRADE)
  else if (action === 'upgrade') {
    const { calculateUpgradeConversion } = await import('@/lib/actions/subscription-actions')
    const conversion = await calculateUpgradeConversion(userId, product.tier_level || 1, supabase)
    
    if (!conversion.success || !conversion.data) {
      console.error('[ProcessPayment] Failed to calculate conversion, using fallback')
      expiresAt = addDays(new Date(), product.duration_months * 30)
    } else {
      const productDays = product.duration_months * 30
      const convertedDays = conversion.data.convertedDays || 0
      const totalDays = productDays + convertedDays
      
      // При апгрейде заменяем старую подписку на новую: totalDays от текущего момента
      const now = new Date()
      expiresAt = new Date(now.getTime() + (totalDays * 24 * 60 * 60 * 1000))
      
      // Финальная проверка и коррекция при необходимости
      const finalDaysFromNow = Math.round((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      const expectedDays = productDays + convertedDays
      
      if (finalDaysFromNow !== expectedDays) {
        console.error(`[ProcessPayment] Days mismatch: expected ${expectedDays}, got ${finalDaysFromNow}, correcting...`)
        expiresAt = new Date(now.getTime() + (expectedDays * 24 * 60 * 60 * 1000))
      }
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
    const now = new Date()
    const durationDays = product.duration_months * 30
    expiresAt = new Date(now.getTime() + (durationDays * 24 * 60 * 60 * 1000))
    
    updateData = {
      subscription_tier: tier,
      subscription_status: 'active',
      subscription_duration_months: product.duration_months,
      subscription_expires_at: expiresAt.toISOString(),
      next_billing_date: expiresAt.toISOString(),
      payment_method_id: paymentMethodId || null,
      auto_renew_enabled: !!paymentMethodId,
      failed_payment_attempts: 0,
      last_payment_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }
  
  // Начислить freeze-токены по матрице лимитов
  const freezeLimits = getFreezeLimits(tier, product.duration_months)
  if (freezeLimits.tokens > 0 || freezeLimits.days > 0) {
    if (action === 'purchase') {
      updateData.freeze_tokens_total = freezeLimits.tokens
      updateData.freeze_tokens_used = 0
      updateData.freeze_days_total = freezeLimits.days
      updateData.freeze_days_used = 0
    } else {
      updateData.freeze_tokens_total = (profile.freeze_tokens_total || 0) + freezeLimits.tokens
      updateData.freeze_days_total = (profile.freeze_days_total || 0) + freezeLimits.days
    }
  } else if (action === 'purchase') {
    updateData.freeze_tokens_total = 0
    updateData.freeze_tokens_used = 0
    updateData.freeze_days_total = 0
    updateData.freeze_days_used = 0
  }

  // Обновить профиль
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
    purchased_days: product.duration_months * 30,
    action: action,
    // Сохраняем метаданные из транзакции, если они есть
    metadata: {
      action: action,
      actual_paid_amount: actualPaidAmount,
      payment_id: paymentId
    }
  }
  
  // Пытаемся найти транзакцию, чтобы вытащить промокод и бонусы
  const { data: tx } = await supabase
    .from('payment_transactions')
    .select('metadata')
    .eq('yookassa_payment_id', paymentId)
    .single()

  if (tx?.metadata) {
    const meta = tx.metadata as any
    purchaseData.promo_code = meta.promoCode || meta.promo_code
    purchaseData.bonus_amount_used = meta.bonusUsed || meta.bonus_amount_used
    purchaseData.metadata = {
      ...purchaseData.metadata,
      ...meta
    }
  }
  
  const { error: purchaseError } = await supabase
    .from('user_purchases')
    .insert(purchaseData)
    
  if (purchaseError) {
    console.error('[ProcessPayment] Error inserting purchase history:', purchaseError)
  }
  
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
 * Выставить статус inactive при истечении подписки.
 * subscription_tier НЕ трогаем — он нужен для UI ("PRO · Истекла") и истории.
 * Все freeze-лимиты обнуляются.
 */
export async function expireSubscription(userId: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_status: 'inactive',
      auto_renew_enabled: false,
      is_frozen: false,
      frozen_at: null,
      frozen_until: null,
      freeze_tokens_total: 0,
      freeze_tokens_used: 0,
      freeze_days_total: 0,
      freeze_days_used: 0,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) {
    console.error('[expireSubscription] Error:', error)
    return false
  }

  return true
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

