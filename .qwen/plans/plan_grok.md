Вот объединённая, цельная и актуальная версия файла **DEVELOPMENT_PLAN.md**, которую можно скопировать целиком и сохранить как один markdown-файл.

```markdown
# LifeOS — Детальный план разработки

**Версия:** 1.1  
**Дата:** 2026-03-15  
**Статус:** Активный

---

## 1. Обзор проекта

**LifeOS** — это универсальная платформа типа «Life Dashboard» для управления всеми основными аспектами жизни через централизованный интерфейс и аналитику.

### Основные модули

| Модуль              | Основное назначение                                      |
|---------------------|------------------------------------------------------------------|
| Финансы             | счета, транзакции, бюджеты, подписки, инвестиции                 |
| Питание             | дневник питания, продукты, рецепты, КБЖУ, цели                   |
| Тренировки          | планы, журнал тренировок, упражнения, прогресс, таймеры          |
| Ум (Knowledge)      | книги, курсы, фильмы/сериалы, статьи, заметки, конспекты         |
| Красота             | косметика, уход за кожей/волосами, рутины                        |
| Здоровье            | сон, витамины/добавки, анализы, вес, давление, другие метрики    |
| Привычки            | трекер привычек, streaks, статистика, напоминания               |
| Цели                | долгосрочные цели, этапы, прогресс, связь с привычками           |

---

## 2. Стек технологий (актуально на март 2026)

| Категория              | Технология              | Версия       | Примечание                              |
|------------------------|-------------------------|--------------|-----------------------------------------|
| Framework              | Next.js                 | 15.0.0 — 16.x| App Router + Server Components          |
| UI Library             | React                   | 19.x         |                                         |
| Язык                   | TypeScript              | 5.4 — 5.6    |                                         |
| Стилизация             | Tailwind CSS            | 3.4 — 4.x    | + OKLCH цвета                           |
| Компоненты             | shadcn/ui               | latest       | Radix UI + Tailwind                     |
| Локальная БД           | Dexie.js                | 4.0 — 4.3    | IndexedDB wrapper                       |
| Удалённая БД + Realtime| Supabase                | 2.45 — 2.99  | PostgreSQL + Realtime                   |
| Управление состоянием  | Zustand                 | 4.5 — 5.x    |                                         |
| Графики / визуализация | Recharts                | 2.12 — 3.x   |                                         |
| Формы                  | react-hook-form + zod   | latest       |                                         |
| Уведомления            | sonner                  | latest       | тосты                                   |
| Запросы / кэш          | @tanstack/react-query   | 5.x          | (очень рекомендуется)                   |
| Иконки                 | lucide-react            | latest       |                                         |
| Линтер                 | ESLint                  | 9.x — 10.x   |                                         |
| Форматирование         | Prettier                | 3.3 — 3.4    |                                         |
| Git hooks              | Husky + lint-staged     | 9.x          |                                         |

---

## 3. Цветовая палитра (OKLCH, 2025–2026 тренд)

```css
@theme {
  --background:      oklch(99.0% 0.00 0);
  --foreground:      oklch(12.0% 0.02 260);

  --primary:         oklch(62.0% 0.16 240);     /* индиго-синий */
  --primary-soft:    oklch(88.0% 0.07 240);
  --primary-fg:      oklch(99% 0 0);

  --secondary:       oklch(68.0% 0.13 195);     /* teal / циан */
  --secondary-soft:  oklch(92.0% 0.05 195);

  --muted:           oklch(96.8% 0.008 240);
  --muted-foreground:oklch(48.0% 0.025 260);

  --accent:          oklch(76.0% 0.18 140);     /* свежий зелёный */
  --destructive:     oklch(63.0% 0.20 30);

  --border:          oklch(88.5% 0.008 240);
  --input:           oklch(94.5% 0.006 240);
  --ring:            oklch(62.0% 0.16 240);

  .dark {
    --background:    oklch(11.0% 0.02 260);
    --foreground:    oklch(96.5% 0.008 260);
    --muted:         oklch(24.0% 0.02 260);
    --muted-foreground: oklch(70.0% 0.015 260);
    --border:        oklch(26.0% 0.02 260);
  }
}
```

---

## 4. Базовая сущность (BaseEntity)

```ts
interface BaseEntity {
  id:          string          // ulid / cuid2
  user_id:     string

  created_at:  number          // timestamp ms
  updated_at:  number
  deleted_at?: number          // soft delete

  version:     number
  sync_status: "local" | "synced" | "conflict" | "pending"

  last_synced_at?: number      // ← важно для отладки и конфликтов

  device_id?:  string
  metadata?:   Record<string, any>
  tags?:       string[]
  notes?:      string
}
```

---

## 5. Структура проекта (рекомендуемая)

```
lifeos/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   │   ├── finance/
│   │   ├── nutrition/
│   │   ├── workouts/
│   │   ├── habits/
│   │   ├── goals/
│   │   ├── health/
│   │   ├── mind/
│   │   ├── beauty/
│   │   ├── settings/
│   │   └── page.tsx           ← главный дашборд
│   ├── api/
│   ├── layout.tsx
│   └── globals.css
├── core/
│   ├── entity/
│   ├── database/              ← dexie + schema + migrations
│   ├── crud/
│   ├── sync/
│   ├── query/
│   ├── events/
│   ├── analytics/
│   ├── search/
│   └── auth/
├── modules/
│   ├── finance/
│   │   ├── entities/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── components/
│   │   └── screens/
│   ├── nutrition/  (аналогично)
│   └── ...
├── ui/
│   ├── components/
│   ├── primitives/
│   ├── layout/
│   ├── forms/
│   ├── charts/
│   └── navigation/
├── shared/
│   ├── types/
│   ├── utils/
│   ├── constants/
│   └── hooks/
├── public/
│   └── locales/  (en, ru)
└── lib/  (или server/ для server-only кода)
```

---

## 6. Начальные команды установки (2026)

```bash
# 1. Создание проекта
npx create-next-app@latest lifeos --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# 2. Основные зависимости
npm install \
  next@16 \
  react@19 \
  react-dom@19 \
  dexie@4 \
  @supabase/supabase-js@2 \
  zustand@5 \
  recharts@3 \
  lucide-react \
  sonner \
  @tanstack/react-query@5 \
  zod \
  @hookform/resolvers \
  react-hook-form

# 3. dev зависимости
npm install -D \
  husky lint-staged prettier \
  @typescript-eslint/eslint-plugin @typescript-eslint/parser

# 4. shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button card input dialog dropdown-menu toast badge avatar command calendar table sheet tabs accordion

# 5. husky + lint-staged (рекомендуется)
npx husky-init && npm exec husky
```

---

## 7. Краткий план этапов (MVP → 1.0)

**Фаза 0** — инфраструктура (2–4 недели)  
- Next.js + Tailwind + shadcn/ui + темная/светлая тема  
- Dexie + базовая схема BaseEntity  
- Supabase auth (email + magic link)  
- Zustand store + react-query  
- Command palette (cmd+k) + Quick Add (+)

**Фаза 1** — MVP (2–3 месяца)  
- Авторизация  
- Главный дашборд (виджеты)  
- Модуль Финансы (счета + транзакции + категории)  
- Модуль Привычки  
- Базовая синхронизация (offline-first)

**Фаза 2** — основные модули  
- Питание, Тренировки, Здоровье  
- Расширенная аналитика (графики)

**Фаза 3** — углубление  
- Ум, Красота, Цели  
- Автоматизации (триггеры → действия)  
- Базовый AI-ассистент (по желанию)

**Фаза 4** — полировка и масштабирование  
- Плагин-система / кастомные виджеты  
- Семейные аккаунты / шаринг  
- Продвинутая аналитика и AI-рекомендации

---