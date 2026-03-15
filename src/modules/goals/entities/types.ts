import type { BaseEntity } from '@/core/entity';

export interface Goal extends BaseEntity {
  title: string;
  description?: string;
  category: 'fitness' | 'health' | 'finance' | 'learning' | 'career' | 'personal' | 'other';
  target_date?: number;
  progress: number; // 0-100
  status: 'active' | 'completed' | 'paused' | 'abandoned';
  parent_goal_id?: string;
  milestones?: Array<{
    id: string;
    title: string;
    completed: boolean;
    completed_at?: number;
  }>;
  metrics?: {
    current: number;
    target: number;
    unit: string;
  };
}

export interface GoalLog extends BaseEntity {
  goal_id: string;
  date: number;
  progress: number;
  notes?: string;
}
