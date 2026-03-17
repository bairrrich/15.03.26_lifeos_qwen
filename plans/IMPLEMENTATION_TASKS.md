# План имплементации улучшений LifeOS

## Фаза 1: Тестирование и безопасность

### 1.1 Unit-тесты для CrudService
**Файл:** `src/core/crud/base-crud.ts`
- [ ] Тест: create() - создание сущности
- [ ] Тест: getById() - получение по ID
- [ ] Тест: getAll() - получение всех (без удалённых)
- [ ] Тест: update() - обновление с версионированием
- [ ] Тест: delete() - мягкое удаление
- [ ] Тест: findByField() - поиск по полю

### 1.2 Unit-тесты для финансовых сервисов
**Файл:** `src/modules/finance/services/finance-services.ts`
- [ ] Тест: AccountService.getTotalBalance()
- [ ] Тест: AccountService.getByType()
- [ ] Тест: TransactionService.getByDateRange()
- [ ] Тест: TransactionService.getExpensesByCategory()

### 1.3 Unit-тесты для хуков
- [ ] Тест: useAccounts() - получение счетов
- [ ] Тест: useCreateAccount() - создание счета
- [ ] Тест: useTransactions() - получение транзакций

### 1.4 Исправить hardcoded Supabase ref
**Файл:** `src/middleware.ts:21`
- [ ] Переместить в переменную окружения
- [ ] Добавить fallback значение

### 1.5 Настроить CI/CD
- [ ] Добавить GitHub Actions workflow
- [ ] Настроить запуск тестов на push

---

## Фаза 2: Производительность

### 2.1 Добавить индексы в БД
**Файл:** `src/core/database/schema.ts`
- [ ] transactions: добавить индекс по date
- [ ] transactions: добавить составной индекс (date, type)
- [ ] habits: добавить индекс по date
- [ ] workout_logs: добавить индекс по date
- [ ] nutrition_logs: добавить индекс по date

### 2.2 Реализовать пагинацию
- [ ] Добавить пагинацию в TransactionService
- [ ] Добавить пагинацию в WorkoutLogService
- [ ] Добавить пагинацию в NutritionLogService
- [ ] Обновить UI страниц с пагинацией

### 2.3 Добавить виртуализацию
- [ ] Установить @tanstack/react-virtual
- [ ] Добавить виртуализацию в списки транзакций

---

## Фаза 3: TypeScript

### 3.1 Убрать any типы
**Файл:** `src/core/sync/sync-service.ts`
- [ ] Типизировать таблицы в syncTable()
- [ ] Типизировать pushToSupabase()
- [ ] Типизировать convertRemoteToLocal()

### 3.2 Убрать eslint-disable
- [ ] Найти все eslint-disable комментарии
- [ ] Исправить код вместо отключения

### 3.3 Строгая типизация
- [ ] Создать типы для API ответов
- [ ] Использовать Generics для сервисов

---

## Фаза 4: UX улучшения

### 4.1 Skeleton loaders
- [ ] Создать компонент TransactionSkeleton
- [ ] Создать компонент WorkoutSkeleton
- [ ] Добавить skeletons на страницы

### 4.2 Empty states
- [ ] Создать компонент EmptyState
- [ ] Добавить на страницы: Finance, Workouts, Habits

### 4.3 Toast уведомления
- [ ] Добавить toast для create операций
- [ ] Добавить toast для update операций
- [ ] Добавить toast для delete операций
- [ ] Добавить toast для ошибок

---

## Статус выполнения

| Задача | Статус |
|--------|--------|
| Фаза 1: Тестирование и безопасность | В процессе |
| Фаза 2: Производительность | Ожидает |
| Фаза 3: TypeScript | Ожидает |
| Фаза 4: UX | Ожидает |
