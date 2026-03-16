'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentUserId } from '@/shared/hooks/use-user-id';
import {
  HealthMetricService,
  SleepLogService,
  SupplementService,
  SupplementLogService,
} from '../services';
import type { HealthMetric, SleepLog, Supplement, SupplementLog } from '../entities';

const healthMetricService = new HealthMetricService();
const sleepLogService = new SleepLogService();
const supplementService = new SupplementService();
const supplementLogService = new SupplementLogService();

// Health Metrics
export function useHealthMetrics(type?: HealthMetric['type']) {
  return useQuery({
    queryKey: ['health-metrics', type],
    queryFn: () => (type ? healthMetricService.getByType(type) : healthMetricService.getAll()),
  });
}

export function useLatestHealthMetric(type: HealthMetric['type']) {
  return useQuery({
    queryKey: ['health-metrics', 'latest', type],
    queryFn: async () => {
      const metric = await healthMetricService.getLatestByType(type);
      return metric ?? null;
    },
    enabled: !!type,
  });
}

export function useCreateHealthMetric() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: Omit<
        HealthMetric,
        | 'id'
        | 'created_at'
        | 'updated_at'
        | 'deleted_at'
        | 'version'
        | 'sync_status'
        | 'last_synced_at'
      >
    ) => healthMetricService.create({ ...data, user_id: getCurrentUserId() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-metrics'] });
    },
  });
}

// Sleep Logs
export function useSleepLogs(date?: number) {
  return useQuery({
    queryKey: ['sleep-logs', date],
    queryFn: async () => {
      if (!date) return [];
      const log = await sleepLogService.getByDate(date);
      return log ? [log] : [];
    },
    enabled: !!date,
  });
}

export function useWeeklySleepStats(date?: number) {
  return useQuery({
    queryKey: ['sleep-stats', 'weekly', date],
    queryFn: () =>
      date
        ? sleepLogService.getWeeklyAverage(date)
        : Promise.resolve({ avgDuration: 0, avgQuality: 0 }),
    enabled: !!date,
  });
}

export function useCreateSleepLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: Omit<
        SleepLog,
        | 'id'
        | 'created_at'
        | 'updated_at'
        | 'deleted_at'
        | 'version'
        | 'sync_status'
        | 'last_synced_at'
      >
    ) => sleepLogService.create({ ...data, user_id: 'current-user' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sleep-logs'] });
      queryClient.invalidateQueries({ queryKey: ['sleep-stats'] });
    },
  });
}

// Supplements
export function useSupplements() {
  return useQuery({
    queryKey: ['supplements'],
    queryFn: () => supplementService.getAll(),
  });
}

export function useActiveSupplements() {
  return useQuery({
    queryKey: ['supplements', 'active'],
    queryFn: () => supplementService.getActive(),
  });
}

export function useCreateSupplement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: Omit<
        Supplement,
        | 'id'
        | 'created_at'
        | 'updated_at'
        | 'deleted_at'
        | 'version'
        | 'sync_status'
        | 'last_synced_at'
      >
    ) => supplementService.create({ ...data, user_id: 'current-user' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplements'] });
    },
  });
}

// Supplement Logs
export function useSupplementLogs(date?: number) {
  return useQuery({
    queryKey: ['supplement-logs', date],
    queryFn: () => (date ? supplementLogService.getByDate(date) : Promise.resolve([])),
    enabled: !!date,
  });
}

export function useCreateSupplementLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: Omit<
        SupplementLog,
        | 'id'
        | 'created_at'
        | 'updated_at'
        | 'deleted_at'
        | 'version'
        | 'sync_status'
        | 'last_synced_at'
      >
    ) => supplementLogService.create({ ...data, user_id: 'current-user' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplement-logs'] });
    },
  });
}
