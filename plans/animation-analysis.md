# Анализ проблемы с анимацией на страницах

## Текущее состояние

### Компоненты анимации
В проекте используются:
- **Framer Motion** (v12.37.0) - для анимаций
- **tw-animate-css** (v1.4.0) - Tailwind плагин для анимаций
- **PageTransition** (`src/components/ui/page-transition.tsx`) - компонент для анимации переходов

### Где используется PageTransition

| Страница | Используется | Notes |
|----------|--------------|-------|
| Dashboard (`/`) | ✅ Да | `variant="slide"` + `StaggerContainer` |
| Habits | ✅ Да | `variant="fade"` (default) |
| Workouts | ✅ Да | `variant="fade"` |
| Nutrition | ✅ Да | `variant="fade"` |
| Health | ✅ Да | `variant="fade"` |
| Beauty | ✅ Да | `variant="fade"` |
| Mind | ✅ Да | `variant="fade"` |
| Goals | ✅ Да | `variant="fade"` |
| Settings | ✅ Да | `variant="fade"` |
| **Finance** | ❌ **НЕТ** | **Отсутствует полностью** |
| Finance/Categories | ❌ НЕТ | Отсутствует |
| Finance/Accounts | ❌ НЕТ | Отсутствует |
| Finance/Budgets | ❌ НЕТ | Отсутствует |
| Finance/Subscriptions | ❌ НЕТ | Отсутствует |
| Finance/Investments | ❌ НЕТ | Отсутствует |
| Finance/Analytics | ❌ НЕТ | Отсутствует |

## Причина проблемы

### 1. Страницы Finance полностью без анимации
Главная причина - на страницах Finance **отсутствует импорт и использование** `PageTransition`.

### 2. Exit-анимации Framer Motion не работают
Компонент `PageTransition` использует `exit` анимацию Framer Motion:
```typescript
exit: { opacity: 0 }
```

Для работы `exit` анимации требуется `AnimatePresence`, который **не используется** нигде в проекте:
```bash
grep -r "AnimatePresence" src  # Результат: 0 совпадений
```

### 3. Почему анимация работает на Dashboard
На Dashboard используется комбинация:
- `PageTransition variant="slide"` - для анимации появления страницы
- `StaggerContainer` - для последовательной анимации дочерних элементов (StatsCards, Charts и т.д.)

`StaggerContainer` обеспечивает видимую анимацию, даже если `exit` анимация не работает.

## Решение

### Шаг 1: Добавить PageTransition на страницы Finance
Необходимо добавить импорт и обёртку на следующие страницы:
- `src/app/finance/page.tsx`
- `src/app/finance/categories/page.tsx`
- `src/app/finance/accounts/page.tsx`
- `src/app/finance/budgets/page.tsx`
- `src/app/finance/subscriptions/page.tsx`
- `src/app/finance/investments/page.tsx`
- `src/app/finance/analytics/page.tsx`

### Шаг 2 (опционально): Улучшить анимации
Для полноценной работы анимаций (включая exit) можно:
1. Добавить `AnimatePresence` в `AppLayout` (сложно в App Router)
2. Или использовать `mode="wait"` в PageTransition для ожидания завершения анимации
3. Добавить `StaggerContainer` на другие страницы для последовательной анимации элементов

## Пример исправления для Finance

```typescript
// src/app/finance/page.tsx
import { PageTransition } from '@/components/ui/page-transition';

// ... существующий код ...

return (
  <PageTransition>
    <div className="space-y-6">
      {/* контент страницы */}
    </div>
  </PageTransition>
);
```
