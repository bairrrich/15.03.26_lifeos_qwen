import { db } from '@/core/database';
import { getSupabaseClient } from '@/core/auth/supabase-client';

/**
 * Сервис миграции данных из локального режима в Supabase
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

export interface MigrationResult {
  success: boolean;
  migratedCount: number;
  failedCount: number;
  errors: Array<{ table: string; error: string }>;
}

/**
 * Мигрировать данные из локальной БД в Supabase
 */
export async function migrateLocalToSupabase(
  localUserId: string,
  supabaseUserId: string
): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    migratedCount: 0,
    failedCount: 0,
    errors: [],
  };

  const supabase = getSupabaseClient();
  if (!supabase) {
    result.success = false;
    result.errors.push({ table: 'system', error: 'Supabase not configured' });
    return result;
  }

  try {
    for (const tableName of TABLES) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const table = (db as any)[tableName];
      if (!table) continue;

      // Получаем все записи локального пользователя
      const localRecords = await table
        .where('user_id')
        .equals(localUserId)
        .toArray();

      if (localRecords.length === 0) continue;

      // Мигрируем каждую запись
      for (const record of localRecords) {
        try {
          // Создаём копию записи с новым user_id
          const { ...data } = record;
          const newRecord = {
            ...data,
            user_id: supabaseUserId,
            created_at: new Date(record.created_at).toISOString(),
            updated_at: new Date(record.updated_at).toISOString(),
            version: record.version,
          };

          // Отправляем в Supabase
          const { error } = await supabase
            .from(tableName)
            .insert(newRecord);

          if (error) {
            throw error;
          }

          // Обновляем локальную запись с новым user_id
          await table.update(record.id, {
            user_id: supabaseUserId,
            sync_status: 'synced',
            last_synced_at: Date.now(),
          });

          result.migratedCount++;
        } catch (error) {
          result.failedCount++;
          result.errors.push({
            table: tableName,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }

    result.success = result.failedCount === 0;
  } catch (error) {
    result.success = false;
    result.errors.push({
      table: 'system',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  return result;
}

/**
 * Экспортировать все локальные данные в JSON
 */
export async function exportLocalData(localUserId: string): Promise<Record<string, unknown[]>> {
  const data: Record<string, unknown[]> = {};

  for (const tableName of TABLES) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const table = (db as any)[tableName];
    if (!table) continue;

    const records = await table
      .where('user_id')
      .equals(localUserId)
      .toArray();

    if (records.length > 0) {
      data[tableName] = records;
    }
  }

  return data;
}

/**
 * Проверить, есть ли локальные данные для миграции
 */
export async function hasLocalData(localUserId: string): Promise<{ hasData: boolean; recordCount: number }> {
  let recordCount = 0;

  for (const tableName of TABLES) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const table = (db as any)[tableName];
    if (!table) continue;

    const count = await table
      .where('user_id')
      .equals(localUserId)
      .count();

    recordCount += count;
  }

  return { hasData: recordCount > 0, recordCount };
}
