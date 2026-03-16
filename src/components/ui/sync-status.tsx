'use client';

import { useSyncStatus, useSync, useOnlineStatus } from '@/shared/hooks';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

/**
 * Компонент отображения статуса синхронизации
 */
export function SyncStatus() {
  const { isSyncing, lastSyncTime } = useSyncStatus();
  const { sync } = useSync();
  const { isOnline, isOffline } = useOnlineStatus();

  const handleSync = async () => {
    await sync();
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      {/* Индикатор онлайн/оффлайн */}
      <div
        className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}
        title={isOnline ? 'Онлайн' : 'Оффлайн'}
      />

      {/* Индикатор синхронизации */}
      {isSyncing ? (
        <span className="flex items-center gap-1 text-muted-foreground">
          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Синхронизация...
        </span>
      ) : lastSyncTime ? (
        <span className="text-muted-foreground">
          Синхронизировано {formatDistanceToNow(lastSyncTime, { locale: ru, addSuffix: true })}
        </span>
      ) : (
        <span className="text-muted-foreground">Нет синхронизации</span>
      )}

      {/* Кнопка ручной синхронизации */}
      <button
        onClick={handleSync}
        disabled={isSyncing}
        className="p-1 hover:bg-accent rounded disabled:opacity-50 disabled:cursor-not-allowed"
        title="Синхронизировать"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
          <path d="M16 21h5v-5" />
        </svg>
      </button>

      {/* Индикатор оффлайн-режима */}
      {isOffline && (
        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-xs">
          Оффлайн
        </span>
      )}
    </div>
  );
}
