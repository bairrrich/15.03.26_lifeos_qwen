'use client';

import { ExerciseService } from '../services';
import { seedExercises } from '../data/seed-exercises';

const SEEDED_KEY = 'workouts_seeded_v1';

export async function initializeSeedExercises(): Promise<void> {
  // Проверяем, были ли уже добавлены упражнения
  if (typeof localStorage !== 'undefined') {
    const alreadySeeded = localStorage.getItem(SEEDED_KEY);
    if (alreadySeeded) {
      return;
    }
  }

  const exerciseService = new ExerciseService();

  try {
    const existing = await exerciseService.getAll();

    // Если уже есть упражнения, не добавляем
    if (existing.length > 0) {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(SEEDED_KEY, 'true');
      }
      return;
    }

    // Добавляем все упражнения из seed
    for (const exercise of seedExercises) {
      await exerciseService.create(exercise);
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SEEDED_KEY, 'true');
    }

    console.log(`[Seed] Added ${seedExercises.length} exercises`);
  } catch (error) {
    console.error('[Seed] Error initializing exercises:', error);
  }
}

export async function resetSeedExercises(): Promise<void> {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(SEEDED_KEY);
  }
  console.log('[Seed] Reset - exercises will be re-added on next load');
}
