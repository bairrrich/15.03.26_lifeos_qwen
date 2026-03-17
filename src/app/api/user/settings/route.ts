import { NextRequest } from 'next/server';
import { getAuthenticatedSupabase } from '@/lib/api-utils';
import { successResponse, errorResponse } from '@/lib/api-response';

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

        const updateData = {
            user_id: userId,
            ...(body.theme && { theme: body.theme }),
            ...(body.language && { language: body.language }),
            ...(body.currency && { currency: body.currency }),
            ...(body.date_format && { date_format: body.date_format }),
            ...(body.notifications_enabled !== undefined && { notifications_enabled: body.notifications_enabled }),
            ...(body.email_notifications !== undefined && { email_notifications: body.email_notifications }),
            updated_at: Date.now(),
        };

        const { data, error } = await supabase
            .from('user_settings')
            .upsert(updateData)
            .select()
            .single();

        if (error) return errorResponse(error.message, 500, 'UPDATE_ERROR');

        return successResponse(data);
    } catch {
        return errorResponse('Invalid request body', 400, 'PARSE_ERROR');
    }
}
