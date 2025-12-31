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
}): Promise<ProcessPaymentResult> {
  const { userId, productId, paymentMethodId } = params
  
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
  
  // Определить тариф
  const tier = levelToTier[product.tier_level || 1]
  
  // Рассчитать дату окончания - обычная покупка
  const expiresAt = addMonths(new Date(), product.duration_months)
  const nextBillingDate = expiresAt
  
  // Обновить профиль
  console.log(`[ProcessPayment] Updating profile for user ${userId}, tier: ${tier}, expires: ${expiresAt.toISOString()}`)
  
  const updateData: any = {
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
  
  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', userId)
  
  if (error) {
    console.error('[ProcessPayment] Error updating profile:', error)
    return { success: false, error: 'Failed to update subscription' }
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

