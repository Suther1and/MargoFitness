'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { UserBonus } from '@/types/database'

/**
 * Хук для получения бонусного счета пользователя
 * Использует прямой вызов Supabase вместо Server Action для скорости
 */
export function useBonusAccount(userId: string) {
  return useQuery({
    queryKey: ['bonus-account', userId],
    queryFn: async (): Promise<UserBonus> => {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('user_bonuses')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (error) {
        console.error('[useBonusAccount] Error:', error)
        throw new Error('Не удалось получить бонусный счет')
      }
      
      if (!data) {
        throw new Error('Бонусный счет не найден')
      }
      
      return data
    },
    staleTime: 60 * 1000, // 1 минута - бонусы не меняются так часто
    gcTime: 30 * 60 * 1000, // 30 минут
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
}
