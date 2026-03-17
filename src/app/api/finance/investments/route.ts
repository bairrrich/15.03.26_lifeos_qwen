import { NextRequest } from 'next/server';
import { getAuthenticatedSupabase } from '@/lib/api-utils';
import {
    successResponse,
    paginatedResponse,
    errorResponse,
    getPaginationParams
} from '@/lib/api-response';

/**
 * GET /api/finance/investments
 * 
 * Get all investments for the authenticated user
 */
export async function GET(request: NextRequest) {
    const { supabase, userId, error: authError } = await getAuthenticatedSupabase();

    if (authError) return authError;

    const { page, limit, offset } = getPaginationParams(request.nextUrl.searchParams);

    const { data, error, count } = await supabase
        .from('investments')
        .select('*', { count: 'exact' })
        .eq('user_id', userId!)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) return errorResponse(error.message, 500, 'FETCH_ERROR');

    return paginatedResponse(data || [], page, limit, count || 0);
}

/**
 * POST /api/finance/investments
 * 
 * Create a new investment
 */
export async function POST(request: NextRequest) {
    const { supabase, userId, error: authError } = await getAuthenticatedSupabase();

    if (authError) return authError;

    try {
        const body = await request.json();

        if (!body.name) {
            return errorResponse('Missing required field: name', 400, 'VALIDATION_ERROR');
        }
        if (!body.type) {
            return errorResponse('Missing required field: type', 400, 'VALIDATION_ERROR');
        }
        if (!body.quantity) {
            return errorResponse('Missing required field: quantity', 400, 'VALIDATION_ERROR');
        }
        if (!body.purchase_price) {
            return errorResponse('Missing required field: purchase_price', 400, 'VALIDATION_ERROR');
        }

        const investmentData = {
            user_id: userId,
            name: body.name,
            type: body.type,
            ticker: body.ticker || null,
            quantity: body.quantity,
            purchase_price: body.purchase_price,
            current_price: body.current_price || body.purchase_price,
            created_at: Date.now(),
            updated_at: Date.now(),
            version: 1,
            sync_status: 'pending',
        };

        const { data, error } = await supabase
            .from('investments')
            .insert(investmentData)
            .select()
            .single();

        if (error) return errorResponse(error.message, 500, 'INSERT_ERROR');

        return successResponse(data, 201);
    } catch {
        return errorResponse('Invalid request body', 400, 'PARSE_ERROR');
    }
}
