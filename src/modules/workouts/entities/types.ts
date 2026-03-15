import type { BaseEntity } from '@/core/entity';

export interface Exercise extends BaseEntity {
  name: string;
  description?: string;
  muscle_group: 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio' | 'other';
  equipment?: 'barbell' | 'dumbbell' | 'bodyweight' | 'machine' | 'cable' | 'kettlebell' | 'other';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  image_url?: string;
}

export interface Workout extends BaseEntity {
  name: string;
  description?: string;
  exercises: Array<{
    exercise_id: string;
    sets: number;
    reps?: number;
    weight?: number;
    duration_seconds?: number;
    rest_seconds?: number;
  }>;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration_minutes?: number;
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
      weight?: number;
      completed: boolean;
    }>;
  }>;
  notes?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  calories_burned?: number;
}

export interface WorkoutPlan extends BaseEntity {
  name: string;
  description?: string;
  goal: 'strength' | 'hypertrophy' | 'endurance' | 'weight_loss' | 'general_fitness';
  days_per_week: number;
  duration_weeks: number;
  workouts: Array<{
    day: number;
    workout_id: string;
  }>;
}
