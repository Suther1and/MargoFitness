'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

/**
 * Хук для получения даты регистрации пользователя
 * Используется для ограничения доступа к датам до регистрации
 */
export function useRegistrationDate(userId: string | null) {
  const { data, isLoading } = useQuery({
    queryKey: ['user-registration', userId],
    queryFn: async () => {
      if (!userId) return null
      
      const supabase = createClient()
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('id', userId)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') return null
        console.error('Error fetching registration date:', error.message || error)
        return null
      }
      
      return profileData
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 10, // Кешируем на 10 минут
  })

  return {
    registrationDate: data?.created_at ? new Date(data.created_at) : null,
    isLoading,
  }
}
