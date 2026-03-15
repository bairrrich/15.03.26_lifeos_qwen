import { CrudService } from '@/core/crud';
import type { HealthMetric, SleepLog, Supplement, SupplementLog } from '../entities';

export class HealthMetricService extends CrudService<HealthMetric> {
  constructor() {
    super('health_metrics');
  }

  async getByType(type: HealthMetric['type']): Promise<HealthMetric[]> {
    return await this.findByField('type', type);
  }

  async getLatestByType(type: HealthMetric['type']): Promise<HealthMetric | undefined> {
    const metrics = await this.getByType(type);
    return metrics.sort((a, b) => b.recorded_at - a.recorded_at)[0];
  }

  async getHistoryByType(type: HealthMetric['type'], days: number = 30): Promise<HealthMetric[]> {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const metrics = await this.getByType(type);
    return metrics
      .filter((m) => m.recorded_at >= cutoff)
      .sort((a, b) => a.recorded_at - b.recorded_at);
  }
}

export class SleepLogService extends CrudService<SleepLog> {
  constructor() {
    super('sleep_logs');
  }

  async getByDate(date: number): Promise<SleepLog | undefined> {
    const logs = await this.getAll();
    return logs.find((log) => log.date === date);
  }

  async getWeeklyAverage(date: number): Promise<{
    avgDuration: number;
    avgQuality: number;
  }> {
    const weekAgo = date - 7 * 24 * 60 * 60 * 1000;
    const logs = await this.getAll();
    const weekLogs = logs.filter((log) => log.date >= weekAgo);

    if (weekLogs.length === 0) {
      return { avgDuration: 0, avgQuality: 0 };
    }

    return {
      avgDuration: weekLogs.reduce((sum, log) => sum + log.duration_hours, 0) / weekLogs.length,
      avgQuality: weekLogs.reduce((sum, log) => sum + log.quality, 0) / weekLogs.length,
    };
  }

  async getMonthlyStats(date: number): Promise<{
    totalDays: number;
    avgDuration: number;
    avgQuality: number;
    goodSleepDays: number;
  }> {
    const monthAgo = date - 30 * 24 * 60 * 60 * 1000;
    const logs = await this.getAll();
    const monthLogs = logs.filter((log) => log.date >= monthAgo);

    if (monthLogs.length === 0) {
      return { totalDays: 0, avgDuration: 0, avgQuality: 0, goodSleepDays: 0 };
    }

    return {
      totalDays: monthLogs.length,
      avgDuration: monthLogs.reduce((sum, log) => sum + log.duration_hours, 0) / monthLogs.length,
      avgQuality: monthLogs.reduce((sum, log) => sum + log.quality, 0) / monthLogs.length,
      goodSleepDays: monthLogs.filter((log) => log.quality >= 4).length,
    };
  }
}

export class SupplementService extends CrudService<Supplement> {
  constructor() {
    super('supplements');
  }

  async getActive(): Promise<Supplement[]> {
    const all = await this.getAll();
    return all.filter((s) => !s.ended_at);
  }

  async getByTimeOfDay(timeOfDay: Supplement['time_of_day']): Promise<Supplement[]> {
    return await this.findByField('time_of_day', timeOfDay);
  }
}

export class SupplementLogService extends CrudService<SupplementLog> {
  constructor() {
    super('supplement_logs');
  }

  async getByDate(date: number): Promise<SupplementLog[]> {
    const logs = await this.getAll();
    return logs.filter((log) => log.date === date);
  }

  async getComplianceRate(supplementId: string, days: number = 30): Promise<number> {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const logs = await this.getAll();
    const supplementLogs = logs.filter(
      (log) => log.supplement_id === supplementId && log.date >= cutoff
    );

    if (supplementLogs.length === 0) return 0;

    const takenCount = supplementLogs.filter((log) => log.taken).length;
    return Math.round((takenCount / supplementLogs.length) * 100);
  }
}
