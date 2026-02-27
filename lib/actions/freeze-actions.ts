'use server'

import { createClient } from '@/lib/supabase/server'
import type { SubscriptionFreeze } from '@/types/database'
import { getFreezeLimits } from '@/lib/constants/subscriptions'
import type { SubscriptionTier } from '@/types/database'

export interface FreezeInfo {
  tokensTotal: number
  tokensUsed: number
  tokensRemaining: number
  daysTotal: number
  daysUsed: number
  daysRemaining: number
  isFrozen: boolean
  frozenAt: string | null
  frozenUntil: string | null
  frozenDaysElapsed: number
  frozenDaysLeft: number
  history: SubscriptionFreeze[]
}

export async function getFreezeInfo(userId: string): Promise<{
  success: boolean
  data?: FreezeInfo
  error?: string
}> {
  try {
    const supabase = await createClient()

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('freeze_tokens_total, freeze_tokens_used, freeze_days_total, freeze_days_used, is_frozen, frozen_at, frozen_until')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return { success: false, error: 'Profile not found' }
    }

    const { data: history } = await supabase
      .from('subscription_freezes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    let frozenDaysElapsed = 0
    let frozenDaysLeft = 0

    if (profile.is_frozen && profile.frozen_at) {
      const now = new Date()
      const frozenAt = new Date(profile.frozen_at)
      frozenDaysElapsed = Math.max(0, Math.floor((now.getTime() - frozenAt.getTime()) / (1000 * 60 * 60 * 24)))

      const daysRemaining = profile.freeze_days_total - profile.freeze_days_used
      frozenDaysLeft = Math.max(0, daysRemaining - frozenDaysElapsed)
    }

    return {
      success: true,
      data: {
        tokensTotal: profile.freeze_tokens_total,
        tokensUsed: profile.freeze_tokens_used,
        tokensRemaining: profile.freeze_tokens_total - profile.freeze_tokens_used,
        daysTotal: profile.freeze_days_total,
        daysUsed: profile.freeze_days_used,
        daysRemaining: profile.freeze_days_total - profile.freeze_days_used,
        isFrozen: profile.is_frozen,
        frozenAt: profile.frozen_at,
        frozenUntil: profile.frozen_until,
        frozenDaysElapsed,
        frozenDaysLeft,
        history: (history || []) as SubscriptionFreeze[],
      },
    }
  } catch (error) {
    console.error('[getFreezeInfo] Error:', error)
    return { success: false, error: 'Internal error' }
  }
}

export async function freezeSubscription(userId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== userId) {
      return { success: false, error: 'Unauthorized' }
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_expires_at, is_frozen, freeze_tokens_total, freeze_tokens_used, freeze_days_total, freeze_days_used')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return { success: false, error: 'Profile not found' }
    }

    if (profile.subscription_status !== 'active') {
      return { success: false, error: 'Подписка не активна' }
    }

    if (profile.is_frozen) {
      return { success: false, error: 'Подписка уже заморожена' }
    }

    const tokensRemaining = profile.freeze_tokens_total - profile.freeze_tokens_used
    if (tokensRemaining <= 0) {
      return { success: false, error: 'Заморозки закончились' }
    }

    const daysRemaining = profile.freeze_days_total - profile.freeze_days_used
    if (daysRemaining <= 0) {
      return { success: false, error: 'Дни заморозки закончились' }
    }

    const now = new Date()
    const frozenUntil = new Date(now.getTime() + daysRemaining * 24 * 60 * 60 * 1000)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        is_frozen: true,
        frozen_at: now.toISOString(),
        frozen_until: frozenUntil.toISOString(),
        freeze_tokens_used: profile.freeze_tokens_used + 1,
        updated_at: now.toISOString(),
      })
      .eq('id', userId)

    if (updateError) {
      console.error('[freezeSubscription] Update error:', updateError)
      return { success: false, error: 'Не удалось заморозить подписку' }
    }

    await supabase.from('subscription_freezes').insert({
      user_id: userId,
      started_at: now.toISOString(),
      days_used: 0,
    })

    return { success: true }
  } catch (error) {
    console.error('[freezeSubscription] Error:', error)
    return { success: false, error: 'Internal error' }
  }
}

export async function unfreezeSubscription(userId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== userId) {
      return { success: false, error: 'Unauthorized' }
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_frozen, frozen_at, subscription_expires_at, freeze_days_total, freeze_days_used')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return { success: false, error: 'Profile not found' }
    }

    if (!profile.is_frozen || !profile.frozen_at) {
      return { success: false, error: 'Подписка не заморожена' }
    }

    return performUnfreeze(supabase, userId, profile, 'manual_unfreeze')
  } catch (error) {
    console.error('[unfreezeSubscription] Error:', error)
    return { success: false, error: 'Internal error' }
  }
}

/**
 * Lazy-инициализация freeze-токенов для существующих подписок.
 * Если подписка активна, duration > 1 мес и freeze_tokens_total = 0 — назначаем по матрице.
 */
export async function ensureFreezeTokens(userId: string): Promise<void> {
  try {
    const supabase = await createClient()

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_tier, subscription_duration_months, freeze_tokens_total')
      .eq('id', userId)
      .single()

    if (!profile) return
    if (profile.subscription_status !== 'active') return
    if (profile.freeze_tokens_total > 0) return

    const duration = profile.subscription_duration_months || 1
    if (duration <= 1) return

    const limits = getFreezeLimits(profile.subscription_tier as SubscriptionTier, duration)
    if (limits.tokens <= 0) return

    await supabase
      .from('profiles')
      .update({
        freeze_tokens_total: limits.tokens,
        freeze_days_total: limits.days,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    console.log(`[ensureFreezeTokens] Assigned ${limits.tokens} tokens, ${limits.days} days to user ${userId}`)
  } catch (error) {
    console.error('[ensureFreezeTokens] Error:', error)
  }
}

export async function checkAndAutoUnfreeze(userId: string): Promise<void> {
  try {
    const supabase = await createClient()

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_frozen, frozen_at, frozen_until, subscription_expires_at, freeze_days_total, freeze_days_used')
      .eq('id', userId)
      .single()

    if (!profile?.is_frozen || !profile.frozen_until) return

    const now = new Date()
    const frozenUntil = new Date(profile.frozen_until)

    if (now >= frozenUntil) {
      await performUnfreeze(supabase, userId, profile, 'days_exhausted')
    }
  } catch (error) {
    console.error('[checkAndAutoUnfreeze] Error:', error)
  }
}

async function performUnfreeze(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  profile: {
    is_frozen: boolean
    frozen_at: string | null
    subscription_expires_at: string | null
    freeze_days_total: number
    freeze_days_used: number
  },
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const now = new Date()
  const frozenAt = new Date(profile.frozen_at!)
  const actualFrozenDays = Math.max(1, Math.ceil((now.getTime() - frozenAt.getTime()) / (1000 * 60 * 60 * 24)))

  const maxAvailableDays = profile.freeze_days_total - profile.freeze_days_used
  const daysToCharge = Math.min(actualFrozenDays, maxAvailableDays)

  const currentExpires = profile.subscription_expires_at
    ? new Date(profile.subscription_expires_at)
    : new Date()

  const newExpires = new Date(currentExpires.getTime() + daysToCharge * 24 * 60 * 60 * 1000)

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      is_frozen: false,
      frozen_at: null,
      frozen_until: null,
      freeze_days_used: profile.freeze_days_used + daysToCharge,
      subscription_expires_at: newExpires.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq('id', userId)

  if (updateError) {
    console.error('[performUnfreeze] Update error:', updateError)
    return { success: false, error: 'Не удалось разморозить подписку' }
  }

  await supabase
    .from('subscription_freezes')
    .update({
      ended_at: now.toISOString(),
      days_used: daysToCharge,
      reason,
    })
    .eq('user_id', userId)
    .is('ended_at', null)

  return { success: true }
}
