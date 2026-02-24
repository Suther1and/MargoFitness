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

    // 1. Получаем профиль
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        *,
        user_bonuses (balance, cashback_level, total_spent_for_cashback),
        diary_settings (user_params)
      `)
      .eq('id', userId)
      .single()

    if (profileError) throw profileError

    // 2. Получаем ВСЕ покупки, транзакции и промокоды
    const [purchasesRes, transactionsRes, promoCodesRes] = await Promise.all([
      supabase.from('user_purchases').select('*, products(*)').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('payment_transactions').select('*').eq('user_id', userId).eq('status', 'succeeded'),
      supabase.from('promo_codes').select('code, discount_value, discount_type')
    ])

    const purchases = purchasesRes.data || []
    const transactions = transactionsRes.data || []
    const promoCodes = promoCodesRes.data || []

    const promoMap = new Map(promoCodes.map(p => [p.code.toUpperCase(), p]))

    // 3. Обогащаем данные
    const enrichedPurchases = purchases.map((p: any) => {
      const tx = transactions.find((t: any) => t.yookassa_payment_id === p.payment_id || t.id === p.payment_id);
      const meta = { ...tx?.metadata, ...p.metadata };

      // Берем данные напрямую по ключам
      const promoCode = p.promo_code || meta.promoCode || meta.promo_code;
      
      // Ищем процент промокода
      const promoData = promoCode ? promoMap.get(promoCode.toUpperCase()) : null;
      let promoPercent = promoData?.discount_type === 'percent' ? promoData.discount_value : null;
      if (!promoPercent) {
        promoPercent = meta.promoPercent || meta.discount_percent || meta.promo_discount_percent || meta.discount_percentage;
      }

      const promoDiscountAmount = meta.promoDiscount || meta.promo_discount || meta.promoDiscountAmount || 0;
      const bonusUsed = p.bonus_amount_used || meta.bonusUsed || meta.bonus_amount_used || 0;
      
      // Тип операции: СТРОГО из базы данных (поле action)
      const action = p.action || meta.action || 'purchase';

      // Расчет процента шагов от СУММЫ ОПЛАТЫ
      const totalSum = (p.actual_paid_amount || 0) + (bonusUsed || 0);
      const bonusPercentOfTotal = totalSum > 0 ? Math.round((bonusUsed / totalSum) * 100) : 0;

      // Скидка за срок
      const basePrice = p.products?.price || p.amount || 0;
      const periodDiscount = basePrice - ((p.actual_paid_amount || 0) + (bonusUsed || 0) + (promoDiscountAmount || 0));

      return {
        ...p,
        promo_code: promoCode,
        promo_percent: promoPercent,
        promo_discount_amount: promoDiscountAmount,
        bonus_amount_used: bonusUsed,
        bonus_percent_of_total: bonusPercentOfTotal,
        period_discount: periodDiscount > 0 ? periodDiscount : 0,
        action: action
      };
    });

    const diaryParams = (Array.isArray(profile.diary_settings) ? profile.diary_settings[0] : profile.diary_settings)?.user_params || {}
    const userBonuses = Array.isArray(profile.user_bonuses) ? profile.user_bonuses[0] : profile.user_bonuses

    return {
      success: true,
      data: {
        profile: { ...profile, bonus_balance: userBonuses?.balance ?? 0, age: diaryParams.age || profile.age, height: diaryParams.height || profile.height, weight: diaryParams.weight || profile.weight },
        purchases: enrichedPurchases,
        bonusTransactions: [],
        stats: { workoutsCompleted: 0, articlesRead: 0, workoutHistory: [], articleHistory: [] }
      }
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
