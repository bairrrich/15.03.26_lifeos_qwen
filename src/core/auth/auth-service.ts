'use client';

import type { User } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/core/auth/supabase-client';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

/**
 * Отправить magic link на email
 */
export async function signInWithMagicLink(email: string): Promise<{ error: Error | null }> {
  const client = getSupabaseClient();
  if (!client) {
    return { error: new Error('Supabase not configured') };
  }

  const { error } = await client.auth.signInWithOtp({ email });
  return { error: error ? new Error(error.message) : null };
}

/**
 * Выйти из аккаунта
 */
export async function signOut(): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  await client.auth.signOut();
}

/**
 * Получить текущую сессию
 */
export async function getSession() {
  const client = getSupabaseClient();
  if (!client) return null;

  const {
    data: { session },
  } = await client.auth.getSession();
  return session;
}

/**
 * Получить текущего пользователя
 */
export async function getCurrentUser(): Promise<User | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  const {
    data: { user },
  } = await client.auth.getUser();
  return user;
}

/**
 * Подписаться на изменения аутентификации
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
  const client = getSupabaseClient();
  if (!client) {
    return { unsubscribe: () => {} };
  }

  const {
    data: { subscription },
  } = client.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null);
  });
  return subscription;
}
