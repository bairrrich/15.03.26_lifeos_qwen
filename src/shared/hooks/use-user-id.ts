'use client';

import { getLocalUser } from '@/core/auth';

/**
 * Получить текущего пользователя ID
 * В локальном режиме - ID локального пользователя
 * Иначе - уникальный анонимный ID
 */
export function getCurrentUserId(): string {
  const localUser = getLocalUser();
  if (localUser) {
    return localUser.id;
  }
  // Генерируем уникальный анонимный ID для новых пользователей
  return getAnonymousUserId();
}

/**
 * Получить или создать анонимный ID пользователя
 */
function getAnonymousUserId(): string {
  const ANON_KEY = 'lifeos_anon_user_id';
  if (typeof window === 'undefined') return 'anon-' + Date.now();

  let anonId = localStorage.getItem(ANON_KEY);
  if (!anonId) {
    anonId = 'anon-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem(ANON_KEY, anonId);
  }
  return anonId;
}
