Вот подробный план модуля **Тренировки** (Workouts) для LifeOS — в едином стиле предыдущих модулей. Полностью самостоятельный документ, готовый к копированию и сохранению как `WORKOUTS_MODULE_PLAN.md`.

```markdown
# LifeOS — Подробный план модуля Тренировки

> **Версия:** 1.0  
> **Дата:** 2026-03-15  
> **Статус:** Активный  
> **Приоритет:** Высокий (Фаза 1–2, параллельно или сразу после Финансов и Питания)

---

## 1. Обзор модуля

**Цель:**  
Помочь пользователю системно тренироваться, отслеживать прогресс, избегать плато, снижать риск травм и получать мотивацию от видимых результатов — всё в одном месте, без лишней сложности.

**Ключевые ценности 2026 (на основе Hevy, Strong, Setgraph, StrengthLog и др.):**
- Быстрый и удобный лог тренировок (sets/reps/weight/RPE/tempo)
- Автоматический progressive overload (предыдущие веса/рекомендации)
- Встроенный rest-timer с уведомлениями
- Гибкие программы / шаблоны / warm-up sets
- Визуализация прогресса (1RM, volume, PRs, графики)
- Интеграция с питанием, сном, восстановлением
- Минимализм + скорость в зале (не отвлекаться от штанги)

**Главные экраны:**
1. Workouts Dashboard (обзор недели/программы)
2. Active Workout (текущая тренировка + таймер)
3. Workout History / Log (список + детализация)
4. Programs & Templates (программы, кастомные планы)
5. Exercises Library (база + поиск)
6. Progress & Analytics (графики, PRs, volume)

---

## 2. Сущности (наследуют BaseEntity)

```typescript
export interface Exercise extends BaseEntity {
  name:              string;                    // "Приседания со штангой", "Bench Press"
  category:          "legs" | "push" | "pull" | "core" | "cardio" | "fullbody" | "other";
  muscle_groups:     string[];                  // ["quads", "glutes", "lower back"]
  equipment:         string[];                  // ["barbell", "dumbbell", "machine"]
  is_compound:       boolean;
  is_custom:         boolean;
  notes?:            string;
  video_url?:        string;                    // демонстрация (YouTube embed или локально)
}

export interface Workout extends BaseEntity {
  date:              number;                    // timestamp начала
  name?:             string;                    // "Leg Day A", "Push 2026-03-15"
  program_id?:       string;
  duration?:         number;                    // секунды
  notes?:            string;
  feeling?:          1 | 2 | 3 | 4 | 5;         // самочувствие (опционально)
}

export interface Set extends BaseEntity {
  workout_id:        string;
  exercise_id:       string;
  order:             number;                    // порядок упражнения
  set_number:        number;                    // 1,2,3...
  type:              "warmup" | "working" | "dropset" | "failure";
  reps:              number;
  weight:            number;                    // кг / lbs
  rpe?:              number;                    // 6–10
  tempo?:            string;                    // "3010" или "2-0-1-0"
  rest_seconds?:     number;
  completed:         boolean;
  notes?:            string;
}
```

**Дополнительно (опционально):**
- `TrainingProgram` — название, недели, дни, упражнения с прогрессией

---

## 3. Схема IndexedDB (дополнение)

```typescript
db.version(1).stores({
  // ... предыдущие модули
  exercises:         "id, user_id, name, category, muscle_groups",
  workouts:          "id, user_id, date, name",
  sets:              "id, workout_id, exercise_id, order, set_number",
});
```

**Индексы для скорости:**
- workouts: `date`
- sets: `workout_id, exercise_id`

---

## 4. Services (бизнес-логика)

- `exerciseService.ts` — поиск, добавление кастомного упражнения
- `workoutService.ts` — старт/завершение тренировки, автосохранение
- `setService.ts` — лог сета, автозаполнение предыдущих значений
- `progressService.ts` — расчёт 1RM (Epley/Brzycki), volume, PR detection
- `restTimerService.ts` — таймер между сетами + уведомления

**Пример быстрого лога сета:**
```ts
async function logSet(setData: Omit<Set, keyof BaseEntity>) {
  const set = await createEntity("sets", setData);
  // Автозаполнение следующего сета на основе предыдущего
  suggestNextSet(set);
  emit("set.completed", set);
}
```

---

## 5. React Hooks

- `useActiveWorkout()` → текущая тренировка + live-таймер
- `useExerciseHistory(exerciseId)` → предыдущие веса/репы
- `usePRs()` → personal records по упражнениям
- `useVolumeTrend(period)` → общий/по группе мышц
- `useSuggestedWeights(exerciseId)` → на основе истории + RPE

(все на `@tanstack/react-query` + zustand)

---

## 6. UI Компоненты (modules/workouts/components/)

- `ExerciseCard` — в активной тренировке (название + предыдущий сет)
- `SetRow` — ввод reps/weight/RPE + кнопка завершить
- `RestTimer` — большой круглый таймер + вибрация/звук
- `PRBadge` — "New PR! +5 кг"
- `WorkoutSummaryCard` — после тренировки (volume, duration, feeling)
- `ExerciseSearch` — быстрый поиск + избранное

---

## 7. Экраны (modules/workouts/screens/)

1. **WorkoutsDashboard**  
   - Эта неделя: выполненные/пропущенные дни  
   - Следующая тренировка по программе  
   - Recent PRs + streaks  
   - Кнопка «Начать тренировку» / «Выбрать шаблон»

2. **ActiveWorkoutScreen** (самый важный)  
   - Список упражнений (swipeable или collapsible)  
   - Текущий сет: reps/weight поля + RPE слайдер  
   - Rest timer после каждого сета  
   - Кнопки: Завершить сет / Пропустить / Заметка  
   - Автосохранение каждые 10 сек

3. **WorkoutHistory**  
   - Календарь + список по датам  
   - Фильтры: по программе, по группе мышц  
   - Детализация: все сеты + notes + feeling

4. **Programs & Templates**  
   - Список программ (5/3/1, PPL, Upper/Lower и т.д.)  
   - Создание/редактирование кастомной  
   - Прогрессия (линейная, волнообразная)

5. **ExercisesLibrary**  
   - Поиск + фильтры (compound/isolation, equipment)  
   - Детальная карточка упражнения (видео + мышцы)

6. **Progress & Analytics**  
   - Графики: 1RM trend, volume per muscle group  
   - Таблица PRs  
   - Сравнение периодов (last 4 weeks vs previous)

---

## 8. Интеграции

- **Питание** — пост-тренировочный приём, расход калорий
- **Здоровье** — связь с сном/восстановлением (HRV, ready score)
- **Привычки** — «Тренировка 4+ раза в неделю»
- **Цели** — «Приседания 150 кг», «Набрать 5 кг мышц»

---

## 9. Этапы реализации

**Неделя 1–2**  
- Exercise + Workout + Set сущности  
- База упражнений (100–200 популярных)  
- Простой лог тренировки

**Неделя 3–4**  
- Active Workout экран + rest timer  
- Автозаполнение весов + RPE  
- Dashboard + quick start

**Неделя 5–6**  
- История + фильтры  
- PR detection + badges  
- Базовые графики (volume, 1RM)

**Неделя 7+**  
- Программы + прогрессия  
- Аналитика + muscle group split  
- Mobile-first polish (крупные кнопки, вибрация)

---

## 10. Рекомендации 2026

- **Скорость > красота** в зале — минимум касаний, автосохранение
- Храните вес в кг с шагом 0.25–2.5 кг (поле number + step)
- Поддержка RPE/RIR + tempo (очень популярно в 2025–2026)
- Уведомления: rest end → вибрация + звук
- Мотивация: streaks, badges («100 тренировок», «5×BW deadlift»)
- Dark mode + large touch targets (пальцы потные)

**Цвета модуля (дополняют глобальную палитру):**
- Успешный сет/PR → oklch(65% 0.18 140) зелёный
- Тяжёлый RPE 9–10 → oklch(62% 0.22 25) красный акцент
- Рабочий вес → primary индиго

---

**Конец документа**