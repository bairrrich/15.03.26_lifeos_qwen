import type { BaseEntity } from '@/core/entity'

export type TriggerType =
  | 'habit_completed'
  | 'habit_missed'
  | 'workout_completed'
  | 'goal_progress'
  | 'budget_exceeded'
  | 'product_expiring'
  | 'time_of_day'
  | 'location'

export type ActionType =
  | 'send_notification'
  | 'send_email'
  | 'create_habit_log'
  | 'send_webhook'
  | 'log_message'

export interface AutomationRule extends BaseEntity {
  name: string
  description?: string
  trigger: {
    type: TriggerType
    config: Record<string, unknown>
  }
  actions: Array<{
    type: ActionType
    config: Record<string, unknown>
  }>
  is_active: boolean
  last_triggered_at?: number
  trigger_count: number
}

export interface AutomationLog extends BaseEntity {
  rule_id: string
  rule_name: string
  triggered_at: number
  trigger_data?: Record<string, unknown>
  actions_executed: Array<{
    type: ActionType
    success: boolean
    error?: string
  }>
}
