/**
 * Типы для системы синхронизации
 */

import type { Table } from 'dexie';

export type SyncStatus = 'local' | 'synced' | 'conflict' | 'pending';

/**
 * Базовая сущность для синхронизации
 */
export interface SyncableEntity {
  id: string;
  user_id: string;
  created_at: number;
  updated_at: number;
  deleted_at?: number;
  version: number;
  sync_status: SyncStatus;
  last_synced_at?: number;
  device_id?: string;
  [key: string]: unknown;
}

/**
 * Тип для таблицы базы данных
 */
export type DbTable<T> = Table<T, string>;

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
