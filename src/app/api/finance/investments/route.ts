import { NextRequest } from 'next/server';
import { getAuthenticatedSupabase, handleDatabaseError } from '@/lib/api-utils';
import {
    successResponse,
    paginatedResponse,
    errorResponse,
    getPaginationParams
} from '@/lib/api-response';
import { validatePositiveNumber, sanitizeString, truncateString, validateLength } from '@/lib/input-validation';

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

    if (error) return handleDatabaseError('investments fetch');

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

        // Validate required fields
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

        // Validate and sanitize input
        const name = sanitizeString(body.name);
        const validatedName = validateLength(name, 1, 200);
        if (!validatedName) {
            return errorResponse('Invalid name: must be 1-200 characters', 400, 'VALIDATION_ERROR');
        }

        // Validate type
        const validTypes = ['stock', 'bond', 'crypto', 'fund', 'real_estate', 'other'];
        if (!validTypes.includes(body.type)) {
            return errorResponse(`Invalid type. Must be one of: ${validTypes.join(', ')}`, 400, 'VALIDATION_ERROR');
        }

        // Validate numbers
        const quantity = validatePositiveNumber(body.quantity);
        if (!quantity) {
            return errorResponse('Invalid quantity: must be a positive number', 400, 'VALIDATION_ERROR');
        }

        const purchasePrice = validatePositiveNumber(body.purchase_price);
        if (!purchasePrice) {
            return errorResponse('Invalid purchase_price: must be a positive number', 400, 'VALIDATION_ERROR');
        }

        const currentPrice = body.current_price ? validatePositiveNumber(body.current_price) : purchasePrice;

        const investmentData = {
            user_id: userId,
            name: validatedName,
            type: body.type,
            ticker: body.ticker ? truncateString(sanitizeString(body.ticker), 20) : null,
            quantity: quantity,
            purchase_price: purchasePrice,
            current_price: currentPrice || purchasePrice,
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

        if (error) return handleDatabaseError('investment insert');

        return successResponse(data, 201);
    } catch {
        return errorResponse('Invalid request body', 400, 'PARSE_ERROR');
    }
}
