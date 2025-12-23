'use server'

import { createClient } from '@/lib/supabase/server'
import type { Product, UserPurchase } from '@/types/database'

/**
 * Получить все активные продукты
 */
export async function getActiveProducts(): Promise<Product[]> {
  const supabase = await createClient()

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('price', { ascending: true })

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return products || []
}

/**
 * Получить подписки (3 тира)
 * @deprecated Используйте getSubscriptionsByDuration
 */
export async function getSubscriptionTiers(): Promise<Product[]> {
  const supabase = await createClient()

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('type', 'subscription_tier')
    .eq('is_active', true)
    .order('tier_level', { ascending: true })

  if (error) {
    console.error('Error fetching subscription tiers:', error)
    return []
  }

  return products || []
}

/**
 * Получить подписки по длительности (Basic, Pro, Elite для выбранного периода)
 * @param durationMonths - Длительность в месяцах (1, 3, 6, 12)
 */
export async function getSubscriptionsByDuration(durationMonths: number): Promise<Product[]> {
  const supabase = await createClient()

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('type', 'subscription_tier')
    .eq('is_active', true)
    .eq('duration_months', durationMonths)
    .order('tier_level', { ascending: true })

  if (error) {
    console.error('Error fetching subscriptions by duration:', error)
    return []
  }

  return products || []
}

/**
 * Получить one-time паки
 */
export async function getOneTimePacks(): Promise<Product[]> {
  const supabase = await createClient()

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('type', 'one_time_pack')
    .eq('is_active', true)
    .order('price', { ascending: true })

  if (error) {
    console.error('Error fetching one-time packs:', error)
    return []
  }

  return products || []
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
    console.error('Error fetching product:', error)
    return null
  }

  return product
}

/**
 * Получить покупки пользователя
 */
export async function getUserPurchases(userId: string): Promise<UserPurchase[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.id !== userId) {
    return []
  }

  const { data: purchases, error } = await supabase
    .from('user_purchases')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user purchases:', error)
    return []
  }

  return purchases || []
}

/**
 * Проверить, купил ли пользователь продукт
 */
export async function hasUserPurchased(
  userId: string,
  productId: string
): Promise<boolean> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.id !== userId) {
    return false
  }

  const { data: purchase, error } = await supabase
    .from('user_purchases')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single()

  return !error && !!purchase
}

/**
 * Получить покупки с деталями продуктов
 */
export async function getUserPurchasesWithProducts(userId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.id !== userId) {
    return []
  }

  const { data, error } = await supabase
    .from('user_purchases')
    .select(`
      *,
      product:products(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching purchases with products:', error)
    return []
  }

  return data || []
}

