import type { WorkoutGoal } from '../entities';

export interface WorkoutPreset {
  id: string;
  name: string;
  description: string;
  goal: WorkoutGoal;
  duration_minutes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  exercises: Array<{
    exercise_id: string;
    exercise_name: string;
    sets: number;
    reps: number;
    weight_percent?: number; // процент от 1RM
    rest_seconds: number;
  }>;
}

export const workoutPresets: WorkoutPreset[] = [
  // ==================== FULL BODY ====================
  {
    id: 'full-body-beginner',
    name: 'Full Body (Начинающий)',
    description: 'Полная тренировка тела для новичков',
    goal: 'general_fitness',
    duration_minutes: 45,
    difficulty: 'beginner',
    exercises: [
      { exercise_id: 'squats', exercise_name: 'Приседания со штангой', sets: 3, reps: 10, rest_seconds: 90 },
      { exercise_id: 'bench-press', exercise_name: 'Жим лёжа', sets: 3, reps: 10, rest_seconds: 90 },
      { exercise_id: 'bent-over-row', exercise_name: 'Тяга штанги в наклоне', sets: 3, reps: 10, rest_seconds: 90 },
      { exercise_id: 'overhead-press', exercise_name: 'Армейский жим', sets: 3, reps: 10, rest_seconds: 90 },
      { exercise_id: 'romanian-deadlift', exercise_name: 'Румынская тяга', sets: 3, reps: 10, rest_seconds: 90 },
      { exercise_id: 'plank', exercise_name: 'Планка', sets: 3, reps: 30, rest_seconds: 60 },
    ],
  },
  {
    id: 'full-body-intermediate',
    name: 'Full Body (Средний)',
    description: 'Базовая тренировка на всё тело',
    goal: 'hypertrophy',
    duration_minutes: 60,
    difficulty: 'intermediate',
    exercises: [
      { exercise_id: 'squats', exercise_name: 'Приседания со штангой', sets: 4, reps: 8, weight_percent: 75, rest_seconds: 120 },
      { exercise_id: 'bench-press', exercise_name: 'Жим лёжа', sets: 4, reps: 8, weight_percent: 75, rest_seconds: 120 },
      { exercise_id: 'deadlift', exercise_name: 'Становая тяга', sets: 3, reps: 6, weight_percent: 80, rest_seconds: 180 },
      { exercise_id: 'pull-ups', exercise_name: 'Подтягивания', sets: 3, reps: 8, rest_seconds: 90 },
      { exercise_id: 'dumbbell-shoulder-press', exercise_name: 'Жим гантелей сидя', sets: 3, reps: 10, rest_seconds: 90 },
      { exercise_id: 'barbell-curl', exercise_name: 'Подъём штанги на бицепс', sets: 3, reps: 10, rest_seconds: 60 },
      { exercise_id: 'tricep-pushdown', exercise_name: 'Разгибание на блоке', sets: 3, reps: 12, rest_seconds: 60 },
    ],
  },
  {
    id: 'full-body-advanced',
    name: 'Full Body (Продвинутый)',
    description: 'Интенсивная тренировка всего тела',
    goal: 'strength',
    duration_minutes: 75,
    difficulty: 'advanced',
    exercises: [
      { exercise_id: 'squats', exercise_name: 'Приседания со штангой', sets: 5, reps: 5, weight_percent: 82, rest_seconds: 180 },
      { exercise_id: 'bench-press', exercise_name: 'Жим лёжа', sets: 5, reps: 5, weight_percent: 82, rest_seconds: 180 },
      { exercise_id: 'deadlift', exercise_name: 'Становая тяга', sets: 3, reps: 3, weight_percent: 90, rest_seconds: 240 },
      { exercise_id: 'weighted-pull-ups', exercise_name: 'Подтягивания с весом', sets: 4, reps: 6, rest_seconds: 120 },
      { exercise_id: 'barbell-row', exercise_name: 'Тяга штанги в наклоне', sets: 4, reps: 8, rest_seconds: 120 },
      { exercise_id: 'dips', exercise_name: 'Отжимания на брусьях', sets: 3, reps: 10, rest_seconds: 90 },
    ],
  },

  // ==================== UPPER BODY ====================
  {
    id: 'upper-body-push',
    name: 'Upper Body (Push)',
    description: 'Толкающая тренировка верха тела',
    goal: 'hypertrophy',
    duration_minutes: 55,
    difficulty: 'intermediate',
    exercises: [
      { exercise_id: 'bench-press', exercise_name: 'Жим лёжа', sets: 4, reps: 8, rest_seconds: 120 },
      { exercise_id: 'incline-bench-press', exercise_name: 'Жим на наклонной', sets: 3, reps: 10, rest_seconds: 90 },
      { exercise_id: 'overhead-press', exercise_name: 'Армейский жим', sets: 3, reps: 8, rest_seconds: 120 },
      { exercise_id: 'lateral-raises', exercise_name: 'Махи в стороны', sets: 3, reps: 12, rest_seconds: 60 },
      { exercise_id: 'tricep-dips', exercise_name: 'Отжимания на брусьях', sets: 3, reps: 10, rest_seconds: 90 },
      { exercise_id: 'overhead-tricep-extension', exercise_name: 'Французский жим', sets: 3, reps: 10, rest_seconds: 60 },
    ],
  },
  {
    id: 'upper-body-pull',
    name: 'Upper Body (Pull)',
    description: 'Тянущая тренировка верха тела',
    goal: 'hypertrophy',
    duration_minutes: 55,
    difficulty: 'intermediate',
    exercises: [
      { exercise_id: 'deadlift', exercise_name: 'Становая тяга', sets: 3, reps: 5, rest_seconds: 180 },
      { exercise_id: 'pull-ups', exercise_name: 'Подтягивания', sets: 4, reps: 8, rest_seconds: 90 },
      { exercise_id: 'bent-over-row', exercise_name: 'Тяга штанги в наклоне', sets: 4, reps: 8, rest_seconds: 90 },
      { exercise_id: 'face-pull', exercise_name: 'Face Pull', sets: 3, reps: 12, rest_seconds: 60 },
      { exercise_id: 'barbell-curl', exercise_name: 'Подъём штанги на бицепс', sets: 3, reps: 10, rest_seconds: 60 },
      { exercise_id: 'hammer-curls', exercise_name: 'Молотки', sets: 3, reps: 10, rest_seconds: 60 },
    ],
  },

  // ==================== LOWER BODY ====================
  {
    id: 'lower-body-squat',
    name: 'Lower Body (Squat Focus)',
    description: 'День ног с акцентом на приседания',
    goal: 'strength',
    duration_minutes: 60,
    difficulty: 'intermediate',
    exercises: [
      { exercise_id: 'squats', exercise_name: 'Приседания со штангой', sets: 5, reps: 5, rest_seconds: 180 },
      { exercise_id: 'front-squats', exercise_name: 'Фронтальные приседания', sets: 3, reps: 8, rest_seconds: 120 },
      { exercise_id: 'leg-press', exercise_name: 'Жим ногами', sets: 3, reps: 10, rest_seconds: 90 },
      { exercise_id: 'leg-extension', exercise_name: 'Разгибание ног', sets: 3, reps: 12, rest_seconds: 60 },
      { exercise_id: 'calf-raises', exercise_name: 'Подъём на носки', sets: 4, reps: 15, rest_seconds: 60 },
      { exercise_id: 'hanging-leg-raise', exercise_name: 'Подъём ног в висе', sets: 3, reps: 12, rest_seconds: 60 },
    ],
  },
  {
    id: 'lower-body-hinge',
    name: 'Lower Body (Hinge Focus)',
    description: 'День ног с акцентом на тягу',
    goal: 'strength',
    duration_minutes: 60,
    difficulty: 'intermediate',
    exercises: [
      { exercise_id: 'deadlift', exercise_name: 'Становая тяга', sets: 5, reps: 5, rest_seconds: 180 },
      { exercise_id: 'romanian-deadlift', exercise_name: 'Румынская тяга', sets: 3, reps: 8, rest_seconds: 120 },
      { exercise_id: 'leg-curl', exercise_name: 'Сгибание ног', sets: 3, reps: 10, rest_seconds: 60 },
      { exercise_id: 'bulgarian-split-squat', exercise_name: 'Болгарские сплит-приседания', sets: 3, reps: 10, rest_seconds: 90 },
      { exercise_id: 'glute-bridge', exercise_name: 'Ягодичный мост', sets: 3, reps: 12, rest_seconds: 60 },
      { exercise_id: 'cable-kickback', exercise_name: 'Отведение ноги в блоке', sets: 3, reps: 15, rest_seconds: 60 },
    ],
  },

  // ==================== PPL ====================
  {
    id: 'ppl-push',
    name: 'PPL - Push Day',
    description: 'Грудь, плечи, трицепс',
    goal: 'hypertrophy',
    duration_minutes: 65,
    difficulty: 'intermediate',
    exercises: [
      { exercise_id: 'bench-press', exercise_name: 'Жим лёжа', sets: 4, reps: 6, rest_seconds: 120 },
      { exercise_id: 'incline-dumbbell-press', exercise_name: 'Жим гантелей на наклонной', sets: 3, reps: 10, rest_seconds: 90 },
      { exercise_id: 'cable-fly', exercise_name: 'Сведение в кроссовере', sets: 3, reps: 12, rest_seconds: 60 },
      { exercise_id: 'overhead-press', exercise_name: 'Армейский жим', sets: 3, reps: 8, rest_seconds: 120 },
      { exercise_id: 'lateral-raises', exercise_name: 'Махи в стороны', sets: 3, reps: 15, rest_seconds: 60 },
      { exercise_id: 'tricep-pushdown', exercise_name: 'Разгибание на блоке', sets: 3, reps: 12, rest_seconds: 60 },
      { exercise_id: 'overhead-tricep-extension', exercise_name: 'Французский жим', sets: 3, reps: 10, rest_seconds: 60 },
    ],
  },
  {
    id: 'ppl-pull',
    name: 'PPL - Pull Day',
    description: 'Спина, задние дельты, бицепс',
    goal: 'hypertrophy',
    duration_minutes: 65,
    difficulty: 'intermediate',
    exercises: [
      { exercise_id: 'pull-ups', exercise_name: 'Подтягивания', sets: 4, reps: 8, rest_seconds: 90 },
      { exercise_id: 'bent-over-row', exercise_name: 'Тяга штанги в наклоне', sets: 4, reps: 8, rest_seconds: 90 },
      { exercise_id: 'lat-pulldown', exercise_name: 'Тяга верхнего блока', sets: 3, reps: 10, rest_seconds: 60 },
      { exercise_id: 'seated-cable-row', exercise_name: 'Тяга горизонтального блока', sets: 3, reps: 10, rest_seconds: 60 },
      { exercise_id: 'face-pull', exercise_name: 'Face Pull', sets: 3, reps: 15, rest_seconds: 60 },
      { exercise_id: 'barbell-curl', exercise_name: 'Подъём штанги на бицепс', sets: 3, reps: 10, rest_seconds: 60 },
      { exercise_id: 'inclined-curl', exercise_name: 'Подъём гантелей на наклонной', sets: 3, reps: 10, rest_seconds: 60 },
    ],
  },
  {
    id: 'ppl-legs',
    name: 'PPL - Legs Day',
    description: 'Ноги и пресс',
    goal: 'hypertrophy',
    duration_minutes: 70,
    difficulty: 'intermediate',
    exercises: [
      { exercise_id: 'squats', exercise_name: 'Приседания со штангой', sets: 4, reps: 6, rest_seconds: 180 },
      { exercise_id: 'romanian-deadlift', exercise_name: 'Румынская тяга', sets: 3, reps: 8, rest_seconds: 120 },
      { exercise_id: 'leg-press', exercise_name: 'Жим ногами', sets: 3, reps: 10, rest_seconds: 90 },
      { exercise_id: 'leg-extension', exercise_name: 'Разгибание ног', sets: 3, reps: 12, rest_seconds: 60 },
      { exercise_id: 'leg-curl', exercise_name: 'Сгибание ног', sets: 3, reps: 12, rest_seconds: 60 },
      { exercise_id: 'calf-raises', exercise_name: 'Подъём на носки', sets: 4, reps: 15, rest_seconds: 60 },
      { exercise_id: 'cable-crunch', exercise_name: 'Скручивания на блоке', sets: 3, reps: 15, rest_seconds: 60 },
    ],
  },

  // ==================== SPECIALIZED ====================
  {
    id: 'strength-5x5',
    name: '5x5 StrongLifts',
    description: 'Классическая программа силы 5 подходов по 5 повторений',
    goal: 'strength',
    duration_minutes: 50,
    difficulty: 'beginner',
    exercises: [
      { exercise_id: 'squats', exercise_name: 'Приседания со штангой', sets: 5, reps: 5, rest_seconds: 180 },
      { exercise_id: 'bench-press', exercise_name: 'Жим лёжа', sets: 5, reps: 5, rest_seconds: 180 },
      { exercise_id: 'barbell-row', exercise_name: 'Тяга штанги в наклоне', sets: 5, reps: 5, rest_seconds: 120 },
    ],
  },
  {
    id: 'cardio-hiit',
    name: 'HIIT Кардио',
    description: 'Высокоинтенсивная интервальная тренировка',
    goal: 'weight_loss',
    duration_minutes: 30,
    difficulty: 'intermediate',
    exercises: [
      { exercise_id: 'burpees', exercise_name: 'Бёрпи', sets: 4, reps: 15, rest_seconds: 60 },
      { exercise_id: 'mountain-climbers', exercise_name: 'Mountain Climbers', sets: 4, reps: 30, rest_seconds: 60 },
      { exercise_id: 'jumping-jacks', exercise_name: 'Jumping Jacks', sets: 4, reps: 45, rest_seconds: 60 },
      { exercise_id: 'jump-squat', exercise_name: 'Приседания с прыжком', sets: 4, reps: 20, rest_seconds: 60 },
    ],
  },
  {
    id: 'core-abs',
    name: 'Пресс и Кор',
    description: 'Интенсивная тренировка пресса',
    goal: 'general_fitness',
    duration_minutes: 25,
    difficulty: 'beginner',
    exercises: [
      { exercise_id: 'crunches', exercise_name: 'Скручивания', sets: 3, reps: 20, rest_seconds: 45 },
      { exercise_id: 'hanging-leg-raise', exercise_name: 'Подъём ног в висе', sets: 3, reps: 12, rest_seconds: 60 },
      { exercise_id: 'russian-twist', exercise_name: 'Русский твист', sets: 3, reps: 30, rest_seconds: 45 },
      { exercise_id: 'plank', exercise_name: 'Планка', sets: 3, reps: 60, rest_seconds: 60 },
      { exercise_id: 'dead-bug', exercise_name: 'Мёртвый жук', sets: 3, reps: 20, rest_seconds: 45 },
      { exercise_id: 'pallof-press', exercise_name: 'Паллоф жим', sets: 3, reps: 12, rest_seconds: 60 },
    ],
  },
];

export function getPresetById(id: string): WorkoutPreset | undefined {
  return workoutPresets.find((p) => p.id === id);
}

export function getPresetsByGoal(goal: WorkoutGoal): WorkoutPreset[] {
  return workoutPresets.filter((p) => p.goal === goal);
}

export function getPresetsByDifficulty(difficulty: string): WorkoutPreset[] {
  return workoutPresets.filter((p) => p.difficulty === difficulty);
}

