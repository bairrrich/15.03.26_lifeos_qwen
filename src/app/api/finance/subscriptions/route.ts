import { NextRequest } from 'next/server';
import { getAuthenticatedSupabase } from '@/lib/api-utils';
import {
    successResponse,
    paginatedResponse,
    errorResponse,
    getPaginationParams
} from '@/lib/api-response';

/**
 * GET /api/finance/subscriptions
 * 
 * Get all subscriptions for the authenticated user
 */
export async function GET(request: NextRequest) {
    const { supabase, userId, error: authError } = await getAuthenticatedSupabase();

    if (authError) return authError;

    const { page, limit, offset } = getPaginationParams(request.nextUrl.searchParams);

    const { data, error, count } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact' })
        .eq('user_id', userId!)
        .order('next_billing_date', { ascending: true })
        .range(offset, offset + limit - 1);

    if (error) return errorResponse(error.message, 500, 'FETCH_ERROR');

    return paginatedResponse(data || [], page, limit, count || 0);
}

/**
 * POST /api/finance/subscriptions
 * 
 * Create a new subscription
 */
export async function POST(request: NextRequest) {
    const { supabase, userId, error: authError } = await getAuthenticatedSupabase();

    if (authError) return authError;

    try {
        const body = await request.json();

        if (!body.name) {
            return errorResponse('Missing required field: name', 400, 'VALIDATION_ERROR');
        }
        if (!body.amount) {
            return errorResponse('Missing required field: amount', 400, 'VALIDATION_ERROR');
        }
        if (!body.billing_period) {
            return errorResponse('Missing required field: billing_period', 400, 'VALIDATION_ERROR');
        }

        const validPeriods = ['monthly', 'yearly', 'weekly'];
        if (!validPeriods.includes(body.billing_period)) {
            return errorResponse(`Invalid billing_period. Must be one of: ${validPeriods.join(', ')}`, 400, 'VALIDATION_ERROR');
        }

        // Calculate next billing date
        const now = Date.now();
        let nextBillingDate = now;
        if (body.billing_period === 'monthly') {
            nextBillingDate = now + 30 * 24 * 60 * 60 * 1000;
        } else if (body.billing_period === 'yearly') {
            nextBillingDate = now + 365 * 24 * 60 * 60 * 1000;
        } else {
            nextBillingDate = now + 7 * 24 * 60 * 60 * 1000;
        }

        const subscriptionData = {
            user_id: userId,
            name: body.name,
            amount: body.amount,
            currency: body.currency || 'RUB',
            billing_period: body.billing_period,
            next_billing_date: body.next_billing_date || nextBillingDate,
            url: body.url || null,
            created_at: Date.now(),
            updated_at: Date.now(),
            version: 1,
            sync_status: 'pending',
        };

        const { data, error } = await supabase
            .from('subscriptions')
            .insert(subscriptionData)
            .select()
            .single();

        if (error) return errorResponse(error.message, 500, 'INSERT_ERROR');

        return successResponse(data, 201);
    } catch {
        return errorResponse('Invalid request body', 400, 'PARSE_ERROR');
    }
}
