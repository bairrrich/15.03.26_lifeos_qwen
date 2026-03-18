import { CrudService } from '@/core/crud'
import { db } from '@/core/database'
import type { WidgetDefinition, WidgetInstance, CustomWidget, WidgetType } from '../entities'

export class WidgetDefinitionService extends CrudService<WidgetDefinition> {
  constructor() {
    super('widget_definitions')
  }

  async getByType(type: WidgetType): Promise<WidgetDefinition[]> {
    return await this.findByField('type', type)
  }

  async getByCategory(category: string): Promise<WidgetDefinition[]> {
    return await this.findByField('category', category)
  }

  async getSystemWidgets(): Promise<WidgetDefinition[]> {
    const all = await this.getAll()
    return all.filter((w) => w.is_system)
  }

  async getCustomWidgets(): Promise<WidgetDefinition[]> {
    const all = await this.getAll()
    return all.filter((w) => !w.is_system)
  }
}

export class WidgetInstanceService extends CrudService<WidgetInstance> {
  constructor() {
    super('widget_instances')
  }

  async getByUser(userId: string): Promise<WidgetInstance[]> {
    return await this.findByField('user_id', userId)
  }

  async getVisibleWidgets(userId: string): Promise<WidgetInstance[]> {
    const widgets = await this.getByUser(userId)
    return widgets.filter((w) => w.is_visible)
  }

  async updatePosition(
    instanceId: string,
    position: WidgetInstance['position']
  ): Promise<void> {
    await this.update(instanceId, { position })
  }

  async toggleVisibility(instanceId: string): Promise<void> {
    const widget = await this.getById(instanceId)
    if (widget) {
      await this.update(instanceId, { is_visible: !widget.is_visible })
    }
  }
}

export class CustomWidgetService extends CrudService<CustomWidget> {
  constructor() {
    super('custom_widgets')
  }

  async getActive(): Promise<CustomWidget[]> {
    const all = await this.getAll()
    return all.filter((w) => w.is_active)
  }

  async executeWidget(widget: CustomWidget, context: Record<string, unknown>): Promise<unknown> {
    try {
      // Create a safe execution context with limited globals
      const safeContext = {
        ...context,
        db: {
          // Only expose safe methods from db
          table: (tableName: string) => {
            // Validate table name to prevent access to unauthorized tables
            const allowedTables = [
              'habits', 'habit_logs', 'goals', 'transactions',
              'accounts', 'nutrition_logs', 'workout_logs',
              'sleep_logs', 'health_metrics', 'foods', 'recipes'
            ];
            if (!allowedTables.includes(tableName)) {
              throw new Error(`Access to table '${tableName}' is not allowed`);
            }
            return db.table(tableName);
          }
        }
      };

      // Create function with restricted scope
      const execute = new Function('safeContext', `
        "use strict";
        const db = safeContext.db;
        const context = safeContext;
        ${widget.code}
      `);

      return await execute(safeContext);
    } catch (error) {
      console.error('Custom widget execution error:', error)
      throw new Error(`Widget execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

// Регистрируем стандартные системные виджеты
export const defaultWidgets: Omit<WidgetDefinition, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'version' | 'sync_status' | 'last_synced_at'>[] = [
  {
    name: 'Прогресс привычек',
    description: 'Показывает процент выполненных привычек за день',
    type: 'progress',
    category: 'habits',
    icon: 'Target',
    color: 'blue',
    default_size: 'small',
    config_schema: {
      showPercentage: { type: 'boolean', default: true },
      showCount: { type: 'boolean', default: true },
    },
    data_source: 'habits',
    is_system: true,
    user_id: 'system',
    author: 'LifeOS',
    widget_version: '1.0.0',
  },
  {
    name: 'Баланс',
    description: 'Текущий финансовый баланс',
    type: 'stats',
    category: 'finance',
    icon: 'DollarSign',
    color: 'green',
    default_size: 'small',
    config_schema: {
      currency: { type: 'string', default: '₽' },
      showTrend: { type: 'boolean', default: true },
    },
    data_source: 'finance',
    is_system: true,
    user_id: 'system',
    author: 'LifeOS',
    widget_version: '1.0.0',
  },
  {
    name: 'График расходов',
    description: 'Расходы по месяцам',
    type: 'chart',
    category: 'finance',
    icon: 'TrendingDown',
    color: 'red',
    default_size: 'medium',
    config_schema: {
      months: { type: 'number', default: 6 },
      chartType: { type: 'string', default: 'line' },
    },
    data_source: 'finance',
    is_system: true,
    user_id: 'system',
    author: 'LifeOS',
    widget_version: '1.0.0',
  },
  {
    name: 'Календарь тренировок',
    description: 'Отмеченные дни тренировок',
    type: 'calendar',
    category: 'workouts',
    icon: 'Calendar',
    color: 'purple',
    default_size: 'large',
    config_schema: {
      showCompleted: { type: 'boolean', default: true },
      showPlanned: { type: 'boolean', default: true },
    },
    data_source: 'workouts',
    is_system: true,
    user_id: 'system',
    author: 'LifeOS',
    widget_version: '1.0.0',
  },
  {
    name: 'Сон',
    description: 'Средняя длительность и качество сна',
    type: 'stats',
    category: 'health',
    icon: 'Moon',
    color: 'indigo',
    default_size: 'small',
    config_schema: {
      days: { type: 'number', default: 7 },
      showQuality: { type: 'boolean', default: true },
    },
    data_source: 'sleep',
    is_system: true,
    user_id: 'system',
    author: 'LifeOS',
    widget_version: '1.0.0',
  },
  {
    name: 'Список целей',
    description: 'Активные цели с прогрессом',
    type: 'list',
    category: 'goals',
    icon: 'Target',
    color: 'yellow',
    default_size: 'medium',
    config_schema: {
      showProgress: { type: 'boolean', default: true },
      limit: { type: 'number', default: 5 },
    },
    data_source: 'goals',
    is_system: true,
    user_id: 'system',
    author: 'LifeOS',
    widget_version: '1.0.0',
  },
]


