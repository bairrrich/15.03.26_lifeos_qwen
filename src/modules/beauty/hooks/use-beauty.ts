'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentUserId } from '@/shared/hooks/use-user-id';
import {
  BeautyProductService,
  BeautyRoutineService,
  BeautyUsageLogService,
  SkinAnalysisService,
} from '../services';
import type { BeautyProduct, BeautyRoutine, BeautyUsageLog, SkinAnalysis } from '../entities';

const beautyProductService = new BeautyProductService();
const beautyRoutineService = new BeautyRoutineService();
const beautyUsageLogService = new BeautyUsageLogService();
const skinAnalysisService = new SkinAnalysisService();

// Beauty Products
export function useBeautyProducts() {
  return useQuery({
    queryKey: ['beauty-products'],
    queryFn: () => beautyProductService.getAll(),
  });
}

export function useBeautyProductsByCategory(category: BeautyProduct['category']) {
  return useQuery({
    queryKey: ['beauty-products', category],
    queryFn: () => beautyProductService.getByCategory(category),
    enabled: !!category,
  });
}

export function useFavoriteBeautyProducts() {
  return useQuery({
    queryKey: ['beauty-products', 'favorites'],
    queryFn: () => beautyProductService.getFavorites(),
  });
}

export function useExpiringBeautyProducts() {
  return useQuery({
    queryKey: ['beauty-products', 'expiring'],
    queryFn: () => beautyProductService.getExpiringSoon(30),
  });
}

export function useCreateBeautyProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: Omit<
        BeautyProduct,
        | 'id'
        | 'created_at'
        | 'updated_at'
        | 'deleted_at'
        | 'version'
        | 'sync_status'
        | 'last_synced_at'
      >
    ) => beautyProductService.create({ ...data, user_id: getCurrentUserId() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beauty-products'] });
    },
  });
}

export function useUpdateBeautyProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BeautyProduct> }) =>
      beautyProductService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beauty-products'] });
    },
  });
}

// Beauty Routines
export function useBeautyRoutines() {
  return useQuery({
    queryKey: ['beauty-routines'],
    queryFn: () => beautyRoutineService.getAll(),
  });
}

export function useActiveBeautyRoutines() {
  return useQuery({
    queryKey: ['beauty-routines', 'active'],
    queryFn: () => beautyRoutineService.getActiveRoutines(),
  });
}

export function useMorningRoutine() {
  return useQuery({
    queryKey: ['beauty-routines', 'morning'],
    queryFn: () => beautyRoutineService.getMorningRoutine(),
  });
}

export function useEveningRoutine() {
  return useQuery({
    queryKey: ['beauty-routines', 'evening'],
    queryFn: () => beautyRoutineService.getEveningRoutine(),
  });
}

export function useCreateBeautyRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: Omit<
        BeautyRoutine,
        | 'id'
        | 'created_at'
        | 'updated_at'
        | 'deleted_at'
        | 'version'
        | 'sync_status'
        | 'last_synced_at'
      >
    ) => beautyRoutineService.create({ ...data, user_id: getCurrentUserId() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beauty-routines'] });
    },
  });
}

// Beauty Usage Logs
export function useBeautyUsageLogs(date?: number) {
  return useQuery({
    queryKey: ['beauty-usage-logs', date],
    queryFn: () => (date ? beautyUsageLogService.getByDate(date) : Promise.resolve([])),
    enabled: !!date,
  });
}

export function useWeeklyBeautyStats(date?: number) {
  return useQuery({
    queryKey: ['beauty-stats', 'weekly', date],
    queryFn: () =>
      date
        ? beautyUsageLogService.getWeeklyStats(date)
        : Promise.resolve({
          totalUses: 0,
          avgRating: 0,
          mostUsedProducts: [],
        }),
    enabled: !!date,
  });
}

export function useCreateBeautyUsageLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: Omit<
        BeautyUsageLog,
        | 'id'
        | 'created_at'
        | 'updated_at'
        | 'deleted_at'
        | 'version'
        | 'sync_status'
        | 'last_synced_at'
      >
    ) => beautyUsageLogService.create({ ...data, user_id: getCurrentUserId() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beauty-usage-logs'] });
    },
  });
}

// Skin Analysis
export function useSkinAnalyses() {
  return useQuery({
    queryKey: ['skin-analyses'],
    queryFn: () => skinAnalysisService.getAll(),
  });
}

export function useLatestSkinAnalysis() {
  return useQuery({
    queryKey: ['skin-analyses', 'latest'],
    queryFn: () => skinAnalysisService.getLatest(),
  });
}

export function useCreateSkinAnalysis() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: Omit<
        SkinAnalysis,
        | 'id'
        | 'created_at'
        | 'updated_at'
        | 'deleted_at'
        | 'version'
        | 'sync_status'
        | 'last_synced_at'
      >
    ) => skinAnalysisService.create({ ...data, user_id: getCurrentUserId() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skin-analyses'] });
    },
  });
}
