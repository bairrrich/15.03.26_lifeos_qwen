'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode, useEffect } from 'react';
import { syncService } from '@/core/sync';
import { MigrationPrompt } from '@/components/ui/migration-prompt';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 минут
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  // Инициализация авто-синхронизации при старте приложения
  useEffect(() => {
    // Запускаем авто-синхронизацию
    syncService.startAutoSync();

    // Очищаем при размонтировании
    return () => {
      syncService.stopAutoSync();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <MigrationPrompt />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
