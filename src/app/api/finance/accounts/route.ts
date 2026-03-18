import { NextRequest } from 'next/server';
import { getAuthenticatedSupabase, handleDatabaseError } from '@/lib/api-utils';
import {
    successResponse,
    paginatedResponse,
    errorResponse,
    getPaginationParams
} from '@/lib/api-response';
import { sanitizeAccountInput } from '@/lib/input-validation';

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
        return handleDatabaseError('accounts fetch');
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

        // Sanitize and validate input
        const sanitized = sanitizeAccountInput(body);
        if (!sanitized) {
            return errorResponse('Invalid input data. Please check your fields.', 400, 'VALIDATION_ERROR');
        }

        // Validate required fields
        if (!sanitized.name || !sanitized.type) {
            return errorResponse('Missing required fields: name, type', 400, 'VALIDATION_ERROR');
        }

        const accountData = {
            user_id: userId,
            name: sanitized.name,
            type: sanitized.type,
            balance: sanitized.balance || 0,
            currency: sanitized.currency || 'RUB',
            color: sanitized.color || null,
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
            return handleDatabaseError('account insert');
        }

        return successResponse(data, 201);
    } catch (err) {
        return errorResponse('Invalid request body', 400, 'PARSE_ERROR');
    }
}

