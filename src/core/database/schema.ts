import Dexie, { Table } from 'dexie';
import type { BaseEntity } from '@/core/entity';

/**
 * Схема базы данных LifeOS
 *
 * Таблицы:
 * - accounts: финансовые счета
 * - transactions: финансовые транзакции
 * - categories: категории транзакций
 * - budgets: бюджеты
 * - subscriptions: подписки
 * - investments: инвестиции
 * - habits: привычки
 * - habit_logs: журналы привычек
 * - goals: цели
 * - foods: продукты
 * - meals: приемы пищи
 * - recipes: рецепты
 * - nutrition_logs: дневник питания
 * - workouts: тренировки
 * - exercises: упражнения
 * - workout_logs: журнал тренировок
 * - books: книги
 * - courses: курсы
 * - movies: фильмы/сериалы
 * - articles: статьи
 * - notes: заметки
 * - health_metrics: метрики здоровья
 * - supplements: витамины/добавки
 * - sleep_logs: журнал сна
 * - beauty_products: косметика
 * - beauty_routines: рутины ухода
 */
export class LifeOSDatabase extends Dexie {
  // Finance
  accounts!: Table<BaseEntity & { name: string; type: string; balance: number; currency: string }>;
  transactions!: Table<
    BaseEntity & {
      account_id: string;
      amount: number;
      currency: string;
      category_id: string;
      type: 'income' | 'expense';
      description: string;
      date: number;
      merchant?: string;
    }
  >;
  categories!: Table<BaseEntity & { name: string; type: 'income' | 'expense'; color?: string }>;
  budgets!: Table<
    BaseEntity & {
      category_id: string;
      amount: number;
      period: 'month' | 'week' | 'year';
      start_date: number;
    }
  >;
  subscriptions!: Table<
    BaseEntity & {
      name: string;
      amount: number;
      currency: string;
      billing_period: 'monthly' | 'yearly' | 'weekly';
      next_billing_date: number;
      url?: string;
    }
  >;
  investments!: Table<
    BaseEntity & {
      name: string;
      type: string;
      ticker?: string;
      quantity: number;
      purchase_price: number;
      current_price?: number;
    }
  >;

  // Habits
  habits!: Table<
    BaseEntity & {
      name: string;
      description?: string;
      frequency: 'daily' | 'weekly' | 'monthly';
      target_count?: number;
      color?: string;
      icon?: string;
    }
  >;
  habit_logs!: Table<
    BaseEntity & {
      habit_id: string;
      date: number;
      count: number;
      completed: boolean;
      notes?: string;
    }
  >;

  // Goals
  goals!: Table<
    BaseEntity & {
      title: string;
      description?: string;
      target_date?: number;
      progress: number;
      status: 'active' | 'completed' | 'paused' | 'abandoned';
      parent_goal_id?: string;
    }
  >;

  // Nutrition
  foods!: Table<
    BaseEntity & {
      name: string;
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
      serving_size: number;
      serving_unit: string;
    }
  >;
  meals!: Table<BaseEntity & { name: string; type: 'breakfast' | 'lunch' | 'dinner' | 'snack' }>;
  recipes!: Table<
    BaseEntity & {
      name: string;
      description?: string;
      ingredients: Array<{ food_id: string; quantity: number; unit: string }>;
      instructions: string[];
      servings: number;
    }
  >;
  nutrition_logs!: Table<
    BaseEntity & {
      date: number;
      meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
      food_id?: string;
      recipe_id?: string;
      quantity: number;
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
    }
  >;

  // Workouts
  exercises!: Table<
    BaseEntity & {
      name: string;
      description?: string;
      muscle_group: string;
      equipment?: string;
      difficulty: 'beginner' | 'intermediate' | 'advanced';
    }
  >;
  workouts!: Table<
    BaseEntity & {
      name: string;
      description?: string;
      exercises: Array<{ exercise_id: string; sets: number; reps?: number; duration?: number }>;
    }
  >;
  workout_logs!: Table<
    BaseEntity & {
      workout_id: string;
      date: number;
      duration: number;
      exercises: Array<{ exercise_id: string; sets: Array<{ reps: number; weight?: number }> }>;
      notes?: string;
    }
  >;

  // Mind
  books!: Table<
    BaseEntity & {
      title: string;
      author?: string;
      status: 'want_to_read' | 'reading' | 'completed';
      rating?: number;
      started_at?: number;
      finished_at?: number;
    }
  >;
  courses!: Table<
    BaseEntity & {
      title: string;
      provider?: string;
      url?: string;
      status: 'enrolled' | 'in_progress' | 'completed';
      progress: number;
    }
  >;
  movies!: Table<
    BaseEntity & {
      title: string;
      type: 'movie' | 'series';
      status: 'want_to_watch' | 'watching' | 'completed';
      rating?: number;
      seasons?: number;
      episodes_watched?: number;
    }
  >;
  articles!: Table<
    BaseEntity & {
      title: string;
      url: string;
      source?: string;
      status: 'saved' | 'reading' | 'completed';
      tags: string[];
    }
  >;
  notes!: Table<
    BaseEntity & {
      title: string;
      content: string;
      parent_note_id?: string;
      tags: string[];
    }
  >;

  // Health
  health_metrics!: Table<
    BaseEntity & {
      type: 'weight' | 'height' | 'bmi' | 'body_fat' | 'muscle_mass' | 'water_percentage';
      value: number;
      unit: string;
      recorded_at: number;
    }
  >;
  supplements!: Table<
    BaseEntity & {
      name: string;
      dosage: string;
      frequency: string;
      time_of_day?: 'morning' | 'afternoon' | 'evening' | 'night';
    }
  >;
  sleep_logs!: Table<
    BaseEntity & {
      date: number;
      bedtime: number;
      wake_time: number;
      duration_hours: number;
      quality: 1 | 2 | 3 | 4 | 5;
      notes?: string;
    }
  >;

  // Beauty
  beauty_products!: Table<
    BaseEntity & {
      name: string;
      brand?: string;
      category: 'skincare' | 'haircare' | 'makeup' | 'fragrance' | 'other';
      purchase_date: number;
      expiry_date?: number;
      ingredients?: string[];
    }
  >;
  beauty_routines!: Table<
    BaseEntity & {
      name: string;
      time_of_day: 'morning' | 'evening' | 'weekly';
      products: Array<{ product_id: string; order: number }>;
      steps: string[];
    }
  >;
}

export const db = new LifeOSDatabase('LifeOS');

db.version(1).stores({
  // Finance
  accounts: 'id, user_id, name, type, sync_status, created_at, updated_at',
  transactions:
    'id, user_id, account_id, category_id, type, date, sync_status, created_at, updated_at',
  categories: 'id, user_id, name, type, sync_status',
  budgets: 'id, user_id, category_id, sync_status',
  subscriptions: 'id, user_id, name, sync_status',
  investments: 'id, user_id, name, ticker, sync_status',

  // Habits
  habits: 'id, user_id, name, frequency, sync_status',
  habit_logs: 'id, user_id, habit_id, date, sync_status',

  // Goals
  goals: 'id, user_id, status, parent_goal_id, sync_status',

  // Nutrition
  foods: 'id, user_id, name, sync_status',
  meals: 'id, user_id, name, type, sync_status',
  recipes: 'id, user_id, name, sync_status',
  nutrition_logs: 'id, user_id, date, meal_type, sync_status',

  // Workouts
  exercises: 'id, user_id, name, muscle_group, sync_status',
  workouts: 'id, user_id, name, sync_status',
  workout_logs: 'id, user_id, workout_id, date, sync_status',

  // Mind
  books: 'id, user_id, title, status, sync_status',
  courses: 'id, user_id, title, status, sync_status',
  movies: 'id, user_id, title, status, sync_status',
  articles: 'id, user_id, url, status, sync_status',
  notes: 'id, user_id, title, parent_note_id, sync_status',

  // Health
  health_metrics: 'id, user_id, type, recorded_at, sync_status',
  supplements: 'id, user_id, name, sync_status',
  sleep_logs: 'id, user_id, date, sync_status',

  // Beauty
  beauty_products: 'id, user_id, name, category, sync_status',
  beauty_routines: 'id, user_id, name, time_of_day, sync_status',
});
