import { NextRequest } from 'next/server';
import { getAuthenticatedSupabase, handleDatabaseError } from '@/lib/api-utils';
import { successResponse, errorResponse } from '@/lib/api-response';
import { sanitizeProfileInput } from '@/lib/input-validation';

/**
 * GET /api/user/profile
 * 
 * Get user profile
 */
export async function GET(request: NextRequest) {
    const { supabase, userId, error: authError } = await getAuthenticatedSupabase();

    if (authError) return authError;

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId!)
        .single();

    if (error) {
        // If profile doesn't exist, return basic user info from auth
        if (error.code === 'PGRST116') {
            const { data: { user } } = await supabase.auth.getUser();
            return successResponse({
                id: user?.id,
                email: user?.email,
                created_at: user?.created_at,
            });
        }
        return handleDatabaseError('profile fetch');
    }

    return successResponse(profile);
}

/**
 * PUT /api/user/profile
 * 
 * Update user profile
 */
export async function PUT(request: NextRequest) {
    const { supabase, userId, error: authError } = await getAuthenticatedSupabase();

    if (authError) return authError;

    try {
        const body = await request.json();

        // Sanitize and validate input
        const sanitized = sanitizeProfileInput(body);
        if (!sanitized) {
            return errorResponse('Invalid input data. Please check your fields.', 400, 'VALIDATION_ERROR');
        }

        // If no valid fields to update, return early
        if (Object.keys(sanitized).length === 0) {
            return errorResponse('No valid fields to update', 400, 'VALIDATION_ERROR');
        }

        const updateData = {
            ...sanitized,
            updated_at: Date.now(),
        };

        const { data, error } = await supabase
            .from('profiles')
            .upsert({
                id: userId,
                ...updateData,
            })
            .select()
            .single();

        if (error) return handleDatabaseError('profile update');

        return successResponse(data);
    } catch {
        return errorResponse('Invalid request body', 400, 'PARSE_ERROR');
    }
}

