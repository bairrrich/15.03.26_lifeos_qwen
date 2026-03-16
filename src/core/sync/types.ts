/**
 * Типы для системы синхронизации
 */

export type SyncStatus = 'local' | 'synced' | 'conflict' | 'pending';

export interface SyncResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  conflicts: SyncConflict[];
  errors: SyncError[];
}

export interface SyncConflict {
  table: string;
  id: string;
  localVersion: number;
  remoteVersion: number;
  localData: Record<string, unknown>;
  remoteData: Record<string, unknown>;
}

export interface SyncError {
  table: string;
  id?: string;
  error: string;
}

export interface SyncConfig {
  autoSync: boolean;
  syncInterval: number; // мс между автоматическими синхронизациями
  maxRetries: number;
  retryDelay: number;
}

export const DEFAULT_SYNC_CONFIG: SyncConfig = {
  autoSync: true,
  syncInterval: 30000, // 30 секунд
  maxRetries: 3,
  retryDelay: 1000, // 1 секунда
};
