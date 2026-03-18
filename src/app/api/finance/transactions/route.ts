import { NextRequest } from 'next/server';
import { getAuthenticatedSupabase, handleDatabaseError } from '@/lib/api-utils';
import {
    successResponse,
    paginatedResponse,
    errorResponse,
    getPaginationParams,
    getSortParams
} from '@/lib/api-response';
import { sanitizeTransactionInput } from '@/lib/input-validation';

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
        query = query.eq('account_id', accountId.substring(0, 100));
    }

    const categoryId = searchParams.get('category_id');
    if (categoryId) {
        query = query.eq('category_id', categoryId.substring(0, 100));
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
        return handleDatabaseError('transactions fetch');
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

        // Sanitize and validate input
        const sanitized = sanitizeTransactionInput(body);
        if (!sanitized) {
            return errorResponse('Invalid input data. Please check your fields.', 400, 'VALIDATION_ERROR');
        }

        // Validate required fields
        if (!sanitized.account_id || !sanitized.amount || !sanitized.type || !sanitized.description) {
            return errorResponse('Missing required fields: account_id, amount, type, description', 400, 'VALIDATION_ERROR');
        }

        // Verify account ownership before creating transaction
        const { data: account, error: accountError } = await supabase
            .from('accounts')
            .select('id, currency')
            .eq('id', sanitized.account_id)
            .eq('user_id', userId!)
            .single();

        if (accountError || !account) {
            return errorResponse('Account not found or access denied', 403, 'AUTHORIZATION_ERROR');
        }

        // Prepare transaction data
        const transactionData = {
            user_id: userId,
            account_id: sanitized.account_id,
            amount: sanitized.amount,
            currency: sanitized.currency || account.currency || 'RUB',
            category_id: sanitized.category_id || null,
            type: sanitized.type,
            description: sanitized.description,
            date: sanitized.date || Date.now(),
            merchant: sanitized.merchant || null,
            receipt_url: sanitized.receipt_url || null,
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
            return handleDatabaseError('transaction insert');
        }

        // Update account balance (with error handling)
        const balanceChange = sanitized.type === 'income' ? sanitized.amount : -sanitized.amount;
        const { error: rpcError } = await supabase.rpc('update_account_balance', {
            p_account_id: sanitized.account_id,
            p_amount: balanceChange,
        });

        // Log RPC error but don't fail the transaction
        if (rpcError) {
            console.error('Failed to update account balance:', rpcError);
        }

        return successResponse(data, 201);
    } catch (err) {
        return errorResponse('Invalid request body', 400, 'PARSE_ERROR');
    }
}

