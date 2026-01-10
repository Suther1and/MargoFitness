'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

/**
 * Хук для проверки прав администратора и получения даты регистрации
 * Проверяет роль пользователя в таблице profiles
 */
export function useAdminCheck(userId: string | null) {
  const { data, isLoading } = useQuery({
    queryKey: ['user-role', userId],
    queryFn: async () => {
      if (!userId) return null
      
      const supabase = createClient()
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('role, created_at')
        .eq('id', userId)
        .single()
      
      if (error) {
        console.error('Error checking admin status:', error.message || error)
        return null
      }
      
      return profileData
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 10, // Кешируем на 10 минут
  })

  return {
    isAdmin: data?.role === 'admin',
    registrationDate: data?.created_at ? new Date(data.created_at) : null,
    isLoading,
  }
}
