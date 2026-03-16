'use client';

import { useEffect, useState, useCallback } from 'react';
import { syncService } from '@/core/sync';

interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime: number | null;
  lastSyncResult: {
    success: boolean;
    syncedCount: number;
    failedCount: number;
  } | null;
}

/**
 * Хук для отслеживания статуса синхронизации
 */
export function useSyncStatus(): SyncStatus {
  const [status, setStatus] = useState<SyncStatus>({
    isSyncing: syncService.isSyncing(),
    lastSyncTime: syncService.getLastSyncTime(),
    lastSyncResult: null,
  });

  useEffect(() => {
    // Обновляем статус каждую секунду
    const interval = setInterval(() => {
      setStatus({
        isSyncing: syncService.isSyncing(),
        lastSyncTime: syncService.getLastSyncTime(),
        lastSyncResult: status.lastSyncResult,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [status.lastSyncResult]);

  return status;
}

/**
 * Хук для ручного запуска синхронизации
 */
export function useSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    syncedCount: number;
    failedCount: number;
  } | null>(null);

  const sync = useCallback(async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    setError(null);

    try {
      const result = await syncService.sync();
      setLastResult({
        success: result.success,
        syncedCount: result.syncedCount,
        failedCount: result.failedCount,
      });

      if (!result.success) {
        setError(result.errors[0]?.error || 'Sync failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  return { sync, isSyncing, error, lastResult };
}

/**
 * Хук для автоматической синхронизации при изменении онлайн/оффлайн статуса
 */
export function useOnlineStatus(): { isOnline: boolean; isOffline: boolean } {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Автоматическая синхронизация при появлении соединения
      syncService.sync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
  };
}
