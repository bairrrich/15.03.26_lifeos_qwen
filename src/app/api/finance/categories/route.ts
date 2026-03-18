import { NextRequest } from 'next/server';
import { getAuthenticatedSupabase, handleDatabaseError } from '@/lib/api-utils';
import {
    successResponse,
    paginatedResponse,
    errorResponse,
    getPaginationParams
} from '@/lib/api-response';
import { sanitizeCategoryInput } from '@/lib/input-validation';

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

    // Limit query param length to prevent abuse
    const queryLimit = searchParams.get('limit');
    if (queryLimit) {
        const parsedLimit = parseInt(queryLimit, 10);
        if (!isNaN(parsedLimit) && parsedLimit > 0 && parsedLimit <= 100) {
            // Valid limit
        }
    }

    const { data, error, count } = await query;

    if (error) {
        return handleDatabaseError('categories fetch');
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

        // Sanitize and validate input
        const sanitized = sanitizeCategoryInput(body);
        if (!sanitized) {
            return errorResponse('Invalid input data. Please check your fields.', 400, 'VALIDATION_ERROR');
        }

        // Validate required fields
        if (!sanitized.name || !sanitized.type) {
            return errorResponse('Missing required fields: name, type', 400, 'VALIDATION_ERROR');
        }

        const categoryData = {
            user_id: userId,
            name: sanitized.name,
            type: sanitized.type,
            color: sanitized.color || null,
            icon: sanitized.icon || null,
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
            return handleDatabaseError('category insert');
        }

        return successResponse(data, 201);
    } catch (err) {
        return errorResponse('Invalid request body', 400, 'PARSE_ERROR');
    }
}

