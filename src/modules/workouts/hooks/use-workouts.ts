'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentUserId } from '@/shared/hooks/use-user-id';
import {
  ExerciseService,
  SetService,
  WorkoutService,
  WorkoutLogService,
  WorkoutPlanService,
  PRService,
} from '../services';
import type { Exercise, Workout, WorkoutLog, WorkoutPlan, Set } from '../entities';

const exerciseService = new ExerciseService();
const setService = new SetService();
const workoutService = new WorkoutService();
const workoutLogService = new WorkoutLogService();
const workoutPlanService = new WorkoutPlanService();
const prService = new PRService();

// ==================== Exercises ====================
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
    ) => exerciseService.create({ ...data, user_id: getCurrentUserId() }),
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

export function useExerciseSearch(query: string) {
  return useQuery({
    queryKey: ['exercises', 'search', query],
    queryFn: () => exerciseService.searchByName(query),
    enabled: query.length >= 2,
  });
}

export function useFavoriteExercises() {
  return useQuery({
    queryKey: ['exercises', 'favorites'],
    queryFn: () => exerciseService.getFavorites(),
  });
}

export function useToggleExerciseFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => exerciseService.toggleFavorite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises', 'favorites'] });
    },
  });
}

// ==================== Sets ====================
export function useSets(workoutId?: string) {
  return useQuery({
    queryKey: ['sets', workoutId],
    queryFn: () => (workoutId ? setService.getByWorkout(workoutId) : Promise.resolve([])),
    enabled: !!workoutId,
  });
}

export function useExerciseHistory(exerciseId: string) {
  return useQuery({
    queryKey: ['exercise-history', exerciseId],
    queryFn: () => setService.getByExercise(exerciseId),
    enabled: !!exerciseId,
  });
}

export function useSuggestedWeight(exerciseId: string) {
  return useQuery({
    queryKey: ['suggested-weight', exerciseId],
    queryFn: () => setService.getSuggestedWeight(exerciseId),
    enabled: !!exerciseId,
  });
}

export function useCreateSet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: Omit<
        Set,
        | 'id'
        | 'created_at'
        | 'updated_at'
        | 'deleted_at'
        | 'version'
        | 'sync_status'
        | 'last_synced_at'
      >
    ) => setService.create({ ...data, user_id: getCurrentUserId() }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sets'] });
      queryClient.invalidateQueries({ queryKey: ['exercise-history', variables.exercise_id] });
      queryClient.invalidateQueries({ queryKey: ['suggested-weight', variables.exercise_id] });
    },
  });
}

// ==================== Workouts ====================
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
    ) => workoutService.create({ ...data, user_id: getCurrentUserId() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
}

export function useWorkoutById(id: string) {
  return useQuery({
    queryKey: ['workout', id],
    queryFn: () => workoutService.getById(id),
    enabled: !!id,
  });
}

// ==================== Workout Logs ====================
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
          avgFeeling: 0,
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
    ) => workoutLogService.create({ ...data, user_id: getCurrentUserId() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-logs'] });
      queryClient.invalidateQueries({ queryKey: ['workout-stats'] });
      queryClient.invalidateQueries({ queryKey: ['prs'] });
    },
  });
}

// ==================== Workout Plans ====================
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
    ) => workoutPlanService.create({ ...data, user_id: getCurrentUserId() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-plans'] });
    },
  });
}

export function useSetActiveWorkoutPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => workoutPlanService.setActivePlan(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-plan', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['workout-plans'] });
    },
  });
}

// ==================== PR Records ====================
export function usePRs() {
  return useQuery({
    queryKey: ['prs'],
    queryFn: () => prService.getAllPRs(),
  });
}

export function useExercisePRs(exerciseId: string) {
  return useQuery({
    queryKey: ['prs', exerciseId],
    queryFn: () => prService.getByExercise(exerciseId),
    enabled: !!exerciseId,
  });
}

export function useUpdatePR() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      exerciseId,
      exerciseName,
      weight,
      reps,
      date,
      workoutLogId,
    }: {
      exerciseId: string;
      exerciseName: string;
      weight: number;
      reps: number;
      date: number;
      workoutLogId?: string;
    }) => prService.updatePR(exerciseId, exerciseName, weight, reps, date, workoutLogId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prs'] });
    },
  });
}

export function useCheckPR() {
  return useMutation({
    mutationFn: ({
      exerciseId,
      weight,
      reps,
    }: {
      exerciseId: string;
      weight: number;
      reps: number;
    }) => workoutLogService.checkPR(exerciseId, weight, reps),
  });
}

// ==================== Active Workout (Zustand-like with React Query) ====================
export function useActiveWorkout(workoutId?: string) {
  const { data: sets } = useSets(workoutId);
  const createSet = useCreateSet();

  const addSet = async (setData: {
    exercise_id: string;
    exercise_name: string;
    order: number;
    set_number: number;
    type: Set['type'];
    reps: number;
    weight: number;
    rpe?: number;
    tempo?: string;
    rest_seconds?: number;
    notes?: string;
  }) => {
    if (!workoutId) return;

    await createSet.mutateAsync({
      ...setData,
      user_id: getCurrentUserId(),
      workout_id: workoutId,
      completed: false,
    });
  };

  const completeSet = async (setId: string) => {
    const set = sets?.find((s) => s.id === setId);
    if (!set) return;

    // В реальной реализации здесь был бы update set
    await createSet.mutateAsync({
      ...set,
      user_id: getCurrentUserId(),
      completed: true,
    });
  };

  return {
    sets: sets || [],
    addSet,
    completeSet,
    isLogging: createSet.isPending,
  };
}
