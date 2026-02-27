'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Profile, ProfileUpdate } from '@/types/database'
import { expireSubscription } from '@/lib/services/subscription-manager'
import { isSubscriptionExpired } from '@/types/database'

/**
 * Проверить и зафиксировать истечение подписки.
 * Вызывается при загрузке дашборда, если клиент обнаружил истечение.
 * subscription_tier не сбрасывается — нужен для UI и истории.
 */
export async function checkAndExpireSubscription(userId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) return

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, subscription_expires_at, is_frozen')
    .eq('id', userId)
    .single()

  if (
    profile?.subscription_status === 'active' &&
    !profile.is_frozen &&
    isSubscriptionExpired(profile.subscription_expires_at)
  ) {
    await expireSubscription(userId)
  }
}

/**
 * Получить профиль текущего пользователя
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('Error getting user:', userError)
      return null
    }
    
    if (!user) {
      console.log('No user found')
      return null
    }

    // Убрано избыточное логирование для уменьшения шума в консоли
    // console.log('Fetching profile for user:', user.id, user.email)

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    // Если профиля нет (триггер не сработал), создаем вручную
    if (error) {
      console.error('Error fetching profile:', error.message || error)
      return null
    }

    if (!profile) {
      // Убрано: revalidatePath вызывает бесконечные циклы рендеринга при вызове из Layout
      // console.log('Profile not found, creating one...')
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            role: 'user',
            subscription_status: 'active', // Устанавливаем active по умолчанию для новых
            subscription_tier: 'free'
          })
          .select()
          .single()

        if (createError) {
          // Если получили ошибку дублирования ключа (23505), 
          // значит профиль уже создан триггером - просто получаем его
          if (createError.code === '23505') {
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single()
            
            return existingProfile
          }
          
          console.error('Error creating profile:', createError.code, createError.message, createError.details)
          return null
        }

        return newProfile
      }

    // Убрано избыточное логирование
    // console.log('Profile found:', profile)
    return profile
  } catch (err) {
    console.error('Unexpected error in getCurrentProfile:', err)
    return null
  }
}

/**
 * Обновить профиль пользователя
 */
export async function updateProfile(
  profileId: string,
  updates: ProfileUpdate
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.id !== profileId) {
    return { success: false, error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', profileId)

  if (error) {
    console.error('Error updating profile:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

/**
 * Обновить статистику пользователя (геймификация)
 */
export async function updateUserStats(
  userId: string,
  stats: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.id !== userId) {
    return { success: false, error: 'Unauthorized' }
  }

  // Получаем текущие статы
  const { data: profile } = await supabase
    .from('profiles')
    .select('stats')
    .eq('id', userId)
    .single()

  if (!profile) {
    return { success: false, error: 'Profile not found' }
  }

  // Мержим новые статы со старыми
  const currentStats = (profile.stats as Record<string, any>) || {}
  const updatedStats = { ...currentStats, ...stats }

  const { error } = await supabase
    .from('profiles')
    .update({ stats: updatedStats })
    .eq('id', userId)

  if (error) {
    console.error('Error updating stats:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

/**
 * Увеличить счетчик завершенных тренировок
 */
export async function incrementWorkoutCount(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.id !== userId) {
    return { success: false, error: 'Unauthorized' }
  }

  // Получаем текущие статы
  const { data: profile } = await supabase
    .from('profiles')
    .select('stats')
    .eq('id', userId)
    .single()

  if (!profile) {
    return { success: false, error: 'Profile not found' }
  }

  const currentStats = (profile.stats as Record<string, any>) || {}
  const workoutsCompleted = (currentStats.workouts_completed || 0) + 1

  const updatedStats = {
    ...currentStats,
    workouts_completed: workoutsCompleted,
    last_workout_at: new Date().toISOString()
  }

  const { error } = await supabase
    .from('profiles')
    .update({ stats: updatedStats })
    .eq('id', userId)

  if (error) {
    console.error('Error incrementing workout count:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

