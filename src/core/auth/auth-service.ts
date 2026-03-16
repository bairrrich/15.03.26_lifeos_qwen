'use client';

import type { User } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/core/auth/supabase-client';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface AuthResult {
  error: Error | null;
  requiresEmailConfirmation?: boolean;
}

/**
 * Войти через email и пароль (для зарегистрированных пользователей)
 */
export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  const client = getSupabaseClient();
  if (!client) {
    return { error: new Error('Supabase not configured') };
  }

  const { error, data } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: new Error(error.message) };
  }

  // После успешного входа сохраняем сессию в cookie
  // Это нужно для работы middleware
  if (data.session) {
    const sessionStr = JSON.stringify({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: data.session.user,
    });
    // Кодируем в base64 для cookie
    const encoded = btoa(unescape(encodeURIComponent(sessionStr)));
    document.cookie = `supabase-auth-token=${encoded}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
  }

  return { error: null };
}

/**
 * Зарегистрироваться через email и пароль
 */
export async function signUpWithEmail(email: string, password: string): Promise<AuthResult> {
  const client = getSupabaseClient();
  if (!client) {
    return { error: new Error('Supabase not configured') };
  }

  const { error } = await client.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/`,
    },
  });

  // Если требуется подтверждение email
  if (error?.status === 400 && error.message.includes('Email confirmation')) {
    return { error: null, requiresEmailConfirmation: true };
  }

  return { error: error ? new Error(error.message) : null, requiresEmailConfirmation: false };
}

/**
 * Отправить magic link на email (альтернативный способ входа без пароля)
 */
export async function signInWithMagicLink(email: string): Promise<AuthResult> {
  const client = getSupabaseClient();
  if (!client) {
    return { error: new Error('Supabase not configured') };
  }

  const { error } = await client.auth.signInWithOtp({ email });
  return { error: error ? new Error(error.message) : null };
}

/**
 * Выйти из аккаунта (Supabase или локальный режим)
 */
export async function signOut(): Promise<void> {
  // Проверяем, в локальном ли режиме пользователь
  if (isLocalMode()) {
    signOutLocally();
    window.location.href = '/login';
    return;
  }

  // Выход из Supabase
  const client = getSupabaseClient();
  if (client) {
    await client.auth.signOut();
  }

  // Очищаем cookie сессии
  document.cookie = 'supabase-auth-token=; path=/; max-age=0; SameSite=Lax';

  // Перезагружаем страницу для редиректа на страницу логина
  window.location.href = '/login';
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
    return { unsubscribe: () => { } };
  }

  const {
    data: { subscription },
  } = client.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null);
  });
  return subscription;
}

// ==========================================
// ЛОКАЛЬНЫЙ РЕЖИМ (без регистрации)
// ==========================================

const LOCAL_USER_KEY = 'lifeos_local_user';

export interface LocalUser {
  id: string;
  email: string;
  isLocal: true;
  createdAt: number;
}

/**
 * Войти в локальном режиме (без регистрации)
 * Сохраняем в cookie для работы middleware
 */
export function signInLocally(email: string): LocalUser {
  const localUser: LocalUser = {
    id: `local-${Date.now()}`,
    email: email || 'local@lifeos.local',
    isLocal: true,
    createdAt: Date.now(),
  };

  // Сохраняем в localStorage для текущего клиента
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localUser));

  // Сохраняем в cookie для middleware (на стороне сервера это не сработает, но для клиентской навигации ok)
  document.cookie = `${LOCAL_USER_KEY}=${encodeURIComponent(JSON.stringify(localUser))}; path=/; max-age=${365 * 24 * 60 * 60}`;

  return localUser;
}

/**
 * Получить текущего локального пользователя
 */
export function getLocalUser(): LocalUser | null {
  // Проверка на сервере
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return null;
  }

  const data = localStorage.getItem(LOCAL_USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data) as LocalUser;
  } catch {
    return null;
  }
}

/**
 * Выйти из локального режима
 */
export function signOutLocally(): void {
  localStorage.removeItem(LOCAL_USER_KEY);
  // Очищаем cookie
  document.cookie = `${LOCAL_USER_KEY}=; path=/; max-age=0`;
}

/**
 * Проверить, работает ли приложение в локальном режиме
 */
export function isLocalMode(): boolean {
  return getLocalUser() !== null;
}

/**
 * Получить текущего пользователя (Supabase или локальный)
 */
export async function getCurrentUserOrLocal(): Promise<User | LocalUser | null> {
  // Сначала пробуем получить пользователя Supabase
  const supabaseUser = await getCurrentUser();
  if (supabaseUser) return supabaseUser;

  // Если нет - пробуем локального
  return getLocalUser();
}
