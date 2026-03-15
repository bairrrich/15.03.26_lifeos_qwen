Вот подробный план модуля **Питание** (Nutrition / Food Diary) для LifeOS — полностью самостоятельный документ в стиле предыдущих модулей.

Можно скопировать целиком и сохранить как `NUTRITION_MODULE_PLAN.md`.

```markdown
# LifeOS — Подробный план модуля Питание

> **Версия:** 1.0  
> **Дата:** 2026-03-15  
> **Статус:** Активный  
> **Приоритет:** Высокий (Фаза 1–2, после или параллельно с Финансами и Привычками)

---

## 1. Обзор модуля

**Цель:**  
Простое, точное и мотивирующее ведение дневника питания с фокусом на достижение целей (КБЖУ, дефицит/профицит, микронутриенты, привычки питания), без излишней сложности и чувства вины.

**Ключевые ценности 2026:**
- Быстрый ввод (AI-фото / голос / текст / штрих-код)
- Точность данных (предпочтительно проверенная база, а не только crowdsourced)
- Учёт не только калорий, но и макро + ключевых микроэлементов
- Умные подсказки и планы питания без навязчивости
- Интеграция с тренировками, сном, весом, привычками
- Визуализация трендов (не только графики, но и «как ты себя чувствуешь»)

**Главные экраны:**
1. Nutrition Dashboard (обзор дня/недели)
2. Food Log / Дневник (добавление приёмов пищи)
3. Meals & Recipes (рецепты и готовые приёмы)
4. Goals & Targets (цели по питанию)
5. Nutrients & Insights (микро + тренды)
6. Meal Planner (планировщик, Фаза 2+)

---

## 2. Сущности (наследуют BaseEntity)

```typescript
export interface Food extends BaseEntity {
  name:              string;                    // "Овсянка 100 г", "Куриная грудка варёная"
  brand?:            string;
  barcode?:          string;                    // EAN-13 / UPC
  serving_size:      number;                    // г / мл / шт
  serving_unit:      string;                    // "г", "порция", "чашка"
  calories:          number;
  protein:           number;
  fat:               number;
  carbs:             number;
  fiber?:            number;
  sugar?:            number;
  // Микро (опционально, но желательно 10–20 самых важных)
  sodium?:           number;
  potassium?:        number;
  calcium?:          number;
  iron?:             number;
  vitamin_c?:        number;
  vitamin_d?:        number;
  // ... можно расширять
  source:            "manual" | "usda" | "openfoodfacts" | "user";
  is_verified:       boolean;
}

export interface Meal extends BaseEntity {
  date:              number;                    // timestamp начала приёма
  type:              "breakfast" | "lunch" | "dinner" | "snack" | "post-workout" | "custom";
  name?:             string;                    // "Овсянка с бананом"
  calories:          number;                    // суммарно
  protein:           number;
  fat:               number;
  carbs:             number;
  // ... другие макро/микро суммарно (вычисляется)
  notes?:            string;
  photo_url?:        string;                    // загруженное фото блюда
}

export interface MealEntry extends BaseEntity {
  meal_id:           string;
  food_id:           string;                    // или custom_food_id
  quantity:          number;                    // в serving_unit
  // вычисляемые поля (опционально хранить)
  calories:          number;
  protein:           number;
  // ...
}

export interface NutritionGoal extends BaseEntity {
  period:            "daily" | "weekly";
  calories?:         number;
  protein_g?:        number;
  fat_g?:            number;
  carbs_g?:          number;
  fiber_g?:          number;
  // микро цели (опционально)
  water_ml?:         number;
  custom_targets?:   Record<string, number>;    // "iron_mg": 18
  deficit_surplus:   number;                    // ккал (–500 = дефицит)
}
```

**Примечание:**  
Food — глобальная/пользовательская база продуктов  
Meal — приём пищи за день  
MealEntry — строка в приёме (продукт + количество)

---

## 3. Схема IndexedDB (дополнение)

```typescript
db.version(1).stores({
  // ... finance, workouts и т.д.
  foods:             "id, user_id, name, barcode, brand, calories",
  meals:             "id, user_id, date, type",
  meal_entries:      "id, meal_id, food_id",
  nutrition_goals:   "id, user_id, period",
});
```

**Индексы для скорости:**
- meals: `date, type`
- meal_entries: `meal_id`

---

## 4. Services (бизнес-логика)

- `foodService.ts` — поиск, добавление кастомного продукта, импорт по штрих-коду
- `mealService.ts` — создание/редактирование приёма, пересчёт сумм
- `nutritionAnalyticsService.ts` — дневные/недельные итоги, отклонение от цели, тренды
- `goalService.ts` — проверка прогресса, рекомендации по корректировке

**Пример быстрого логирования:**
```ts
async function quickLogMeal(mealData: { type: string; items: Array<{foodId: string, qty: number}> }) {
  const meal = await createEntity("meals", { date: Date.now(), type: mealData.type });
  
  for (const item of mealData.items) {
    const food = await getFood(item.foodId);
    const entry = {
      meal_id: meal.id,
      food_id: item.foodId,
      quantity: item.qty,
      calories: food.calories * item.qty / food.serving_size,
      // ... остальные расчёты
    };
    await createEntity("meal_entries", entry);
  }
  
  emit("meal.logged", meal);
}
```

---

## 5. React Hooks

- `useDailyLog(date)` → все приёмы за день + итоги
- `useFoodSearch(query)` → поиск + недавние/избранные
- `useNutritionSummary(period)` → КБЖУ + % от цели
- `useNutrientTrends(nutrient)` → график по дням/неделям
- `useRemainingMacros()` → сколько осталось до цели на сегодня

(все на react-query + zustand)

---

## 6. UI Компоненты

- `MealCard` — карточка приёма (время, название, КБЖУ, фото)
- `FoodSearchInput` — поиск + быстрый выбор порции
- `MacroCircle` / `ProgressRing` — визуализация КБЖУ
- `NutrientBreakdown` — таблица/график микроэлементов
- `QuickAddMeal` — модалка с типом приёма + быстрый ввод
- `PhotoLogPreview` — предпросмотр и корректировка после AI-распознавания (Фаза 2+)

---

## 7. Экраны

1. **NutritionDashboard**  
   - Сегодня: текущие КБЖУ + кольца прогресса  
   - Осталось до цели / перебор  
   - Последние 3–5 приёмов  
   - График недели (калории + белок)  
   - Кнопка «+ Добавить приём»

2. **DailyLogPage**  
   - Хронология приёмов (timeline)  
   - Детализация каждого приёма  
   - Итог дня + сравнение с целью

3. **FoodDatabase / Search**  
   - Поиск + фильтры (высокобелковый, низкоуглеводный и т.д.)  
   - Избранное + недавние

4. **Recipes & SavedMeals**  
   - Пользовательские и встроенные рецепты  
   - Расчёт КБЖУ на порцию

5. **NutritionGoals**  
   - Установка целей (калории, белок %, дефицит и т.д.)  
   - Рекомендации (на основе веса/активности)

6. **Insights & Trends** (Фаза 2)  
   - Микронутриенты (витамины/минералы)  
   - Корреляция с самочувствием / сном / тренировками

---

## 8. Интеграции

- **Тренировки** — пост-тренировочный приём, расход калорий от активности
- **Здоровье** — вес, % жира → корректировка калорийности
- **Привычки** — «Выпить 2 л воды», «30 г клетчатки в день»
- **Цели** — «Сбросить 8 кг за 4 месяца» → дефицит 500–700 ккал

---

## 9. Этапы реализации

**Неделя 1–2**  
- Food + Meal + MealEntry сущности  
- Базовый поиск и ручной ввод  
- Дневной лог + суммирование

**Неделя 3–4**  
- Dashboard + кольца КБЖУ  
- Цели и сравнение с планом  
- Мобильный ввод (быстрые порции)

**Неделя 5–6**  
- Рецепты + избранное  
- Тренды и графики  
- Микронутриенты (10–15 ключевых)

**Неделя 7+ (Фаза 2)**  
- AI-лог (фото/голос) — интеграция с внешним API или локальной моделью  
- Планировщик питания + список покупок  
- Интеграция с умными весами / трекерами

---

## 10. Рекомендации 2026

- **Быстрый ввод > точность на старте** — приоритет на скорость логирования
- Храните порции в граммах/мл → пересчёт на лету
- Используйте **verified** данные где возможно (USDA-style)
- Добавьте **water tracker** как отдельный простой счётчик
- Визуализация: зелёный — в пределах цели, жёлтый — близко к лимиту, красный — перебор
- Мотивация: streaks по дням без пропусков, badges («Белковый день», «5 дней в дефиците»)

**Цвета модуля (дополняют глобальную палитру):**
- Белок     → oklch(62% 0.16 240) (primary)
- Жиры      → oklch(65% 0.14 80)  (тёплый жёлто-оранжевый)
- Углеводы  → oklch(68% 0.13 195) (teal)
- Клетчатка → oklch(65% 0.18 140) (зелёный)

---

**Конец документа**

Готово к использованию!  
Если нужно — могу сделать план для любого другого модуля в таком же формате.