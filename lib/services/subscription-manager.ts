/**
 * Менеджер подписок - вся бизнес-логика для управления подписками
 * 
 * Функции:
 * - Расчет конвертации дней при апгрейде
 * - Обработка успешных платежей
 * - Автопродление подписок
 * - Обработка неудачных попыток оплаты
 */

import { createClient } from '@/lib/supabase/server'
import { createRecurrentPayment } from './yookassa'
import type { Profile, Product, SubscriptionTier } from '@/types/database'

// ============================================
// Типы
// ============================================

export interface UpgradeConversionResult {
  // Базовые дни нового тарифа
  baseDays: number
  // Дни из конвертации остатка старого тарифа
  convertedDays: number
  // Всего дней новой подписки
  totalDays: number
  // Стоимость остатка старого тарифа
  remainderValue: number
  // Стоимость дня нового тарифа
  newDayPrice: number
  // Детали для отображения пользователю
  details: {
    oldTierName: string
    oldDaysRemaining: number
    oldDayPrice: number
    newTierName: string
    newDaysBase: number
    bonusDays: number
  }
}

export interface ProcessPaymentResult {
  success: boolean
  error?: string
  subscriptionUpdated?: boolean
}

export interface AutoRenewResult {
  success: boolean
  error?: string
  paymentId?: string
  nextBillingDate?: Date
}

// ============================================
// Утилиты для работы с датами
// ============================================

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

function getDaysBetween(date1: Date, date2: Date): number {
  const diffTime = date2.getTime() - date1.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
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

const tierNames: Record<SubscriptionTier, string> = {
  'free': 'Free',
  'basic': 'Basic',
  'pro': 'Pro',
  'elite': 'Elite'
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
// Конвертация дней при апгрейде
// ============================================

/**
 * Получить фактически оплаченную сумму за текущую подписку пользователя
 * Используется для честной конвертации при апгрейде (защита от манипуляций с промокодами)
 * 
 * @param params - параметры для поиска транзакции
 * @returns фактически оплаченная сумма или null если не найдена
 */
export async function getActualSubscriptionPrice(params: {
  userId: string
  tierLevel: number
  durationMonths: number
}): Promise<number | null> {
  const { userId, tierLevel, durationMonths } = params
  
  // Используем service client для доступа к транзакциям
  const { createClient: createServiceClient } = await import('@supabase/supabase-js')
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  // Находим последнюю успешную транзакцию подписки с нужным tier_level
  const { data: transaction, error } = await supabase
    .from('payment_transactions')
    .select('amount, metadata, product_id, products!inner(tier_level, duration_months, type)')
    .eq('user_id', userId)
    .eq('status', 'succeeded')
    .eq('products.type', 'subscription_tier')
    .eq('products.tier_level', tierLevel)
    .eq('products.duration_months', durationMonths)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  if (error || !transaction) {
    console.log(`[getActualSubscriptionPrice] No transaction found for user ${userId}, tier ${tierLevel}, duration ${durationMonths}`)
    return null
  }
  
  console.log(`[getActualSubscriptionPrice] Found actual paid amount: ${transaction.amount}₽ for user ${userId}`)
  return Number(transaction.amount)
}

/**
 * Рассчитать конвертацию дней при апгрейде подписки
 * 
 * Логика:
 * 1. Рассчитываем стоимость оставшихся дней текущей подписки
 * 2. Конвертируем эту стоимость в дни новой подписки
 * 3. Добавляем к базовому периоду новой подписки
 * 
 * Пример:
 * - Текущая: Basic 3 месяца (11397₽), осталось 30 дней
 * - Новая: Pro 6 месяцев (24294₽)
 * - Остаток Basic: 30 дней × (11397₽/90дн) = 3799₽
 * - Конвертация: 3799₽ / (24294₽/180дн) = 28 дней Pro
 * - Итого: 180 + 28 = 208 дней Pro подписки
 */
export function calculateUpgradeConversion(params: {
  currentTierLevel: number
  currentDurationMonths: number
  currentPrice: number
  remainingDays: number
  newTierLevel: number
  newDurationMonths: number
  newPrice: number
  newBaseMonthlyPrice: number // Базовая цена 1 месяца нового тарифа (без скидки за срок)
}): UpgradeConversionResult {
  const {
    currentTierLevel,
    currentDurationMonths,
    currentPrice,
    remainingDays,
    newTierLevel,
    newDurationMonths,
    newPrice,
    newBaseMonthlyPrice
  } = params

  // Стоимость дня текущей подписки
  const currentTotalDays = currentDurationMonths * 30
  const currentDayPrice = currentPrice / currentTotalDays
  
  // Остаток стоимости текущей подписки
  const remainderValue = remainingDays * currentDayPrice
  
  // ИСПРАВЛЕНИЕ: Используем базовую месячную цену для расчета стоимости дня
  // Это гарантирует, что бонусные дни не зависят от срока новой подписки
  const newDayPrice = newBaseMonthlyPrice / 30
  
  // Конвертированные дни
  const convertedDays = Math.floor(remainderValue / newDayPrice)
  
  // Базовые дни новой подписки
  const baseDays = newDurationMonths * 30
  
  // Всего дней
  const totalDays = baseDays + convertedDays

  return {
    baseDays,
    convertedDays,
    totalDays,
    remainderValue,
    newDayPrice,
    details: {
      oldTierName: tierNames[levelToTier[currentTierLevel]],
      oldDaysRemaining: remainingDays,
      oldDayPrice: currentDayPrice,
      newTierName: tierNames[levelToTier[newTierLevel]],
      newDaysBase: baseDays,
      bonusDays: convertedDays
    }
  }
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
  customExpiryDays?: number // Для апгрейда с конвертацией
  isRenewal?: boolean // Для продления текущей подписки
}): Promise<ProcessPaymentResult> {
  const { userId, productId, paymentMethodId, customExpiryDays, isRenewal } = params
  
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
  
  // Рассчитать дату окончания
  let expiresAt: Date
  let nextBillingDate: Date
  
  if (isRenewal) {
    // ПРОДЛЕНИЕ: добавляем время к текущей подписке
    console.log(`[ProcessPayment] Processing RENEWAL for user ${userId}`)
    
    // Получить текущую дату окончания подписки
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('subscription_expires_at, subscription_tier')
      .eq('id', userId)
      .single()
    
    if (currentProfile?.subscription_expires_at) {
      const currentExpiry = new Date(currentProfile.subscription_expires_at)
      const now = new Date()
      
      // Если подписка еще активна - добавляем к текущей дате окончания
      // Если истекла - добавляем от текущего момента
      const baseDate = currentExpiry > now ? currentExpiry : now
      expiresAt = addMonths(baseDate, product.duration_months)
      
      console.log(`[ProcessPayment] Renewal: base date ${baseDate.toISOString()}, adding ${product.duration_months} months, new expiry: ${expiresAt.toISOString()}`)
    } else {
      // Нет текущей подписки - добавляем от сейчас
      expiresAt = addMonths(new Date(), product.duration_months)
    }
    
    nextBillingDate = expiresAt
  } else if (customExpiryDays) {
    // Для апгрейда - используем кастомное количество дней
    expiresAt = addDays(new Date(), customExpiryDays)
    nextBillingDate = expiresAt
  } else {
    // Обычная покупка - добавляем месяцы
    expiresAt = addMonths(new Date(), product.duration_months)
    nextBillingDate = expiresAt
  }
  
  // Обновить профиль
  console.log(`[ProcessPayment] Updating profile for user ${userId}, tier: ${tier}, expires: ${expiresAt.toISOString()}, isRenewal: ${isRenewal}`)
  
  const updateData: any = {
    subscription_status: 'active',
    subscription_duration_months: product.duration_months,
    subscription_expires_at: expiresAt.toISOString(),
    next_billing_date: nextBillingDate.toISOString(),
    payment_method_id: paymentMethodId || null,
    auto_renew_enabled: !!paymentMethodId, // Включаем автопродление если есть карта
    failed_payment_attempts: 0,
    last_payment_date: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  // При продлении НЕ меняем tier (только если это не апгрейд)
  if (!isRenewal) {
    updateData.subscription_tier = tier
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

// ============================================
// Автопродление
// ============================================

/**
 * Попытка автоматического продления подписки
 */
export async function autoRenewSubscription(
  profile: Profile
): Promise<AutoRenewResult> {
  // Проверки
  if (!profile.payment_method_id) {
    return { success: false, error: 'No payment method saved' }
  }
  
  if (!profile.auto_renew_enabled) {
    return { success: false, error: 'Auto-renew disabled' }
  }
  
  // Найти продукт для продления (тот же тариф и период)
  const product = await findProductByTierAndDuration(
    profile.subscription_tier,
    profile.subscription_duration_months
  )
  
  if (!product) {
    return { success: false, error: 'Product not found' }
  }
  
  // Попытка списания
  try {
    const payment = await createRecurrentPayment({
      amount: product.price,
      paymentMethodId: profile.payment_method_id,
      description: `Автопродление подписки ${product.name}`,
      metadata: {
        userId: profile.id,
        productId: product.id,
        type: 'auto_renewal'
      }
    })
    
    // Проверка успеха
    if (payment.status === 'succeeded' && payment.paid) {
      // Обработать успешный платеж
      const result = await processSuccessfulPayment({
        userId: profile.id,
        productId: product.id,
        paymentMethodId: profile.payment_method_id
      })
      
      if (result.success) {
        return {
          success: true,
          paymentId: payment.id,
          nextBillingDate: addMonths(new Date(), product.duration_months)
        }
      }
    }
    
    return { success: false, error: 'Payment not succeeded' }
    
  } catch (error) {
    console.error('Auto-renew payment failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Payment failed' 
    }
  }
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
// Поиск подписок для автопродления
// ============================================

/**
 * Найти подписки которые истекают завтра и требуют автопродления
 */
export async function findSubscriptionsForRenewal(): Promise<Profile[]> {
  const supabase = await createClient()
  
  // Завтрашняя дата
  const tomorrow = addDays(new Date(), 1)
  const startOfTomorrow = new Date(tomorrow)
  startOfTomorrow.setHours(0, 0, 0, 0)
  
  const endOfTomorrow = new Date(tomorrow)
  endOfTomorrow.setHours(23, 59, 59, 999)
  
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('subscription_status', 'active')
    .eq('auto_renew_enabled', true)
    .gte('next_billing_date', startOfTomorrow.toISOString())
    .lte('next_billing_date', endOfTomorrow.toISOString())
    .not('payment_method_id', 'is', null)
  
  if (error) {
    console.error('Error finding subscriptions for renewal:', error)
    return []
  }
  
  return profiles || []
}

// ============================================
// Вспомогательные функции
// ============================================

/**
 * Получить количество оставшихся дней подписки
 */
export function getRemainingDays(expiresAt: string | null): number {
  if (!expiresAt) return 0
  
  const now = new Date()
  const expiry = new Date(expiresAt)
  
  return getDaysBetween(now, expiry)
}

/**
 * Проверить можно ли сделать апгрейд
 */
export function canUpgrade(
  currentTierLevel: number,
  newTierLevel: number
): boolean {
  return newTierLevel > currentTierLevel
}

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

