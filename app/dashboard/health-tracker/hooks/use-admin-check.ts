'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

/**
 * Хук для проверки прав администратора
 * Проверяет роль пользователя в таблице users
 */
export function useAdminCheck(userId: string | null) {
  const { data, isLoading } = useQuery({
    queryKey: ['user-role', userId],
    queryFn: async () => {
      if (!userId) return null
      
      const supabase = createClient()
      const { data: userData, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()
      
      if (error) {
        console.error('Error checking admin status:', error)
        return null
      }
      
      return userData
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 10, // Кешируем на 10 минут
  })

  return {
    isAdmin: data?.role === 'admin',
    isLoading,
  }
}
