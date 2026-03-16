import { CrudService } from '@/core/crud';
import type { Account, Transaction, Category, Budget, Subscription, Investment, InvestmentTransaction } from '../entities';

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

  async getActiveAccounts(): Promise<Account[]> {
    const accounts = await this.getAll();
    return accounts.filter((acc) => !acc.is_archived);
  }
}

export class TransactionService extends CrudService<Transaction> {
  constructor() {
    super('transactions');
  }

  /**
   * Обновить баланс счёта на основе транзакций
   */
  async updateAccountBalance(accountId: string): Promise<void> {
    const accountService = new AccountService();
    const account = await accountService.getById(accountId);
    if (!account) return;

    // Получаем все транзакции по счёту
    const transactions = await this.getByAccount(accountId);

    // Считаем баланс: доходы - расходы
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const newBalance = income - expenses;

    // Обновляем баланс счёта
    await accountService.update(accountId, { balance: newBalance });
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

  async getExpensesByCategory(categoryId: string, start: number, end: number): Promise<number> {
    const transactions = await this.getByDateRange(start, end);
    return transactions
      .filter((t) => t.category_id === categoryId && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  async getTransfersByAccount(accountId: string): Promise<Transaction[]> {
    const all = await this.getAll();
    return all.filter(
      (t) => t.type === 'transfer' && (t.account_id === accountId || t.transfer_to_account_id === accountId)
    );
  }
}

export class CategoryService extends CrudService<Category> {
  constructor() {
    super('categories');
  }

  async getByType(type: 'income' | 'expense'): Promise<Category[]> {
    return await this.findByField('type', type);
  }

  async getSubcategories(parentId: string): Promise<Category[]> {
    return await this.findByField('parent_id', parentId);
  }

  async getRootCategories(type?: 'income' | 'expense'): Promise<Category[]> {
    const all = await this.getAll();
    const roots = all.filter((c) => !c.parent_id);
    return type ? roots.filter((c) => c.type === type) : roots;
  }
}

export class BudgetService extends CrudService<Budget> {
  constructor() {
    super('budgets');
  }

  async getByCategory(categoryId: string): Promise<Budget[]> {
    return await this.findByField('category_id', categoryId);
  }

  async getActiveBudgets(): Promise<Budget[]> {
    const all = await this.getAll();
    const now = Date.now();
    return all.filter((b) => !b.end_date || b.end_date > now);
  }

  async updateSpent(categoryId: string, spent: number): Promise<void> {
    const budgets = await this.getByCategory(categoryId);
    for (const budget of budgets) {
      await this.update(budget.id, { ...budget, spent });
    }
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

  async getActiveSubscriptions(): Promise<Subscription[]> {
    const all = await this.getAll();
    return all.filter((s) => s.is_active !== false && new Date(s.next_billing_date) > new Date());
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

  async getTotalInvested(): Promise<number> {
    const investments = await this.getAll();
    return investments.reduce((total, inv) => total + inv.purchase_price * inv.quantity, 0);
  }

  async getTotalPnl(): Promise<number> {
    const investments = await this.getAll();
    return investments.reduce((total, inv) => {
      const currentValue = (inv.current_price || inv.purchase_price) * inv.quantity;
      const investedValue = inv.purchase_price * inv.quantity;
      return total + (currentValue - investedValue);
    }, 0);
  }

  async getByType(type: Investment['type']): Promise<Investment[]> {
    return await this.findByField('type', type);
  }

  async getActiveInvestments(): Promise<Investment[]> {
    const all = await this.getAll();
    return all.filter((inv) => !inv.is_archived);
  }

  async updatePnl(id: string): Promise<void> {
    const investment = await this.getById(id);
    if (!investment) return;

    const currentValue = (investment.current_price || investment.purchase_price) * investment.quantity;
    const investedValue = investment.purchase_price * investment.quantity;
    const unrealizedPnl = currentValue - investedValue;

    await this.update(id, {
      ...investment,
      current_value: currentValue,
      invested_amount: investedValue,
      unrealized_pnl: unrealizedPnl,
    });
  }
}

export class InvestmentTransactionService extends CrudService<InvestmentTransaction> {
  constructor() {
    super('investment_transactions');
  }

  async getByInvestment(investmentId: string): Promise<InvestmentTransaction[]> {
    return await this.findByField('investment_id', investmentId);
  }

  async getByDateRange(start: number, end: number): Promise<InvestmentTransaction[]> {
    const all = await this.getAll();
    return all.filter((t) => t.date >= start && t.date <= end);
  }

  async getByType(investmentId: string, type: InvestmentTransaction['type']): Promise<InvestmentTransaction[]> {
    const all = await this.getAll();
    return all.filter((t) => t.investment_id === investmentId && t.type === type);
  }

  async getTotalDividends(investmentId: string): Promise<number> {
    const dividends = await this.getByType(investmentId, 'dividend');
    return dividends.reduce((sum, t) => sum + t.total, 0);
  }
}
