# Аутентификация в LifeOS

## Режимы работы

LifeOS поддерживает **четыре режима** аутентификации:

### 1. Вход по email и паролю

Для зарегистрированных пользователей.

**Как работает:**
- Введите email и пароль
- Мгновенный вход без подтверждения
- Сессия сохраняется в cookie

### 2. Регистрация по email и паролю

Для новых пользователей.

**Требования к паролю:**
- ✅ Минимум 8 символов
- ✅ Заглавная буква (A-Z)
- ✅ Строчная буква (a-z)
- ✅ Цифра (0-9)

**Как работает:**
- Введите email и пароль
- Проверка требований к паролю в реальном времени
- После создания аккаунта — автоматический вход

### 3. Magic Link (без пароля)

Альтернативный способ входа без регистрации пароля.

**Как работает:**
- Введите email
- На почту отправляется ссылка для входа
- Перейдите по ссылке — вход выполнен

### 4. Локальный режим (без регистрации)

Данные хранятся **только в браузере** пользователя.

**Преимущества:**
- ✅ Мгновенный вход без email
- ✅ Полная приватность (данные не покидают устройство)
- ✅ Работает без интернета

**Недостатки:**
- ❌ Данные не синхронизируются между устройствами
- ❌ При очистке кэша данные теряются
- ❌ Нет резервной копии

## Как это работает

### Вход по email и паролю

```typescript
import { signInWithEmail } from '@/core/auth';

const result = await signInWithEmail('user@example.com', 'password123');

if (result.error) {
  console.error(result.error.message);
} else {
  console.log('Успешный вход!');
}
```

### Регистрация

```typescript
import { signUpWithEmail } from '@/core/auth';

const result = await signUpWithEmail('user@example.com', 'password123');

if (result.error) {
  console.error(result.error.message);
} else if (result.requiresEmailConfirmation) {
  console.log('Проверьте почту для подтверждения');
} else {
  console.log('Аккаунт создан!');
}
```

### Magic Link

```typescript
import { signInWithMagicLink } from '@/core/auth';

const result = await signInWithMagicLink('user@example.com');

if (result.error) {
  console.error(result.error.message);
} else {
  console.log('Ссылка отправлена на email');
}
```

### Локальный вход

```typescript
import { signInLocally } from '@/core/auth';

const user = signInLocally('demo');
// Пользователь сразу входит в систему
```

### Выход из системы

```typescript
import { signOut } from '@/core/auth';

await signOut();
// Автоматический редирект на /login
```

## Определение текущего пользователя

```typescript
import { getCurrentUserId, getLocalUser, isLocalMode } from '@/core/auth';

// Получить ID текущего пользователя
const userId = getCurrentUserId();

// Проверить локальный режим
if (isLocalMode()) {
  const localUser = getLocalUser();
  console.log(`Локальный пользователь: ${localUser?.email}`);
}
```

## Синхронизация

| Режим | Синхронизация |
|-------|--------------|
| **Email/Пароль** | ✅ Автоматическая с Supabase |
| **Magic Link** | ✅ Автоматическая с Supabase |
| **Локальный** | ❌ Отключена (данные только локально) |

## Структура файлов

```
src/core/auth/
├── auth-service.ts      # Сервис аутентификации
├── supabase-client.ts   # Supabase клиент
└── index.ts             # Экспорты

src/shared/hooks/
└── use-user-id.ts       # Хук для получения userId
```

## Компоненты

### Страница логина

`/login` — универсальная страница входа с 4 режимами:

- **Вход** — email + пароль для зарегистрированных
- **Регистрация** — создание аккаунта с валидацией пароля
- **Magic Link** — вход без пароля по ссылке
- **Локально** — вход без регистрации

### Валидация пароля

При регистрации показываются требования к паролю в реальном времени:
- Минимум 8 символов
- Заглавная буква
- Строчная буква
- Цифра

### Middleware

`src/middleware.ts` защищает роуты:
- Проверяет сессию Supabase ИЛИ локальный режим
- Перенаправляет неавторизованных на `/login`
- Перенаправляет авторизованных с `/login` на `/`

## Хранение данных

### Локальный режим

```typescript
// localStorage
{
  "lifeos_local_user": {
    "id": "local-1710123456789",
    "email": "demo@lifeos.local",
    "isLocal": true,
    "createdAt": 1710123456789
  }
}

// Cookie (для middleware)
lifeos_local_user=...
```

### Режим Supabase

```typescript
// Cookie сессии
sb-lyxtpcyjgnrynpyvemyb-auth-token=...
```

## Безопасность

### Пароли
- Хранятся хэшированными в Supabase
- Минимальная длина: 8 символов
- Требуется сложность (буквы + цифры)

### Сессии
- JWT токены от Supabase
- Автоматическое обновление
- Срок действия: 1 час (настраивается в Supabase)

### Локальный режим
- Данные только в IndexedDB
- Нет передачи на сервер
- Риск потери при очистке кэша

## Будущие улучшения

- [ ] Миграция из локального режима в Supabase
- [ ] Экспорт/импорт данных локального режима
- [ ] Уведомление о риске потери данных в локальном режиме
- [ ] Резервное копирование локальных данных
- [ ] Двухфакторная аутентификация (2FA)
- [ ] Восстановление пароля
