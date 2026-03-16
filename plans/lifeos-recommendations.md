# LifeOS — Рекомендации по улучшению

**Дата анализа:** 2026-03-16  
**Проект:** LifeOS — универсальная платформа управления жизнью

---

## 📊 Резюме анализа

Проект представляет собой зрелое приложение с **19 страницами**, **50+ таблицами БД** и **~19,000 строками кода**. Используется современный стек: Next.js 16, React 19, TypeScript, Tailwind CSS 4, Dexie.js (IndexedDB), Supabase, Zustand, React Query.

Ниже представлены рекомендации по улучшению, сгруппированные по приоритетам.

---

## 🔴 Высокий приоритет

### 1. Отсутствует единый API-слой для работы с данными

**Проблема:** Каждый модуль имеет свои сервисы (`AccountService`, `TransactionService` и т.д.), но нет унифицированного подхода к:
- Валидации данных
- Обработке ошибок
- Логированию операций

**Рекомендация:** Создать `DataService` — единый слой абстракции:

```typescript
// src/core/api/data-service.ts
interface DataOperation<T> {
  type: 'create' | 'update' | 'delete' | 'read';
  entity: string;
  data?: Partial<T>;
  filters?: Record<string, unknown>;
}

class DataService {
  async execute<T>(operation: DataOperation<T>): Promise<T | T[]>;
  
  // Добавить middleware для:
  // - Валидации через Zod
  // - Логирования операций
  // - Обработки ошибок с user-friendly сообщениями
  // - Отката транзакций при ошибках
}
```

---

### 2. Нет реальной синхронизации с Supabase

**Проблема:** В схеме БД есть поля `sync_status`, `last_synced_at`, `device_id`, но **отсутствует реализация sync-сервиса**.

**Рекендация:** Реализовать `SyncService`:

```typescript
// src/core/sync/sync-service.ts
class SyncService {
  // 1. Инкрементальная синхронизация (только изменения)
  async syncEntity<T extends BaseEntity>(entity: T): Promise<SyncResult>;
  
  // 2. Разрешение конфликтов (CRDT или Last-Write-Wins)
  async resolveConflicts(): Promise<void>;
  
  // 3. Очередь синхронизации (background sync)
  startBackgroundSync(intervalMs: number): void;
  
  // 4. Офлайн-индикатор
  getConnectionStatus(): 'online' | 'offline' | 'syncing';
}
```

---

### 3. Хардкод `user_id = 'current-user'`

**Проблема:** В [`use-finance.ts:45`](src/modules/finance/hooks/use-finance.ts) и аналогичных хуках:

```typescript
user_id: 'current-user' // ❌ Хардкод
```

**Рекомендация:** Создать AuthContext с реальным user_id:

```typescript
// src/core/auth/auth-context.tsx
interface AuthUser {
  id: string;
  email: string;
  // ...
}

const AuthContext = createContext<AuthUser | null>(null);

// Хук для получения текущего пользователя
export function useCurrentUser() {
  const user = useContext(AuthContext);
  if (!user) throw new Error('User not authenticated');
  return user;
}
```

---

### 4. Нет типизированных React Query хуков

**Проблема:** [`providers.tsx:17`](src/shared/hooks/providers.tsx) — базовая конфигурация без:
- Типизации ошибок
- Кастомных персистентных стратегий
- Оптимистических обновлений

**Рекомендация:** Расширить конфигурацию:

```typescript
// src/shared/hooks/use-typed-query.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      // Персистентное кэширование для офлайн-режима
      persistence: 'local-storage',
      // Оптимистические обновления
      onMutate: async (newData) => {
        await queryClient.cancelQueries({ queryKey });
        const previousData = queryClient.getQueryData(queryKey);
        queryClient.setQueryData(queryKey, newData);
        return { previousData };
      },
    },
  },
});
```

---

## 🟡 Средний приоритет

### 5. Дублирование кода в модулях

**Проблема:** Каждый модуль (`finance`, `nutrition`, `workouts`) имеет:
- Похожие сервисы (AccountService, FoodService, ExerciseService)
- Похожие хуки (`useAccounts`, `useFoods`, `useExercises`)
- Похожие UI-компоненты

**Рекомендация:** Создать генеративные функции или Generic-сервисы:

```typescript
// src/core/crud/typed-crud.ts
function createTypedCrudService<T extends BaseEntity>(tableName: string) {
  return new CrudService<T>(tableName);
}

const accountService = createTypedCrudService<Account>('accounts');
const foodService = createTypedCrudService<Food>('foods');
```

Или использовать паттерн "Repository":

```typescript
// src/core/repository/repository.ts
class Repository<T extends BaseEntity> {
  constructor(private tableName: string) {}
  
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | undefined>;
  create(data: Omit<T, BaseEntityFields>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<void>;
  delete(id: string): Promise<void>;
  
  // Специфичные методы
  findByUserId(userId: string): Promise<T[]>;
  findByDateRange(start: number, end: number): Promise<T[]>;
}
```

---

### 6. Отсутствует централизованная обработка ошибок

**Проблема:** Нет unified error handling. Каждый сервис обрабатывает ошибки по-своему.

**Рекомендация:** Создать Error Boundary и сервис ошибок:

```typescript
// src/core/errors/error-handler.ts
class ErrorHandler {
  handle(error: Error): AppError;
  log(error: Error, context: Record<string, unknown>);
  reportToMonitoring(error: AppError); // Sentry, DataDog
}

// src/shared/components/error-boundary.tsx
class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error): State;
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void;
}
```

---

### 7. Нет документации API и типов

**Проблема:** Entities определены в модулях, но:
- Нет единого экспорта типов
- Нет документации JSDoc
- Types могут дублироваться между модулями

**Рекомендация:**

```
src/
├── types/
│   ├── index.ts          # Центральный экспорт всех типов
│   ├── entities/         # Типы сущностей
│   │   ├── account.ts
│   │   ├── transaction.ts
│   │   └── ...
│   └── api/              # Типы для API
└── docs/
    └── entities.md       # Документация сущностей
```

---

### 8. Компоненты страниц слишком большие

**Проблема:** [`page.tsx`](src/app/page.tsx) содержит 400+ строк со всей логикой виджетов.

**Рекомендация:** Извлечь виджеты в отдельные компоненты:

```
src/
├── app/
│   └── page.tsx                    # 50 строк (только layout)
├── features/
│   └── dashboard/
│       ├── components/
│       │   ├── BalanceWidget.tsx
│       │   ├── NetWorthWidget.tsx
│       │   ├── ExpensesWidget.tsx
│       │   ├── HabitsWidget.tsx
│       │   └── ...
│       └── hooks/
│           └── useDashboardData.ts
```

---

### 9. Отсутствует DI-контейнер

**Проблема:** Сервисы создаются напрямую в хуках:

```typescript
// use-finance.ts
const accountService = new AccountService(); // ❌ Плохо
```

**Рекомендация:** Использовать Service Locator или DI:

```typescript
// src/core/di/container.ts
const container = {
  accountService: new AccountService(),
  transactionService: new TransactionService(),
  // ...
};

// Или с использованием React Context
const ServiceContext = createContext(container);
```

---

### 10. Нет тестов (только настройка)

**Проблема:** В `package.json` есть `vitest`, но реальных тестов нет (только `utils.test.ts`).

**Рекомендация:** Добавить тесты:

```
src/
├── __tests__/
│   ├── core/
│   │   ├── database/
│   │   │   └── schema.test.ts
│   │   ├── crud/
│   │   │   └── base-crud.test.ts
│   │   └── sync/
│   │       └── sync-service.test.ts
│   ├── modules/
│   │   └── finance/
│   │       └── services/
│   │           └── account-service.test.ts
│   └── utils/
│       └── utils.test.ts
```

---

## 🟢 Низкий приоритет

### 11. Нет Storybook для компонентов

**Рекомендация:** Добавить Storybook для документирования и разработки UI-компонентов изолированно.

---

### 12. Отсутствует CI/CD

**Рекомендация:** Настроить GitHub Actions:

- `lint.yml` — проверка линтера
- `test.yml` — запуск тестов
- `build.yml` — проверка сборки
- `deploy.yml` — деплой на Vercel

---

### 13. Нет E2E тестов

**Рекомендация:** Добавить Playwright для end-to-end тестов:

```
e2e/
├── dashboard.spec.ts
├── finance.spec.ts
├── habits.spec.ts
└── ...
```

---

### 14. Нет линтера для безопасности

**Рекомендация:** Добавить:
- `npm install -D eslint-plugin-security` — проверка уязвимостей
- `npm install -D eslint-plugin-prettier` — консистентность форматирования

---

### 15. Конфигурация разбросана

**Проблема:** Конфиги в корне проекта: `eslint.config.mjs`, `prettierrc`, `vitest.config.ts`, `next.config.ts`.

**Рекомендация:** Создать директорию `config/`:

```
config/
├── eslint/
│   └── eslint.config.mjs
├── prettier/
│   └── .prettierrc
├── vitest/
│   └── vitest.config.ts
└── next/
    └── next.config.ts
```

---

## 📈 Метрики для отслеживания

| Метрика | Текущее | Целевое |
|---------|---------|---------|
| Покрытие тестами | ~5% | 70%+ |
| Bundle size (JS) | TBD | < 500KB |
| First Contentful Paint | TBD | < 1.5s |
| Time to Interactive | TBD | < 3s |
| Lighthouse Score | TBD | 90+ |

---

## 🎯 План действий

### Фаза 1: Инфраструктура (1-2 недели)
1. [ ] Реализовать AuthContext с реальным user_id
2. [ ] Создать SyncService для синхронизации с Supabase
3. [ ] Настроить Error Boundary и обработку ошибок
4. [ ] Добавить DI-контейнер

### Фаза 2: Качество кода (2-3 недели)
1. [ ] Рефакторинг: извлечь виджеты dashboard в отдельные компоненты
2. [ ] Создать Generic CRUD Repository
3. [ ] Добавить централизованные типы и документацию
4. [ ] Настроить CI/CD

### Фаза 3: Тестирование (2-3 недели)
1. [ ] Написать unit-тесты для core-сервисов
2. [ ] Написать интеграционные тесты для модулей
3. [ ] Добавить E2E тесты с Playwright
4. [ ] Настроить Storybook

### Фаза 4: Производительность (1-2 недели)
1. [ ] Анализ bundle size
2. [ ] Оптимизация React Query
3. [ ] Lazy loading для тяжёлых компонентов
4. [ ] Оптимизация Recharts графиков

---

## 📝 Заключение

Проект **LifeOS** находится на хорошем уровне зрелости для MVP. Основные проблемы связаны с:

1. **Отсутствием production-ready инфраструктуры** (sync, error handling, DI)
2. **Дублированием кода** между модулями
3. **Отсутствием тестов** и документации

Рекомендую начать с **Фазы 1** — реализация базовой инфраструктуры даст наибольший ROI и упростит дальнейшую разработку.
