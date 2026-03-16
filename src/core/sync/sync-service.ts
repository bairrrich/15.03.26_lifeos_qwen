import { getSupabaseClient, isLocalMode } from '@/core/auth';
import { db } from '@/core/database';
import type { SyncResult, SyncConflict, SyncError, SyncConfig } from './types';
import { DEFAULT_SYNC_CONFIG } from './types';

/**
 * Сервис синхронизации локальной базы данных (IndexedDB) с Supabase
 *
 * Принцип работы:
 * 1. При создании/обновлении записи в локальной БД она помечается как 'local'
 * 2. Синхронизация отправляет локальные изменения на сервер
 * 3. Получает изменения с сервера и обновляет локальную БД
 * 4. Разрешает конфликты версий
 *
 * В локальном режиме синхронизация с Supabase отключена - данные хранятся только в IndexedDB
 */

const TABLES = [
  'accounts',
  'transactions',
  'categories',
  'budgets',
  'subscriptions',
  'investments',
  'investment_transactions',
  'habits',
  'habit_logs',
  'goals',
  'foods',
  'meals',
  'recipes',
  'nutrition_logs',
  'exercises',
  'workouts',
  'workout_logs',
  'books',
  'courses',
  'movies',
  'articles',
  'notes',
  'health_metrics',
  'supplements',
  'sleep_logs',
  'beauty_products',
  'beauty_routines',
  'automations',
  'automation_logs',
];

export class SyncService {
  private config: SyncConfig;
  private syncInProgress = false;
  private lastSyncTime: number | null = null;
  private autoSyncInterval: ReturnType<typeof setInterval> | null = null;

  constructor(config: Partial<SyncConfig> = {}) {
    this.config = { ...DEFAULT_SYNC_CONFIG, ...config };
  }

  /**
   * Запустить автоматическую синхронизацию
   * В локальном режиме синхронизация отключена
   */
  startAutoSync(): void {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
    }

    if (this.config.autoSync && !isLocalMode()) {
      this.autoSyncInterval = setInterval(() => {
        this.sync();
      }, this.config.syncInterval);
    }
  }

  /**
   * Остановить автоматическую синхронизацию
   */
  stopAutoSync(): void {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
      this.autoSyncInterval = null;
    }
  }

  /**
   * Выполнить синхронизацию всех таблиц
   * В локальном режиме возвращает успех без синхронизации
   */
  async sync(): Promise<SyncResult> {
    if (this.syncInProgress) {
      return {
        success: false,
        syncedCount: 0,
        failedCount: 0,
        conflicts: [],
        errors: [{ table: 'system', error: 'Sync already in progress' }],
      };
    }

    // В локальном режиме синхронизация не нужна
    if (isLocalMode()) {
      return {
        success: true,
        syncedCount: 0,
        failedCount: 0,
        conflicts: [],
        errors: [],
      };
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return {
        success: false,
        syncedCount: 0,
        failedCount: 0,
        conflicts: [],
        errors: [{ table: 'system', error: 'Supabase not configured' }],
      };
    }

    this.syncInProgress = true;
    const result: SyncResult = {
      success: true,
      syncedCount: 0,
      failedCount: 0,
      conflicts: [],
      errors: [],
    };

    try {
      // Получаем пользователя из локальной БД (первый найденный user_id)
      const userId = await this.getCurrentUserId();

      if (!userId) {
        // Если пользователь не найден, используем демо-режим
        console.warn('No user found, using demo mode');
      }

      // Синхронизируем каждую таблицу
      for (const table of TABLES) {
        const tableResult = await this.syncTable(table, userId || 'demo-user');
        result.syncedCount += tableResult.syncedCount;
        result.failedCount += tableResult.failedCount;
        result.conflicts.push(...tableResult.conflicts);
        result.errors.push(...tableResult.errors);
      }

      this.lastSyncTime = Date.now();
      result.success = result.errors.length === 0;
    } catch (error) {
      result.success = false;
      result.errors.push({
        table: 'system',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      this.syncInProgress = false;
    }

    return result;
  }

  /**
   * Синхронизация отдельной таблицы
   */
  private async syncTable(
    tableName: string,
    userId: string
  ): Promise<{ syncedCount: number; failedCount: number; conflicts: SyncConflict[]; errors: SyncError[] }> {
    const result = {
      syncedCount: 0,
      failedCount: 0,
      conflicts: [] as SyncConflict[],
      errors: [] as SyncError[],
    };

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const table = (db as any)[tableName];
      if (!table) {
        return result;
      }

      // 1. Получаем локальные изменения (pending sync)
      const localChanges = await table.where('sync_status').equals('local').toArray();

      // 2. Отправляем локальные изменения на сервер
      for (const record of localChanges) {
        try {
          await this.pushToSupabase(tableName, record, userId);
          await table.update(record.id, {
            sync_status: 'synced',
            last_synced_at: Date.now(),
          });
          result.syncedCount++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          if (errorMessage.includes('conflict') || errorMessage.includes('version')) {
            result.conflicts.push({
              table: tableName,
              id: record.id,
              localVersion: record.version,
              remoteVersion: 0,
              localData: record,
              remoteData: {},
            });
            await table.update(record.id, { sync_status: 'conflict' });
          } else {
            result.failedCount++;
            result.errors.push({
              table: tableName,
              id: record.id,
              error: errorMessage,
            });
          }
        }
      }

      // 3. Получаем изменения с сервера
      await this.pullFromSupabase(tableName, userId, table);
    } catch (error) {
      result.errors.push({
        table: tableName,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    return result;
  }

  /**
   * Отправка записи в Supabase
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async pushToSupabase(tableName: string, record: any, userId: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');

    // Подготавливаем данные для отправки (убираем служебные поля Dexie)
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      id,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      created_at,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      updated_at,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      deleted_at,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      version,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      sync_status,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      last_synced_at,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      device_id,
      ...data
    } = record;

    // Проверяем, существует ли запись на сервере
    const { data: existing } = await supabase
      .from(tableName)
      .select('id')
      .eq('id', record.id)
      .eq('user_id', userId)
      .single();

    if (existing) {
      // Обновляем существующую запись
      const { error } = await supabase
        .from(tableName)
        .update({
          ...data,
          updated_at: new Date(record.updated_at).toISOString(),
          version: record.version,
        })
        .eq('id', record.id);

      if (error) throw error;
    } else {
      // Создаем новую запись
      const { error } = await supabase.from(tableName).insert({
        id: record.id,
        user_id: userId,
        ...data,
        created_at: new Date(record.created_at).toISOString(),
        updated_at: new Date(record.updated_at).toISOString(),
        version: record.version,
      });

      if (error) throw error;
    }
  }

  /**
   * Получение записей из Supabase
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async pullFromSupabase(tableName: string, userId: string, table: any): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    // Получаем все записи пользователя с сервера
    const { data: remoteRecords, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.warn(`Failed to pull ${tableName}:`, error.message);
      return;
    }

    if (!remoteRecords || remoteRecords.length === 0) return;

    // Обновляем локальные записи
    for (const remote of remoteRecords) {
      try {
        const local = await table.get(remote.id);

        if (!local) {
          // Записи нет локально - создаем
          const localRecord = this.convertRemoteToLocal(remote);
          await table.add(localRecord);
        } else if (local.sync_status !== 'local') {
          // Запись есть локально, но не помечена как локальное изменение
          // Проверяем версии
          const remoteVersion = remote.version || 1;
          if (remoteVersion > local.version) {
            // Remote новее - обновляем локально
            const localRecord = this.convertRemoteToLocal(remote);
            await table.update(remote.id, localRecord);
          } else if (remoteVersion < local.version) {
            // Local новее - помечаем конфликт
            await table.update(remote.id, { sync_status: 'conflict' });
          }
        }
      } catch (error) {
        console.warn(`Failed to sync record ${remote.id} in ${tableName}:`, error);
      }
    }
  }

  /**
   * Конвертация записи из Supabase в формат Dexie
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private convertRemoteToLocal(remote: any): any {
    return {
      ...remote,
      created_at: new Date(remote.created_at).getTime(),
      updated_at: new Date(remote.updated_at).getTime(),
      sync_status: 'synced',
      last_synced_at: Date.now(),
    };
  }

  /**
   * Получение текущего пользователя
   */
  private async getCurrentUserId(): Promise<string | null> {
    // Пока используем демо-пользователя
    // В будущем можно получать из аутентификации
    return 'demo-user';
  }

  /**
   * Получить статус последней синхронизации
   */
  getLastSyncTime(): number | null {
    return this.lastSyncTime;
  }

  /**
   * Проверка, идет ли синхронизация
   */
  isSyncing(): boolean {
    return this.syncInProgress;
  }
}

// Экспорт singleton экземпляра
export const syncService = new SyncService();
