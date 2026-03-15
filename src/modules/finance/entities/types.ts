import type { BaseEntity } from '@/core/entity';

export interface Account extends BaseEntity {
  name: string;
  type: 'cash' | 'bank' | 'card' | 'investment' | 'crypto' | 'other';
  balance: number;
  currency: string;
  icon?: string;
  color?: string;
}

export interface Transaction extends BaseEntity {
  account_id: string;
  amount: number;
  currency: string;
  category_id: string;
  type: 'income' | 'expense';
  description: string;
  date: number;
  merchant?: string;
  tags?: string[];
}

export interface Category extends BaseEntity {
  name: string;
  type: 'income' | 'expense';
  color?: string;
  icon?: string;
}

export interface Budget extends BaseEntity {
  category_id: string;
  amount: number;
  currency: string;
  period: 'month' | 'week' | 'year';
  start_date: number;
}

export interface Subscription extends BaseEntity {
  name: string;
  amount: number;
  currency: string;
  billing_period: 'monthly' | 'yearly' | 'weekly';
  next_billing_date: number;
  url?: string;
  icon?: string;
}

export interface Investment extends BaseEntity {
  name: string;
  type: 'stock' | 'bond' | 'etf' | 'crypto' | 'real_estate' | 'other';
  ticker?: string;
  quantity: number;
  purchase_price: number;
  current_price?: number;
  currency: string;
}
