# LifeOS

**LifeOS** — это универсальная платформа типа «Life Dashboard» для управления всеми основными аспектами жизни через централизованный интерфейс и аналитику.

## 🚀 Стек технологий

| Категория    | Технология                       |
| ------------ | -------------------------------- |
| Framework    | Next.js 16 (App Router)          |
| UI Library   | React 19                         |
| Язык         | TypeScript 5.x                   |
| Стилизация   | Tailwind CSS 4 + OKLCH цвета     |
| Компоненты   | shadcn/ui                        |
| Локальная БД | Dexie.js (IndexedDB)             |
| Удалённая БД | Supabase (PostgreSQL + Realtime) |
| Состояние    | Zustand                          |
| Графики      | Recharts 3                       |
| Формы        | react-hook-form + zod            |
| Уведомления  | sonner                           |
| Запросы      | @tanstack/react-query            |

## 📦 Модули

- **Финансы** — счета, транзакции, бюджеты, подписки, инвестиции
- **Питание** — дневник питания, продукты, рецепты, КБЖУ
- **Тренировки** — планы, журнал тренировок, упражнения, прогресс
- **Привычки** — трекер привычек, streaks, статистика
- **Цели** — долгосрочные цели, этапы, прогресс
- **Здоровье** — сон, витамины, анализы, метрики
- **Ум** — книги, курсы, фильмы, статьи, заметки
- **Красота** — косметика, уход, рутины

## 🛠️ Начало работы

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка переменных окружения

Скопируйте `.env.example` в `.env.local` и заполните значения:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Запуск разработки

```bash
npm run dev
```

Приложение будет доступно по адресу [http://localhost:3000](http://localhost:3000)

## 📁 Структура проекта

```
lifeos/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Страницы аутентификации
│   ├── (dashboard)/              # Основной dashboard
│   ├── api/                      # API routes
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── core/                         # Ядро приложения
│   ├── entity/                   # Базовые сущности
│   ├── database/                 # Dexie схема БД
│   ├── crud/                     # CRUD сервисы
│   ├── sync/                     # Синхронизация
│   ├── auth/                     # Аутентификация (Supabase)
│   └── ...
├── modules/                      # Функциональные модули
│   ├── finance/
│   ├── nutrition/
│   ├── workouts/
│   └── ...
├── ui/                           # UI компоненты
│   ├── components/
│   ├── navigation/
│   ├── forms/
│   └── charts/
├── shared/                       # Общие утилиты
│   ├── hooks/
│   ├── utils/
│   ├── types/
│   └── constants/
└── public/
```

## 🔑 Основные возможности

- ✅ **Offline-first** — работа без подключения к интернету
- ✅ **Синхронизация** — автоматическая синхронизация с Supabase
- ✅ **Тёмная тема** — переключатель светлой/тёмной темы
- ✅ **Command Palette** — быстрая навигация (Cmd+K)
- ✅ **Quick Add** — быстрое добавление записей (+)

## 📝 Команды

```bash
# Разработка
npm run dev

# Сборка
npm run build

# Запуск production
npm run start

# Линтинг
npm run lint

# Форматирование
npm run format
```

## 📄 Лицензия

MIT
