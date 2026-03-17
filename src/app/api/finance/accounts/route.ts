import { NextRequest } from 'next/server';
import { getAuthenticatedSupabase } from '@/lib/api-utils';
import {
    successResponse,
    paginatedResponse,
    errorResponse,
    getPaginationParams
} from '@/lib/api-response';

/**
 * GET /api/finance/accounts
 * 
 * Get all accounts for the authenticated user
 * 
 * Query params:
 * - page: page number (default: 1)
 * - limit: items per page (default: 20, max: 100)
 */
export async function GET(request: NextRequest) {
    // Check authentication
    const { supabase, userId, error: authError } = await getAuthenticatedSupabase();

    if (authError) {
        return authError;
    }

    const searchParams = request.nextUrl.searchParams;
    const { page, limit, offset } = getPaginationParams(searchParams);

    const { data, error, count } = await supabase
        .from('accounts')
        .select('*', { count: 'exact' })
        .eq('user_id', userId!)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

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
 * POST /api/finance/accounts
 * 
 * Create a new account
 * 
 * Body:
 * - name: string (required)
 * - type: string (required) - 'bank', 'cash', 'card', 'investment'
 * - balance: number (default: 0)
 * - currency: string (default: RUB)
 * - color: string (optional)
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
        const validTypes = ['bank', 'cash', 'card', 'investment'];
        if (!validTypes.includes(body.type)) {
            return errorResponse(`Invalid type. Must be one of: ${validTypes.join(', ')}`, 400, 'VALIDATION_ERROR');
        }

        const accountData = {
            user_id: userId,
            name: body.name,
            type: body.type,
            balance: body.balance || 0,
            currency: body.currency || 'RUB',
            color: body.color || null,
            created_at: Date.now(),
            updated_at: Date.now(),
            version: 1,
            sync_status: 'pending',
        };

        const { data, error } = await supabase
            .from('accounts')
            .insert(accountData)
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
