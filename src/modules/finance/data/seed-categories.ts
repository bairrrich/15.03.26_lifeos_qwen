import type { Category } from '../entities';

// Предустановленные категории расходов
export const expenseCategories: Array<
  Omit<Category, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'version' | 'sync_status' | 'last_synced_at'> & { parentName?: string }
> = [
    // Еда
    { user_id: 'system', name: '🍔 Еда', type: 'expense', color: '#ef4444', is_system: true },
    { user_id: 'system', name: '🛒 Продукты', type: 'expense', color: '#ef4444', is_system: true, parentName: '🍔 Еда' },
    { user_id: 'system', name: '🍽️ Рестораны', type: 'expense', color: '#ef4444', is_system: true, parentName: '🍔 Еда' },
    { user_id: 'system', name: '☕ Кофе', type: 'expense', color: '#ef4444', is_system: true, parentName: '🍔 Еда' },

    // Транспорт
    { user_id: 'system', name: '🚗 Транспорт', type: 'expense', color: '#f97316', is_system: true },
    { user_id: 'system', name: '⛽ Бензин', type: 'expense', color: '#f97316', is_system: true, parentName: '🚗 Транспорт' },
    { user_id: 'system', name: '🚌 Общественный транспорт', type: 'expense', color: '#f97316', is_system: true, parentName: '🚗 Транспорт' },
    { user_id: 'system', name: '🚕 Такси', type: 'expense', color: '#f97316', is_system: true, parentName: '🚗 Транспорт' },
    { user_id: 'system', name: '🔧 Ремонт авто', type: 'expense', color: '#f97316', is_system: true, parentName: '🚗 Транспорт' },

    // Жильё
    { user_id: 'system', name: '🏠 Жильё', type: 'expense', color: '#eab308', is_system: true },
    { user_id: 'system', name: '💰 Аренда', type: 'expense', color: '#eab308', is_system: true, parentName: '🏠 Жильё' },
    { user_id: 'system', name: '📊 Коммунальные услуги', type: 'expense', color: '#eab308', is_system: true, parentName: '🏠 Жильё' },
    { user_id: 'system', name: '🔨 Ремонт', type: 'expense', color: '#eab308', is_system: true, parentName: '🏠 Жильё' },
    { user_id: 'system', name: '🛒 Товары для дома', type: 'expense', color: '#eab308', is_system: true, parentName: '🏠 Жильё' },

    // Здоровье
    { user_id: 'system', name: '💊 Здоровье', type: 'expense', color: '#22c55e', is_system: true },
    { user_id: 'system', name: '🏥 Медицина', type: 'expense', color: '#22c55e', is_system: true, parentName: '💊 Здоровье' },
    { user_id: 'system', name: '💉 Лекарства', type: 'expense', color: '#22c55e', is_system: true, parentName: '💊 Здоровье' },
    { user_id: 'system', name: '🏋️ Спорт', type: 'expense', color: '#22c55e', is_system: true, parentName: '💊 Здоровье' },

    // Развлечения
    { user_id: 'system', name: '🎬 Развлечения', type: 'expense', color: '#8b5cf6', is_system: true },
    { user_id: 'system', name: '🎟️ Кино/Театр', type: 'expense', color: '#8b5cf6', is_system: true, parentName: '🎬 Развлечения' },
    { user_id: 'system', name: '🎮 Игры', type: 'expense', color: '#8b5cf6', is_system: true, parentName: '🎬 Развлечения' },
    { user_id: 'system', name: '📺 Подписки', type: 'expense', color: '#8b5cf6', is_system: true, parentName: '🎬 Развлечения' },

    // Покупки
    { user_id: 'system', name: '🛍️ Покупки', type: 'expense', color: '#ec4899', is_system: true },
    { user_id: 'system', name: '👕 Одежда', type: 'expense', color: '#ec4899', is_system: true, parentName: '🛍️ Покупки' },
    { user_id: 'system', name: '📱 Электроника', type: 'expense', color: '#ec4899', is_system: true, parentName: '🛍️ Покупки' },
    { user_id: 'system', name: '🎁 Подарки', type: 'expense', color: '#ec4899', is_system: true, parentName: '🛍️ Покупки' },

    // Образование
    { user_id: 'system', name: '📚 Образование', type: 'expense', color: '#06b6d4', is_system: true },
    { user_id: 'system', name: '🎓 Курсы', type: 'expense', color: '#06b6d4', is_system: true, parentName: '📚 Образование' },
    { user_id: 'system', name: '📖 Книги', type: 'expense', color: '#06b6d4', is_system: true, parentName: '📚 Образование' },

    // Финансы
    { user_id: 'system', name: '💵 Финансы', type: 'expense', color: '#6366f1', is_system: true },
    { user_id: 'system', name: '🏦 Страхование', type: 'expense', color: '#6366f1', is_system: true, parentName: '💵 Финансы' },
    { user_id: 'system', name: '📈 Инвестиции', type: 'expense', color: '#6366f1', is_system: true, parentName: '💵 Финансы' },
    { user_id: 'system', name: '💳 Кредиты', type: 'expense', color: '#6366f1', is_system: true, parentName: '💵 Финансы' },

    // Другое
    { user_id: 'system', name: '📦 Другое', type: 'expense', color: '#6b7280', is_system: true },
  ];

// Предустановленные категории доходов
export const incomeCategories: Array<
  Omit<Category, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'version' | 'sync_status' | 'last_synced_at'> & { parentName?: string }
> = [
    // Работа
    { user_id: 'system', name: '💼 Работа', type: 'income', color: '#22c55e', is_system: true },
    { user_id: 'system', name: '💰 Зарплата', type: 'income', color: '#22c55e', is_system: true, parentName: '💼 Работа' },
    { user_id: 'system', name: '🎁 Премия', type: 'income', color: '#22c55e', is_system: true, parentName: '💼 Работа' },

    // Бизнес
    { user_id: 'system', name: '🏢 Бизнес', type: 'income', color: '#84cc16', is_system: true },
    { user_id: 'system', name: '📦 Продажа товаров', type: 'income', color: '#84cc16', is_system: true, parentName: '🏢 Бизнес' },
    { user_id: 'system', name: '💡 Услуги', type: 'income', color: '#84cc16', is_system: true, parentName: '🏢 Бизнес' },

    // Инвестиции
    { user_id: 'system', name: '📈 Инвестиции', type: 'income', color: '#06b6d4', is_system: true },
    { user_id: 'system', name: '💵 Дивиденды', type: 'income', color: '#06b6d4', is_system: true, parentName: '📈 Инвестиции' },
    { user_id: 'system', name: '🏠 Аренда', type: 'income', color: '#06b6d4', is_system: true, parentName: '📈 Инвестиции' },
    { user_id: 'system', name: '📊 Проценты', type: 'income', color: '#06b6d4', is_system: true, parentName: '📈 Инвестиции' },

    // Другое
    { user_id: 'system', name: '🎁 Другое', type: 'income', color: '#6b7280', is_system: true },
    { user_id: 'system', name: '🎁 Подарки', type: 'income', color: '#6b7280', is_system: true, parentName: '🎁 Другое' },
    { user_id: 'system', name: '💸 Возвраты', type: 'income', color: '#6b7280', is_system: true, parentName: '🎁 Другое' },
  ];

// Функция для инициализации seed-категорий
export async function initializeSeedCategories(categoryService: any): Promise<void> {
  const SEEDED_KEY = 'finance_categories_seeded_v1';

  // Проверяем, были ли уже добавлены категории
  if (typeof localStorage !== 'undefined') {
    const alreadySeeded = localStorage.getItem(SEEDED_KEY);
    if (alreadySeeded) {
      console.log('[Seed] Categories already seeded, skipping');
      return;
    }
  }

  try {
    const existing = await categoryService.getAll();

    // Если уже есть категории, не добавляем (защита от дублирования)
    if (existing.length > 0) {
      console.log(`[Seed] Found ${existing.length} existing categories, skipping seed`);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(SEEDED_KEY, 'true');
      }
      return;
    }

    // Сначала создаём родительские категории (без parentName)
    const parentCategories = [...expenseCategories, ...incomeCategories].filter(c => !c.parentName);
    const createdParents: Record<string, string> = {}; // name -> id mapping

    for (const category of parentCategories) {
      const created = await categoryService.create({
        ...category,
        id: crypto.randomUUID(),
        created_at: Date.now(),
        updated_at: Date.now(),
        version: 1,
        sync_status: 'synced',
      });
      createdParents[category.name] = created.id;
    }

    // Затем создаём подкатегории с правильными parent_id
    const subCategories = [...expenseCategories, ...incomeCategories].filter(c => c.parentName);

    for (const category of subCategories) {
      // Находим ID родительской категории по имени
      const parentId = createdParents[category.parentName!];
      if (parentId) {
        await categoryService.create({
          ...category,
          parent_id: parentId,
          id: crypto.randomUUID(),
          created_at: Date.now(),
          updated_at: Date.now(),
          version: 1,
          sync_status: 'synced',
        });
      }
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SEEDED_KEY, 'true');
    }

    console.log(`[Seed] Added ${parentCategories.length + subCategories.length} finance categories`);
  } catch (error) {
    console.error('[Seed] Error initializing categories:', error);
  }
}
