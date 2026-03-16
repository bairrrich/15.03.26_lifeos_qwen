import { CrudService } from '@/core/crud';
import type { Exercise, Workout, WorkoutLog, WorkoutPlan, Set, PRRecord } from '../entities';

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

  async getFavorites(): Promise<Exercise[]> {
    const all = await this.getAll();
    return all.filter((e) => e.metadata?.isFavorite);
  }

  async toggleFavorite(id: string): Promise<void> {
    const exercise = await this.getById(id);
    if (exercise) {
      const current = exercise.metadata?.isFavorite || false;
      await this.update(id, {
        ...exercise,
        metadata: { ...exercise.metadata, isFavorite: !current },
      });
    }
  }
}

export class SetService extends CrudService<Set> {
  constructor() {
    super('sets');
  }

  async getByWorkout(workoutId: string): Promise<Set[]> {
    const all = await this.getAll();
    return all.filter((set) => set.workout_id === workoutId);
  }

  async getByExercise(exerciseId: string): Promise<Set[]> {
    const all = await this.getAll();
    return all.filter((set) => set.exercise_id === exerciseId && set.completed);
  }

  async getNextSetNumber(workoutId: string, exerciseId: string): Promise<number> {
    const sets = await this.getByWorkout(workoutId);
    const exerciseSets = sets.filter((s) => s.exercise_id === exerciseId);
    return exerciseSets.length > 0 ? Math.max(...exerciseSets.map((s) => s.set_number)) + 1 : 1;
  }

  async getLastSet(exerciseId: string): Promise<Set | undefined> {
    const sets = await this.getByExercise(exerciseId);
    if (sets.length === 0) return undefined;
    return sets.reduce((latest, current) =>
      current.created_at > latest.created_at ? current : latest
    );
  }

  async getSuggestedWeight(exerciseId: string): Promise<number | undefined> {
    const lastSet = await this.getLastSet(exerciseId);
    return lastSet?.weight;
  }
}

export class WorkoutService extends CrudService<Workout> {
  constructor() {
    super('workouts');
  }

  async getByProgram(programId: string): Promise<Workout[]> {
    const all = await this.getAll();
    return all.filter((w) => w.program_id === programId);
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

  async getByExercise(exerciseId: string): Promise<WorkoutLog[]> {
    const all = await this.getAll();
    return all.filter((log) =>
      log.exercises.some((ex) => ex.exercise_id === exerciseId)
    );
  }

  async getWeeklyStats(date: number): Promise<{
    totalWorkouts: number;
    totalDuration: number;
    avgRating: number;
    avgFeeling: number;
  }> {
    const weekAgo = date - 7 * 24 * 60 * 60 * 1000;
    const logs = await this.getByDateRange(weekAgo, date);

    const ratings = logs.filter((l) => l.rating).map((l) => l.rating!) as number[];
    const feelings = logs.filter((l) => l.feeling).map((l) => l.feeling!) as number[];

    return {
      totalWorkouts: logs.length,
      totalDuration: logs.reduce((sum, log) => sum + log.duration_seconds, 0),
      avgRating: ratings.length > 0
        ? Math.round(ratings.reduce((sum, r) => sum + r, 0) / ratings.length * 10) / 10
        : 0,
      avgFeeling: feelings.length > 0
        ? Math.round(feelings.reduce((sum, f) => sum + f, 0) / feelings.length * 10) / 10
        : 0,
    };
  }

  async getMonthlyStats(date: number): Promise<{
    totalWorkouts: number;
    totalDuration: number;
    workoutsByDay: Record<number, number>;
    volumeByMuscleGroup: Record<string, number>;
  }> {
    const monthAgo = date - 30 * 24 * 60 * 60 * 1000;
    const logs = await this.getByDateRange(monthAgo, date);

    const workoutsByDay: Record<number, number> = {};
    const volumeByMuscleGroup: Record<string, number> = {};

    logs.forEach((log) => {
      const day = new Date(log.date).getDay();
      workoutsByDay[day] = (workoutsByDay[day] || 0) + 1;
    });

    return {
      totalWorkouts: logs.length,
      totalDuration: logs.reduce((sum, log) => sum + log.duration_seconds, 0),
      workoutsByDay,
      volumeByMuscleGroup,
    };
  }

  calculateOneRepMax(weight: number, reps: number): number {
    // Epley formula: 1RM = weight * (1 + reps/30)
    return Math.round(weight * (1 + reps / 30));
  }

  async checkPR(exerciseId: string, weight: number, reps: number): Promise<boolean> {
    const current1RM = this.calculateOneRepMax(weight, reps);
    const logs = await this.getByExercise(exerciseId);

    let max1RM = 0;
    logs.forEach((log) => {
      log.exercises.forEach((ex) => {
        if (ex.exercise_id === exerciseId) {
          ex.sets.forEach((set) => {
            const set1RM = this.calculateOneRepMax(set.weight, set.reps);
            if (set1RM > max1RM) max1RM = set1RM;
          });
        }
      });
    });

    return current1RM > max1RM;
  }
}

export class WorkoutPlanService extends CrudService<WorkoutPlan> {
  constructor() {
    super('workout_plans');
  }

  async getActivePlan(): Promise<WorkoutPlan | undefined> {
    const plans = await this.getAll();
    return plans.find((p) => p.is_active);
  }

  async setActivePlan(planId: string): Promise<void> {
    const plans = await this.getAll();
    for (const plan of plans) {
      await this.update(plan.id, { ...plan, is_active: plan.id === planId });
    }
  }

  async getCurrentWorkout(planId: string, week: number, day: number): Promise<Workout | undefined> {
    const plan = await this.getById(planId);
    if (!plan) return undefined;

    const workoutDay = plan.workouts.find((w) => w.day === ((day - 1) % plan.days_per_week) + 1);
    if (!workoutDay) return undefined;

    return await this.db.table('workouts').get(workoutDay.workout_id);
  }
}

export class PRService extends CrudService<PRRecord> {
  constructor() {
    super('pr_records');
  }

  async getByExercise(exerciseId: string): Promise<PRRecord[]> {
    const all = await this.getAll();
    return all
      .filter((pr) => pr.exercise_id === exerciseId)
      .sort((a, b) => b.one_rep_max - a.one_rep_max);
  }

  async getAllPRs(): Promise<PRRecord[]> {
    const all = await this.getAll();
    return all.sort((a, b) => b.one_rep_max - a.one_rep_max);
  }

  async updatePR(exerciseId: string, exerciseName: string, weight: number, reps: number, date: number, workoutLogId?: string): Promise<PRRecord | null> {
    const oneRepMax = new WorkoutLogService().calculateOneRepMax(weight, reps);
    const existingPRs = await this.getByExercise(exerciseId);
    const currentMax = existingPRs.length > 0 ? existingPRs[0].one_rep_max : 0;

    if (oneRepMax <= currentMax) {
      return null;
    }

    const pr: Omit<PRRecord, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'version' | 'sync_status'> = {
      user_id: 'current-user',
      exercise_id: exerciseId,
      exercise_name: exerciseName,
      one_rep_max: oneRepMax,
      weight,
      reps,
      date,
      workout_log_id: workoutLogId,
    };

    return await this.create(pr);
  }
}
