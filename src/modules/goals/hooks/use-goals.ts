'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentUserId } from '@/shared/hooks/use-user-id';
import { GoalService, GoalLogService } from '../services';
import type { Goal, GoalLog } from '../entities';

const goalService = new GoalService();
const goalLogService = new GoalLogService();

export function useGoals() {
  return useQuery({
    queryKey: ['goals'],
    queryFn: () => goalService.getAll(),
  });
}

export function useActiveGoals() {
  return useQuery({
    queryKey: ['goals', 'active'],
    queryFn: () => goalService.getActiveGoals(),
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: Omit<
        Goal,
        | 'id'
        | 'created_at'
        | 'updated_at'
        | 'deleted_at'
        | 'version'
        | 'sync_status'
        | 'last_synced_at'
      >
    ) => goalService.create({ ...data, user_id: getCurrentUserId() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

export function useUpdateGoalProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, progress }: { goalId: string; progress: number }) =>
      goalService.updateProgress(goalId, progress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

export function useAddMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, title }: { goalId: string; title: string }) =>
      goalService.addMilestone(goalId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

export function useCompleteMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, milestoneId }: { goalId: string; milestoneId: string }) =>
      goalService.completeMilestone(goalId, milestoneId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

export function useGoalLogs(goalId?: string) {
  return useQuery({
    queryKey: ['goal-logs', goalId],
    queryFn: () => (goalId ? goalLogService.getByGoal(goalId) : Promise.resolve([])),
    enabled: !!goalId,
  });
}

export function useCreateGoalLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: Omit<
        GoalLog,
        | 'id'
        | 'created_at'
        | 'updated_at'
        | 'deleted_at'
        | 'version'
        | 'sync_status'
        | 'last_synced_at'
      >
    ) => goalLogService.create({ ...data, user_id: 'current-user' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goal-logs'] });
    },
  });
}
