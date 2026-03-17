import { NextRequest } from 'next/server';
import { getAuthenticatedSupabase } from '@/lib/api-utils';
import { successResponse, errorResponse } from '@/lib/api-response';

/**
 * GET /api/finance/transactions/[id]
 * 
 * Get a single transaction by ID
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Check authentication
    const { supabase, userId, error: authError } = await getAuthenticatedSupabase();

    if (authError) {
        return authError;
    }

    const { id } = await params;

    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId!)
        .single();

    if (error || !data) {
        return errorResponse('Transaction not found', 404, 'NOT_FOUND');
    }

    return successResponse(data);
}

/**
 * PUT /api/finance/transactions/[id]
 * 
 * Update a transaction
 * 
 * Body (all optional):
 * - account_id: string
 * - amount: number
 * - currency: string
 * - category_id: string
 * - type: 'income' | 'expense'
 * - description: string
 * - date: number
 * - merchant: string
 * - receipt_url: string
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Check authentication
    const { supabase, userId, error: authError } = await getAuthenticatedSupabase();

    if (authError) {
        return authError;
    }

    const { id } = await params;

    try {
        // Check if transaction exists
        const { data: existing, error: fetchError } = await supabase
            .from('transactions')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId!)
            .single();

        if (fetchError || !existing) {
            return errorResponse('Transaction not found', 404, 'NOT_FOUND');
        }

        const body = await request.json();

        // Validate type if provided
        if (body.type && !['income', 'expense'].includes(body.type)) {
            return errorResponse('Invalid type. Must be "income" or "expense"', 400, 'VALIDATION_ERROR');
        }

        const updateData = {
            ...(body.account_id && { account_id: body.account_id }),
            ...(body.amount !== undefined && { amount: body.amount }),
            ...(body.currency && { currency: body.currency }),
            ...(body.category_id !== undefined && { category_id: body.category_id }),
            ...(body.type && { type: body.type }),
            ...(body.description && { description: body.description }),
            ...(body.date && { date: body.date }),
            ...(body.merchant !== undefined && { merchant: body.merchant }),
            ...(body.receipt_url !== undefined && { receipt_url: body.receipt_url }),
            updated_at: Date.now(),
            version: existing.version + 1,
            sync_status: 'pending',
        };

        const { data, error } = await supabase
            .from('transactions')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', userId!)
            .select()
            .single();

        if (error) {
            return errorResponse(error.message, 500, 'UPDATE_ERROR');
        }

        return successResponse(data);
    } catch (err) {
        return errorResponse('Invalid request body', 400, 'PARSE_ERROR');
    }
}

/**
 * DELETE /api/finance/transactions/[id]
 * 
 * Delete a transaction
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Check authentication
    const { supabase, userId, error: authError } = await getAuthenticatedSupabase();

    if (authError) {
        return authError;
    }

    const { id } = await params;

    // Check if transaction exists
    const { data: existing, error: fetchError } = await supabase
        .from('transactions')
        .select('account_id, amount, type')
        .eq('id', id)
        .eq('user_id', userId!)
        .single();

    if (fetchError || !existing) {
        return errorResponse('Transaction not found', 404, 'NOT_FOUND');
    }

    // Delete the transaction
    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId!);

    if (error) {
        return errorResponse(error.message, 500, 'DELETE_ERROR');
    }

    // Update account balance
    const balanceChange = existing.type === 'income' ? -existing.amount : existing.amount;
    await supabase.rpc('update_account_balance', {
        p_account_id: existing.account_id,
        p_amount: balanceChange,
    });

    return successResponse({ success: true, id });
}
