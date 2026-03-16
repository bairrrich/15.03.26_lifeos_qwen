import type { BaseEntity } from '@/core/entity';

export interface Account extends BaseEntity {
  name: string;
  type: 'cash' | 'bank' | 'card' | 'investment' | 'crypto' | 'other';
  balance: number;
  currency: string;
  icon?: string;
  color?: string;
  is_archived?: boolean;
}

export interface Transaction extends BaseEntity {
  account_id: string;
  amount: number;
  currency: string;
  category_id?: string;
  type: 'income' | 'expense' | 'transfer';
  description: string;
  date: number;
  merchant?: string;
  tags?: string[];
  transfer_to_account_id?: string;
  receipt_url?: string;
}

export interface Category extends BaseEntity {
  name: string;
  type: 'income' | 'expense';
  color?: string;
  icon?: string;
  parent_id?: string;
  is_system?: boolean;
}

export interface Budget extends BaseEntity {
  category_id: string;
  amount: number;
  currency: string;
  period: 'month' | 'week' | 'year';
  start_date: number;
  end_date?: number;
  spent?: number;
  alert_threshold?: number;
}

export interface Subscription extends BaseEntity {
  name: string;
  amount: number;
  currency: string;
  billing_period: 'monthly' | 'yearly' | 'weekly';
  next_billing_date: number;
  url?: string;
  icon?: string;
  is_active?: boolean;
}

export interface Investment extends BaseEntity {
  name: string;
  type: 'stock' | 'bond' | 'etf' | 'crypto' | 'real_estate' | 'other';
  ticker?: string;
  quantity: number;
  purchase_price: number;
  average_buy_price?: number;
  current_price?: number;
  current_value?: number;
  invested_amount?: number;
  unrealized_pnl?: number;
  realized_pnl?: number;
  currency: string;
  notes?: string;
  tags?: string[];
  is_archived?: boolean;
}

export interface InvestmentTransaction extends BaseEntity {
  investment_id: string;
  type: 'buy' | 'sell' | 'dividend' | 'fee' | 'split' | 'interest';
  date: number;
  quantity: number;
  price: number;
  fee?: number;
  total: number;
  currency: string;
  notes?: string;
}
