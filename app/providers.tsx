'use client'

import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, useEffect } from 'react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      // gcTime должен быть >= maxAge персистера
      gcTime: 1000 * 60 * 60 * 24,
      refetchOnWindowFocus: false,
      retry: 1,
      refetchOnMount: false,
    },
    mutations: {
      retry: false,
    },
  },
})

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG' || target.tagName === 'VIDEO' || target.closest('img') || target.closest('video')) {
        e.preventDefault();
      }
    };
    const handleDragStart = (e: DragEvent) => e.preventDefault();

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('dragstart', handleDragStart);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  const [persister] = useState(() =>
    createSyncStoragePersister({
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      key: 'margo-rq-cache',
      throttleTime: 1000,
    })
  )

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        // Кеш живёт 24 часа
        maxAge: 1000 * 60 * 60 * 24,
        // Сбрасываем кеш при смене версии
        buster: 'v1',
        dehydrateOptions: {
          // Персистим только успешные запросы с данными
          shouldDehydrateQuery: (query) => query.state.status === 'success',
        },
      }}
    >
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </PersistQueryClientProvider>
  )
}

