import { CrudService } from '@/core/crud';
import type { Goal, GoalLog } from '../entities';

export class GoalService extends CrudService<Goal> {
  constructor() {
    super('goals');
  }

  async getActiveGoals(): Promise<Goal[]> {
    const all = await this.getAll();
    return all.filter((g) => g.status === 'active');
  }

  async getCompletedGoals(): Promise<Goal[]> {
    const all = await this.getAll();
    return all.filter((g) => g.status === 'completed');
  }

  async getByCategory(category: Goal['category']): Promise<Goal[]> {
    return await this.findByField('category', category);
  }

  async updateProgress(goalId: string, progress: number): Promise<void> {
    const goal = await this.getById(goalId);
    if (!goal) return;

    const status: Goal['status'] =
      progress >= 100 ? 'completed' : goal.status === 'completed' ? 'active' : goal.status;

    await this.update(goalId, { progress, status });
  }

  async addMilestone(goalId: string, milestoneTitle: string): Promise<void> {
    const goal = await this.getById(goalId);
    if (!goal) return;

    const milestones = goal.milestones || [];
    milestones.push({
      id: `milestone-${Date.now()}`,
      title: milestoneTitle,
      completed: false,
    });

    await this.update(goalId, { milestones });
  }

  async completeMilestone(goalId: string, milestoneId: string): Promise<void> {
    const goal = await this.getById(goalId);
    if (!goal || !goal.milestones) return;

    const milestones = goal.milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: true, completed_at: Date.now() } : m
    );

    await this.update(goalId, { milestones });
  }
}

export class GoalLogService extends CrudService<GoalLog> {
  constructor() {
    super('goal_logs');
  }

  async getByGoal(goalId: string): Promise<GoalLog[]> {
    return await this.findByField('goal_id', goalId);
  }

  async getProgressHistory(goalId: string): Promise<GoalLog[]> {
    const logs = await this.getByGoal(goalId);
    return logs.sort((a, b) => a.date - b.date);
  }
}
