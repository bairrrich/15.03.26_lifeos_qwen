'use client';

import { CategoryService } from '../services';
import { initializeSeedCategories } from '../data/seed-categories';

const categoryService = new CategoryService();

export async function initializeFinanceCategories(): Promise<void> {
  await initializeSeedCategories(categoryService);
}

export async function resetFinanceCategories(): Promise<void> {
  // Удаляем все категории
  const categories = await categoryService.getAll();
  const deletePromises = categories.map(cat => categoryService.delete(cat.id).catch(() => { }));
  await Promise.all(deletePromises);

  // Сбрасываем флаги
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('finance_categories_seeded_v1');
  }
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem('finance_categories_init');
  }

  // Пересоздаем категории с правильной иерархией
  await initializeSeedCategories(categoryService);

  console.log('[Seed] Finance categories reset and re-initialized');
}

