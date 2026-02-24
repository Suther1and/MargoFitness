'use server'

import { createClient } from '@/lib/supabase/server'
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
    const supabase = await createClient()

    // 1. Получаем расширенный профиль (включая бонусы)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        *,
        user_bonuses (
          balance,
          cashback_level,
          total_spent_for_cashback
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
        products:product_id (
          name
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

    // 4. Получаем статистику тренировок (количество выполненных)
    const { count: workoutsCount, error: workoutsError } = await supabase
      .from('user_workout_completions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (workoutsError) console.error('Error fetching workouts count:', workoutsError)

    // 5. Получаем статистику прочитанных статей
    const { count: articlesCount, error: articlesError } = await supabase
      .from('user_article_progress')
      .select('*', { count: 'exact', head: true })
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

    return {
      success: true,
      data: {
        profile: {
          ...profile,
          bonus_balance: profile.user_bonuses?.[0]?.balance ?? 0,
          cashback_level: profile.user_bonuses?.[0]?.cashback_level ?? 1,
          total_spent_for_cashback: profile.user_bonuses?.[0]?.total_spent_for_cashback ?? 0,
        },
        purchases: purchases || [],
        bonusTransactions: bonusTransactions || [],
        stats: {
          workoutsCompleted: workoutsCount || 0,
          articlesRead: articlesCount || 0,
        },
        lastDiaryEntries: lastDiaryEntries || []
      }
    }
  } catch (error: any) {
    console.error('Error in getUserFullDetails:', error)
    return { success: false, error: error.message }
  }
}
