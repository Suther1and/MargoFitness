/**
 * Server Actions: Аналитика
 * 
 * Функции для получения статистики и метрик для админ-панели
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from './profile'
import { redirect } from 'next/navigation'

// ============================================
// Типы
// ============================================

export interface RevenueData {
  totalRevenue: number
  periodRevenue: number
  transactionsCount: number
  averageTransaction: number
  byTier: {
    basic: number
    pro: number
    elite: number
  }
}

export interface SubscriptionStats {
  total: number
  active: number
  byTier: {
    free: number
    basic: number
    pro: number
    elite: number
  }
  byStatus: {
    active: number
    inactive: number
    canceled: number
    expired: number
  }
}

export interface RegistrationStats {
  total: number
  withActiveSubscription: number
  conversionRate: number
  newThisMonth: number
  newThisWeek: number
  activeToday: number
}

export interface AnalyticsPeriod {
  startDate: Date
  endDate: Date
  label: string
}

// ============================================
// Проверка доступа
// ============================================

async function checkAdminAccess() {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }
  return profile
}

// ============================================
// Получение выручки
// ============================================

/**
 * Получить выручку за период
 */
export async function getRevenueByPeriod(
  startDate?: Date,
  endDate?: Date
): Promise<{ success: boolean; data?: RevenueData; error?: string }> {
  try {
    await checkAdminAccess()
    
    const supabase = await createClient()
    
    // По умолчанию - за всё время
    let query = supabase
      .from('payment_transactions')
      .select('amount, status, product_id, created_at')
      .eq('status', 'succeeded')
    
    // Если указан период
    if (startDate) {
      query = query.gte('created_at', startDate.toISOString())
    }
    if (endDate) {
      query = query.lte('created_at', endDate.toISOString())
    }
    
    const { data: transactions, error } = await query
    
    if (error) {
      console.error('Error fetching revenue:', error)
      return { success: false, error: 'Failed to fetch revenue data' }
    }
    
    // Получить информацию о продуктах для группировки по тарифам
    const { data: products } = await supabase
      .from('products')
      .select('id, tier_level')
    
    const productTierMap = new Map(
      products?.map(p => [p.id, p.tier_level]) || []
    )
    
    // Подсчет метрик
    const totalRevenue = transactions?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0
    const transactionsCount = transactions?.length || 0
    const averageTransaction = transactionsCount > 0 ? totalRevenue / transactionsCount : 0
    
    // Выручка по тарифам
    const byTier = {
      basic: 0,
      pro: 0,
      elite: 0
    }
    
    transactions?.forEach(tx => {
      const tierLevel = productTierMap.get(tx.product_id!)
      if (tierLevel === 1) byTier.basic += Number(tx.amount)
      else if (tierLevel === 2) byTier.pro += Number(tx.amount)
      else if (tierLevel === 3) byTier.elite += Number(tx.amount)
    })
    
    return {
      success: true,
      data: {
        totalRevenue,
        periodRevenue: totalRevenue, // В данном случае совпадает
        transactionsCount,
        averageTransaction,
        byTier
      }
    }
  } catch (error) {
    console.error('Error in getRevenueByPeriod:', error)
    return { success: false, error: 'Internal error' }
  }
}

/**
 * Получить выручку по месяцам (для графика)
 */
export async function getRevenueByMonth(
  monthsBack: number = 6
): Promise<{ success: boolean; data?: Array<{ month: string; revenue: number }>; error?: string }> {
  try {
    await checkAdminAccess()
    
    const supabase = await createClient()
    
    // Последние N месяцев
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - monthsBack)
    startDate.setDate(1)
    startDate.setHours(0, 0, 0, 0)
    
    const { data: transactions, error } = await supabase
      .from('payment_transactions')
      .select('amount, created_at')
      .eq('status', 'succeeded')
      .gte('created_at', startDate.toISOString())
    
    if (error) {
      return { success: false, error: 'Failed to fetch data' }
    }
    
    // Группировка по месяцам
    const revenueByMonth = new Map<string, number>()
    
    transactions?.forEach(tx => {
      const date = new Date(tx.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const current = revenueByMonth.get(monthKey) || 0
      revenueByMonth.set(monthKey, current + Number(tx.amount))
    })
    
    // Преобразовать в массив
    const result = Array.from(revenueByMonth.entries()).map(([month, revenue]) => ({
      month,
      revenue
    })).sort((a, b) => a.month.localeCompare(b.month))
    
    return { success: true, data: result }
  } catch (error) {
    console.error('Error in getRevenueByMonth:', error)
    return { success: false, error: 'Internal error' }
  }
}

// ============================================
// Статистика подписок
// ============================================

/**
 * Получить статистику по подпискам
 */
export async function getSubscriptionStats(): Promise<{ 
  success: boolean; 
  data?: SubscriptionStats; 
  error?: string 
}> {
  try {
    await checkAdminAccess()
    
    const supabase = await createClient()
    
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status')
    
    if (error) {
      return { success: false, error: 'Failed to fetch subscription data' }
    }
    
    const stats: SubscriptionStats = {
      total: profiles?.length || 0,
      active: profiles?.filter(p => p.subscription_status === 'active').length || 0,
      byTier: {
        free: 0,
        basic: 0,
        pro: 0,
        elite: 0
      },
      byStatus: {
        active: 0,
        inactive: 0,
        canceled: 0,
        expired: 0
      }
    }
    
    profiles?.forEach(profile => {
      // По тарифам
      if (profile.subscription_tier === 'free') stats.byTier.free++
      else if (profile.subscription_tier === 'basic') stats.byTier.basic++
      else if (profile.subscription_tier === 'pro') stats.byTier.pro++
      else if (profile.subscription_tier === 'elite') stats.byTier.elite++
      
      // По статусам
      if (profile.subscription_status === 'active') stats.byStatus.active++
      else if (profile.subscription_status === 'canceled') stats.byStatus.canceled++
      else stats.byStatus.inactive++
    })
    
    return { success: true, data: stats }
  } catch (error) {
    console.error('Error in getSubscriptionStats:', error)
    return { success: false, error: 'Internal error' }
  }
}

// ============================================
// Статистика регистраций
// ============================================

/**
 * Получить статистику регистраций и конверсии
 */
export async function getRegistrationStats(): Promise<{ 
  success: boolean; 
  data?: RegistrationStats; 
  error?: string 
}> {
  try {
    await checkAdminAccess()
    
    const supabase = await createClient()
    
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('created_at, updated_at, subscription_status, subscription_tier')
    
    if (error) {
      return { success: false, error: 'Failed to fetch registration data' }
    }
    
    const now = new Date()
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)
    
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    const total = profiles?.length || 0
    const withActiveSubscription = profiles?.filter(p => 
      p.subscription_status === 'active' && p.subscription_tier !== 'free'
    ).length || 0
    
    const newThisWeek = profiles?.filter(p => 
      new Date(p.created_at) > weekAgo
    ).length || 0
    
    const newThisMonth = profiles?.filter(p => 
      new Date(p.created_at) > monthAgo
    ).length || 0

    const activeToday = profiles?.filter(p => 
      new Date(p.updated_at) > todayStart
    ).length || 0
    
    const conversionRate = total > 0 ? (withActiveSubscription / total) * 100 : 0
    
    return {
      success: true,
      data: {
        total,
        withActiveSubscription,
        conversionRate,
        newThisMonth,
        newThisWeek,
        activeToday
      }
    }
  } catch (error) {
    console.error('Error in getRegistrationStats:', error)
    return { success: false, error: 'Internal error' }
  }
}

// ============================================
// Последние транзакции
// ============================================

/**
 * Получить последние транзакции
 */
export async function getRecentTransactions(limit: number = 10): Promise<{
  success: boolean
  data?: Array<{
    id: string
    amount: number
    status: string
    payment_type: string
    created_at: string
    user_email: string
    product_name: string
  }>
  error?: string
}> {
  try {
    await checkAdminAccess()
    
    const supabase = await createClient()
    
    const { data: transactions, error } = await supabase
      .from('payment_transactions')
      .select(`
        id,
        amount,
        status,
        payment_type,
        created_at,
        user_id,
        product_id
      `)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      return { success: false, error: 'Failed to fetch transactions' }
    }
    
    // Получить информацию о пользователях и продуктах
    const userIds = [...new Set(transactions?.map(t => t.user_id) || [])]
    const productIds = [...new Set(transactions?.map(t => t.product_id).filter((id): id is string => id !== null) || [])]
    
    const { data: users } = await supabase
      .from('profiles')
      .select('id, email')
      .in('id', userIds)
    
    const { data: products } = await supabase
      .from('products')
      .select('id, name')
      .in('id', productIds)
    
    const userMap = new Map(users?.map(u => [u.id, u.email]) || [])
    const productMap = new Map(products?.map(p => [p.id, p.name]) || [])
    
    const result = transactions?.map(tx => ({
      id: tx.id,
      amount: Number(tx.amount),
      status: tx.status,
      payment_type: tx.payment_type || 'unknown',
      created_at: tx.created_at,
      user_email: userMap.get(tx.user_id) || 'Unknown',
      product_name: tx.product_id ? (productMap.get(tx.product_id) || 'Unknown') : 'N/A'
    })) || []
    
    return { success: true, data: result }
  } catch (error) {
    console.error('Error in getRecentTransactions:', error)
    return { success: false, error: 'Internal error' }
  }
}

