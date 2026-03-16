'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentUserId } from '@/shared/hooks/use-user-id';
import { HabitService, HabitLogService } from '../services';
import type { Habit, HabitLog } from '../entities';

const habitService = new HabitService();
const habitLogService = new HabitLogService();

export function useHabits() {
  return useQuery({
    queryKey: ['habits'],
    queryFn: () => habitService.getAll(),
  });
}

export function useDailyHabits() {
  return useQuery({
    queryKey: ['habits', 'daily'],
    queryFn: () => habitService.getDailyHabits(),
  });
}

export function useCreateHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: Omit<
        Habit,
        | 'id'
        | 'created_at'
        | 'updated_at'
        | 'deleted_at'
        | 'version'
        | 'sync_status'
        | 'last_synced_at'
      >
    ) => habitService.create({ ...data, user_id: getCurrentUserId() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
}

export function useUpdateHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Habit> }) =>
      habitService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
}

export function useDeleteHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => habitService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
}

export function useHabitLogs(habitId?: string) {
  return useQuery({
    queryKey: ['habit-logs', habitId],
    queryFn: () => (habitId ? habitLogService.getByHabit(habitId) : Promise.resolve([])),
    enabled: !!habitId,
  });
}

export function useTodayHabitsLog() {
  return useQuery({
    queryKey: ['habit-logs', 'today'],
    queryFn: () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return habitLogService.getByDate(today.getTime());
    },
  });
}

export function useLogHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: Omit<
        HabitLog,
        | 'id'
        | 'created_at'
        | 'updated_at'
        | 'deleted_at'
        | 'version'
        | 'sync_status'
        | 'last_synced_at'
      >
    ) => habitLogService.create({ ...data, user_id: getCurrentUserId() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habit-logs'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
}

export function useCompleteHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ habitId, date }: { habitId: string; date: number }) => {
      const existing = await habitLogService.getLogForHabitOnDate(habitId, date);
      if (existing) {
        await habitLogService.update(existing.id, { completed: true });
      } else {
        await habitLogService.create({
          habit_id: habitId,
          date,
          count: 1,
          completed: true,
          user_id: getCurrentUserId(),
        });
      }
      await habitService.incrementStreak(habitId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habit-logs'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
}

export function useHabitCompletionRate(habitId: string, days: number = 30) {
  return useQuery({
    queryKey: ['habit-stats', habitId, days],
    queryFn: () => habitLogService.getCompletionRate(habitId, days),
    enabled: !!habitId,
  });
}
