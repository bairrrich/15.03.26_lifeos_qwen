import { CrudService } from '@/core/crud';
import type { Food, Meal, Recipe, NutritionLog, NutritionGoal } from '../entities';

export class FoodService extends CrudService<Food> {
  constructor() {
    super('foods');
  }

  async searchByName(query: string): Promise<Food[]> {
    const all = await this.getAll();
    return all.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()));
  }

  async getByCategory(category: Food['category']): Promise<Food[]> {
    return await this.findByField('category', category);
  }
}

export class MealService extends CrudService<Meal> {
  constructor() {
    super('meals');
  }

  async getByType(type: Meal['type']): Promise<Meal[]> {
    return await this.findByField('type', type);
  }
}

export class RecipeService extends CrudService<Recipe> {
  constructor() {
    super('recipes');
  }

  async calculateCalories(recipe: Recipe): Promise<number> {
    // Заглушка - в реальности нужно загружать foods и считать
    return recipe.calories_per_serving || 0;
  }
}

export class NutritionLogService extends CrudService<NutritionLog> {
  constructor() {
    super('nutrition_logs');
  }

  async getByDate(date: number): Promise<NutritionLog[]> {
    const logs = await this.getAll();
    return logs.filter((log) => log.date === date);
  }

  async getDailyTotals(date: number): Promise<{
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    fiber: number;
  }> {
    const logs = await this.getByDate(date);
    return logs.reduce(
      (acc, log) => ({
        calories: acc.calories + log.calories,
        protein: acc.protein + log.protein,
        fat: acc.fat + log.fat,
        carbs: acc.carbs + log.carbs,
        fiber: acc.fiber + (log.fiber || 0),
      }),
      { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 }
    );
  }

  async getByDateRange(start: number, end: number): Promise<NutritionLog[]> {
    const all = await this.getAll();
    return all.filter((log) => log.date >= start && log.date <= end);
  }

  async getWeeklyAverage(date: number): Promise<{
    avgCalories: number;
    avgProtein: number;
    avgFat: number;
    avgCarbs: number;
  }> {
    const weekAgo = date - 7 * 24 * 60 * 60 * 1000;
    const logs = await this.getByDateRange(weekAgo, date);
    const daysWithLogs = new Set(logs.map((l) => l.date)).size;

    if (daysWithLogs === 0) {
      return { avgCalories: 0, avgProtein: 0, avgFat: 0, avgCarbs: 0 };
    }

    const totals = await this.getDailyTotals(date);
    return {
      avgCalories: Math.round(totals.calories / daysWithLogs),
      avgProtein: Math.round(totals.protein / daysWithLogs),
      avgFat: Math.round(totals.fat / daysWithLogs),
      avgCarbs: Math.round(totals.carbs / daysWithLogs),
    };
  }
}

export class NutritionGoalService extends CrudService<NutritionGoal> {
  constructor() {
    super('nutrition_goals');
  }

  async getCurrentGoal(): Promise<NutritionGoal | undefined> {
    const goals = await this.getAll();
    return goals[0]; // Возвращаем первую (текущую) цель
  }
}
