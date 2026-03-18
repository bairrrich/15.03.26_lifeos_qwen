import type { BaseEntity } from '@/core/entity'

export type WidgetType = 'stats' | 'chart' | 'list' | 'calendar' | 'progress' | 'custom'
export type WidgetSize = 'small' | 'medium' | 'large' | 'full'
export type DataSource = 'habits' | 'goals' | 'finance' | 'nutrition' | 'workouts' | 'health' | 'sleep' | 'custom'

export interface WidgetDefinition extends BaseEntity {
  id: string
  name: string
  description?: string
  type: WidgetType
  category: string
  icon?: string
  color?: string
  default_size: WidgetSize
  config_schema: Record<string, unknown> // JSON Schema для конфигурации
  data_source?: DataSource
  is_system: boolean // Системные виджеты нельзя удалить
  widget_version: string
  author?: string
}

export interface WidgetInstance extends BaseEntity {
  widget_id: string
  user_id: string
  title: string
  config: Record<string, unknown>
  position: {
    row: number
    col: number
    width: number
    height: number
  }
  is_visible: boolean
  refresh_interval?: number // секунды
}

export interface WidgetData {
  widget_id: string
  data: unknown
  last_updated: number
  expires_at?: number
}

export interface CustomWidget extends BaseEntity {
  name: string
  code: string // JavaScript код виджета
  config: Record<string, unknown>
  is_active: boolean
}

