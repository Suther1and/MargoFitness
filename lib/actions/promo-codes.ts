'use server'

import { createClient } from '@/lib/supabase/server'
import { PromoCode, PromoCodeInsert, PromoCodeUpdate } from '@/types/database'
import { revalidatePath } from 'next/cache'

// ============================================
// Получение данных
// ============================================

/**
 * Проверить и получить данные промокода
 */
export async function validatePromoCode(
  code: string,
  productId?: string
): Promise<{
  success: boolean
  data?: PromoCode
  error?: string
}> {
  const supabase = await createClient()

  try {
    // Получаем промокод
    const { data: promo, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single()

    if (error || !promo) {
      return { success: false, error: 'Промокод не найден или неактивен' }
    }

    // Проверяем срок действия
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return { success: false, error: 'Срок действия промокода истек' }
    }

    // Проверяем лимит использований
    if (promo.usage_limit !== null && promo.usage_count >= promo.usage_limit) {
      return { success: false, error: 'Промокод исчерпан' }
    }

    // Проверяем применимость к продукту
    if (productId && promo.applicable_products) {
      const applicableProducts = promo.applicable_products as string[]
      if (!applicableProducts.includes(productId)) {
        return { success: false, error: 'Промокод не применим к этому продукту' }
      }
    }

    return { success: true, data: promo }
  } catch (error) {
    console.error('Error validating promo code:', error)
    return { success: false, error: 'Ошибка при проверке промокода' }
  }
}

/**
 * Увеличить счетчик использований промокода
 */
export async function incrementPromoUsage(promoId: string): Promise<{
  success: boolean
  error?: string
}> {
  const supabase = await createClient()

  try {
    const { error } = await supabase.rpc('increment', {
      table_name: 'promo_codes',
      row_id: promoId,
      column_name: 'usage_count',
    })

    // Если RPC не работает, используем обычный UPDATE
    if (error) {
      const { data: promo } = await supabase
        .from('promo_codes')
        .select('usage_count')
        .eq('id', promoId)
        .single()

      if (promo) {
        await supabase
          .from('promo_codes')
          .update({ usage_count: promo.usage_count + 1 })
          .eq('id', promoId)
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error incrementing promo usage:', error)
    return { success: false, error: 'Ошибка при обновлении счетчика' }
  }
}

/**
 * Рассчитать скидку по промокоду
 */
export async function calculatePromoDiscount(
  code: string,
  basePrice: number,
  productId?: string
): Promise<{
  success: boolean
  discount?: number
  promoData?: PromoCode
  error?: string
}> {
  const validationResult = await validatePromoCode(code, productId)
  if (!validationResult.success || !validationResult.data) {
    return { success: false, error: validationResult.error }
  }

  const promo = validationResult.data
  let discount = 0

  if (promo.discount_type === 'percent') {
    discount = Math.floor(basePrice * (promo.discount_value / 100))
  } else {
    discount = Math.min(promo.discount_value, basePrice)
  }

  return {
    success: true,
    discount,
    promoData: promo,
  }
}

// ============================================
// Админские функции
// ============================================

/**
 * Создать промокод (только админ)
 */
export async function createPromoCode(data: {
  code: string
  discountType: 'percent' | 'fixed_amount'
  discountValue: number
  applicableProducts?: string[] | null
  usageLimit?: number | null
  expiresAt?: string | null
}): Promise<{
  success: boolean
  data?: PromoCode
  error?: string
}> {
  const supabase = await createClient()

  // Проверяем права админа
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Необходимо авторизоваться' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { success: false, error: 'Недостаточно прав' }
  }

  try {
    // Проверяем уникальность кода
    const { data: existing } = await supabase
      .from('promo_codes')
      .select('id')
      .eq('code', data.code.toUpperCase())
      .single()

    if (existing) {
      return { success: false, error: 'Промокод с таким кодом уже существует' }
    }

    // Создаем промокод
    const { data: promo, error } = await supabase
      .from('promo_codes')
      .insert({
        code: data.code.toUpperCase(),
        discount_type: data.discountType,
        discount_value: data.discountValue,
        applicable_products: data.applicableProducts || null,
        usage_limit: data.usageLimit || null,
        expires_at: data.expiresAt || null,
        is_active: true,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    revalidatePath('/admin/promo-codes')

    return { success: true, data: promo }
  } catch (error) {
    console.error('Error creating promo code:', error)
    return { success: false, error: 'Ошибка при создании промокода' }
  }
}

/**
 * Получить список всех промокодов (только админ)
 */
export async function getPromoCodes(): Promise<{
  success: boolean
  data?: PromoCode[]
  error?: string
}> {
  const supabase = await createClient()

  // Проверяем права админа
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Необходимо авторизоваться' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { success: false, error: 'Недостаточно прав' }
  }

  try {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching promo codes:', error)
    return { success: false, error: 'Ошибка при получении промокодов' }
  }
}

/**
 * Обновить промокод (только админ)
 */
export async function updatePromoCode(
  id: string,
  updates: PromoCodeUpdate
): Promise<{
  success: boolean
  data?: PromoCode
  error?: string
}> {
  const supabase = await createClient()

  // Проверяем права админа
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Необходимо авторизоваться' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { success: false, error: 'Недостаточно прав' }
  }

  try {
    const { data, error } = await supabase
      .from('promo_codes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    revalidatePath('/admin/promo-codes')

    return { success: true, data }
  } catch (error) {
    console.error('Error updating promo code:', error)
    return { success: false, error: 'Ошибка при обновлении промокода' }
  }
}

/**
 * Деактивировать промокод (только админ)
 */
export async function deactivatePromoCode(id: string): Promise<{
  success: boolean
  error?: string
}> {
  return updatePromoCode(id, { is_active: false })
}

/**
 * Активировать промокод (только админ)
 */
export async function activatePromoCode(id: string): Promise<{
  success: boolean
  error?: string
}> {
  return updatePromoCode(id, { is_active: true })
}

/**
 * Удалить промокод (только админ)
 */
export async function deletePromoCode(id: string): Promise<{
  success: boolean
  error?: string
}> {
  const supabase = await createClient()

  // Проверяем права админа
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Необходимо авторизоваться' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { success: false, error: 'Недостаточно прав' }
  }

  try {
    const { error } = await supabase
      .from('promo_codes')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    revalidatePath('/admin/promo-codes')

    return { success: true }
  } catch (error) {
    console.error('Error deleting promo code:', error)
    return { success: false, error: 'Ошибка при удалении промокода' }
  }
}

/**
 * Получить статистику по промокодам (для админки)
 */
export async function getPromoCodeStats(): Promise<{
  success: boolean
  data?: {
    totalPromoCodes: number
    activePromoCodes: number
    totalUsage: number
    topPromoCodes: Array<{
      code: string
      usageCount: number
      discountType: string
      discountValue: number
    }>
  }
  error?: string
}> {
  const supabase = await createClient()

  // Проверяем права админа
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Необходимо авторизоваться' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { success: false, error: 'Недостаточно прав' }
  }

  try {
    const { data: promoCodes } = await supabase
      .from('promo_codes')
      .select('*')

    const totalPromoCodes = promoCodes?.length || 0
    const activePromoCodes = promoCodes?.filter(p => p.is_active).length || 0
    const totalUsage = promoCodes?.reduce((sum, p) => sum + p.usage_count, 0) || 0

    const topPromoCodes = promoCodes
      ?.sort((a, b) => b.usage_count - a.usage_count)
      .slice(0, 10)
      .map(p => ({
        code: p.code,
        usageCount: p.usage_count,
        discountType: p.discount_type,
        discountValue: p.discount_value,
      })) || []

    return {
      success: true,
      data: {
        totalPromoCodes,
        activePromoCodes,
        totalUsage,
        topPromoCodes,
      },
    }
  } catch (error) {
    console.error('Error fetching promo code stats:', error)
    return { success: false, error: 'Ошибка при получении статистики' }
  }
}

