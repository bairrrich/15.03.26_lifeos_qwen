import { NextRequest } from 'next/server';
import { getAuthenticatedSupabase, handleDatabaseError } from '@/lib/api-utils';
import {
    successResponse,
    paginatedResponse,
    errorResponse,
    getPaginationParams
} from '@/lib/api-response';
import { validatePositiveNumber, sanitizeString, sanitizeUrl, truncateString, validateLength } from '@/lib/input-validation';

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

    if (error) return handleDatabaseError('subscriptions fetch');

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

        // Validate required fields
        if (!body.name) {
            return errorResponse('Missing required field: name', 400, 'VALIDATION_ERROR');
        }
        if (!body.amount) {
            return errorResponse('Missing required field: amount', 400, 'VALIDATION_ERROR');
        }
        if (!body.billing_period) {
            return errorResponse('Missing required field: billing_period', 400, 'VALIDATION_ERROR');
        }

        // Validate and sanitize input
        const name = sanitizeString(body.name);
        const validatedName = validateLength(name, 1, 100);
        if (!validatedName) {
            return errorResponse('Invalid name: must be 1-100 characters', 400, 'VALIDATION_ERROR');
        }

        const amount = validatePositiveNumber(body.amount);
        if (!amount) {
            return errorResponse('Invalid amount: must be a positive number', 400, 'VALIDATION_ERROR');
        }

        const validPeriods = ['monthly', 'yearly', 'weekly'];
        if (!validPeriods.includes(body.billing_period)) {
            return errorResponse(`Invalid billing_period. Must be one of: ${validPeriods.join(', ')}`, 400, 'VALIDATION_ERROR');
        }

        // Validate URL if provided
        const url = body.url ? sanitizeUrl(body.url) : null;

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
            name: validatedName,
            amount: amount,
            currency: body.currency ? String(body.currency).substring(0, 3).toUpperCase() : 'RUB',
            billing_period: body.billing_period,
            next_billing_date: body.next_billing_date || nextBillingDate,
            url: url,
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

        if (error) return handleDatabaseError('subscription insert');

        return successResponse(data, 201);
    } catch {
        return errorResponse('Invalid request body', 400, 'PARSE_ERROR');
    }
}
