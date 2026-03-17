import { NextRequest } from 'next/server';
import { getAuthenticatedSupabase, handleDatabaseError } from '@/lib/api-utils';
import {
    successResponse,
    paginatedResponse,
    errorResponse,
    getPaginationParams
} from '@/lib/api-response';

/**
 * GET /api/workouts/exercises
 * 
 * Get all exercises for the authenticated user
 */
export async function GET(request: NextRequest) {
    const { supabase, userId, error: authError } = await getAuthenticatedSupabase();

    if (authError) return authError;

    const { page, limit, offset } = getPaginationParams(request.nextUrl.searchParams);

    // Get query params for filtering
    const searchParams = request.nextUrl.searchParams;
    const muscleGroup = searchParams.get('muscle_group');
    const equipment = searchParams.get('equipment');

    let query = supabase
        .from('exercises')
        .select('*', { count: 'exact' })
        .eq('user_id', userId!)
        .order('name', { ascending: true })
        .range(offset, offset + limit - 1);

    if (muscleGroup) {
        query = query.eq('muscle_group', muscleGroup.substring(0, 50));
    }

    if (equipment) {
        query = query.eq('equipment', equipment.substring(0, 50));
    }

    const { data, error, count } = await query;

    if (error) return handleDatabaseError('exercises fetch');

    return paginatedResponse(data || [], page, limit, count || 0);
}
