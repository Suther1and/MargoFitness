'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from './profile'
import { revalidatePath } from 'next/cache'

/**
 * Мок-покупка подписки
 * Имитирует успешную оплату и обновляет профиль пользователя
 */
export async function mockPurchaseSubscription(productId: string): Promise<{
  success: boolean
  error?: string
  redirectUrl?: string
}> {
  const profile = await getCurrentProfile()

  if (!profile) {
    return { success: false, error: 'Необходимо авторизоваться' }
  }

  const supabase = await createClient()

  // 1. Получить информацию о продукте
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .eq('type', 'subscription_tier')
    .single()

  if (productError || !product) {
    return { success: false, error: 'Продукт не найден' }
  }

  // 2. Определить уровень подписки
  const tierMap: Record<number, 'free' | 'basic' | 'pro' | 'elite'> = {
    1: 'basic',
    2: 'pro',
    3: 'elite',
  }

  const newTier = tierMap[product.tier_level || 1]

  if (!newTier) {
    return { success: false, error: 'Некорректный уровень подписки' }
  }

  // 3. Рассчитать дату истечения (30 дней от сегодня)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30)

  // 4. Обновить профиль
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      subscription_tier: newTier,
      subscription_status: 'active',
      subscription_expires_at: expiresAt.toISOString(),
    })
    .eq('id', profile.id)

  if (updateError) {
    console.error('Error updating profile:', updateError)
    return { success: false, error: 'Ошибка обновления профиля' }
  }

  // 5. Создать запись о покупке
  const { error: purchaseError } = await supabase
    .from('user_purchases')
    .insert({
      user_id: profile.id,
      product_id: productId,
      amount: product.price,
      payment_provider: 'mock',
      payment_id: `mock_${Date.now()}`,
    })

  if (purchaseError) {
    console.error('Error creating purchase record:', purchaseError)
    // Не критично, продолжаем
  }

  // 6. Обновить кеш
  revalidatePath('/dashboard')
  revalidatePath('/workouts')
  revalidatePath('/pricing')

  return {
    success: true,
    redirectUrl: '/dashboard',
  }
}

/**
 * Отмена подписки
 */
export async function cancelSubscription(): Promise<{
  success: boolean
  error?: string
}> {
  const profile = await getCurrentProfile()

  if (!profile) {
    return { success: false, error: 'Необходимо авторизоваться' }
  }

  const supabase = await createClient()

  // Установить статус "canceled", но не менять tier и expires_at
  // Пользователь сохранит доступ до конца оплаченного периода
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_status: 'canceled',
    })
    .eq('id', profile.id)

  if (error) {
    console.error('Error canceling subscription:', error)
    return { success: false, error: 'Ошибка отмены подписки' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/workouts')

  return { success: true }
}

