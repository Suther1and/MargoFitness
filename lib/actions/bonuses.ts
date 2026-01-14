'use server'

import { createClient } from '@/lib/supabase/server'
import { 
  UserBonus, 
  BonusTransaction, 
  BonusTransactionInsert,
  calculateCashbackLevel,
  getCashbackLevelData,
  calculateLevelProgress,
  BONUS_CONSTANTS,
  CASHBACK_LEVELS
} from '@/types/database'
import { revalidatePath } from 'next/cache'
import { checkAndUnlockAchievements } from './achievements'

// ============================================
// Получение данных
// ============================================

/**
 * Получить бонусный счет пользователя
 */
export async function getUserBonusAccount(userId: string): Promise<{
  success: boolean
  data?: UserBonus
  error?: string
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_bonuses')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Error fetching bonus account:', error)
    return { success: false, error: 'Не удалось получить бонусный счет' }
  }

  return { success: true, data }
}

/**
 * Получить текущий бонусный счет авторизованного пользователя
 */
export async function getCurrentUserBonusAccount(): Promise<{
  success: boolean
  data?: UserBonus
  error?: string
}> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Необходимо авторизоваться' }
  }

  return getUserBonusAccount(user.id)
}

/**
 * Создать бонусный аккаунт для пользователя (если не существует)
 */
export async function ensureBonusAccountExists(userId: string): Promise<{
  success: boolean
  created: boolean
  error?: string
}> {
  const supabase = await createClient()

  // Проверяем существует ли уже
  const { data: existing } = await supabase
    .from('user_bonuses')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (existing) {
    return { success: true, created: false }
  }

  try {
    // Вызываем функцию создания аккаунта
    const { error } = await supabase.rpc('create_bonus_account_for_user' as any, {
      p_user_id: userId
    })

    if (error) {
      console.error('[ensureBonusAccountExists] RPC error:', error)
      // Если RPC не работает, создаем вручную
      return await createBonusAccountManually(userId)
    }

    return { success: true, created: true }
  } catch (error) {
    console.error('[ensureBonusAccountExists] Error:', error)
    return { success: false, created: false, error: 'Не удалось создать бонусный аккаунт' }
  }
}

/**
 * Создать бонусный аккаунт вручную (fallback)
 */
async function createBonusAccountManually(userId: string): Promise<{
  success: boolean
  created: boolean
  error?: string
}> {
  const supabase = await createClient()

  try {
    // Генерируем реферальный код
    const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase()

    // Создаем бонусный счет
    const { error: bonusError } = await supabase
      .from('user_bonuses')
      .insert({
        user_id: userId,
        balance: 0,
        cashback_level: 1,
        total_spent_for_cashback: 0,
        referral_level: 1,
        total_referral_earnings: 0,
      })

    if (bonusError) throw bonusError

    // Создаем реферальный код
    const { error: refCodeError } = await supabase
      .from('referral_codes')
      .insert({
        user_id: userId,
        code: referralCode,
      })

    if (refCodeError) throw refCodeError

    console.log('[createBonusAccountManually] Successfully created for user:', userId)
    
    // Проверяем достижения (разблокирует "Теплый прием")
    await checkAndUnlockAchievements(userId)

    return { success: true, created: true }
  } catch (error) {
    console.error('[createBonusAccountManually] Error:', error)
    return { success: false, created: false, error: 'Не удалось создать аккаунт вручную' }
  }
}

/**
 * Получить историю бонусных транзакций
 */
export async function getBonusTransactions(
  userId: string,
  limit: number = 50
): Promise<{
  success: boolean
  data?: BonusTransaction[]
  error?: string
}> {
  const supabase = await createClient()

    const { data, error } = await supabase
      .from('bonus_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

  if (error) {
    console.error('Error fetching bonus transactions:', error.message || error)
    return { success: false, error: 'Не удалось получить историю' }
  }

  return { success: true, data }
}

/**
 * Получить статистику для UI
 */
export async function getBonusStats(userId: string): Promise<{
  success: boolean
  data?: {
    account: UserBonus
    levelData: ReturnType<typeof getCashbackLevelData>
    progress: ReturnType<typeof calculateLevelProgress>
    recentTransactions: BonusTransaction[]
  }
  error?: string
}> {
  try {
    const accountResult = await getUserBonusAccount(userId)
    
    // Если счета нет, возвращаем пустую статистику (дефолтную)
    if (!accountResult.success || !accountResult.data) {
      const defaultAccount: UserBonus = {
        id: '',
        user_id: userId,
        balance: 0,
        cashback_level: 1,
        total_spent_for_cashback: 0,
        referral_level: 1,
        total_referral_earnings: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      return {
        success: true,
        data: {
          account: defaultAccount,
          levelData: getCashbackLevelData(1),
          progress: calculateLevelProgress(0, false),
          recentTransactions: [],
        }
      }
    }

    const account = accountResult.data
    const levelData = getCashbackLevelData(account.cashback_level)
    const progress = calculateLevelProgress(account.total_spent_for_cashback, false)

    const transactionsResult = await getBonusTransactions(userId, 10)
    const recentTransactions = transactionsResult.data || []

    return {
      success: true,
      data: {
        account,
        levelData,
        progress,
        recentTransactions,
      },
    }
  } catch (error) {
    console.error('[getBonusStats] Critical error:', error)
    return { success: false, error: 'Ошибка загрузки статистики' }
  }
}

// ============================================
// Операции с бонусами
// ============================================

/**
 * Начислить или списать шаги (с транзакцией БД)
 */
export async function addBonusTransaction(params: {
  userId: string
  amount: number // положительное = начисление, отрицательное = списание
  type: BonusTransactionInsert['type']
  description: string
  relatedPaymentId?: string
  relatedUserId?: string
  metadata?: Record<string, any>
}): Promise<{
  success: boolean
  newBalance?: number
  error?: string
}> {
  const supabase = await createClient()

  try {
    // Получаем текущий счет
    const { data: account, error: accountError } = await supabase
      .from('user_bonuses')
      .select('*')
      .eq('user_id', params.userId)
      .single()

    if (accountError || !account) {
      throw new Error('Бонусный счет не найден')
    }

    // Проверяем достаточность средств при списании
    if (params.amount < 0 && account.balance + params.amount < 0) {
      return { success: false, error: 'Недостаточно шагов на счете' }
    }

    // Рассчитываем новый баланс
    const newBalance = account.balance + params.amount

    // Создаем транзакцию
    const { error: txError } = await supabase
      .from('bonus_transactions')
      .insert({
        user_id: params.userId,
        amount: params.amount,
        type: params.type,
        description: params.description,
        related_payment_id: params.relatedPaymentId,
        related_user_id: params.relatedUserId,
        metadata: params.metadata || {},
      })

    if (txError) {
      throw txError
    }

    // Обновляем счет
    const { error: updateError } = await supabase
      .from('user_bonuses')
      .update({
        balance: newBalance,
      })
      .eq('user_id', params.userId)

    if (updateError) {
      throw updateError
    }

    return { success: true, newBalance }
  } catch (error) {
    console.error('Error in addBonusTransaction:', error)
    return { success: false, error: 'Ошибка при обработке бонусной операции' }
  }
}

/**
 * Начислить кешбек с покупки
 * ВАЖНО: Должна вызываться с service role client (например из webhook)
 */
export async function awardCashback(
  params: {
    userId: string
    paidAmount: number // фактически оплаченная сумма
    paymentId: string
    action?: 'purchase' | 'renewal' | 'upgrade' // тип операции
  },
  supabaseClient?: any // Опциональный admin client для вызова из webhook
): Promise<{
  success: boolean
  cashbackAmount?: number
  newLevel?: number
  error?: string
}> {
  const supabase = supabaseClient || await createClient()

  try {
    // Получаем счет
    const { data: account, error: accountError } = await supabase
      .from('user_bonuses')
      .select('*')
      .eq('user_id', params.userId)
      .single()

    if (accountError || !account) {
      throw new Error('Бонусный счет не найден')
    }

    // Рассчитываем кешбек (целое число)
    const levelData = getCashbackLevelData(account.cashback_level)
    const cashbackAmount = Math.floor(params.paidAmount * (levelData.percent / 100))

    if (cashbackAmount === 0) {
      console.log('[awardCashback] Cashback amount is 0, skipping')
      return { success: true, cashbackAmount: 0 }
    }

    // Формируем описание в зависимости от типа операции
    let description = `Кешбек ${levelData.percent}% с покупки`
    if (params.action === 'renewal') {
      description = `Кешбек ${levelData.percent}% с продления`
    } else if (params.action === 'upgrade') {
      description = `Кешбек ${levelData.percent}% с апгрейда`
    }

    // Создаем транзакцию кешбека напрямую через admin client
    const { error: txError } = await supabase
      .from('bonus_transactions')
      .insert({
        user_id: params.userId,
        amount: cashbackAmount,
        type: 'cashback',
        description: description,
        related_payment_id: params.paymentId,
        metadata: {
          paid_amount: params.paidAmount,
          cashback_percent: levelData.percent,
          level: levelData.name,
          action: params.action || 'purchase',
        },
      })

    if (txError) {
      throw txError
    }

    // Обновляем баланс и статистику
    const newTotalSpent = account.total_spent_for_cashback + params.paidAmount
    const newLevel = calculateCashbackLevel(newTotalSpent)
    const newBalance = account.balance + cashbackAmount

    const { error: updateError } = await supabase
      .from('user_bonuses')
      .update({
        balance: newBalance,
        total_spent_for_cashback: newTotalSpent,
        cashback_level: newLevel,
      })
      .eq('user_id', params.userId)

    if (updateError) {
      throw updateError
    }

    revalidatePath('/dashboard/bonuses')

    console.log(`[awardCashback] Success: ${cashbackAmount} шагов начислено`)

    return {
      success: true,
      cashbackAmount,
      newLevel,
    }
  } catch (error) {
    console.error('Error awarding cashback:', error)
    return { success: false, error: 'Ошибка при начислении кешбека' }
  }
}

/**
 * Списать шаги при оплате
 * ВАЖНО: Должна вызываться с service role client (например из webhook)
 */
export async function spendBonusesOnPayment(
  params: {
    userId: string
    amount: number
    paymentId: string
  },
  supabaseClient?: any // Опциональный admin client для вызова из webhook
): Promise<{
  success: boolean
  error?: string
}> {
  if (params.amount <= 0) {
    return { success: false, error: 'Сумма должна быть положительной' }
  }

  const supabase = supabaseClient || await createClient()

  try {
    // Получаем текущий счет
    const { data: account, error: accountError } = await supabase
      .from('user_bonuses')
      .select('*')
      .eq('user_id', params.userId)
      .single()

    if (accountError || !account) {
      throw new Error('Бонусный счет не найден')
    }

    // Проверяем достаточность средств
    if (account.balance < params.amount) {
      return { success: false, error: 'Недостаточно шагов на счете' }
    }

    // Рассчитываем новый баланс
    const newBalance = account.balance - params.amount

    // Создаем транзакцию списания
    const { error: txError } = await supabase
      .from('bonus_transactions')
      .insert({
        user_id: params.userId,
        amount: -params.amount,
        type: 'spent',
        description: `Оплата подписки (${params.amount} шагов)`,
        related_payment_id: params.paymentId,
        metadata: {},
      })

    if (txError) {
      throw txError
    }

    // Обновляем баланс
    const { error: updateError } = await supabase
      .from('user_bonuses')
      .update({ balance: newBalance })
      .eq('user_id', params.userId)

    if (updateError) {
      throw updateError
    }

    revalidatePath('/dashboard/bonuses')

    return { success: true }
  } catch (error) {
    console.error('Error in spendBonusesOnPayment:', error)
    return { success: false, error: 'Ошибка при списании бонусов' }
  }
}

/**
 * Рассчитать максимальное количество шагов для использования
 */
export async function calculateMaxBonusUsage(
  priceAfterDiscounts: number,
  userId: string
): Promise<{
  success: boolean
  maxAmount?: number
  availableBalance?: number
  error?: string
}> {
  const accountResult = await getUserBonusAccount(userId)
  if (!accountResult.success || !accountResult.data) {
    return { success: false, error: accountResult.error }
  }

  const maxAllowed = Math.floor(priceAfterDiscounts * (BONUS_CONSTANTS.MAX_BONUS_USAGE_PERCENT / 100))
  const maxAmount = Math.min(maxAllowed, accountResult.data.balance)

  return {
    success: true,
    maxAmount,
    availableBalance: accountResult.data.balance,
  }
}

// ============================================
// Админские функции
// ============================================

/**
 * Ручная корректировка баланса (только для админов)
 */
export async function adminAdjustBonus(params: {
  userId: string
  amount: number
  reason: string
}): Promise<{
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

  // Выполняем корректировку
  const result = await addBonusTransaction({
    userId: params.userId,
    amount: params.amount,
    type: 'admin_adjustment',
    description: `Корректировка админом: ${params.reason}`,
    relatedUserId: user.id,
  })

  if (result.success) {
    revalidatePath('/admin/analytics')
    revalidatePath('/dashboard/bonuses')
  }

  return result
}

/**
 * Получить общую статистику по бонусной системе (для админки)
 */
export async function getAdminBonusStats(): Promise<{
  success: boolean
  data?: {
    totalBonusesIssued: number
    totalBonusesSpent: number
    totalBonusesInCirculation: number
    averageBalance: number
    usersByLevel: Record<number, number>
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
    // Получаем все счета
    const { data: accounts, error } = await supabase
      .from('user_bonuses')
      .select('balance, cashback_level')

    if (error) throw error

    // Считаем статистику по транзакциям
    const { data: transactions } = await supabase
      .from('bonus_transactions')
      .select('amount')

    const totalBonusesIssued = transactions?.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0) || 0
    const totalBonusesSpent = transactions?.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0
    const totalBonusesInCirculation = accounts?.reduce((sum, acc) => sum + acc.balance, 0) || 0
    const averageBalance = accounts?.length ? Math.floor(totalBonusesInCirculation / accounts.length) : 0

    const usersByLevel: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 }
    accounts?.forEach(acc => {
      usersByLevel[acc.cashback_level] = (usersByLevel[acc.cashback_level] || 0) + 1
    })

    return {
      success: true,
      data: {
        totalBonusesIssued,
        totalBonusesSpent,
        totalBonusesInCirculation,
        averageBalance,
        usersByLevel,
      },
    }
  } catch (error) {
    console.error('Error fetching admin bonus stats:', error)
    return { success: false, error: 'Ошибка при получении статистики' }
  }
}

