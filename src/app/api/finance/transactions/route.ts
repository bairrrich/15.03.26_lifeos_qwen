import { NextRequest } from 'next/server';
import { getAuthenticatedSupabase } from '@/lib/api-utils';
import {
    successResponse,
    paginatedResponse,
    errorResponse,
    getPaginationParams,
    getSortParams
} from '@/lib/api-response';

/**
 * GET /api/finance/transactions
 * 
 * Get all transactions with pagination and filtering
 * 
 * Query params:
 * - page: page number (default: 1)
 * - limit: items per page (default: 20, max: 100)
 * - sort: field to sort by (default: date)
 * - order: sort order (asc/desc, default: desc)
 * - type: filter by type (income/expense)
 * - account_id: filter by account
 * - category_id: filter by category
 * - date_from: filter by start date (ISO string)
 * - date_to: filter by end date (ISO string)
 */
export async function GET(request: NextRequest) {
    // Check authentication
    const { supabase, userId, error: authError } = await getAuthenticatedSupabase();

    if (authError) {
        return authError;
    }

    const searchParams = request.nextUrl.searchParams;

    // Get pagination params
    const { page, limit, offset } = getPaginationParams(searchParams);

    // Get sort params
    const { sort, order } = getSortParams(searchParams, 'date', 'desc');

    // Build query
    let query = supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('user_id', userId!)
        .order(sort, { ascending: order === 'asc' })
        .range(offset, offset + limit - 1);

    // Apply filters
    const type = searchParams.get('type');
    if (type === 'income' || type === 'expense') {
        query = query.eq('type', type);
    }

    const accountId = searchParams.get('account_id');
    if (accountId) {
        query = query.eq('account_id', accountId);
    }

    const categoryId = searchParams.get('category_id');
    if (categoryId) {
        query = query.eq('category_id', categoryId);
    }

    const dateFrom = searchParams.get('date_from');
    if (dateFrom) {
        query = query.gte('date', new Date(dateFrom).getTime());
    }

    const dateTo = searchParams.get('date_to');
    if (dateTo) {
        query = query.lte('date', new Date(dateTo).getTime());
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
 * POST /api/finance/transactions
 * 
 * Create a new transaction
 * 
 * Body:
 * - account_id: string (required)
 * - amount: number (required)
 * - currency: string (default: RUB)
 * - category_id: string (optional)
 * - type: 'income' | 'expense' (required)
 * - description: string (required)
 * - date: number (timestamp, default: now)
 * - merchant: string (optional)
 * - receipt_url: string (optional)
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
        const requiredFields = ['account_id', 'amount', 'type', 'description'];
        for (const field of requiredFields) {
            if (!body[field]) {
                return errorResponse(`Missing required field: ${field}`, 400, 'VALIDATION_ERROR');
            }
        }

        // Validate type
        if (!['income', 'expense'].includes(body.type)) {
            return errorResponse('Invalid type. Must be "income" or "expense"', 400, 'VALIDATION_ERROR');
        }

        // Prepare transaction data
        const transactionData = {
            user_id: userId,
            account_id: body.account_id,
            amount: body.amount,
            currency: body.currency || 'RUB',
            category_id: body.category_id || null,
            type: body.type,
            description: body.description,
            date: body.date || Date.now(),
            merchant: body.merchant || null,
            receipt_url: body.receipt_url || null,
            created_at: Date.now(),
            updated_at: Date.now(),
            version: 1,
            sync_status: 'pending',
        };

        const { data, error } = await supabase
            .from('transactions')
            .insert(transactionData)
            .select()
            .single();

        if (error) {
            return errorResponse(error.message, 500, 'INSERT_ERROR');
        }

        // Update account balance
        const balanceChange = body.type === 'income' ? body.amount : -body.amount;
        await supabase.rpc('update_account_balance', {
            p_account_id: body.account_id,
            p_amount: balanceChange,
        });

        return successResponse(data, 201);
    } catch (err) {
        return errorResponse('Invalid request body', 400, 'PARSE_ERROR');
    }
}
