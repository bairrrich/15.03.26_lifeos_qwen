import { db } from '@/core/database';
import type { BaseEntity } from '@/core/entity';

/**
 * Сервис для экспорта и импорта данных
 */
export class DataExportImportService {
  /**
   * Экспортировать все данные из базы
   */
  async exportAllData(): Promise<Record<string, unknown[]>> {
    const tables = db.tables;
    const exportData: Record<string, unknown[]> = {};

    for (const table of tables) {
      const data = await table.toArray();
      exportData[table.name] = data;
    }

    exportData['_metadata'] = [
      {
        export_date: Date.now(),
        version: '1.0.0',
        tables: Object.keys(exportData).filter((k) => k !== '_metadata'),
      },
    ];

    return exportData;
  }

  /**
   * Скачать данные в файл
   */
  downloadExport(data: Record<string, unknown[]>, filename = 'lifeos-backup.json'): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Импортировать данные из файла
   */
  async importData(
    data: Record<string, unknown[]>
  ): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Очищаем базу перед импортом
      for (const table of db.tables) {
        const tableName = table.name;
        const importData = data[tableName] as BaseEntity[];

        if (importData && Array.isArray(importData)) {
          await table.clear();

          for (const item of importData) {
            if (item && typeof item === 'object' && 'id' in item) {
              await table.put(item);
            }
          }
        }
      }

      return { success: true, errors };
    } catch (error) {
      errors.push(
        `Ошибка импорта: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
      );
      return { success: false, errors };
    }
  }

  /**
   * Загрузить файл и распарсить JSON
   */
  async loadFromFile(file: File): Promise<Record<string, unknown[]>> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          resolve(json);
        } catch (error) {
          reject(new Error('Неверный формат JSON'));
        }
      };
      reader.onerror = () => reject(new Error('Ошибка чтения файла'));
      reader.readAsText(file);
    });
  }

  /**
   * Очистить все данные
   */
  async clearAllData(): Promise<void> {
    for (const table of db.tables) {
      await table.clear();
    }
  }

  /**
   * Получить статистику данных
   */
  async getDataStats(): Promise<Record<string, number>> {
    const stats: Record<string, number> = {};
    const tables = db.tables;

    for (const table of tables) {
      const count = await table.count();
      stats[table.name] = count;
    }

    return stats;
  }
}

export const dataExportImportService = new DataExportImportService();
