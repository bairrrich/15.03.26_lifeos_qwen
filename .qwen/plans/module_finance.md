# LifeOS — Подробный план модуля Финансы

> **Версия:** 1.0  
> **Дата:** 2026-03-15  
> **Статус:** Активный  
> **Приоритет:** Высокий (входит в Фазу 1 MVP)

---

## 1. Обзор модуля

**Цель:** Дать пользователю полный контроль над деньгами в одном месте: от ежедневных трат до долгосрочного финансового здоровья.

**Ключевые возможности (2026 тренд):**
- Учёт всех счетов и транзакций
- Иерархические категории + подкатегории
- Гибкие бюджеты (месячные/недельные/проектные)
- Автоматическое отслеживание подписок и автоплатежей
- Инвестиционный портфель
- Прогноз cash flow и net worth
- AI-подсказки по экономии (Фаза 3+)
- Детальная аналитика + экспорт отчётов

**Главные экраны:**
1. Finance Dashboard (обзор)
2. Transactions (список + фильтры)
3. Accounts (управление счетами)
4. Budgets (бюджеты и контроль)
5. Subscriptions (подписки)
6. Investments (инвестиции)
7. Analytics (графики и отчёты)

---

## 2. Сущности (все наследуют BaseEntity)

```typescript
// core/entity/types.ts
export interface Account extends BaseEntity {
  name: string;
  type: "bank" | "cash" | "credit" | "investment" | "savings";
  balance: number;
  currency: string;
  icon?: string;
  color?: string; // OKLCH
  is_archived: boolean;
}

export interface Transaction extends BaseEntity {
  account_id: string;
  amount: number;
  type: "income" | "expense" | "transfer";
  category_id?: string;
  date: number;           // timestamp
  description: string;
  tags?: string[];
  receipt_url?: string;   // вложение
  transfer_to_account_id?: string; // для переводов
}

export interface Category extends BaseEntity {
  name: string;
  type: "income" | "expense";
  parent_id?: string;     // иерархия
  icon?: string;
  color?: string;
  is_system: boolean;     // "Еда", "Транспорт" и т.д.
}

export interface Budget extends BaseEntity {
  category_id: string;
  period: "month" | "week" | "year";
  amount: number;
  spent: number;
  start_date: number;
  end_date?: number;
  alert_threshold: number; // % (например 80%)
}

export interface Subscription extends BaseEntity {
  name: string;
  amount: number;
  currency: string;
  next_payment_date: number;
  billing_cycle: "monthly" | "yearly" | "weekly";
  service_url?: string;
  is_active: boolean;
}

export interface Investment extends BaseEntity {
  name: string;
  asset_type: "stock" | "crypto" | "bond" | "fund" | "real_estate";
  amount: number;
  current_value: number;
  currency: string;
  purchase_date: number;
  notes?: string;
}