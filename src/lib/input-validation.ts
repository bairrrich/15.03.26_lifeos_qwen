/**
 * Input Validation and Sanitization Utilities
 * 
 * Provides functions to validate and sanitize user input
 * to prevent XSS, injection, and other security vulnerabilities
 */

/**
 * Maximum allowed lengths for various input fields
 */
export const INPUT_LIMITS = {
    // User profile fields
    full_name: 100,
    bio: 500,
    website: 2048,
    location: 200,
    avatar_url: 2048,

    // Finance fields
    account_name: 100,
    description: 500,
    merchant: 200,
    receipt_url: 2048,

    // Categories
    category_name: 100,

    // Habits
    habit_name: 100,
    habit_description: 500,
    reminder_time: 10,

    // Nutrition
    notes: 1000,

    // General
    generic_text: 1000,
    url: 2048,
};

/**
 * Sanitize a string to prevent XSS attacks
 * - Removes HTML tags
 * - Escapes special characters
 * - Trims whitespace
 */
export function sanitizeString(input: unknown): string {
    if (typeof input !== 'string') {
        return '';
    }

    // Trim whitespace
    let sanitized = input.trim();

    // Remove HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');

    // Escape HTML entities
    sanitized = sanitized
        .replace(/&/g, '&')
        .replace(/</g, '<')
        .replace(/>/g, '>')
        .replace(/"/g, '"')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');

    return sanitized;
}

/**
 * Validate and sanitize a URL
 * Only allows http, https, and data URLs
 */
export function sanitizeUrl(input: unknown): string | null {
    if (typeof input !== 'string' || !input.trim()) {
        return null;
    }

    const url = input.trim().toLowerCase();

    // Only allow http, https, and data URLs
    if (!url.startsWith('http://') &&
        !url.startsWith('https://') &&
        !url.startsWith('data:')) {
        return null;
    }

    // Basic URL validation
    try {
        const parsed = new URL(url);
        // Block javascript: and data: URLs (except safe data URLs)
        if (url.startsWith('javascript:') ||
            (url.startsWith('data:') && !url.startsWith('data:image/'))) {
            return null;
        }
        return input.trim();
    } catch {
        return null;
    }
}

/**
 * Validate a positive number
 */
export function validatePositiveNumber(input: unknown): number | null {
    if (typeof input !== 'number' || isNaN(input) || !isFinite(input)) {
        return null;
    }
    if (input <= 0) {
        return null;
    }
    // Limit to reasonable values (max 1 trillion)
    if (input > 1_000_000_000_000) {
        return null;
    }
    return input;
}

/**
 * Validate a non-negative number
 */
export function validateNonNegativeNumber(input: unknown): number | null {
    if (typeof input !== 'number' || isNaN(input) || !isFinite(input)) {
        return null;
    }
    if (input < 0) {
        return null;
    }
    // Limit to reasonable values
    if (input > 1_000_000_000_000) {
        return null;
    }
    return input;
}

/**
 * Validate an integer
 */
export function validateInteger(input: unknown): number | null {
    const num = validatePositiveNumber(input);
    if (num === null) {
        return null;
    }
    if (!Number.isInteger(num)) {
        return null;
    }
    return num;
}

/**
 * Validate email format
 */
export function validateEmail(input: unknown): string | null {
    if (typeof input !== 'string') {
        return null;
    }

    const email = input.trim().toLowerCase();

    // Basic email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return null;
    }

    // Max length check
    if (email.length > 254) {
        return null;
    }

    return email;
}

/**
 * Truncate string to maximum length
 */
export function truncateString(input: unknown, maxLength: number): string {
    const str = typeof input === 'string' ? input : '';
    if (str.length <= maxLength) {
        return str;
    }
    return str.substring(0, maxLength);
}

/**
 * Validate string length
 */
export function validateLength(input: unknown, minLength: number, maxLength: number): string | null {
    if (typeof input !== 'string') {
        return null;
    }

    const trimmed = input.trim();
    if (trimmed.length < minLength || trimmed.length > maxLength) {
        return null;
    }

    return trimmed;
}

/**
 * Validate UUID format
 */
export function validateUuid(input: unknown): string | null {
    if (typeof input !== 'string') {
        return null;
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(input)) {
        return null;
    }

    return input;
}

/**
 * Validate ISO date string or timestamp
 */
export function validateDate(input: unknown): number | null {
    if (typeof input === 'number') {
        // Timestamp validation
        const now = Date.now();
        const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;
        const oneYearAhead = now + 365 * 24 * 60 * 60 * 1000;

        if (input < oneYearAgo || input > oneYearAhead) {
            return null;
        }
        return input;
    }

    if (typeof input === 'string') {
        const timestamp = new Date(input).getTime();
        if (isNaN(timestamp)) {
            return null;
        }
        return validateDate(timestamp);
    }

    return null;
}

/**
 * Validate hex color format
 */
export function validateHexColor(input: unknown): string | null {
    if (typeof input !== 'string') {
        return null;
    }

    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!colorRegex.test(input)) {
        return null;
    }

    return input.toLowerCase();
}

/**
 * Sanitize and validate user profile input
 */
export interface SanitizedProfileInput {
    full_name?: string;
    avatar_url?: string | null;
    bio?: string | null;
    website?: string | null;
    location?: string | null;
}

export function sanitizeProfileInput(input: unknown): SanitizedProfileInput | null {
    if (typeof input !== 'object' || input === null) {
        return null;
    }

    const data = input as Record<string, unknown>;
    const result: SanitizedProfileInput = {};

    if (data.full_name !== undefined) {
        const name = sanitizeString(data.full_name);
        const validated = validateLength(name, 1, INPUT_LIMITS.full_name);
        if (validated !== null) {
            result.full_name = validated;
        } else if (data.full_name !== undefined) {
            return null; // Invalid if provided but fails validation
        }
    }

    if (data.avatar_url !== undefined) {
        const url = sanitizeUrl(data.avatar_url);
        if (url !== null) {
            result.avatar_url = truncateString(url, INPUT_LIMITS.avatar_url);
        } else if (data.avatar_url !== undefined && data.avatar_url !== null && data.avatar_url !== '') {
            return null;
        }
    }

    if (data.bio !== undefined) {
        const bio = sanitizeString(data.bio);
        if (bio === '') {
            result.bio = null;
        } else {
            const validated = validateLength(bio, 0, INPUT_LIMITS.bio);
            if (validated !== null) {
                result.bio = validated;
            } else if (data.bio !== undefined) {
                return null;
            }
        }
    }

    if (data.website !== undefined) {
        const url = sanitizeUrl(data.website);
        if (url === null && data.website !== undefined && data.website !== null && data.website !== '') {
            return null;
        }
        result.website = url;
    }

    if (data.location !== undefined) {
        const location = sanitizeString(data.location);
        if (location === '') {
            result.location = null;
        } else {
            const validated = validateLength(location, 0, INPUT_LIMITS.location);
            if (validated !== null) {
                result.location = validated;
            } else if (data.location !== undefined) {
                return null;
            }
        }
    }

    return result;
}

/**
 * Sanitize finance transaction input
 */
export interface SanitizedTransactionInput {
    account_id?: string;
    amount?: number;
    currency?: string;
    category_id?: string | null;
    type?: 'income' | 'expense' | 'transfer';
    description?: string;
    date?: number;
    merchant?: string | null;
    receipt_url?: string | null;
    transfer_to_account_id?: string | null;
}

export function sanitizeTransactionInput(input: unknown): SanitizedTransactionInput | null {
    if (typeof input !== 'object' || input === null) {
        return null;
    }

    const data = input as Record<string, unknown>;
    const result: SanitizedTransactionInput = {};

    // Validate required fields
    if (data.account_id !== undefined) {
        const id = validateUuid(data.account_id);
        if (id !== null) {
            result.account_id = id;
        } else {
            return null;
        }
    }

    if (data.amount !== undefined) {
        const amount = validatePositiveNumber(data.amount);
        if (amount !== null) {
            result.amount = amount;
        } else {
            return null;
        }
    }

    // Type validation
    if (data.type !== undefined) {
        if (data.type === 'income' || data.type === 'expense' || data.type === 'transfer') {
            result.type = data.type;
        } else {
            return null;
        }
    }

    // Description validation
    if (data.description !== undefined) {
        const desc = sanitizeString(data.description);
        if (desc === '' && data.description !== undefined) {
            return null;
        }
        result.description = truncateString(desc, INPUT_LIMITS.description);
    }

    // Optional fields
    if (data.currency !== undefined) {
        result.currency = typeof data.currency === 'string' ? data.currency.toUpperCase() : 'RUB';
    }

    if (data.category_id !== undefined) {
        if (data.category_id === null) {
            result.category_id = null;
        } else {
            const id = validateUuid(data.category_id);
            if (id !== null) {
                result.category_id = id;
            }
        }
    }

    if (data.date !== undefined) {
        const date = validateDate(data.date);
        if (date !== null) {
            result.date = date;
        }
    }

    if (data.merchant !== undefined) {
        if (data.merchant === null || data.merchant === '') {
            result.merchant = null;
        } else {
            const merchant = sanitizeString(data.merchant);
            result.merchant = truncateString(merchant, INPUT_LIMITS.merchant);
        }
    }

    if (data.receipt_url !== undefined) {
        result.receipt_url = sanitizeUrl(data.receipt_url);
    }

    if (data.transfer_to_account_id !== undefined) {
        if (data.transfer_to_account_id === null || data.transfer_to_account_id === '') {
            result.transfer_to_account_id = null;
        } else {
            const id = validateUuid(data.transfer_to_account_id);
            if (id !== null) {
                result.transfer_to_account_id = id;
            }
        }
    }

    return result;
}

/**
 * Sanitize account input
 */
export interface SanitizedAccountInput {
    name?: string;
    type?: 'bank' | 'cash' | 'card' | 'investment';
    balance?: number;
    currency?: string;
    color?: string | null;
}

export function sanitizeAccountInput(input: unknown): SanitizedAccountInput | null {
    if (typeof input !== 'object' || input === null) {
        return null;
    }

    const data = input as Record<string, unknown>;
    const result: SanitizedAccountInput = {};

    if (data.name !== undefined) {
        const name = sanitizeString(data.name);
        const validated = validateLength(name, 1, INPUT_LIMITS.account_name);
        if (validated !== null) {
            result.name = validated;
        } else {
            return null;
        }
    }

    if (data.type !== undefined) {
        const validTypes = ['bank', 'cash', 'card', 'investment'];
        if (validTypes.includes(data.type as string)) {
            result.type = data.type as 'bank' | 'cash' | 'card' | 'investment';
        } else {
            return null;
        }
    }

    if (data.balance !== undefined) {
        const balance = validateNonNegativeNumber(data.balance);
        if (balance !== null) {
            result.balance = balance;
        }
    }

    if (data.currency !== undefined) {
        result.currency = typeof data.currency === 'string' ? data.currency.toUpperCase() : 'RUB';
    }

    if (data.color !== undefined) {
        if (data.color === null) {
            result.color = null;
        } else {
            const color = validateHexColor(data.color);
            if (color !== null) {
                result.color = color;
            }
        }
    }

    return result;
}

/**
 * Sanitize category input
 */
export interface SanitizedCategoryInput {
    name?: string;
    type?: 'income' | 'expense';
    parent_id?: string | null;
    icon?: string | null;
    color?: string | null;
}

export function sanitizeCategoryInput(input: unknown): SanitizedCategoryInput | null {
    if (typeof input !== 'object' || input === null) {
        return null;
    }

    const data = input as Record<string, unknown>;
    const result: SanitizedCategoryInput = {};

    if (data.name !== undefined) {
        const name = sanitizeString(data.name);
        const validated = validateLength(name, 1, INPUT_LIMITS.category_name);
        if (validated !== null) {
            result.name = validated;
        } else {
            return null;
        }
    }

    if (data.type !== undefined) {
        if (data.type === 'income' || data.type === 'expense') {
            result.type = data.type;
        } else {
            return null;
        }
    }

    if (data.parent_id !== undefined) {
        if (data.parent_id === null || data.parent_id === '') {
            result.parent_id = null;
        } else {
            const id = validateUuid(data.parent_id);
            if (id !== null) {
                result.parent_id = id;
            }
        }
    }

    if (data.icon !== undefined) {
        if (data.icon === null) {
            result.icon = null;
        } else {
            const icon = sanitizeString(data.icon);
            result.icon = truncateString(icon, 50);
        }
    }

    if (data.color !== undefined) {
        if (data.color === null) {
            result.color = null;
        } else {
            const color = validateHexColor(data.color);
            if (color !== null) {
                result.color = color;
            }
        }
    }

    return result;
}

/**
 * Sanitize habit input
 */
export interface SanitizedHabitInput {
    name?: string;
    description?: string | null;
    frequency?: 'daily' | 'weekly' | 'custom';
    target_days?: number[] | null;
    reminder_time?: string | null;
    color?: string | null;
    icon?: string | null;
}

export function sanitizeHabitInput(input: unknown): SanitizedHabitInput | null {
    if (typeof input !== 'object' || input === null) {
        return null;
    }

    const data = input as Record<string, unknown>;
    const result: SanitizedHabitInput = {};

    if (data.name !== undefined) {
        const name = sanitizeString(data.name);
        const validated = validateLength(name, 1, INPUT_LIMITS.habit_name);
        if (validated !== null) {
            result.name = validated;
        } else {
            return null;
        }
    }

    if (data.description !== undefined) {
        if (data.description === null || data.description === '') {
            result.description = null;
        } else {
            const desc = sanitizeString(data.description);
            result.description = truncateString(desc, INPUT_LIMITS.habit_description);
        }
    }

    if (data.frequency !== undefined) {
        const validFrequencies = ['daily', 'weekly', 'custom'];
        if (validFrequencies.includes(data.frequency as string)) {
            result.frequency = data.frequency as 'daily' | 'weekly' | 'custom';
        } else {
            return null;
        }
    }

    if (data.target_days !== undefined) {
        if (data.target_days === null) {
            result.target_days = null;
        } else if (Array.isArray(data.target_days)) {
            const days = data.target_days.filter((d): d is number =>
                typeof d === 'number' && d >= 0 && d <= 6
            );
            result.target_days = days.length > 0 ? days : null;
        }
    }

    if (data.reminder_time !== undefined) {
        if (data.reminder_time === null || data.reminder_time === '') {
            result.reminder_time = null;
        } else {
            const time = sanitizeString(data.reminder_time);
            result.reminder_time = truncateString(time, INPUT_LIMITS.reminder_time);
        }
    }

    if (data.color !== undefined) {
        if (data.color === null) {
            result.color = null;
        } else {
            const color = validateHexColor(data.color);
            if (color !== null) {
                result.color = color;
            }
        }
    }

    if (data.icon !== undefined) {
        if (data.icon === null) {
            result.icon = null;
        } else {
            const icon = sanitizeString(data.icon);
            result.icon = truncateString(icon, 50);
        }
    }

    return result;
}

/**
 * Sanitize nutrition log input
 */
export interface SanitizedNutritionLogInput {
    meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    date?: number;
    foods?: unknown[];
    total_calories?: number;
    total_protein?: number;
    total_carbs?: number;
    total_fat?: number;
    notes?: string | null;
}

export function sanitizeNutritionLogInput(input: unknown): SanitizedNutritionLogInput | null {
    if (typeof input !== 'object' || input === null) {
        return null;
    }

    const data = input as Record<string, unknown>;
    const result: SanitizedNutritionLogInput = {};

    if (data.meal_type !== undefined) {
        const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
        if (validMealTypes.includes(data.meal_type as string)) {
            result.meal_type = data.meal_type as 'breakfast' | 'lunch' | 'dinner' | 'snack';
        } else {
            return null;
        }
    }

    if (data.date !== undefined) {
        const date = validateDate(data.date);
        if (date !== null) {
            result.date = date;
        }
    }

    if (data.foods !== undefined) {
        if (Array.isArray(data.foods)) {
            result.foods = data.foods;
        }
    }

    if (data.total_calories !== undefined) {
        const calories = validateNonNegativeNumber(data.total_calories);
        if (calories !== null) {
            result.total_calories = calories;
        }
    }

    if (data.total_protein !== undefined) {
        const protein = validateNonNegativeNumber(data.total_protein);
        if (protein !== null) {
            result.total_protein = protein;
        }
    }

    if (data.total_carbs !== undefined) {
        const carbs = validateNonNegativeNumber(data.total_carbs);
        if (carbs !== null) {
            result.total_carbs = carbs;
        }
    }

    if (data.total_fat !== undefined) {
        const fat = validateNonNegativeNumber(data.total_fat);
        if (fat !== null) {
            result.total_fat = fat;
        }
    }

    if (data.notes !== undefined) {
        if (data.notes === null || data.notes === '') {
            result.notes = null;
        } else {
            const notes = sanitizeString(data.notes);
            result.notes = truncateString(notes, INPUT_LIMITS.notes);
        }
    }

    return result;
}

