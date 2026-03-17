/**
 * Centralized category color system for LifeOS
 * Provides consistent colors across all modules
 */

export const CATEGORY_COLORS = {
    // Universal colors for common categories
    fitness: {
        bg: 'bg-red-500',
        text: 'text-red-700',
        border: 'border-red-200',
        light: 'bg-red-50',
    },
    health: {
        bg: 'bg-green-500',
        text: 'text-green-700',
        border: 'border-green-200',
        light: 'bg-green-50',
    },
    finance: {
        bg: 'bg-blue-500',
        text: 'text-blue-700',
        border: 'border-blue-200',
        light: 'bg-blue-50',
    },
    learning: {
        bg: 'bg-purple-500',
        text: 'text-purple-700',
        border: 'border-purple-200',
        light: 'bg-purple-50',
    },
    career: {
        bg: 'bg-orange-500',
        text: 'text-orange-700',
        border: 'border-orange-200',
        light: 'bg-orange-50',
    },
    personal: {
        bg: 'bg-pink-500',
        text: 'text-pink-700',
        border: 'border-pink-200',
        light: 'bg-pink-50',
    },
    other: {
        bg: 'bg-gray-500',
        text: 'text-gray-700',
        border: 'border-gray-200',
        light: 'bg-gray-50',
    },

    // Nutrition specific
    breakfast: {
        bg: 'bg-yellow-500',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
        light: 'bg-yellow-50',
    },
    lunch: {
        bg: 'bg-orange-500',
        text: 'text-orange-700',
        border: 'border-orange-200',
        light: 'bg-orange-50',
    },
    dinner: {
        bg: 'bg-indigo-500',
        text: 'text-indigo-700',
        border: 'border-indigo-200',
        light: 'bg-indigo-50',
    },
    snack: {
        bg: 'bg-pink-500',
        text: 'text-pink-700',
        border: 'border-pink-200',
        light: 'bg-pink-50',
    },

    // Beauty specific
    skincare: {
        bg: 'bg-cyan-500',
        text: 'text-cyan-700',
        border: 'border-cyan-200',
        light: 'bg-cyan-50',
    },
    haircare: {
        bg: 'bg-amber-500',
        text: 'text-amber-700',
        border: 'border-amber-200',
        light: 'bg-amber-50',
    },
    makeup: {
        bg: 'bg-rose-500',
        text: 'text-rose-700',
        border: 'border-rose-200',
        light: 'bg-rose-50',
    },
    fragrance: {
        bg: 'bg-violet-500',
        text: 'text-violet-700',
        border: 'border-violet-200',
        light: 'bg-violet-50',
    },
    body: {
        bg: 'bg-emerald-500',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        light: 'bg-emerald-50',
    },

    // Finance specific
    income: {
        bg: 'bg-green-500',
        text: 'text-green-700',
        border: 'border-green-200',
        light: 'bg-green-50',
    },
    expense: {
        bg: 'bg-red-500',
        text: 'text-red-700',
        border: 'border-red-200',
        light: 'bg-red-50',
    },
    transfer: {
        bg: 'bg-blue-500',
        text: 'text-blue-700',
        border: 'border-blue-200',
        light: 'bg-blue-50',
    },
    investment: {
        bg: 'bg-purple-500',
        text: 'text-purple-700',
        border: 'border-purple-200',
        light: 'bg-purple-50',
    },

    // Workout specific
    cardio: {
        bg: 'bg-red-500',
        text: 'text-red-700',
        border: 'border-red-200',
        light: 'bg-red-50',
    },
    strength: {
        bg: 'bg-orange-500',
        text: 'text-orange-700',
        border: 'border-orange-200',
        light: 'bg-orange-50',
    },
    flexibility: {
        bg: 'bg-green-500',
        text: 'text-green-700',
        border: 'border-green-200',
        light: 'bg-green-50',
    },
    sports: {
        bg: 'bg-blue-500',
        text: 'text-blue-700',
        border: 'border-blue-200',
        light: 'bg-blue-50',
    },
} as const;

export type CategoryColorKey = keyof typeof CATEGORY_COLORS;

/**
 * Get color configuration for a category
 */
export function getCategoryColor(category: string, variant: 'bg' | 'text' | 'border' | 'light' = 'bg') {
    const colorConfig = CATEGORY_COLORS[category as CategoryColorKey];
    if (!colorConfig) {
        // Fallback to 'other' category
        return CATEGORY_COLORS.other[variant];
    }
    return colorConfig[variant];
}

/**
 * Get all available categories for a specific module
 */
export function getModuleCategories(module: 'goals' | 'beauty' | 'finance' | 'workouts' | 'nutrition') {
    const moduleMappings = {
        goals: ['fitness', 'health', 'finance', 'learning', 'career', 'personal', 'other'],
        beauty: ['skincare', 'haircare', 'makeup', 'fragrance', 'body', 'other'],
        finance: ['income', 'expense', 'transfer', 'investment', 'other'],
        workouts: ['cardio', 'strength', 'flexibility', 'sports', 'other'],
        nutrition: ['breakfast', 'lunch', 'dinner', 'snack', 'other'],
    };

    return moduleMappings[module] || ['other'];
}