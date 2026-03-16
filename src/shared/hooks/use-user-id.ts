'use client';

import { getLocalUser } from '@/core/auth';

/**
 * Получить текущего пользователя ID
 * В локальном режиме - ID локального пользователя
 * В режиме Supabase - 'supabase-user'
 */
export function getCurrentUserId(): string {
  const localUser = getLocalUser();
  if (localUser) {
    return localUser.id;
  }
  return 'supabase-user';
}
