import { CrudService } from '@/core/crud'
import type { AutomationRule, AutomationLog } from '../entities'

export class AutomationService extends CrudService<AutomationRule> {
  constructor() {
    super('automations')
  }

  async getActiveRules(): Promise<AutomationRule[]> {
    const all = await this.getAll()
    return all.filter((rule) => rule.is_active)
  }

  async triggerRule(ruleId: string): Promise<void> {
    const rule = await this.getById(ruleId)
    if (!rule) return

    await this.update(ruleId, {
      last_triggered_at: Date.now(),
      trigger_count: (rule.trigger_count || 0) + 1,
    })
  }

  async getRulesByTriggerType(type: string): Promise<AutomationRule[]> {
    const all = await this.getAll()
    return all.filter((rule) => rule.trigger.type === type)
  }
}

export class AutomationLogService extends CrudService<AutomationLog> {
  constructor() {
    super('automation_logs')
  }

  async getByRule(ruleId: string): Promise<AutomationLog[]> {
    return await this.findByField('rule_id', ruleId)
  }

  async getRecentLogs(limit = 50): Promise<AutomationLog[]> {
    const all = await this.getAll()
    return all.sort((a, b) => b.triggered_at - a.triggered_at).slice(0, limit)
  }

  async getStatsByRule(ruleId: string): Promise<{
    totalTriggers: number
    successfulActions: number
    failedActions: number
  }> {
    const logs = await this.getByRule(ruleId)
    let successfulActions = 0
    let failedActions = 0

    logs.forEach((log) => {
      log.actions_executed.forEach((action) => {
        if (action.success) successfulActions++
        else failedActions++
      })
    })

    return {
      totalTriggers: logs.length,
      successfulActions,
      failedActions,
    }
  }
}
