import { db } from '@/core/database'
import type { Transaction } from '@/modules/finance/entities';
import type { HabitLog } from '@/modules/habits/entities';
import type { WorkoutLog } from '@/modules/workouts/entities';
import type { NutritionLog } from '@/modules/nutrition/entities';
import type { SleepLog } from '@/modules/health/entities';
import type { Goal } from '@/modules/goals/entities';
import type { HealthMetric } from '@/modules/health/entities';

/**
 * Сервис для расширенной аналитики
 */
export interface DashboardStats {
  // Finance
  totalIncome: number
  totalExpenses: number
  balance: number
  incomeByCategory: Array<{ category: string; amount: number }>
  expensesByCategory: Array<{ category: string; amount: number }>

  // Habits
  habitsCompleted: number
  habitsTotal: number
  habitsCompletionRate: number
  currentStreak: number

  // Workouts
  workoutsCompleted: number
  totalWorkoutDuration: number
  avgWorkoutDuration: number

  // Nutrition
  avgDailyCalories: number
  avgDailyProtein: number
  avgDailyFat: number
  avgDailyCarbs: number

  // Sleep
  avgSleepDuration: number
  avgSleepQuality: number

  // Goals
  activeGoals: number
  completedGoals: number
  avgGoalProgress: number
}

export class AnalyticsService {
  /**
   * Получить статистику за период
   */
  async getDashboardStats(days = 30): Promise<DashboardStats> {
    const now = Date.now()
    const cutoff = now - days * 24 * 60 * 60 * 1000

    // Finance
    const transactions = await db.table('transactions').toArray() as Transaction[];
    const recentTransactions = transactions.filter((t) => t.date >= cutoff && !t.deleted_at);

    const totalIncome = recentTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = recentTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    // Habits
    const habits = await db.table('habits').toArray()
    const habitLogs = await db.table('habit_logs').toArray() as HabitLog[];
    const recentHabitLogs = habitLogs.filter((log) => log.date >= cutoff && !log.deleted_at);

    const habitsCompleted = recentHabitLogs.filter((log) => log.completed).length;
    const habitsTotal = habits.length * days
    const habitsCompletionRate = habitsTotal > 0 ? Math.round((habitsCompleted / habitsTotal) * 100) : 0

    // Workouts
    const workoutLogs = await db.table('workout_logs').toArray() as WorkoutLog[];
    const recentWorkoutLogs = workoutLogs.filter((log) => log.date >= cutoff && !log.deleted_at);

    const workoutsCompleted = recentWorkoutLogs.length;
    const totalWorkoutDuration = recentWorkoutLogs.reduce((sum, log) => sum + (log.duration_seconds || 0), 0);
    const avgWorkoutDuration = workoutsCompleted > 0 ? Math.round(totalWorkoutDuration / workoutsCompleted / 60) : 0

    // Nutrition
    const nutritionLogs = await db.table('nutrition_logs').toArray() as NutritionLog[];
    const recentNutritionLogs = nutritionLogs.filter((log) => log.date >= cutoff && !log.deleted_at);

    const daysWithNutrition = new Set(recentNutritionLogs.map((log) => log.date)).size;
    const totalCalories = recentNutritionLogs.reduce((sum, log) => sum + log.calories, 0);
    const totalProtein = recentNutritionLogs.reduce((sum, log) => sum + log.protein, 0);
    const totalFat = recentNutritionLogs.reduce((sum, log) => sum + log.fat, 0);
    const totalCarbs = recentNutritionLogs.reduce((sum, log) => sum + log.carbs, 0);

    // Sleep
    const sleepLogs = await db.table('sleep_logs').toArray() as SleepLog[];
    const recentSleepLogs = sleepLogs.filter((log) => log.date >= cutoff && !log.deleted_at);

    const avgSleepDuration = recentSleepLogs.length > 0
      ? Math.round(recentSleepLogs.reduce((sum, log) => sum + log.duration_hours, 0) / recentSleepLogs.length * 10) / 10
      : 0;

    const avgSleepQuality = recentSleepLogs.length > 0
      ? Math.round(recentSleepLogs.reduce((sum, log) => sum + log.quality, 0) / recentSleepLogs.length)
      : 0;

    // Goals
    const goals = await db.table('goals').toArray() as Goal[];
    const activeGoals = goals.filter((g) => g.status === 'active' && !g.deleted_at).length;
    const completedGoals = goals.filter((g) => g.status === 'completed' && !g.deleted_at).length;
    const avgGoalProgress = goals.length > 0
      ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
      : 0;

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      incomeByCategory: [],
      expensesByCategory: [],
      habitsCompleted,
      habitsTotal,
      habitsCompletionRate,
      currentStreak: 0,
      workoutsCompleted,
      totalWorkoutDuration: Math.round(totalWorkoutDuration / 60),
      avgWorkoutDuration,
      avgDailyCalories: daysWithNutrition > 0 ? Math.round(totalCalories / daysWithNutrition) : 0,
      avgDailyProtein: daysWithNutrition > 0 ? Math.round(totalProtein / daysWithNutrition) : 0,
      avgDailyFat: daysWithNutrition > 0 ? Math.round(totalFat / daysWithNutrition) : 0,
      avgDailyCarbs: daysWithNutrition > 0 ? Math.round(totalCarbs / daysWithNutrition) : 0,
      avgSleepDuration,
      avgSleepQuality,
      activeGoals,
      completedGoals,
      avgGoalProgress,
    }
  }

  /**
   * Получить данные для графика финансов по месяцам
   */
  async getFinanceChartData(months = 6): Promise<Array<{ month: string; income: number; expenses: number }>> {
    const transactions = await db.table('transactions').toArray()
    const validTransactions = transactions.filter((t: unknown) => !(t as Record<string, unknown>).deleted_at)

    const data: Array<{ month: string; income: number; expenses: number }> = []

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).getTime()
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0).getTime()

      const monthTransactions = validTransactions.filter((t: Transaction) =>
        t.date >= monthStart && t.date <= monthEnd
      );

      const income = monthTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      data.push({
        month: date.toLocaleDateString('ru-RU', { month: 'short' }),
        income: Math.round(income),
        expenses: Math.round(expenses),
      })
    }

    return data
  }

  /**
   * Получить данные для графика привычек по дням недели
   */
  async getHabitsChartData(): Promise<Array<{ day: string; completed: number }>> {
    const habitLogs = await db.table('habit_logs').toArray() as HabitLog[];
    const validLogs = habitLogs.filter((log) => !log.deleted_at);

    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const data: Array<{ day: string; completed: number }> = days.map((day) => ({ day, completed: 0 }));

    validLogs.forEach((log) => {
      const date = new Date(log.date);
      const dayIndex = date.getDay();
      if (log.completed) {
        data[dayIndex].completed++;
      }
    });

    return data;
  }

  /**
   * Получить данные для графика веса
   */
  async getWeightChartData(days = 30): Promise<Array<{ date: string; weight: number }>> {
    const now = Date.now();
    const cutoff = now - days * 24 * 60 * 60 * 1000;

    const metrics = await db.table('health_metrics').toArray() as HealthMetric[];
    const weightMetrics = metrics.filter((m) =>
      m.type === 'weight' && m.recorded_at >= cutoff && !m.deleted_at
    );

    return weightMetrics
      .sort((a, b) => a.recorded_at - b.recorded_at)
      .map((m) => ({
        date: new Date(m.recorded_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
        weight: m.value,
      }));
  }
}

export const analyticsService = new AnalyticsService()
