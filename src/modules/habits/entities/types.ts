import type { BaseEntity } from '@/core/entity';

export interface Habit extends BaseEntity {
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  target_count?: number;
  color?: string;
  icon?: string;
  streak?: number;
  completed_total?: number;
}

export interface HabitLog extends BaseEntity {
  habit_id: string;
  date: number; // timestamp начала дня
  count: number;
  completed: boolean;
  notes?: string;
}

