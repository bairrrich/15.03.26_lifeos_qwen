'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  WidgetDefinitionService,
  WidgetInstanceService,
  CustomWidgetService,
  defaultWidgets,
} from '../services'
import type { WidgetDefinition, WidgetInstance, CustomWidget } from '../entities'

const widgetDefinitionService = new WidgetDefinitionService()
const widgetInstanceService = new WidgetInstanceService()
const customWidgetService = new CustomWidgetService()

// Widget Definitions
export function useWidgetDefinitions() {
  return useQuery({
    queryKey: ['widget-definitions'],
    queryFn: () => widgetDefinitionService.getAll(),
    initialData: defaultWidgets.map((w, i) => ({ ...w, id: `default-${i}` })) as WidgetDefinition[],
  })
}

export function useWidgetDefinitionsByCategory(category: string) {
  return useQuery({
    queryKey: ['widget-definitions', category],
    queryFn: () => widgetDefinitionService.getByCategory(category),
  })
}

// Widget Instances
export function useWidgetInstances(userId?: string) {
  return useQuery({
    queryKey: ['widget-instances', userId],
    queryFn: () => (userId ? widgetInstanceService.getByUser(userId) : Promise.resolve([])),
    enabled: !!userId,
  })
}

export function useVisibleWidgets(userId?: string) {
  return useQuery({
    queryKey: ['widget-instances', 'visible', userId],
    queryFn: () => (userId ? widgetInstanceService.getVisibleWidgets(userId) : Promise.resolve([])),
    enabled: !!userId,
  })
}

export function useCreateWidgetInstance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<WidgetInstance, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'version' | 'sync_status' | 'last_synced_at'>) =>
      widgetInstanceService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['widget-instances'] })
    },
  })
}

export function useUpdateWidgetPosition() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ instanceId, position }: { instanceId: string; position: WidgetInstance['position'] }) =>
      widgetInstanceService.updatePosition(instanceId, position),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['widget-instances'] })
    },
  })
}

export function useToggleWidgetVisibility() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (instanceId: string) => widgetInstanceService.toggleVisibility(instanceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['widget-instances'] })
    },
  })
}

export function useRemoveWidgetInstance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (instanceId: string) => widgetInstanceService.delete(instanceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['widget-instances'] })
    },
  })
}

// Custom Widgets
export function useCustomWidgets() {
  return useQuery({
    queryKey: ['custom-widgets'],
    queryFn: () => customWidgetService.getActive(),
  })
}

export function useCreateCustomWidget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<CustomWidget, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'version' | 'sync_status' | 'last_synced_at'>) =>
      customWidgetService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-widgets'] })
      queryClient.invalidateQueries({ queryKey: ['widget-definitions'] })
    },
  })
}

export function useExecuteCustomWidget() {
  return useMutation({
    mutationFn: ({ widget, context }: { widget: CustomWidget; context: Record<string, unknown> }) =>
      customWidgetService.executeWidget(widget, context),
  })
}

