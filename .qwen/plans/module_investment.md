Вот подробный план для модуля **Инвестиции** в LifeOS — полностью самостоятельный документ, который можно скопировать и сохранить как `INVESTMENTS_MODULE_PLAN.md`.

```markdown
# LifeOS — Подробный план модуля Инвестиции

> **Версия:** 1.0  
> **Дата:** 2026-03-15  
> **Статус:** Активный  
> **Приоритет:** Средний (рекомендуется реализовать в Фазе 1–2, после базового Финансового модуля)

---

## 1. Обзор модуля

**Цель:**  
Дать пользователю удобный, понятный и мотивирующий обзор инвестиционного портфеля, отслеживание производительности, расчёт доходности и базовые инструменты планирования без необходимости быть профессиональным трейдером.

**Ключевые ценности (2026 тренд):**
- Простота + визуальная ясность (не перегружать цифрами)
- Автоматический импорт / ручной ввод
- Реалистичный расчёт доходности (с учётом дивидендов, комиссий, налогов)
- Сравнение с бенчмарками (S&P 500, MOEX, BTC и т.д.)
- Net Worth интеграция (активы − обязательства)
- Прогноз роста портфеля (простой compound interest + сценарии)
- Мотивационные элементы: achievement badges, progress to goal

**Главные экраны:**
1. Investments Dashboard (обзор портфеля)
2. Holdings (список активов)
3. Performance (доходность, график)
4. Transactions (история покупок/продаж/дивидендов)
5. Goals & Scenarios (планирование)
6. Settings (бенчмарки, валюта, комиссии)

---

## 2. Сущности (наследуют BaseEntity)

```typescript
export interface Investment extends BaseEntity {
  name:              string;                    // "Apple Inc", "BTC", "VTI ETF"
  ticker?:           string;                    // AAPL, BTC-USD, VTI
  asset_type:        "stock" | "etf" | "crypto" | "bond" | "fund" | "real_estate" | "other";
  currency:          string;                    // USD, EUR, RUB
  quantity:          number;                    // кол-во акций / монет / единиц
  average_buy_price: number;                    // средняя цена покупки
  current_price?:    number;                    // последняя известная цена (обновляется вручную / API)
  current_value?:    number;                    // quantity × current_price
  invested_amount:   number;                    // всего вложено (с учётом комиссий)
  unrealized_pnl:    number;                    // нереализованная прибыль/убыток
  realized_pnl:      number;                    // реализованная (по закрытым позициям)
  notes?:            string;
  tags?:             string[];                   // "tech", "dividend", "long-term"
  is_archived:       boolean;
}

export interface InvestmentTransaction extends BaseEntity {
  investment_id:     string;
  type:              "buy" | "sell" | "dividend" | "fee" | "split" | "interest";
  date:              number;                    // timestamp
  quantity:          number;
  price:             number;                    // цена за единицу
  fee?:              number;
  total:             number;                    // quantity × price ± fee
  currency:          string;
  notes?:            string;
}
```

**Важно:**  
- Одна запись `Investment` = одна позиция (не агрегируем разные покупки в одну строку автоматически — пользователь видит историю)
- `current_price` и `current_value` обновляются вручную или через внешний API (Фаза 2+)

---

## 3. Схема IndexedDB (дополнение к finance)

```typescript
db.version(1).stores({
  // ... существующие таблицы finance
  investments:        "id, user_id, name, ticker, asset_type, current_value",
  investment_transactions: "id, user_id, investment_id, date, type",
});
```

**Индексы:**
- investment_transactions: `investment_id, date`

---

## 4. Services (бизнес-логика)

- `investmentService.ts`  
  - CRUD позиции  
  - Пересчёт average_buy_price, unrealized_pnl, total_invested  
  - Расчёт XIRR / CAGR (простая реализация или библиотека)

- `investmentTransactionService.ts`  
  - Добавление buy/sell/dividend → автоматический пересчёт позиции  
  - Обработка сплитов, комиссий

- `portfolioAnalyticsService.ts`  
  - Общая стоимость портфеля  
  - Allocation by asset_type / sector / currency  
  - Performance vs benchmark  
  - Прогноз (future_value = PV × (1 + r)^n)

---

## 5. React Hooks

- `usePortfolioOverview()` → total_value, total_pnl, allocation pie data
- `useInvestmentList(filter)` → список позиций + сортировка (по pnl, по размеру)
- `usePerformanceHistory(period)` → данные для графика (daily/weekly/monthly)
- `useXirrCalculator(transactions)` → расчёт внутренней нормы доходности
- `useBenchmarkComparison()` → сравнение с индексами

Все хуки на `@tanstack/react-query` + zustand для кэша.

---

## 6. UI Компоненты (modules/investments/components/)

- `PortfolioCard` — большая карточка с total value, today change %, YTD %
- `HoldingRow` — строка актива: иконка / название / % портфеля / pnl / current value
- `AssetAllocationPie` / `DonutChart` (Recharts)
- `PerformanceLineChart` (сравнение с бенчмарком)
- `TransactionHistoryTable`
- `AddInvestmentModal` (быстрое добавление позиции)
- `ScenarioCalculator` (ввод monthly contribution, expected return → график роста)

Стили:  
- Положительный pnl → `oklch(65% 0.18 140)` (зелёный)  
- Отрицательный pnl → `oklch(62% 0.22 25)` (красный)  
- Нейтральный / benchmark → primary индиго

---

## 7. Экраны (modules/investments/screens/)

1. **InvestmentsDashboard** (главный)  
   - Большая метрика: Total Portfolio Value  
   - Today / 30d / YTD change  
   - Pie: Allocation by type / currency  
   - Top 5 winners / losers  
   - Mini line chart (1Y)  
   - Quick actions: + Buy / + New position

2. **HoldingsPage**  
   - Таблица всех позиций (sortable: pnl, value, % weight)  
   - Фильтры: asset_type, currency, tag  
   - Клик → детальная карточка актива

3. **PerformancePage**  
   - График стоимости портфеля + бенчмарк  
   - Таблица доходности по периодам (1m/3m/6m/1y/3y/all)  
   - XIRR / CAGR / Dividends received

4. **TransactionsPage**  
   - Полная история операций (buy/sell/dividend)  
   - Фильтры по типу, дате, активу

5. **Goals & Planning**  
   - Цель: "Накопить 10 млн к 2035"  
   - Калькулятор сценариев (monthly add, expected return 7–12%)  
   - Прогнозная кривая роста

---

## 8. Интеграции и расширения

- С модулем **Финансы** → общий Net Worth = банковские счета + инвестиции − кредиты
- С **Целями** → инвестиционная цель как часть долгосрочной цели
- Будущие расширения (Фаза 3+):  
  - Авто-обновление цен через Polygon / Yahoo Finance API  
  - Dividend calendar  
  - Tax optimizer (FIFO / LIFO)  
  - Risk metrics (Sharpe ratio, volatility)

---

## 9. Этапы реализации (рекомендуемый порядок)

**Неделя 1**  
- Сущности + Dexie schema  
- CRUD services + базовый пересчёт pnl

**Неделя 2**  
- Holdings list + Portfolio overview card  
- Простой график стоимости

**Неделя 3**  
- Transactions history + добавление buy/sell  
- Allocation pie

**Неделя 4**  
- Performance page + бенчмарки  
- Goals & scenario calculator

**Неделя 5**  
- Mobile-first polish, фильтры, сортировки  
- Интеграция с общим Net Worth

---

## 10. Рекомендации 2026

- Храните суммы в минимальных единицах (копейки, сатоши) → используйте `bigint` или `number × 100`
- Показывайте **нереализованную** и **реализованную** прибыль отдельно
- Добавьте **badge** за достижения: "Первый $10k", "Dividend aristocrat", "1 год без продаж"
- В дашборде — **trust building** элементы: прозрачные расчёты, источники цен, дата последнего обновления
- Производительность: виртуализация таблицы (TanStack Virtual) при >200 позициях

**Цветовая семантика модуля:**
- Рост / прибыль     → oklch(65% 0.18 140)
- Падение / убыток   → oklch(62% 0.22 25)
- Нейтрально / benchmark → oklch(62% 0.16 240) (primary)

---

**Конец документа**

Скопируйте весь текст выше → сохраните как `INVESTMENTS_MODULE_PLAN.md`.

Готов сделать аналогичный план для любого другого модуля — просто укажите название.
```