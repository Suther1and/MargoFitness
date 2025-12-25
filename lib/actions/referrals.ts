'use server'

import { createClient } from '@/lib/supabase/server'
import {
  Referral,
  ReferralCode,
  calculateReferralLevel,
  getReferralLevelData,
  calculateLevelProgress,
  BONUS_CONSTANTS,
} from '@/types/database'
import { addBonusTransaction, getUserBonusAccount } from './bonuses'
import { revalidatePath } from 'next/cache'

// ============================================
// Получение данных
// ============================================

/**
 * Получить реферальный код пользователя
 */
export async function getUserReferralCode(userId: string): Promise<{
  success: boolean
  data?: ReferralCode
  error?: string
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('referral_codes')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Error fetching referral code:', error)
    return { success: false, error: 'Не удалось получить реферальный код' }
  }

  return { success: true, data }
}

/**
 * Получить реферальный код текущего пользователя
 */
export async function getCurrentUserReferralCode(): Promise<{
  success: boolean
  data?: ReferralCode
  error?: string
}> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Необходимо авторизоваться' }
  }

  return getUserReferralCode(user.id)
}

/**
 * Проверить существование реферального кода
 */
export async function validateReferralCode(code: string): Promise<{
  success: boolean
  data?: { userId: string; userName: string | null }
  error?: string
}> {
  const supabase = await createClient()

  const { data: refCode, error } = await supabase
    .from('referral_codes')
    .select('user_id')
    .eq('code', code)
    .single()

  if (error || !refCode) {
    return { success: false, error: 'Реферальный код не найден' }
  }

  // Получаем имя приглашающего
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', refCode.user_id)
    .single()

  return {
    success: true,
    data: {
      userId: refCode.user_id,
      userName: profile?.full_name || null,
    },
  }
}

/**
 * Получить список рефералов пользователя
 */
export async function getUserReferrals(userId: string): Promise<{
  success: boolean
  data?: Array<Referral & { referred_name: string | null; total_spent: number }>
  error?: string
}> {
  const supabase = await createClient()

  const { data: referrals, error } = await supabase
    .from('referrals')
    .select(`
      *,
      referred:profiles!referrals_referred_id_fkey(full_name)
    `)
    .eq('referrer_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching referrals:', error)
    return { success: false, error: 'Не удалось получить список рефералов' }
  }

  // Получаем сумму покупок каждого реферала
  const enrichedReferrals = await Promise.all(
    (referrals || []).map(async (ref) => {
      const { data: bonusAccount } = await supabase
        .from('user_bonuses')
        .select('total_spent_for_cashback')
        .eq('user_id', ref.referred_id)
        .single()

      return {
        ...ref,
        referred_name: (ref.referred as any)?.full_name || null,
        total_spent: bonusAccount?.total_spent_for_cashback || 0,
      }
    })
  )

  return { success: true, data: enrichedReferrals }
}

/**
 * Получить статистику реферальной программы
 */
export async function getReferralStats(userId: string): Promise<{
  success: boolean
  data?: {
    totalReferrals: number
    activeReferrals: number
    totalEarned: number
    referralLevel: number
    referralPercent: number
    progress: ReturnType<typeof calculateLevelProgress>
    referrals: Array<Referral & { referred_name: string | null; total_spent: number }>
  }
  error?: string
}> {
  const supabase = await createClient()

  try {
    // Получаем бонусный счет для реферальной статистики
    const { data: bonusAccount, error: bonusError } = await supabase
      .from('user_bonuses')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (bonusError || !bonusAccount) {
      throw new Error('Бонусный счет не найден')
    }

    // Получаем список рефералов
    const referralsResult = await getUserReferrals(userId)
    if (!referralsResult.success || !referralsResult.data) {
      throw new Error(referralsResult.error)
    }

    const referrals = referralsResult.data
    const activeReferrals = referrals.filter(r => r.status === 'first_purchase_made').length

    // Получаем общую сумму заработанного с рефералов
    const { data: transactions } = await supabase
      .from('bonus_transactions')
      .select('amount')
      .eq('user_id', userId)
      .in('type', ['referral_bonus', 'referral_first'])

    const totalEarned = transactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0

    const referralLevelData = getReferralLevelData(bonusAccount.referral_level)
    const progress = calculateLevelProgress(bonusAccount.total_referral_earnings, true)

    return {
      success: true,
      data: {
        totalReferrals: referrals.length,
        activeReferrals,
        totalEarned,
        referralLevel: bonusAccount.referral_level,
        referralPercent: referralLevelData.percent,
        progress,
        referrals,
      },
    }
  } catch (error) {
    console.error('Error fetching referral stats:', error)
    return { success: false, error: 'Ошибка при получении статистики' }
  }
}

// ============================================
// Операции с рефералами
// ============================================

/**
 * Зарегистрировать реферала (вызывается при регистрации нового пользователя)
 */
export async function registerReferral(
  referralCode: string,
  newUserId: string
): Promise<{
  success: boolean
  referrerName?: string | null
  error?: string
}> {
  const supabase = await createClient()

  try {
    console.log('[registerReferral] Starting registration with code:', referralCode, 'for user:', newUserId)

    // Проверяем код
    const validationResult = await validateReferralCode(referralCode)
    if (!validationResult.success || !validationResult.data) {
      console.error('[registerReferral] Invalid referral code')
      return { success: false, error: 'Неверный реферальный код' }
    }

    const referrerId = validationResult.data.userId
    console.log('[registerReferral] Valid code, referrer:', referrerId)

    // Проверяем, что пользователь не пытается использовать свой код
    if (referrerId === newUserId) {
      console.error('[registerReferral] User trying to use own code')
      return { success: false, error: 'Нельзя использовать свой реферальный код' }
    }

    // Проверяем, что реферал еще не зарегистрирован
    const { data: existing } = await supabase
      .from('referrals')
      .select('id')
      .eq('referred_id', newUserId)
      .single()

    if (existing) {
      console.error('[registerReferral] User already registered with referral')
      return { success: false, error: 'Вы уже зарегистрированы по реферальной ссылке' }
    }

    console.log('[registerReferral] Creating referral record')
    
    // Создаем связь
    const { error: insertError } = await supabase
      .from('referrals')
      .insert({
        referrer_id: referrerId,
        referred_id: newUserId,
        status: 'registered',
      })

    if (insertError) {
      throw insertError
    }

    console.log('[registerReferral] Referral record created, adding bonus')

    // Начисляем бонус приглашенному
    const bonusResult = await addBonusTransaction({
      userId: newUserId,
      amount: BONUS_CONSTANTS.REFERRED_USER_BONUS,
      type: 'referral_bonus',
      description: `Бонус за регистрацию по приглашению`,
      relatedUserId: referrerId,
    })

    if (!bonusResult.success) {
      console.error('[registerReferral] Failed to add bonus:', bonusResult.error)
    } else {
      console.log('[registerReferral] Bonus added successfully')
    }

    return {
      success: true,
      referrerName: validationResult.data.userName,
    }
  } catch (error) {
    console.error('Error registering referral:', error)
    return { success: false, error: 'Ошибка при регистрации реферала' }
  }
}

/**
 * Обработать покупку реферала (начислить бонусы приглашающему)
 * ВАЖНО: Должна вызываться с service role client (например из webhook)
 */
export async function handleReferralPurchase(
  referredUserId: string,
  paidAmount: number,
  supabaseClient?: any // Опциональный admin client для вызова из webhook
): Promise<{
  success: boolean
  bonusAwarded?: number
  isFirstPurchase?: boolean
  error?: string
}> {
  // Используем переданный client или создаем обычный (для обратной совместимости)
  const supabase = supabaseClient || await createClient()

  try {
    console.log('[handleReferralPurchase] Processing for user:', referredUserId, 'amount:', paidAmount)

    // Находим связь реферала
    const { data: referral, error: refError } = await supabase
      .from('referrals')
      .select('*')
      .eq('referred_id', referredUserId)
      .single()

    console.log('[handleReferralPurchase] Referral check:', { found: !!referral, error: refError?.message })

    if (refError || !referral) {
      // Это не реферал, пропускаем
      console.log('[handleReferralPurchase] Not a referral, skipping')
      return { success: true }
    }

    const isFirstPurchase = referral.status === 'registered'
    console.log('[handleReferralPurchase] Referral found:', {
      referrer_id: referral.referrer_id,
      status: referral.status,
      isFirstPurchase
    })

    // Получаем бонусный счет приглашающего напрямую
    const { data: referrerAccount, error: accountError } = await supabase
      .from('user_bonuses')
      .select('*')
      .eq('user_id', referral.referrer_id)
      .single()

    console.log('[handleReferralPurchase] Referrer account:', {
      found: !!referrerAccount,
      balance: referrerAccount?.balance,
      referral_level: referrerAccount?.referral_level,
      error: accountError?.message
    })

    if (accountError || !referrerAccount) {
      throw new Error('Счет приглашающего не найден')
    }

    // Рассчитываем процент
    const referralLevelData = getReferralLevelData(referrerAccount.referral_level)
    const bonusAmount = Math.floor(paidAmount * (referralLevelData.percent / 100))

    console.log('[handleReferralPurchase] Calculated bonus:', {
      level: referrerAccount.referral_level,
      percent: referralLevelData.percent,
      bonusAmount
    })

    // Начисляем процент с покупки
    const { error: txError1 } = await supabase
      .from('bonus_transactions')
      .insert({
        user_id: referral.referrer_id,
        amount: bonusAmount,
        type: 'referral_bonus',
        description: `${referralLevelData.percent}% с покупки реферала`,
        related_user_id: referredUserId,
        metadata: {
          paid_amount: paidAmount,
          referral_percent: referralLevelData.percent,
        },
      })

    if (txError1) {
      console.error('[handleReferralPurchase] Failed to add bonus transaction:', txError1)
    } else {
      console.log('[handleReferralPurchase] Bonus transaction added')
    }

    // Обновляем баланс
    const { error: balanceError1 } = await supabase
      .from('user_bonuses')
      .update({ balance: referrerAccount.balance + bonusAmount })
      .eq('user_id', referral.referrer_id)

    if (balanceError1) {
      console.error('[handleReferralPurchase] Failed to update balance:', balanceError1)
    }

    let firstPurchaseBonus = 0

    // Если это первая покупка реферала
    if (isFirstPurchase && referral.status !== 'first_purchase_made') {
      console.log('[handleReferralPurchase] First purchase! Adding bonus:', BONUS_CONSTANTS.REFERRAL_FIRST_BONUS)

      // Начисляем разовый бонус 500
      const { error: txError2 } = await supabase
        .from('bonus_transactions')
        .insert({
          user_id: referral.referrer_id,
          amount: BONUS_CONSTANTS.REFERRAL_FIRST_BONUS,
          type: 'referral_first',
          description: `Бонус за первую покупку реферала`,
          related_user_id: referredUserId,
        })

      if (txError2) {
        console.error('[handleReferralPurchase] Failed to add first purchase bonus:', txError2)
      }

      firstPurchaseBonus = BONUS_CONSTANTS.REFERRAL_FIRST_BONUS

      // Обновляем баланс еще раз
      const { error: balanceError2 } = await supabase
        .from('user_bonuses')
        .update({ balance: referrerAccount.balance + bonusAmount + firstPurchaseBonus })
        .eq('user_id', referral.referrer_id)

      if (balanceError2) {
        console.error('[handleReferralPurchase] Failed to update balance with first bonus:', balanceError2)
      }

      // Обновляем статус реферала
      await supabase
        .from('referrals')
        .update({
          status: 'first_purchase_made',
          first_purchase_at: new Date().toISOString(),
        })
        .eq('id', referral.id)

      console.log('[handleReferralPurchase] Referral status updated to first_purchase_made')
    }

    // Обновляем total_referral_earnings и уровень приглашающего
    const newTotalReferralEarnings = referrerAccount.total_referral_earnings + paidAmount
    const newReferralLevel = calculateReferralLevel(newTotalReferralEarnings)

    await supabase
      .from('user_bonuses')
      .update({
        total_referral_earnings: newTotalReferralEarnings,
        referral_level: newReferralLevel,
      })
      .eq('user_id', referral.referrer_id)

    console.log('[handleReferralPurchase] ✅ SUCCESS - Total awarded:', bonusAmount + firstPurchaseBonus)

    revalidatePath('/dashboard/bonuses')

    return {
      success: true,
      bonusAwarded: bonusAmount + firstPurchaseBonus,
      isFirstPurchase,
    }
  } catch (error) {
    console.error('[handleReferralPurchase] Error:', error)
    return { success: false, error: 'Ошибка при обработке реферальной покупки' }
  }
}

/**
 * Создать реферальный код для пользователя (обычно вызывается автоматически при регистрации)
 */
export async function createReferralCode(userId: string): Promise<{
  success: boolean
  code?: string
  error?: string
}> {
  const supabase = await createClient()

  try {
    // Проверяем, есть ли уже код
    const existing = await getUserReferralCode(userId)
    if (existing.success && existing.data) {
      return { success: true, code: existing.data.code }
    }

    // Генерируем уникальный код
    let code = ''
    let attempts = 0
    const maxAttempts = 10

    while (attempts < maxAttempts) {
      code = Math.random().toString(36).substring(2, 10)

      const { data: duplicate } = await supabase
        .from('referral_codes')
        .select('id')
        .eq('code', code)
        .single()

      if (!duplicate) break
      attempts++
    }

    if (attempts >= maxAttempts) {
      throw new Error('Не удалось сгенерировать уникальный код')
    }

    // Создаем код
    const { error: insertError } = await supabase
      .from('referral_codes')
      .insert({
        user_id: userId,
        code,
      })

    if (insertError) {
      throw insertError
    }

    return { success: true, code }
  } catch (error) {
    console.error('Error creating referral code:', error)
    return { success: false, error: 'Ошибка при создании реферального кода' }
  }
}

/**
 * Получить полную реферальную ссылку
 */
export async function getReferralLink(userId: string): Promise<{
  success: boolean
  link?: string
  code?: string
  error?: string
}> {
  const codeResult = await getUserReferralCode(userId)
  if (!codeResult.success || !codeResult.data) {
    return { success: false, error: codeResult.error }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  // Используем /auth вместо /auth/signup (signup редиректит и теряет параметры)
  const link = `${baseUrl}/auth?ref=${codeResult.data.code}`

  return {
    success: true,
    link,
    code: codeResult.data.code,
  }
}

// ============================================
// Админские функции
// ============================================

/**
 * Получить общую статистику по реферальной программе (для админки)
 */
export async function getAdminReferralStats(): Promise<{
  success: boolean
  data?: {
    totalReferrals: number
    activeReferrals: number
    totalBonusesPaid: number
    topReferrers: Array<{
      userId: string
      userName: string | null
      referralCount: number
      totalEarned: number
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
    // Общее количество рефералов
    const { count: totalReferrals } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })

    const { count: activeReferrals } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'first_purchase_made')

    // Общая сумма выплаченных бонусов
    const { data: transactions } = await supabase
      .from('bonus_transactions')
      .select('amount')
      .in('type', ['referral_bonus', 'referral_first'])

    const totalBonusesPaid = transactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0

    // Топ рефереров
    const { data: referrers } = await supabase
      .from('referrals')
      .select('referrer_id')

    const referrerCounts: Record<string, number> = {}
    referrers?.forEach(ref => {
      referrerCounts[ref.referrer_id] = (referrerCounts[ref.referrer_id] || 0) + 1
    })

    const topReferrerIds = Object.entries(referrerCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([id]) => id)

    const topReferrers = await Promise.all(
      topReferrerIds.map(async (userId) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', userId)
          .single()

        const { data: txs } = await supabase
          .from('bonus_transactions')
          .select('amount')
          .eq('user_id', userId)
          .in('type', ['referral_bonus', 'referral_first'])

        const totalEarned = txs?.reduce((sum, tx) => sum + tx.amount, 0) || 0

        return {
          userId,
          userName: profile?.full_name || null,
          referralCount: referrerCounts[userId],
          totalEarned,
        }
      })
    )

    return {
      success: true,
      data: {
        totalReferrals: totalReferrals || 0,
        activeReferrals: activeReferrals || 0,
        totalBonusesPaid,
        topReferrers,
      },
    }
  } catch (error) {
    console.error('Error fetching admin referral stats:', error)
    return { success: false, error: 'Ошибка при получении статистики' }
  }
}

