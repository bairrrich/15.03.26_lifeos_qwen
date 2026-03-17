import { NextRequest } from 'next/server';
import { getAuthenticatedSupabase, handleDatabaseError } from '@/lib/api-utils';
import { successResponse, errorResponse } from '@/lib/api-response';
import { sanitizeAccountInput } from '@/lib/input-validation';

/**
 * GET /api/finance/accounts/[id]
 * 
 * Get a single account by ID
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
        .from('accounts')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId!)
        .single();

    if (error || !data) {
        return errorResponse('Account not found', 404, 'NOT_FOUND');
    }

    return successResponse(data);
}

/**
 * PUT /api/finance/accounts/[id]
 * 
 * Update an account
 * 
 * Body (all optional):
 * - name: string
 * - type: 'bank' | 'cash' | 'card' | 'investment'
 * - balance: number
 * - currency: string
 * - color: string
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
        // Check if account exists
        const { data: existing, error: fetchError } = await supabase
            .from('accounts')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId!)
            .single();

        if (fetchError || !existing) {
            return errorResponse('Account not found', 404, 'NOT_FOUND');
        }

        const body = await request.json();

        // Sanitize and validate input
        const sanitized = sanitizeAccountInput(body);
        if (!sanitized) {
            return errorResponse('Invalid input data. Please check your fields.', 400, 'VALIDATION_ERROR');
        }

        // If no valid fields to update, return early
        if (Object.keys(sanitized).length === 0) {
            return errorResponse('No valid fields to update', 400, 'VALIDATION_ERROR');
        }

        const updateData = {
            ...sanitized,
            updated_at: Date.now(),
            version: existing.version + 1,
            sync_status: 'pending',
        };

        const { data, error } = await supabase
            .from('accounts')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', userId!)
            .select()
            .single();

        if (error) {
            return handleDatabaseError('account update');
        }

        return successResponse(data);
    } catch (err) {
        return errorResponse('Invalid request body', 400, 'PARSE_ERROR');
    }
}

/**
 * DELETE /api/finance/accounts/[id]
 * 
 * Delete an account
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

    // Check if account has transactions
    const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select('id', { count: 'exact', head: true })
        .eq('account_id', id)
        .eq('user_id', userId!);

    if (txError) {
        return handleDatabaseError('transactions check');
    }

    // Optionally, you could prevent deletion if there are transactions
    // For now, we'll allow it but you might want to handle this differently

    // Delete the account
    const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id)
        .eq('user_id', userId!);

    if (error) {
        return handleDatabaseError('account delete');
    }

    return successResponse({ success: true, id });
}
