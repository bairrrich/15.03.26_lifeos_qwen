import { NextRequest } from 'next/server';
import { getAuthenticatedSupabase, handleDatabaseError } from '@/lib/api-utils';
import {
    successResponse,
    paginatedResponse,
    errorResponse,
    getPaginationParams
} from '@/lib/api-response';

/**
 * GET /api/workouts/programs
 * 
 * Get all workout programs for the authenticated user
 */
export async function GET(request: NextRequest) {
    const { supabase, userId, error: authError } = await getAuthenticatedSupabase();

    if (authError) return authError;

    const { page, limit, offset } = getPaginationParams(request.nextUrl.searchParams);

    const { data, error, count } = await supabase
        .from('workout_programs')
        .select('*', { count: 'exact' })
        .eq('user_id', userId!)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) return handleDatabaseError('workout programs fetch');

    return paginatedResponse(data || [], page, limit, count || 0);
}

