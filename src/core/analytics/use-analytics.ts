'use client'

import { useQuery } from '@tanstack/react-query'
import { analyticsService, type DashboardStats } from '@/core/analytics'

export function useDashboardStats(days = 30) {
  return useQuery<DashboardStats>({
    queryKey: ['analytics', 'dashboard', days],
    queryFn: () => analyticsService.getDashboardStats(days),
  })
}

export function useFinanceChartData(months = 6) {
  return useQuery({
    queryKey: ['analytics', 'finance-chart', months],
    queryFn: () => analyticsService.getFinanceChartData(months),
  })
}

export function useHabitsChartData() {
  return useQuery({
    queryKey: ['analytics', 'habits-chart'],
    queryFn: () => analyticsService.getHabitsChartData(),
  })
}

export function useWeightChartData(days = 30) {
  return useQuery({
    queryKey: ['analytics', 'weight-chart', days],
    queryFn: () => analyticsService.getWeightChartData(days),
  })
}
