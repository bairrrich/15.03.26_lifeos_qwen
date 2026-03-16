import type { BaseEntity } from '@/core/entity';
import type { Table } from 'dexie';
import { db } from '@/core/database';

/**
 * Базовый CRUD сервис для работы с сущностями
 */
export class CrudService<T extends BaseEntity> {
  protected table: Table<T>;
  protected db = db;

  constructor(tableName: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.table = (db as any)[tableName];
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
      created_at: now,
      updated_at: now,
      version: 1,
      sync_status: 'local' as const,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const id = await this.table.add(newEntity as any);
    return { ...newEntity, id } as T;
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.table.update(id, {
      ...updates,
      updated_at: Date.now(),
      version: existing.version + 1,
      sync_status: 'local',
    } as any);
  }

  /**
   * Мягкое удаление сущности
   */
  async delete(id: string): Promise<void> {
    await this.update(id, { deleted_at: Date.now() } as Partial<T>);
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await this.table
      .where(field as string)
      .equals(value as any)
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.table.update(id, { sync_status: 'synced', last_synced_at: Date.now() } as any);
  }
}
