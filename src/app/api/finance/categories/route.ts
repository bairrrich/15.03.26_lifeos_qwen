import { NextRequest } from 'next/server';
import { getAuthenticatedSupabase } from '@/lib/api-utils';
import {
    successResponse,
    paginatedResponse,
    errorResponse,
    getPaginationParams
} from '@/lib/api-response';

/**
 * GET /api/finance/categories
 * 
 * Get all categories for the authenticated user
 * 
 * Query params:
 * - page: page number (default: 1)
 * - limit: items per page (default: 20, max: 100)
 * - type: filter by type (income/expense)
 */
export async function GET(request: NextRequest) {
    // Check authentication
    const { supabase, userId, error: authError } = await getAuthenticatedSupabase();

    if (authError) {
        return authError;
    }

    const searchParams = request.nextUrl.searchParams;
    const { page, limit, offset } = getPaginationParams(searchParams);

    let query = supabase
        .from('categories')
        .select('*', { count: 'exact' })
        .eq('user_id', userId!)
        .order('name', { ascending: true })
        .range(offset, offset + limit - 1);

    // Filter by type
    const type = searchParams.get('type');
    if (type === 'income' || type === 'expense') {
        query = query.eq('type', type);
    }

    const { data, error, count } = await query;

    if (error) {
        return errorResponse(error.message, 500, 'FETCH_ERROR');
    }

    return paginatedResponse(
        data || [],
        page,
        limit,
        count || 0
    );
}

/**
 * POST /api/finance/categories
 * 
 * Create a new category
 * 
 * Body:
 * - name: string (required)
 * - type: 'income' | 'expense' (required)
 * - color: string (optional) - hex color
 * - icon: string (optional) - icon name
 */
export async function POST(request: NextRequest) {
    // Check authentication
    const { supabase, userId, error: authError } = await getAuthenticatedSupabase();

    if (authError) {
        return authError;
    }

    try {
        const body = await request.json();

        // Validate required fields
        if (!body.name) {
            return errorResponse('Missing required field: name', 400, 'VALIDATION_ERROR');
        }

        if (!body.type) {
            return errorResponse('Missing required field: type', 400, 'VALIDATION_ERROR');
        }

        // Validate type
        if (!['income', 'expense'].includes(body.type)) {
            return errorResponse('Invalid type. Must be "income" or "expense"', 400, 'VALIDATION_ERROR');
        }

        const categoryData = {
            user_id: userId,
            name: body.name,
            type: body.type,
            color: body.color || null,
            icon: body.icon || null,
            created_at: Date.now(),
            updated_at: Date.now(),
            version: 1,
            sync_status: 'pending',
        };

        const { data, error } = await supabase
            .from('categories')
            .insert(categoryData)
            .select()
            .single();

        if (error) {
            return errorResponse(error.message, 500, 'INSERT_ERROR');
        }

        return successResponse(data, 201);
    } catch (err) {
        return errorResponse('Invalid request body', 400, 'PARSE_ERROR');
    }
}
