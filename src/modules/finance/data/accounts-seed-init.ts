'use client';

import { AccountService } from '../services';
import { initializeSeedAccounts } from '../data/seed-accounts';

const accountService = new AccountService();

export async function initializeFinanceAccounts(): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await initializeSeedAccounts(accountService as any);
}

export async function resetFinanceAccounts(): Promise<void> {
  // Удаляем все счета
  const accounts = await accountService.getAll();
  const deletePromises = accounts.map(acc => accountService.delete(acc.id).catch(() => { }));
  await Promise.all(deletePromises);

  // Сбрасываем флаги
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('finance_accounts_seeded_v1');
  }

  // Пересоздаем счета
  await initializeSeedAccounts(accountService);

  console.log('[Seed] Finance accounts reset and re-initialized');
}

