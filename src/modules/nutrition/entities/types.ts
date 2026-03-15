import type { BaseEntity } from '@/core/entity';

export interface Food extends BaseEntity {
  name: string;
  brand?: string;
  calories: number; // на 100г
  protein: number;
  fat: number;
  carbs: number;
  fiber?: number;
  serving_size: number; // граммов
  serving_unit: string; // 'г', 'мл', 'шт'
  barcode?: string;
  category?: 'protein' | 'carbs' | 'fat' | 'vegetable' | 'fruit' | 'other';
}

export interface Meal extends BaseEntity {
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  target_calories?: number;
}

export interface Recipe extends BaseEntity {
  name: string;
  description?: string;
  ingredients: Array<{
    food_id: string;
    quantity: number;
    unit: string;
  }>;
  instructions: string[];
  servings: number;
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  calories_per_serving?: number;
  image_url?: string;
}

export interface NutritionLog extends BaseEntity {
  date: number; // timestamp начала дня
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_id?: string;
  recipe_id?: string;
  meal_name?: string;
  quantity: number; // граммов или порций
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber?: number;
  notes?: string;
}

export interface NutritionGoal extends BaseEntity {
  daily_calories: number;
  daily_protein: number;
  daily_fat: number;
  daily_carbs: number;
  daily_fiber?: number;
  goal_type: 'lose' | 'maintain' | 'gain';
  target_weight?: number;
}
