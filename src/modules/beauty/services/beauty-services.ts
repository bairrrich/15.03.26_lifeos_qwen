import { CrudService } from '@/core/crud';
import type { BeautyProduct, BeautyRoutine, BeautyUsageLog, SkinAnalysis } from '../entities';

export class BeautyProductService extends CrudService<BeautyProduct> {
  constructor() {
    super('beauty_products');
  }

  async getByCategory(category: BeautyProduct['category']): Promise<BeautyProduct[]> {
    return await this.findByField('category', category);
  }

  async getFavorites(): Promise<BeautyProduct[]> {
    const all = await this.getAll();
    return all.filter((p) => p.is_favorite);
  }

  async getExpired(): Promise<BeautyProduct[]> {
    const all = await this.getAll();
    const now = Date.now();
    return all.filter((p) => p.expiry_date && p.expiry_date < now);
  }

  async getExpiringSoon(days = 30): Promise<BeautyProduct[]> {
    const all = await this.getAll();
    const now = Date.now();
    const threshold = now + days * 24 * 60 * 60 * 1000;
    return all.filter((p) => p.expiry_date && p.expiry_date >= now && p.expiry_date <= threshold);
  }

  async getEmptyProducts(): Promise<BeautyProduct[]> {
    const all = await this.getAll();
    return all.filter((p) => p.is_empty);
  }
}

export class BeautyRoutineService extends CrudService<BeautyRoutine> {
  constructor() {
    super('beauty_routines');
  }

  async getByType(type: BeautyRoutine['type']): Promise<BeautyRoutine[]> {
    return await this.findByField('type', type);
  }

  async getActiveRoutines(): Promise<BeautyRoutine[]> {
    const all = await this.getAll();
    return all.filter((r) => r.is_active);
  }

  async getMorningRoutine(): Promise<BeautyRoutine | undefined> {
    const routines = await this.getByType('morning');
    return routines.find((r) => r.is_active);
  }

  async getEveningRoutine(): Promise<BeautyRoutine | undefined> {
    const routines = await this.getByType('evening');
    return routines.find((r) => r.is_active);
  }
}

export class BeautyUsageLogService extends CrudService<BeautyUsageLog> {
  constructor() {
    super('beauty_usage_logs');
  }

  async getByDate(date: number): Promise<BeautyUsageLog[]> {
    const logs = await this.getAll();
    return logs.filter((log) => log.date === date);
  }

  async getByRoutine(routineId: string): Promise<BeautyUsageLog[]> {
    return await this.findByField('routine_id', routineId);
  }

  async getWeeklyStats(date: number): Promise<{
    totalUses: number;
    avgRating: number;
    mostUsedProducts: Array<{ product_id: string; product_name: string; count: number }>;
  }> {
    const weekAgo = date - 7 * 24 * 60 * 60 * 1000;
    const all = await this.getAll();
    const weekLogs = all.filter((log) => log.date >= weekAgo);

    const productCounts: Record<
      string,
      { product_id: string; product_name: string; count: number }
    > = {};

    weekLogs.forEach((log) => {
      log.products.forEach((p) => {
        if (!productCounts[p.product_id]) {
          productCounts[p.product_id] = {
            product_id: p.product_id,
            product_name: p.product_name,
            count: 0,
          };
        }
        productCounts[p.product_id].count++;
      });
    });

    const mostUsedProducts = Object.values(productCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const avgRating =
      weekLogs.length > 0
        ? weekLogs.reduce((sum, log) => sum + (log.rating || 0), 0) / weekLogs.length
        : 0;

    return {
      totalUses: weekLogs.length,
      avgRating,
      mostUsedProducts,
    };
  }
}

export class SkinAnalysisService extends CrudService<SkinAnalysis> {
  constructor() {
    super('skin_analyses');
  }

  async getLatest(): Promise<SkinAnalysis | undefined> {
    const all = await this.getAll();
    return all.sort((a, b) => b.date - a.date)[0];
  }

  async getHistory(limit = 10): Promise<SkinAnalysis[]> {
    const all = await this.getAll();
    return all.sort((a, b) => b.date - a.date).slice(0, limit);
  }

  async getByDateRange(start: number, end: number): Promise<SkinAnalysis[]> {
    const all = await this.getAll();
    return all.filter((a) => a.date >= start && a.date <= end);
  }
}
