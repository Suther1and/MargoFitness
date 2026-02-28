'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from './profile'

export interface PurchaseHistoryItem {
  id: string
  product_name: string
  tier: string
  action: 'purchase' | 'renewal' | 'upgrade'
  created_at: string
  actual_paid_amount: number
  base_price: number
  promo_code?: string
  promo_percent?: number
  promo_discount_amount?: number
  bonus_amount_used?: number
  bonus_percent_of_total?: number
  period_discount?: number
  purchased_days?: number
  payment_provider?: string
}

/**
 * Получить историю покупок текущего пользователя
 */
export async function getUserPurchaseHistory(): Promise<{
  success: boolean
  data?: PurchaseHistoryItem[]
  error?: string
}> {
  try {
    const profile = await getCurrentProfile()
    
    if (!profile) {
      return { success: false, error: 'Необходимо авторизоваться' }
    }

    const supabase = await createClient()

    // Получаем покупки с продуктами
    const { data: purchases, error: purchasesError } = await supabase
      .from('user_purchases')
      .select('*, products(*)')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })

    if (purchasesError) {
      console.error('[PurchaseHistory] Error fetching purchases:', purchasesError)
      return { success: false, error: 'Ошибка загрузки истории покупок' }
    }

    // Получаем транзакции для дополнительных данных
    const { data: transactions, error: txError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('user_id', profile.id)
      .eq('status', 'succeeded')

    if (txError) {
      console.error('[PurchaseHistory] Error fetching transactions:', txError)
    }

    // Получаем все промокоды для расчета процентов
    const { data: promoCodes } = await supabase
      .from('promo_codes')
      .select('code, discount_value, discount_type')

    const promoMap = new Map(
      (promoCodes || []).map(p => [p.code.toUpperCase(), p])
    )

    // Обогащаем данные покупок
    const enrichedPurchases: PurchaseHistoryItem[] = (purchases || []).map((p: any) => {
      const tx = (transactions || []).find(
        (t: any) => t.yookassa_payment_id === p.payment_id || t.id === p.payment_id
      )
      
      const meta = {
        ...(typeof tx?.metadata === 'object' && tx?.metadata !== null ? tx.metadata : {}),
        ...(typeof p.metadata === 'object' && p.metadata !== null ? p.metadata : {})
      }

      const promoCode = p.promo_code || meta.promoCode || meta.promo_code
      const promoData = promoCode ? promoMap.get(promoCode.toUpperCase()) : null
      
      let promoPercent = promoData?.discount_type === 'percent' ? promoData.discount_value : null
      if (!promoPercent) {
        promoPercent = meta.promoPercent || meta.discount_percent || meta.promo_discount_percent || meta.discount_percentage
      }

      const promoDiscountAmount = meta.promoDiscount || meta.promo_discount || meta.promoDiscountAmount || 0
      const bonusUsed = p.bonus_amount_used || meta.bonusUsed || meta.bonus_amount_used || 0
      const action = p.action || meta.action || 'purchase'

      const totalSum = (p.actual_paid_amount || 0) + (bonusUsed || 0)
      const bonusPercentOfTotal = totalSum > 0 ? Math.round((bonusUsed / totalSum) * 100) : 0

      const basePrice = p.products?.price || p.amount || 0
      const periodDiscount = basePrice - ((p.actual_paid_amount || 0) + (bonusUsed || 0) + (promoDiscountAmount || 0))

      return {
        id: p.id,
        product_name: p.products?.name || 'Подписка',
        tier: p.products?.tier_level === 1 ? 'Basic' : 
              p.products?.tier_level === 2 ? 'Pro' : 
              p.products?.tier_level === 3 ? 'Elite' : 'Basic',
        action: action as 'purchase' | 'renewal' | 'upgrade',
        created_at: p.created_at,
        actual_paid_amount: p.actual_paid_amount || 0,
        base_price: basePrice,
        promo_code: promoCode,
        promo_percent: promoPercent,
        promo_discount_amount: promoDiscountAmount,
        bonus_amount_used: bonusUsed,
        bonus_percent_of_total: bonusPercentOfTotal,
        period_discount: periodDiscount > 0 ? periodDiscount : 0,
        purchased_days: p.purchased_days,
        payment_provider: p.payment_provider
      }
    })

    return { success: true, data: enrichedPurchases }
  } catch (error: any) {
    console.error('[PurchaseHistory] Unexpected error:', error)
    return { success: false, error: error.message || 'Произошла ошибка' }
  }
}
