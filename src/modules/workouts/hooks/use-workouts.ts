'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ExerciseService,
  WorkoutService,
  WorkoutLogService,
  WorkoutPlanService,
} from '../services';
import type { Exercise, Workout, WorkoutLog, WorkoutPlan } from '../entities';

const exerciseService = new ExerciseService();
const workoutService = new WorkoutService();
const workoutLogService = new WorkoutLogService();
const workoutPlanService = new WorkoutPlanService();

// Exercises
export function useExercises() {
  return useQuery({
    queryKey: ['exercises'],
    queryFn: () => exerciseService.getAll(),
  });
}

export function useCreateExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: Omit<
        Exercise,
        | 'id'
        | 'created_at'
        | 'updated_at'
        | 'deleted_at'
        | 'version'
        | 'sync_status'
        | 'last_synced_at'
      >
    ) => exerciseService.create({ ...data, user_id: 'current-user' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });
}

export function useExercisesByMuscleGroup(muscleGroup: Exercise['muscle_group']) {
  return useQuery({
    queryKey: ['exercises', 'muscle', muscleGroup],
    queryFn: () => exerciseService.getByMuscleGroup(muscleGroup),
    enabled: !!muscleGroup,
  });
}

// Workouts
export function useWorkouts() {
  return useQuery({
    queryKey: ['workouts'],
    queryFn: () => workoutService.getAll(),
  });
}

export function useCreateWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: Omit<
        Workout,
        | 'id'
        | 'created_at'
        | 'updated_at'
        | 'deleted_at'
        | 'version'
        | 'sync_status'
        | 'last_synced_at'
      >
    ) => workoutService.create({ ...data, user_id: 'current-user' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
}

// Workout Logs
export function useWorkoutLogs(date?: number) {
  return useQuery({
    queryKey: ['workout-logs', date],
    queryFn: () => (date ? workoutLogService.getByDate(date) : Promise.resolve([])),
    enabled: !!date,
  });
}

export function useWeeklyWorkoutStats(date?: number) {
  return useQuery({
    queryKey: ['workout-stats', 'weekly', date],
    queryFn: () =>
      date
        ? workoutLogService.getWeeklyStats(date)
        : Promise.resolve({
            totalWorkouts: 0,
            totalDuration: 0,
            avgRating: 0,
          }),
    enabled: !!date,
  });
}

export function useCreateWorkoutLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: Omit<
        WorkoutLog,
        | 'id'
        | 'created_at'
        | 'updated_at'
        | 'deleted_at'
        | 'version'
        | 'sync_status'
        | 'last_synced_at'
      >
    ) => workoutLogService.create({ ...data, user_id: 'current-user' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-logs'] });
      queryClient.invalidateQueries({ queryKey: ['workout-stats'] });
    },
  });
}

// Workout Plans
export function useWorkoutPlans() {
  return useQuery({
    queryKey: ['workout-plans'],
    queryFn: () => workoutPlanService.getAll(),
  });
}

export function useActiveWorkoutPlan() {
  return useQuery({
    queryKey: ['workout-plan', 'active'],
    queryFn: () => workoutPlanService.getActivePlan(),
  });
}

export function useCreateWorkoutPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: Omit<
        WorkoutPlan,
        | 'id'
        | 'created_at'
        | 'updated_at'
        | 'deleted_at'
        | 'version'
        | 'sync_status'
        | 'last_synced_at'
      >
    ) => workoutPlanService.create({ ...data, user_id: 'current-user' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-plans'] });
    },
  });
}
