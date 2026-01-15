'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, useEffect } from 'react'

/**
 * Providers компонент для React Query
 * 
 * Настраивает глобальный QueryClient с оптимальными параметрами кэширования
 * для Health Tracker.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Блокировка контекстного меню (правой кнопки мыши)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Блокировка перетаскивания (для изображений и т.д.)
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('dragstart', handleDragStart);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

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

