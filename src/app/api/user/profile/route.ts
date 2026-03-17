import { NextRequest } from 'next/server';
import { getAuthenticatedSupabase } from '@/lib/api-utils';
import { successResponse, errorResponse } from '@/lib/api-response';

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
        const { data: { user } } = await supabase.auth.getUser();
        return successResponse({
            id: user?.id,
            email: user?.email,
            created_at: user?.created_at,
        });
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

        const updateData = {
            ...(body.full_name && { full_name: body.full_name }),
            ...(body.avatar_url && { avatar_url: body.avatar_url }),
            ...(body.bio && { bio: body.bio }),
            ...(body.website && { website: body.website }),
            ...(body.location && { location: body.location }),
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

        if (error) return errorResponse(error.message, 500, 'UPDATE_ERROR');

        return successResponse(data);
    } catch {
        return errorResponse('Invalid request body', 400, 'PARSE_ERROR');
    }
}
