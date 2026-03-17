import { NextRequest } from 'next/server';
import { getAuthenticatedSupabase } from '@/lib/api-utils';
import {
    successResponse,
    paginatedResponse,
    errorResponse,
    getPaginationParams
} from '@/lib/api-response';

/**
 * GET /api/finance/budgets
 * 
 * Get all budgets for the authenticated user
 */
export async function GET(request: NextRequest) {
    const { supabase, userId, error: authError } = await getAuthenticatedSupabase();

    if (authError) return authError;

    const { page, limit, offset } = getPaginationParams(request.nextUrl.searchParams);

    const { data, error, count } = await supabase
        .from('budgets')
        .select('*', { count: 'exact' })
        .eq('user_id', userId!)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) return errorResponse(error.message, 500, 'FETCH_ERROR');

    return paginatedResponse(data || [], page, limit, count || 0);
}

/**
 * POST /api/finance/budgets
 * 
 * Create a new budget
 */
export async function POST(request: NextRequest) {
    const { supabase, userId, error: authError } = await getAuthenticatedSupabase();

    if (authError) return authError;

    try {
        const body = await request.json();

        if (!body.category_id) {
            return errorResponse('Missing required field: category_id', 400, 'VALIDATION_ERROR');
        }
        if (!body.amount) {
            return errorResponse('Missing required field: amount', 400, 'VALIDATION_ERROR');
        }
        if (!body.period) {
            return errorResponse('Missing required field: period', 400, 'VALIDATION_ERROR');
        }

        const validPeriods = ['month', 'week', 'year'];
        if (!validPeriods.includes(body.period)) {
            return errorResponse(`Invalid period. Must be one of: ${validPeriods.join(', ')}`, 400, 'VALIDATION_ERROR');
        }

        const budgetData = {
            user_id: userId,
            category_id: body.category_id,
            amount: body.amount,
            period: body.period,
            start_date: body.start_date || Date.now(),
            created_at: Date.now(),
            updated_at: Date.now(),
            version: 1,
            sync_status: 'pending',
        };

        const { data, error } = await supabase
            .from('budgets')
            .insert(budgetData)
            .select()
            .single();

        if (error) return errorResponse(error.message, 500, 'INSERT_ERROR');

        return successResponse(data, 201);
    } catch {
        return errorResponse('Invalid request body', 400, 'PARSE_ERROR');
    }
}
