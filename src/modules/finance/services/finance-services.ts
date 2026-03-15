import { CrudService } from '@/core/crud';
import type { Account, Transaction, Category, Budget, Subscription, Investment } from '../entities';

export class AccountService extends CrudService<Account> {
  constructor() {
    super('accounts');
  }

  async getTotalBalance(): Promise<number> {
    const accounts = await this.getAll();
    return accounts.reduce((total, acc) => total + acc.balance, 0);
  }

  async getByType(type: Account['type']): Promise<Account[]> {
    return await this.findByField('type', type);
  }
}

export class TransactionService extends CrudService<Transaction> {
  constructor() {
    super('transactions');
  }

  async getByAccount(accountId: string): Promise<Transaction[]> {
    return await this.findByField('account_id', accountId);
  }

  async getByCategory(categoryId: string): Promise<Transaction[]> {
    return await this.findByField('category_id', categoryId);
  }

  async getByDateRange(start: number, end: number): Promise<Transaction[]> {
    const all = await this.getAll();
    return all.filter((t) => t.date >= start && t.date <= end);
  }

  async getIncomeByDateRange(start: number, end: number): Promise<number> {
    const transactions = await this.getByDateRange(start, end);
    return transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  }

  async getExpensesByDateRange(start: number, end: number): Promise<number> {
    const transactions = await this.getByDateRange(start, end);
    return transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  }
}

export class CategoryService extends CrudService<Category> {
  constructor() {
    super('categories');
  }

  async getByType(type: 'income' | 'expense'): Promise<Category[]> {
    return await this.findByField('type', type);
  }
}

export class BudgetService extends CrudService<Budget> {
  constructor() {
    super('budgets');
  }
}

export class SubscriptionService extends CrudService<Subscription> {
  constructor() {
    super('subscriptions');
  }

  async getMonthlyTotal(): Promise<number> {
    const subscriptions = await this.getAll();
    return subscriptions.reduce((total, sub) => {
      const amount = sub.amount;
      if (sub.billing_period === 'weekly') return total + amount * 4;
      if (sub.billing_period === 'yearly') return total + amount / 12;
      return total + amount;
    }, 0);
  }
}

export class InvestmentService extends CrudService<Investment> {
  constructor() {
    super('investments');
  }

  async getTotalValue(): Promise<number> {
    const investments = await this.getAll();
    return investments.reduce((total, inv) => {
      const price = inv.current_price || inv.purchase_price;
      return total + price * inv.quantity;
    }, 0);
  }
}
