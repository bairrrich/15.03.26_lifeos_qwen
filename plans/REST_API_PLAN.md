# LifeOS REST API Plan

## Текущее состояние

Приложение сейчас использует:
- **IndexedDB (Dexie.js)** - локальная база данных в браузере
- **Supabase** - облачная база данных PostgreSQL
- **Sync Service** - синхронизация между локальной и облачной БД
- **Прямые вызовы** из клиента в Supabase (не через API)

## Проблемы текущей архитектуры

1. **Нет промежуточного слоя** - клиент напрямую обращается к Supabase
2. **Сложная бизнес-логика на клиенте** - валидация, агрегация данных
3. **Нет единой точки входа** - разные источники данных
4. **Ограниченная кастомизация** - зависимость от Supabase API

## Предлагаемое решение: REST API

### Архитектура

```
┌─────────────────┐
│   Next.js App   │
│   (Frontend)    │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐     ┌─────────────────┐
│   REST API      │────►│   Supabase      │
│   (Next.js API) │     │   (PostgreSQL)  │
└─────────────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐
│   IndexedDB     │
│   (Offline)     │
└─────────────────┘
```

### API Endpoints

#### 1. Финансы (Finance)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/finance/accounts` | Получить все счета |
| GET | `/api/finance/accounts/[id]` | Получить счет по ID |
| POST | `/api/finance/accounts` | Создать счет |
| PUT | `/api/finance/accounts/[id]` | Обновить счет |
| DELETE | `/api/finance/accounts/[id]` | Удалить счет |
| GET | `/api/finance/transactions` | Получить транзакции (с пагинацией) |
| POST | `/api/finance/transactions` | Создать транзакцию |
| PUT | `/api/finance/transactions/[id]` | Обновить транзакцию |
| DELETE | `/api/finance/transactions/[id]` | Удалить транзакцию |
| GET | `/api/finance/categories` | Получить категории |
| GET | `/api/finance/analytics/summary` | Аналитика (доходы/расходы) |
| GET | `/api/finance/analytics/by-category` | Аналитика по категориям |
| GET | `/api/finance/budgets` | Получить бюджеты |
| GET | `/api/finance/subscriptions` | Получить подписки |
| GET | `/api/finance/investments` | Получить инвестиции |

#### 2. Привычки (Habits)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/habits` | Получить все привычки |
| GET | `/api/habits/[id]` | Получить привычку по ID |
| POST | `/api/habits` | Создать привычку |
| PUT | `/api/habits/[id]` | Обновить привычку |
| DELETE | `/api/habits/[id]` | Удалить привычку |
| POST | `/api/habits/[id]/log` | Отметить выполнение |
| GET | `/api/habits/[id]/stats` | Статистика привычки |

#### 3. Тренировки (Workouts)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workouts` | Получить все тренировки |
| GET | `/api/workouts/programs` | Получить программы тренировок |
| GET | `/api/workouts/exercises` | Получить упражнения |
| GET | `/api/workouts/history` | Получить историю тренировок |
| POST | `/api/workouts/history` | Записать тренировку |
| GET | `/api/workouts/progress` | Получить прогресс |

#### 4. Питание (Nutrition)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/nutrition/foods` | Получить продукты |
| POST | `/api/nutrition/foods` | Добавить продукт |
| GET | `/api/nutrition/recipes` | Получить рецепты |
| GET | `/api/nutrition/logs` | Получить дневник питания |
| POST | `/api/nutrition/logs` | Добавить прием пищи |

#### 5. Здоровье (Health)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health/metrics` | Получить метрики здоровья |
| POST | `/api/health/metrics` | Записать метрику |
| GET | `/api/health/sleep` | Получить данные о сне |
| POST | `/api/health/sleep` | Записать сон |

#### 6. Развлечения (Mind)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mind/books` | Получить книги |
| GET | `/api/mind/courses` | Получить курсы |
| GET | `/api/mind/movies` | Получить фильмы/сериалы |
| GET | `/api/mind/articles` | Получить статьи |

#### 7. Пользователь (User)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Получить профиль |
| PUT | `/api/user/profile` | Обновить профиль |
| GET | `/api/user/settings` | Получить настройки |
| PUT | `/api/user/settings` | Обновить настройки |

## Пагинация

Все списковые endpoints поддерживают пагинацию:

```
GET /api/finance/transactions?page=1&limit=20&sort=date&order=desc
```

Response:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

## Фильтрация

支持 фильтрация по полям:

```
GET /api/finance/transactions?type=expense&category_id=xxx&date_from=2024-01-01&date_to=2024-12-31
```

## Аутентификация

- JWT токены через Supabase Auth
- Middleware для проверки токена
- Refresh token rotation

## Кэширование

- React Query на клиенте (уже есть)
- Server-side caching с Supabase (опционально)
- Redis для production (опционально)

## Реализация

### Шаг 1: Базовые API Routes

```typescript
// app/api/[resource]/route.ts
import { NextResponse } from 'next/server';
import { getSupabase } from '@/core/auth';

export async function GET(request: Request) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('transactions')
    .select('*');
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ data });
}
```

### Шаг 2: Добавить пагинацию и фильтрацию

### Шаг 3: Добавить бизнес-логику

### Шаг 4: Обновить клиент для использования API

## Приоритеты реализации

1. **Высокий** - Finance API (транзакции, счета, категории)
2. **Высокий** - Habits API (привычки, логи)
3. **Средний** - Workouts API (тренировки, история)
4. **Средний** - Nutrition API (продукты, рецепты)
5. **Низкий** - Mind API (книги, фильмы)

## Преимущества REST API

1. **Единая точка входа** - централизованная логика
2. **Кэширование** - можно кэшировать на уровне API
3. **Безопасность** - валидация на сервере
4. **Гибкость** - легче мигрировать между бэкендами
5. **Тестирование** - проще тестировать API endpoints
