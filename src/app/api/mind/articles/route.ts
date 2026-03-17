import { NextRequest } from 'next/server';
import { getAuthenticatedSupabase } from '@/lib/api-utils';
import {
    successResponse,
    paginatedResponse,
    errorResponse,
    getPaginationParams
} from '@/lib/api-response';

/**
 * GET /api/mind/articles
 * 
 * Get all articles for the authenticated user
 */
export async function GET(request: NextRequest) {
    const { supabase, userId, error: authError } = await getAuthenticatedSupabase();

    if (authError) return authError;

    const { page, limit, offset } = getPaginationParams(request.nextUrl.searchParams);

    const { data, error, count } = await supabase
        .from('articles')
        .select('*', { count: 'exact' })
        .eq('user_id', userId!)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) return errorResponse(error.message, 500, 'FETCH_ERROR');

    return paginatedResponse(data || [], page, limit, count || 0);
}

/**
 * POST /api/mind/articles
 * 
 * Add a new article
 */
export async function POST(request: NextRequest) {
    const { supabase, userId, error: authError } = await getAuthenticatedSupabase();

    if (authError) return authError;

    try {
        const body = await request.json();

        if (!body.title) {
            return errorResponse('Missing required field: title', 400, 'VALIDATION_ERROR');
        }

        const articleData = {
            user_id: userId,
            title: body.title,
            url: body.url || null,
            source: body.source || null,
            category: body.category || null,
            status: body.status || 'unread', // unread, reading, read, archived
            notes: body.notes || null,
            created_at: Date.now(),
            updated_at: Date.now(),
            version: 1,
            sync_status: 'pending',
        };

        const { data, error } = await supabase
            .from('articles')
            .insert(articleData)
            .select()
            .single();

        if (error) return errorResponse(error.message, 500, 'INSERT_ERROR');

        return successResponse(data, 201);
    } catch {
        return errorResponse('Invalid request body', 400, 'PARSE_ERROR');
    }
}
