'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentProfile } from './profile'

async function checkAdmin() {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'admin') {
    throw new Error('Доступ запрещён')
  }
  return profile
}

export async function getUserFullDetails(userId: string) {
  try {
    await checkAdmin()
    const supabase = createAdminClient()

    // 1. Получаем расширенный профиль (включая бонусы и настройки дневника)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        *,
        user_bonuses (
          balance,
          cashback_level,
          total_spent_for_cashback
        ),
        diary_settings (
          user_params
        )
      `)
      .eq('id', userId)
      .single()

    if (profileError) throw profileError

    // 2. Получаем историю покупок
    const { data: purchases, error: purchasesError } = await supabase
      .from('user_purchases')
      .select(`
        *,
        products (
          id,
          name,
          price,
          type,
          duration_months
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (purchasesError) console.error('Error fetching purchases:', purchasesError)

    // 3. Получаем историю бонусов (транзакции)
    const { data: bonusTransactions, error: bonusError } = await supabase
      .from('bonus_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (bonusError) console.error('Error fetching bonus transactions:', bonusError)

    // 4. Получаем историю платежных транзакций (для деталей промокодов и бонусов)
    const { data: paymentTransactions, error: paymentError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'succeeded')
      .order('created_at', { ascending: false })

    if (paymentError) console.error('Error fetching payment transactions:', paymentError)

    // 5. Получаем статистику тренировок (количество выполненных)
    const { data: workoutCompletions, error: workoutsError } = await supabase
      .from('user_workout_completions')
      .select('id')
      .eq('user_id', userId)

    if (workoutsError) console.error('Error fetching workouts count:', workoutsError)

    // 5. Получаем статистику прочитанных статей
    const { data: articleProgress, error: articlesError } = await supabase
      .from('user_article_progress')
      .select('article_id')
      .eq('user_id', userId)
      .eq('is_read', true)

    if (articlesError) console.error('Error fetching articles count:', articlesError)

    // 6. Получаем последние записи в дневнике (для общей инфо)
    const { data: lastDiaryEntries, error: diaryError } = await supabase
      .from('diary_entries')
      .select('date, metrics')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(5)

    if (diaryError) console.error('Error fetching diary entries:', diaryError)

    // Извлекаем параметры из diary_settings (это массив при join)
    const diarySettings = Array.isArray(profile.diary_settings) 
      ? profile.diary_settings[0] 
      : profile.diary_settings
    const diaryParams = (diarySettings as any)?.user_params || {}

    // Извлекаем бонусы (это массив при join)
    const userBonuses = Array.isArray(profile.user_bonuses)
      ? profile.user_bonuses[0]
      : profile.user_bonuses

    // Фильтруем интенсивы и марафоны из покупок
    const intensives = purchases?.filter((p: any) => p.products?.type === 'one_time_pack') || []

    // Обогащаем покупки данными из транзакций
    const enrichedPurchases = purchases?.map((p: any) => {
      const tx = paymentTransactions?.find((t: any) => t.id === p.payment_id || t.metadata?.order_id === p.id);
      return {
        ...p,
        promo_code: p.promo_code || tx?.promo_code || tx?.metadata?.promo_code,
        promo_discount_amount: tx?.metadata?.promo_discount_amount,
        promo_percent: tx?.metadata?.promo_percent,
        bonus_amount_used: p.bonus_amount_used || tx?.bonus_amount_used || tx?.metadata?.bonus_amount_used,
        action: p.action || tx?.metadata?.action,
        metadata: {
          ...p.metadata,
          ...tx?.metadata
        }
      };
    }) || [];

    return {
      success: true,
      data: {
        profile: {
          ...profile,
          bonus_balance: userBonuses?.balance ?? 0,
          cashback_level: userBonuses?.cashback_level ?? 1,
          total_spent_for_cashback: userBonuses?.total_spent_for_cashback ?? 0,
          // Приоритет параметрам из дневника
          age: diaryParams.age || (profile as any).age,
          height: diaryParams.height || (profile as any).height,
          weight: diaryParams.weight || (profile as any).weight,
        },
        purchases: enrichedPurchases,
        intensives: intensives,
        bonusTransactions: bonusTransactions || [],
        stats: {
          workoutsCompleted: workoutCompletions?.length || 0,
          articlesRead: articleProgress?.length || 0,
        },
        lastDiaryEntries: lastDiaryEntries || []
      }
    }
  } catch (error: any) {
    console.error('Error in getUserFullDetails:', error)
    return { success: false, error: error.message }
  }
}
