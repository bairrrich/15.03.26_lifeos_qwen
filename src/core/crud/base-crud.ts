import type { BaseEntity } from '@/core/entity';
import type { Table } from 'dexie';
import { db } from '@/core/database';
import { syncService } from '@/core/sync';
import { getLocalUser } from '@/core/auth';
import { v4 as uuidv4 } from 'uuid';

/**
 * Базовый CRUD сервис для работы с сущностями
 *
 * Все операции create/update/delete помечают записи как 'local'
 * и автоматически отправляются в очередь на синхронизацию с Supabase
 *
 * В локальном режиме user_id берётся из локального пользователя
 */
export class CrudService<T extends BaseEntity> {
  protected table: Table<T>;
  protected db = db;
  protected syncService = syncService;

  constructor(tableName: string) {
    this.table = (db as Record<string, Table<T>>)[tableName];
  }

  /**
   * Получить текущего пользователя (локальный или анонимный ID)
   */
  protected getUserId(): string {
    const localUser = getLocalUser();
    if (localUser) {
      return localUser.id;
    }
    // Генерируем уникальный анонимный ID для новых пользователей
    return this.getAnonymousUserId();
  }

  /**
   * Получить или создать анонимный ID пользователя
   */
  private getAnonymousUserId(): string {
    const ANON_KEY = 'lifeos_anon_user_id';
    if (typeof window === 'undefined') return 'anon-' + Date.now();

    let anonId = localStorage.getItem(ANON_KEY);
    if (!anonId) {
      anonId = 'anon-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem(ANON_KEY, anonId);
    }
    return anonId;
  }

  /**
   * Триггерит фоновую синхронизацию после изменения данных
   */
  protected triggerSync(): void {
    // Запускаем синхронизацию в фоне (не ждем завершения)
    this.syncService.sync().catch((err) => {
      console.warn('Background sync failed:', err);
    });
  }

  /**
   * Создать новую сущность
   */
  async create(
    entity: Omit<
      T,
      | 'id'
      | 'created_at'
      | 'updated_at'
      | 'deleted_at'
      | 'version'
      | 'sync_status'
      | 'last_synced_at'
    > & { user_id: string }
  ): Promise<T> {
    const now = Date.now();
    const newEntity = {
      ...entity,
      id: uuidv4(), // Генерируем UUID для id
      created_at: now,
      updated_at: now,
      version: 1,
      sync_status: 'local' as const,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.table.add(newEntity as any);

    // Запускаем синхронизацию после создания
    this.triggerSync();

    return newEntity as T;
  }

  /**
   * Получить сущность по ID
   */
  async getById(id: string): Promise<T | undefined> {
    return await this.table.get(id);
  }

  /**
   * Получить все сущности (без удаленных)
   */
  async getAll(): Promise<T[]> {
    const all = await this.table.toArray();
    return all.filter((item) => !item.deleted_at);
  }

  /**
   * Обновить сущность
   */
  async update(id: string, updates: Partial<T>): Promise<void> {
    const existing = await this.getById(id);
    if (!existing) return;

    await this.table.update(id, {
      ...updates,
      updated_at: Date.now(),
      version: existing.version + 1,
      sync_status: 'local',
    } as unknown);

    // Запускаем синхронизацию после обновления
    this.triggerSync();
  }

  /**
   * Мягкое удаление сущности
   */
  async delete(id: string): Promise<void> {
    await this.update(id, { deleted_at: Date.now() } as Partial<T>);
    // triggerSync вызывается внутри update
  }

  /**
   * Полное удаление сущности
   */
  async hardDelete(id: string): Promise<void> {
    await this.table.delete(id);
  }

  /**
   * Поиск сущностей по полю
   */
  async findByField<K extends keyof T>(field: K, value: T[K]): Promise<T[]> {
    return await this.table
      .where(field as string)
      .equals(value as unknown)
      .toArray();
  }

  /**
   * Получить сущности, готовые к синхронизации
   */
  async getPendingSync(): Promise<T[]> {
    return await this.table.where('sync_status').equals('local').toArray();
  }

  /**
   * Отметить сущность как синхронизированную
   */
  async markAsSynced(id: string): Promise<void> {
    await this.table.update(id, { sync_status: 'synced', last_synced_at: Date.now() } as unknown);
  }
}
