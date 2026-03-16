import type { Account } from '../entities';
import type { AccountService } from '../services';

// Предустановленные счета по умолчанию
export const defaultAccounts: Omit<Account, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'version' | 'sync_status' | 'last_synced_at'>[] = [
  // Наличные
  { user_id: 'system', name: '💵 Наличные', type: 'cash', balance: 0, currency: 'RUB', is_archived: false },

  // Банковские счета
  { user_id: 'system', name: '🏦 Основной счёт', type: 'bank', balance: 0, currency: 'RUB', is_archived: false },
  { user_id: 'system', name: '💳 Зарплатная карта', type: 'bank', balance: 0, currency: 'RUB', is_archived: false },

  // Кредитные карты
  { user_id: 'system', name: '💳 Кредитная карта', type: 'card', balance: 0, currency: 'RUB', is_archived: false },

  // Инвестиции
  { user_id: 'system', name: '📈 Инвестиционный счёт', type: 'investment', balance: 0, currency: 'RUB', is_archived: false },

  // Вклады (накопительные счета)
  { user_id: 'system', name: '💰 Вклад', type: 'savings', balance: 0, currency: 'RUB', is_archived: false },

  // Криптовалюта
  { user_id: 'system', name: '₿ Криптокошелёк', type: 'crypto', balance: 0, currency: 'BTC', is_archived: false },

  // Другое
  { user_id: 'system', name: '📦 Другое', type: 'other', balance: 0, currency: 'RUB', is_archived: false },
];

// Функция для инициализации seed-счетов
export async function initializeSeedAccounts(accountService: AccountService): Promise<void> {
  const SEEDED_KEY = 'finance_accounts_seeded_v1';

  // Проверяем, были ли уже добавлены счета
  if (typeof localStorage !== 'undefined') {
    const alreadySeeded = localStorage.getItem(SEEDED_KEY);
    if (alreadySeeded) {
      console.log('[Seed] Accounts already seeded, skipping');
      return;
    }
  }

  try {
    const existing = await accountService.getAll();

    // Если уже есть счета, не добавляем
    if (existing.length > 0) {
      console.log(`[Seed] Found ${existing.length} existing accounts, skipping seed`);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(SEEDED_KEY, 'true');
      }
      return;
    }

    // Создаём все счета по умолчанию
    for (const account of defaultAccounts) {
      await accountService.create(account);
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SEEDED_KEY, 'true');
    }

    console.log(`[Seed] Added ${defaultAccounts.length} default accounts`);
  } catch (error) {
    console.error('[Seed] Error initializing accounts:', error);
  }
}
