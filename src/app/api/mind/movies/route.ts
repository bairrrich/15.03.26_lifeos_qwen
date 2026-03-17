import { NextRequest } from 'next/server';
import { getAuthenticatedSupabase, handleDatabaseError } from '@/lib/api-utils';
import {
    successResponse,
    paginatedResponse,
    errorResponse,
    getPaginationParams
} from '@/lib/api-response';

/**
 * GET /api/mind/movies
 * 
 * Get all movies/TV shows for the authenticated user
 */
export async function GET(request: NextRequest) {
    const { supabase, userId, error: authError } = await getAuthenticatedSupabase();

    if (authError) return authError;

    const { page, limit, offset } = getPaginationParams(request.nextUrl.searchParams);

    const { data, error, count } = await supabase
        .from('movies')
        .select('*', { count: 'exact' })
        .eq('user_id', userId!)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) return handleDatabaseError('movies fetch');

    return paginatedResponse(data || [], page, limit, count || 0);
}

/**
 * POST /api/mind/movies
 * 
 * Add a new movie/TV show
 */
export async function POST(request: NextRequest) {
    const { supabase, userId, error: authError } = await getAuthenticatedSupabase();

    if (authError) return authError;

    try {
        const body = await request.json();

        if (!body.title) {
            return errorResponse('Missing required field: title', 400, 'VALIDATION_ERROR');
        }

        const movieData = {
            user_id: userId,
            title: body.title?.substring(0, 500) || '',
            type: body.type || 'movie',
            genre: body.genre?.substring(0, 100) || null,
            status: body.status || 'planned',
            rating: body.rating ? Math.min(Math.max(body.rating, 0), 10) : null,
            episodes_watched: Math.max(body.episodes_watched || 0, 0),
            total_episodes: body.total_episodes ? Math.max(body.total_episodes, 0) : null,
            notes: body.notes?.substring(0, 5000) || null,
            created_at: Date.now(),
            updated_at: Date.now(),
            version: 1,
            sync_status: 'pending',
        };

        const { data, error } = await supabase
            .from('movies')
            .insert(movieData)
            .select()
            .single();

        if (error) return handleDatabaseError('movies insert');

        return successResponse(data, 201);
    } catch {
        return errorResponse('Invalid request body', 400, 'PARSE_ERROR');
    }
}
