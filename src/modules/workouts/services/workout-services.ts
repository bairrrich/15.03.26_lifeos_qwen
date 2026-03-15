import { CrudService } from '@/core/crud';
import type { Exercise, Workout, WorkoutLog, WorkoutPlan } from '../entities';

export class ExerciseService extends CrudService<Exercise> {
  constructor() {
    super('exercises');
  }

  async getByMuscleGroup(muscleGroup: Exercise['muscle_group']): Promise<Exercise[]> {
    return await this.findByField('muscle_group', muscleGroup);
  }

  async getByEquipment(equipment: Exercise['equipment']): Promise<Exercise[]> {
    return await this.findByField('equipment', equipment);
  }

  async searchByName(query: string): Promise<Exercise[]> {
    const all = await this.getAll();
    return all.filter((e) => e.name.toLowerCase().includes(query.toLowerCase()));
  }
}

export class WorkoutService extends CrudService<Workout> {
  constructor() {
    super('workouts');
  }
}

export class WorkoutLogService extends CrudService<WorkoutLog> {
  constructor() {
    super('workout_logs');
  }

  async getByDate(date: number): Promise<WorkoutLog[]> {
    const logs = await this.getAll();
    return logs.filter((log) => log.date === date);
  }

  async getByDateRange(start: number, end: number): Promise<WorkoutLog[]> {
    const all = await this.getAll();
    return all.filter((log) => log.date >= start && log.date <= end);
  }

  async getWeeklyStats(date: number): Promise<{
    totalWorkouts: number;
    totalDuration: number;
    avgRating: number;
  }> {
    const weekAgo = date - 7 * 24 * 60 * 60 * 1000;
    const logs = await this.getByDateRange(weekAgo, date);

    return {
      totalWorkouts: logs.length,
      totalDuration: logs.reduce((sum, log) => sum + log.duration_seconds, 0),
      avgRating:
        logs.length > 0
          ? Math.round(logs.reduce((sum, log) => sum + (log.rating || 0), 0) / logs.length)
          : 0,
    };
  }

  async getMonthlyStats(date: number): Promise<{
    totalWorkouts: number;
    totalDuration: number;
    workoutsByDay: Record<number, number>;
  }> {
    const monthAgo = date - 30 * 24 * 60 * 60 * 1000;
    const logs = await this.getByDateRange(monthAgo, date);

    const workoutsByDay: Record<number, number> = {};
    logs.forEach((log) => {
      const day = new Date(log.date).getDay();
      workoutsByDay[day] = (workoutsByDay[day] || 0) + 1;
    });

    return {
      totalWorkouts: logs.length,
      totalDuration: logs.reduce((sum, log) => sum + log.duration_seconds, 0),
      workoutsByDay,
    };
  }
}

export class WorkoutPlanService extends CrudService<WorkoutPlan> {
  constructor() {
    super('workout_plans');
  }

  async getActivePlan(): Promise<WorkoutPlan | undefined> {
    const plans = await this.getAll();
    return plans[0];
  }
}
