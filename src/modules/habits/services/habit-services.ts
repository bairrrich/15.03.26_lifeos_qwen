import { CrudService } from '@/core/crud';
import type { Habit, HabitLog } from '../entities';

export class HabitService extends CrudService<Habit> {
  constructor() {
    super('habits');
  }

  async getActiveHabits(): Promise<Habit[]> {
    const habits = await this.getAll();
    return habits.filter((h) => !h.deleted_at);
  }

  async getDailyHabits(): Promise<Habit[]> {
    return await this.findByField('frequency', 'daily');
  }

  async incrementStreak(habitId: string): Promise<void> {
    const habit = await this.getById(habitId);
    if (habit) {
      await this.update(habitId, {
        streak: (habit.streak || 0) + 1,
        completed_total: (habit.completed_total || 0) + 1,
      });
    }
  }
}

export class HabitLogService extends CrudService<HabitLog> {
  constructor() {
    super('habit_logs');
  }

  async getByHabit(habitId: string): Promise<HabitLog[]> {
    return await this.findByField('habit_id', habitId);
  }

  async getByDate(date: number): Promise<HabitLog[]> {
    const logs = await this.getAll();
    return logs.filter((log) => log.date === date);
  }

  async getLogForHabitOnDate(habitId: string, date: number): Promise<HabitLog | undefined> {
    const logs = await this.getByHabit(habitId);
    return logs.find((log) => log.date === date);
  }

  async getCompletionRate(habitId: string, days: number = 30): Promise<number> {
    const logs = await this.getByHabit(habitId);
    const now = Date.now();
    const cutoff = now - days * 24 * 60 * 60 * 1000;
    const recentLogs = logs.filter((log) => log.date >= cutoff);

    if (recentLogs.length === 0) return 0;
    const completed = recentLogs.filter((log) => log.completed).length;
    return Math.round((completed / recentLogs.length) * 100);
  }
}
