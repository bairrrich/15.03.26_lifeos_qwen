import type { BaseEntity } from '@/core/entity';

export type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio' | 'other';
export type Equipment = 'barbell' | 'dumbbell' | 'bodyweight' | 'machine' | 'cable' | 'kettlebell' | 'other';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type WorkoutGoal = 'strength' | 'hypertrophy' | 'endurance' | 'weight_loss' | 'general_fitness';
export type SetType = 'warmup' | 'working' | 'dropset' | 'failure' | 'superset';

export interface Exercise extends BaseEntity {
  name: string;
  description?: string;
  muscle_group: MuscleGroup;
  equipment?: Equipment;
  difficulty: Difficulty;
  is_compound?: boolean;
  is_custom?: boolean;
  image_url?: string;
  video_url?: string;
  notes?: string;
}

export interface Set extends BaseEntity {
  workout_id: string;
  exercise_id: string;
  exercise_name: string;
  order: number;
  set_number: number;
  type: SetType;
  reps: number;
  weight: number;
  rpe?: number;
  tempo?: string;
  rest_seconds?: number;
  completed: boolean;
  notes?: string;
  pr?: boolean;
}

export interface WorkoutExercise {
  exercise_id: string;
  exercise_name?: string;
  order: number;
  target_sets: number;
  target_reps?: number;
  target_weight?: number;
  rest_seconds?: number;
}

export interface Workout extends BaseEntity {
  name: string;
  description?: string;
  exercises: WorkoutExercise[];
  difficulty?: Difficulty;
  estimated_duration_minutes?: number;
  program_id?: string;
}

export interface WorkoutLog extends BaseEntity {
  workout_id: string;
  workout_name: string;
  date: number;
  duration_seconds: number;
  exercises: Array<{
    exercise_id: string;
    exercise_name: string;
    sets: Array<{
      reps: number;
      weight: number;
      rpe?: number;
      completed: boolean;
    }>;
  }>;
  notes?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  calories_burned?: number;
  feeling?: 1 | 2 | 3 | 4 | 5;
}

export interface WorkoutPlan extends BaseEntity {
  name: string;
  description?: string;
  goal: WorkoutGoal;
  days_per_week: number;
  duration_weeks: number;
  is_active?: boolean;
  workouts: Array<{
    day: number;
    workout_id: string;
    workout_name?: string;
  }>;
  progression?: {
    type: 'linear' | 'wave' | 'periodized';
    increment?: number;
  };
}

export interface PRRecord extends BaseEntity {
  exercise_id: string;
  exercise_name: string;
  one_rep_max: number;
  reps: number;
  weight: number;
  date: number;
  workout_log_id?: string;
}
