import { NextRequest } from 'next/server';
import { getAuthenticatedSupabase, handleDatabaseError } from '@/lib/api-utils';
import { successResponse, errorResponse } from '@/lib/api-response';

/**
 * Validate user settings input
 */
function sanitizeSettingsInput(input: unknown): Record<string, unknown> | null {
    if (typeof input !== 'object' || input === null) {
        return null;
    }

    const data = input as Record<string, unknown>;
    const result: Record<string, unknown> = {};

    // Validate theme
    if (data.theme !== undefined) {
        const validThemes = ['light', 'dark', 'system'];
        if (validThemes.includes(data.theme as string)) {
            result.theme = data.theme;
        }
    }

    // Validate language
    if (data.language !== undefined) {
        const validLanguages = ['ru', 'en'];
        if (validLanguages.includes(data.language as string)) {
            result.language = data.language;
        }
    }

    // Validate currency (3 letter code)
    if (data.currency !== undefined) {
        const currency = data.currency;
        if (typeof currency === 'string' && /^[A-Z]{3}$/.test(currency.toUpperCase())) {
            result.currency = currency.toUpperCase();
        }
    }

    // Validate date format
    if (data.date_format !== undefined) {
        const validFormats = ['DD.MM.YYYY', 'MM.DD.YYYY', 'YYYY-MM-DD'];
        if (validFormats.includes(data.date_format as string)) {
            result.date_format = data.date_format;
        }
    }

    // Validate booleans
    if (data.notifications_enabled !== undefined) {
        if (typeof data.notifications_enabled === 'boolean') {
            result.notifications_enabled = data.notifications_enabled;
        }
    }

    if (data.email_notifications !== undefined) {
        if (typeof data.email_notifications === 'boolean') {
            result.email_notifications = data.email_notifications;
        }
    }

    return result;
}

/**
 * GET /api/user/settings
 * 
 * Get user settings
 */
export async function GET(request: NextRequest) {
    const { supabase, userId, error: authError } = await getAuthenticatedSupabase();

    if (authError) return authError;

    const { data: settings, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId!)
        .single();

    if (error) {
        // Return default settings if none exist
        return successResponse({
            user_id: userId,
            theme: 'system',
            language: 'ru',
            currency: 'RUB',
            date_format: 'DD.MM.YYYY',
            notifications_enabled: true,
            email_notifications: false,
        });
    }

    return successResponse(settings);
}

/**
 * PUT /api/user/settings
 * 
 * Update user settings
 */
export async function PUT(request: NextRequest) {
    const { supabase, userId, error: authError } = await getAuthenticatedSupabase();

    if (authError) return authError;

    try {
        const body = await request.json();

        // Sanitize and validate input
        const sanitized = sanitizeSettingsInput(body);
        if (!sanitized) {
            return errorResponse('Invalid input data. Please check your fields.', 400, 'VALIDATION_ERROR');
        }

        const updateData = {
            user_id: userId,
            ...sanitized,
            updated_at: Date.now(),
        };

        const { data, error } = await supabase
            .from('user_settings')
            .upsert(updateData)
            .select()
            .single();

        if (error) return handleDatabaseError('settings update');

        return successResponse(data);
    } catch {
        return errorResponse('Invalid request body', 400, 'PARSE_ERROR');
    }
}


