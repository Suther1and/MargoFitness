'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { BonusTransaction } from '@/types/database'

/**
 * Хук для получения истории бонусных транзакций
 * Использует прямой вызов Supabase вместо Server Action для скорости
 */
export function useBonusTransactions(userId: string, limit: number = 50) {
  return useQuery({
    queryKey: ['bonus-transactions', userId, limit],
    queryFn: async (): Promise<BonusTransaction[]> => {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('bonus_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (error) {
        console.error('[useBonusTransactions] Error:', error)
        throw new Error('Не удалось получить историю транзакций')
      }
      
      return data || []
    },
    staleTime: 30 * 1000, // 30 секунд - транзакции могут добавляться
    gcTime: 30 * 60 * 1000, // 30 минут
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
}
