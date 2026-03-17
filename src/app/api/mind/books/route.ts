import { NextRequest } from 'next/server';
import { getAuthenticatedSupabase, handleDatabaseError } from '@/lib/api-utils';
import {
    successResponse,
    paginatedResponse,
    errorResponse,
    getPaginationParams
} from '@/lib/api-response';

/**
 * GET /api/mind/books
 * 
 * Get all books for the authenticated user
 */
export async function GET(request: NextRequest) {
    const { supabase, userId, error: authError } = await getAuthenticatedSupabase();

    if (authError) return authError;

    const { page, limit, offset } = getPaginationParams(request.nextUrl.searchParams);

    const { data, error, count } = await supabase
        .from('books')
        .select('*', { count: 'exact' })
        .eq('user_id', userId!)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) return handleDatabaseError('books fetch');

    return paginatedResponse(data || [], page, limit, count || 0);
}

/**
 * POST /api/mind/books
 * 
 * Add a new book
 */
export async function POST(request: NextRequest) {
    const { supabase, userId, error: authError } = await getAuthenticatedSupabase();

    if (authError) return authError;

    try {
        const body = await request.json();

        if (!body.title) {
            return errorResponse('Missing required field: title', 400, 'VALIDATION_ERROR');
        }

        const bookData = {
            user_id: userId,
            title: body.title?.substring(0, 500) || '',
            author: body.author?.substring(0, 200) || null,
            genre: body.genre?.substring(0, 100) || null,
            status: body.status || 'planned',
            rating: body.rating ? Math.min(Math.max(body.rating, 0), 10) : null,
            notes: body.notes?.substring(0, 5000) || null,
            created_at: Date.now(),
            updated_at: Date.now(),
            version: 1,
            sync_status: 'pending',
        };

        const { data, error } = await supabase
            .from('books')
            .insert(bookData)
            .select()
            .single();

        if (error) return handleDatabaseError('books insert');

        return successResponse(data, 201);
    } catch {
        return errorResponse('Invalid request body', 400, 'PARSE_ERROR');
    }
}
