'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AutomationService, AutomationLogService } from '../services'
import type { AutomationRule, AutomationLog } from '../entities'

const automationService = new AutomationService()
const automationLogService = new AutomationLogService()

export function useAutomations() {
  return useQuery({
    queryKey: ['automations'],
    queryFn: () => automationService.getAll(),
  })
}

export function useActiveAutomations() {
  return useQuery({
    queryKey: ['automations', 'active'],
    queryFn: () => automationService.getActiveRules(),
  })
}

export function useCreateAutomation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<AutomationRule, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'version' | 'sync_status' | 'last_synced_at'>) =>
      automationService.create({ ...data, user_id: 'current-user', trigger_count: 0 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] })
    },
  })
}

export function useToggleAutomation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      automationService.update(id, { is_active: isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] })
    },
  })
}

export function useDeleteAutomation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => automationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] })
    },
  })
}

export function useAutomationLogs(ruleId?: string) {
  return useQuery({
    queryKey: ['automation-logs', ruleId],
    queryFn: () => (ruleId ? automationLogService.getByRule(ruleId) : Promise.resolve([])),
    enabled: !!ruleId,
  })
}

export function useRecentAutomationLogs() {
  return useQuery({
    queryKey: ['automation-logs', 'recent'],
    queryFn: () => automationLogService.getRecentLogs(20),
  })
}
