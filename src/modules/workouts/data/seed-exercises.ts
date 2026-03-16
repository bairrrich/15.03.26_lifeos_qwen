import type { Exercise } from '../entities';

export const seedExercises: Omit<Exercise, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'version' | 'sync_status' | 'last_synced_at'>[] = [
  // Chest - Грудь
  { user_id: 'system', name: 'Жим лёжа', description: 'Базовое упражнение для груди', muscle_group: 'chest', equipment: 'barbell', difficulty: 'intermediate', is_compound: true },
  { user_id: 'system', name: 'Жим лёжа на наклонной', description: 'Акцент на верх груди', muscle_group: 'chest', equipment: 'barbell', difficulty: 'intermediate', is_compound: true },
  { user_id: 'system', name: 'Жим гантелей лёжа', description: 'Большая амплитуда движения', muscle_group: 'chest', equipment: 'dumbbell', difficulty: 'intermediate', is_compound: true },
  { user_id: 'system', name: 'Жим гантелей на наклонной', description: 'Верх груди с гантелями', muscle_group: 'chest', equipment: 'dumbbell', difficulty: 'intermediate', is_compound: true },
  { user_id: 'system', name: 'Отжимания на брусьях', description: 'Грудной стиль отжиманий', muscle_group: 'chest', equipment: 'bodyweight', difficulty: 'intermediate', is_compound: true },
  { user_id: 'system', name: 'Отжимания от пола', description: 'Классические отжимания', muscle_group: 'chest', equipment: 'bodyweight', difficulty: 'beginner', is_compound: true },
  { user_id: 'system', name: 'Разводка гантелей', description: 'Изоляция грудных', muscle_group: 'chest', equipment: 'dumbbell', difficulty: 'beginner', is_compound: false },
  { user_id: 'system', name: 'Кроссовер', description: 'Сведение рук в блоке', muscle_group: 'chest', equipment: 'cable', difficulty: 'beginner', is_compound: false },
  { user_id: 'system', name: 'Пуловер', description: 'Растяжение грудных и широчайших', muscle_group: 'chest', equipment: 'dumbbell', difficulty: 'intermediate', is_compound: false },
  { user_id: 'system', name: 'Жим в тренажёре', description: 'Безопасный жим', muscle_group: 'chest', equipment: 'machine', difficulty: 'beginner', is_compound: false },

  // Back - Спина
  { user_id: 'system', name: 'Становая тяга', description: 'Королева всех упражнений', muscle_group: 'back', equipment: 'barbell', difficulty: 'advanced', is_compound: true },
  { user_id: 'system', name: 'Подтягивания', description: 'Базовое для спины', muscle_group: 'back', equipment: 'bodyweight', difficulty: 'intermediate', is_compound: true },
  { user_id: 'system', name: 'Тяга штанги в наклоне', description: 'Толщина спины', muscle_group: 'back', equipment: 'barbell', difficulty: 'intermediate', is_compound: true },
  { user_id: 'system', name: 'Тяга гантели в наклоне', description: 'Односторонняя тяга', muscle_group: 'back', equipment: 'dumbbell', difficulty: 'intermediate', is_compound: true },
  { user_id: 'system', name: 'Тяга верхнего блока', description: 'Аналог подтягиваний', muscle_group: 'back', equipment: 'cable', difficulty: 'beginner', is_compound: true },
  { user_id: 'system', name: 'Тяга горизонтального блока', description: 'Тяга к поясу', muscle_group: 'back', equipment: 'cable', difficulty: 'beginner', is_compound: true },
  { user_id: 'system', name: 'Гиперэкстензия', description: 'Разгибание спины', muscle_group: 'back', equipment: 'machine', difficulty: 'beginner', is_compound: false },
  { user_id: 'system', name: 'Шраги', description: 'Трапеции', muscle_group: 'back', equipment: 'barbell', difficulty: 'beginner', is_compound: false },
  { user_id: 'system', name: 'Шраги с гантелями', description: 'Трапеции с гантелями', muscle_group: 'back', equipment: 'dumbbell', difficulty: 'beginner', is_compound: false },
  { user_id: 'system', name: 'Пуловер на блоке', description: 'Изоляция широчайших', muscle_group: 'back', equipment: 'cable', difficulty: 'beginner', is_compound: false },
  { user_id: 'system', name: 'Румынская тяга', description: 'Бицепс бедра и спина', muscle_group: 'back', equipment: 'barbell', difficulty: 'intermediate', is_compound: true },
  { user_id: 'system', name: 'Тяга Т-грифа', description: 'Тяга к груди', muscle_group: 'back', equipment: 'barbell', difficulty: 'intermediate', is_compound: true },

  // Legs - Ноги
  { user_id: 'system', name: 'Приседания со штангой', description: 'Король упражнений', muscle_group: 'legs', equipment: 'barbell', difficulty: 'intermediate', is_compound: true },
  { user_id: 'system', name: 'Фронтальные приседания', description: 'Акцент на квадрицепсы', muscle_group: 'legs', equipment: 'barbell', difficulty: 'advanced', is_compound: true },
  { user_id: 'system', name: 'Жим ногами', description: 'Безопасная альтернатива', muscle_group: 'legs', equipment: 'machine', difficulty: 'beginner', is_compound: true },
  { user_id: 'system', name: 'Выпады', description: 'Унилатеральное упражнение', muscle_group: 'legs', equipment: 'bodyweight', difficulty: 'beginner', is_compound: true },
  { user_id: 'system', name: 'Выпады с гантелями', description: 'Выпады с отягощением', muscle_group: 'legs', equipment: 'dumbbell', difficulty: 'intermediate', is_compound: true },
  { user_id: 'system', name: 'Болгарские сплит-приседания', description: 'Сплит-присед', muscle_group: 'legs', equipment: 'bodyweight', difficulty: 'intermediate', is_compound: true },
  { user_id: 'system', name: 'Разгибание ног', description: 'Изоляция квадрицепсов', muscle_group: 'legs', equipment: 'machine', difficulty: 'beginner', is_compound: false },
  { user_id: 'system', name: 'Сгибание ног', description: 'Бицепс бедра', muscle_group: 'legs', equipment: 'machine', difficulty: 'beginner', is_compound: false },
  { user_id: 'system', name: 'Подъём на носки', description: 'Икры стоя', muscle_group: 'legs', equipment: 'machine', difficulty: 'beginner', is_compound: false },
  { user_id: 'system', name: 'Подъём на носки сидя', description: 'Камбаловидная мышца', muscle_group: 'legs', equipment: 'machine', difficulty: 'beginner', is_compound: false },
  { user_id: 'system', name: 'Гоблет приседания', description: 'Присед с гантелью', muscle_group: 'legs', equipment: 'kettlebell', difficulty: 'beginner', is_compound: true },
  { user_id: 'system', name: 'Ягодичный мост', description: 'Акцент на ягодицы', muscle_group: 'legs', equipment: 'barbell', difficulty: 'beginner', is_compound: true },
  { user_id: 'system', name: 'Отведение ноги в блоке', description: 'Изоляция ягодиц', muscle_group: 'legs', equipment: 'cable', difficulty: 'beginner', is_compound: false },

  // Shoulders - Плечи
  { user_id: 'system', name: 'Армейский жим', description: 'Жим штанги стоя', muscle_group: 'shoulders', equipment: 'barbell', difficulty: 'intermediate', is_compound: true },
  { user_id: 'system', name: 'Жим гантелей сидя', description: 'Жим на плечи', muscle_group: 'shoulders', equipment: 'dumbbell', difficulty: 'intermediate', is_compound: true },
  { user_id: 'system', name: 'Махи гантелями в стороны', description: 'Средняя дельта', muscle_group: 'shoulders', equipment: 'dumbbell', difficulty: 'beginner', is_compound: false },
  { user_id: 'system', name: 'Махи в наклоне', description: 'Задняя дельта', muscle_group: 'shoulders', equipment: 'dumbbell', difficulty: 'beginner', is_compound: false },
  { user_id: 'system', name: 'Махи перед собой', description: 'Передняя дельта', muscle_group: 'shoulders', equipment: 'dumbbell', difficulty: 'beginner', is_compound: false },
  { user_id: 'system', name: 'Тяга к подбородку', description: 'Протяжка', muscle_group: 'shoulders', equipment: 'barbell', difficulty: 'intermediate', is_compound: true },
  { user_id: 'system', name: 'Разведение в кроссовере', description: 'Махи в блоке', muscle_group: 'shoulders', equipment: 'cable', difficulty: 'beginner', is_compound: false },
  { user_id: 'system', name: 'Жим в тренажёре', description: 'Безопасный жим', muscle_group: 'shoulders', equipment: 'machine', difficulty: 'beginner', is_compound: true },
  { user_id: 'system', name: 'Face Pull', description: 'Задняя дельта и ротаторы', muscle_group: 'shoulders', equipment: 'cable', difficulty: 'beginner', is_compound: false },

  // Arms - Руки
  { user_id: 'system', name: 'Подъём штанги на бицепс', description: 'Классика на бицепс', muscle_group: 'arms', equipment: 'barbell', difficulty: 'beginner', is_compound: false },
  { user_id: 'system', name: 'Подъём гантелей на бицепс', description: 'Бицепс с супинацией', muscle_group: 'arms', equipment: 'dumbbell', difficulty: 'beginner', is_compound: false },
  { user_id: 'system', name: 'Молотки', description: 'Бицепс и брахиалис', muscle_group: 'arms', equipment: 'dumbbell', difficulty: 'beginner', is_compound: false },
  { user_id: 'system', name: 'Концентрированный подъём', description: 'Пик бицепса', muscle_group: 'arms', equipment: 'dumbbell', difficulty: 'beginner', is_compound: false },
  { user_id: 'system', name: 'Подъём на скамье Скотта', description: 'Изоляция бицепса', muscle_group: 'arms', equipment: 'barbell', difficulty: 'intermediate', is_compound: false },
  { user_id: 'system', name: 'Французский жим', description: 'Трицепс лёжа', muscle_group: 'arms', equipment: 'barbell', difficulty: 'intermediate', is_compound: false },
  { user_id: 'system', name: 'Разгибание на блоке', description: 'Трицепс на блоке', muscle_group: 'arms', equipment: 'cable', difficulty: 'beginner', is_compound: false },
  { user_id: 'system', name: 'Отжимания на брусьях', description: 'Трицепс на брусьях', muscle_group: 'arms', equipment: 'bodyweight', difficulty: 'intermediate', is_compound: true },
  { user_id: 'system', name: 'Жим узким хватом', description: 'Базовое на трицепс', muscle_group: 'arms', equipment: 'barbell', difficulty: 'intermediate', is_compound: true },
  { user_id: 'system', name: 'Разгибание с гантелью', description: 'Трицепс из-за головы', muscle_group: 'arms', equipment: 'dumbbell', difficulty: 'beginner', is_compound: false },
  { user_id: 'system', name: 'Обратные отжимания', description: 'Трицепс от скамьи', muscle_group: 'arms', equipment: 'bodyweight', difficulty: 'beginner', is_compound: false },
  { user_id: 'system', name: 'Подъём на бицепс обратным хватом', description: 'Брахиорадиалис', muscle_group: 'arms', equipment: 'barbell', difficulty: 'beginner', is_compound: false },

  // Core - Пресс
  { user_id: 'system', name: 'Скручивания', description: 'Классический пресс', muscle_group: 'core', equipment: 'bodyweight', difficulty: 'beginner', is_compound: false },
  { user_id: 'system', name: 'Подъём ног в висе', description: 'Нижний пресс', muscle_group: 'core', equipment: 'bodyweight', difficulty: 'intermediate', is_compound: false },
  { user_id: 'system', name: 'Планка', description: 'Изометрия кора', muscle_group: 'core', equipment: 'bodyweight', difficulty: 'beginner', is_compound: false },
  { user_id: 'system', name: 'Русский твист', description: 'Косые мышцы', muscle_group: 'core', equipment: 'bodyweight', difficulty: 'beginner', is_compound: false },
  { user_id: 'system', name: 'Велосипед', description: 'Косые и прямая', muscle_group: 'core', equipment: 'bodyweight', difficulty: 'beginner', is_compound: false },
  { user_id: 'system', name: 'Мёртвый жук', description: 'Стабилизация', muscle_group: 'core', equipment: 'bodyweight', difficulty: 'beginner', is_compound: false },
  { user_id: 'system', name: 'Паллоф жим', description: 'Антиротация', muscle_group: 'core', equipment: 'cable', difficulty: 'intermediate', is_compound: false },
  { user_id: 'system', name: 'Ролик для пресса', description: 'Раскатка', muscle_group: 'core', equipment: 'other', difficulty: 'intermediate', is_compound: false },
  { user_id: 'system', name: 'Боковая планка', description: 'Косые изометрия', muscle_group: 'core', equipment: 'bodyweight', difficulty: 'beginner', is_compound: false },
  { user_id: 'system', name: 'Скручивания на блоке', description: 'Пресс с отягощением', muscle_group: 'core', equipment: 'cable', difficulty: 'intermediate', is_compound: false },

  // Cardio - Кардио
  { user_id: 'system', name: 'Бег', description: 'Классическое кардио', muscle_group: 'cardio', equipment: 'bodyweight', difficulty: 'beginner', is_compound: false },
  { user_id: 'system', name: 'Велотренажёр', description: 'Низкоударное кардио', muscle_group: 'cardio', equipment: 'machine', difficulty: 'beginner', is_compound: false },
  { user_id: 'system', name: 'Гребной тренажёр', description: 'Полное тело', muscle_group: 'cardio', equipment: 'machine', difficulty: 'intermediate', is_compound: true },
  { user_id: 'system', name: 'Эллипс', description: 'Без ударной нагрузки', muscle_group: 'cardio', equipment: 'machine', difficulty: 'beginner', is_compound: false },
  { user_id: 'system', name: 'Прыжки на скакалке', description: 'Координация и кардио', muscle_group: 'cardio', equipment: 'other', difficulty: 'beginner', is_compound: false },
  { user_id: 'system', name: 'Бёрпи', description: 'Взрывное кардио', muscle_group: 'cardio', equipment: 'bodyweight', difficulty: 'intermediate', is_compound: true },
  { user_id: 'system', name: 'Mountain Climbers', description: 'Альпинист', muscle_group: 'cardio', equipment: 'bodyweight', difficulty: 'beginner', is_compound: false },
  { user_id: 'system', name: 'Jumping Jacks', description: 'Джампинг Джек', muscle_group: 'cardio', equipment: 'bodyweight', difficulty: 'beginner', is_compound: false },

  // Other - Другое
  { user_id: 'system', name: 'Прогулка фермера', description: 'Ходьба с гантелями', muscle_group: 'other', equipment: 'kettlebell', difficulty: 'intermediate', is_compound: true },
  { user_id: 'system', name: 'Броски мяча', description: 'Взрывная сила', muscle_group: 'other', equipment: 'other', difficulty: 'intermediate', is_compound: true },
  { user_id: 'system', name: 'Бой с тенью', description: 'Кардио и координация', muscle_group: 'other', equipment: 'bodyweight', difficulty: 'beginner', is_compound: false },
];
