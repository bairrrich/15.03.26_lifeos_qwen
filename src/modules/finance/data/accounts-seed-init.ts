'use client';

import { AccountService } from '../services';
import { initializeSeedAccounts } from '../data/seed-accounts';

const accountService = new AccountService();

export async function initializeFinanceAccounts(): Promise<void> {
  await initializeSeedAccounts(accountService);
}

export async function resetFinanceAccounts(): Promise<void> {
  // Удаляем все счета
  const accounts = await accountService.getAll();
  const deletePromises = accounts.map(acc => accountService.delete(acc.id).catch(() => {}));
  await Promise.all(deletePromises);
  
  // Сбрасываем флаги
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('finance_accounts_seeded_v1');
  }
  
  // Пересоздаем счета
  await initializeSeedAccounts(accountService);
  
  console.log('[Seed] Finance accounts reset and re-initialized');
}
