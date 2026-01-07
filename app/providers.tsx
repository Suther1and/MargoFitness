'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

/**
 * Providers компонент для React Query
 * 
 * Настраивает глобальный QueryClient с оптимальными параметрами кэширования
 * для Health Tracker.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Данные считаются свежими 5 минут
        staleTime: 1000 * 60 * 5,
        // Кэш хранится 30 минут (увеличено для сохранения между переключениями)
        gcTime: 1000 * 60 * 30,
        // Не перезагружать при фокусе окна (данные health tracker не меняются извне)
        refetchOnWindowFocus: false,
        // Retry только один раз при ошибке
        retry: 1,
        // Не перезагружать при монтировании - используем кэш
        refetchOnMount: false,
      },
      mutations: {
        // Retry для мутаций отключен (чтобы не дублировать запросы)
        retry: false,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools только в dev режиме */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}

