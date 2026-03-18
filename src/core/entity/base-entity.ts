/**
 * Базовая сущность для всех объектов LifeOS
 */
export interface BaseEntity {
  id: string;
  user_id: string;

  created_at: number;
  updated_at: number;
  deleted_at?: number; // soft delete

  version: number;
  sync_status: 'local' | 'synced' | 'conflict' | 'pending';

  last_synced_at?: number;
  device_id?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
  tags?: string[];
  notes?: string;
}

