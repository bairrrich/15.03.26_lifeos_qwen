import { NextRequest } from 'next/server';
import { getAuthenticatedSupabase } from '@/lib/api-utils';
import { successResponse, errorResponse } from '@/lib/api-response';

/**
 * GET /api/habits/[id]
 * 
 * Get a single habit by ID
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
        .from('habits')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId!)
        .single();

    if (error || !data) {
        return errorResponse('Habit not found', 404, 'NOT_FOUND');
    }

    return successResponse(data);
}

/**
 * PUT /api/habits/[id]
 * 
 * Update a habit
 * 
 * Body (all optional):
 * - name: string
 * - description: string
 * - frequency: 'daily' | 'weekly' | 'custom'
 * - target_days: number[]
 * - reminder_time: string (HH:mm)
 * - color: string
 * - icon: string
 * - is_active: boolean
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
        // Check if habit exists
        const { data: existing, error: fetchError } = await supabase
            .from('habits')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId!)
            .single();

        if (fetchError || !existing) {
            return errorResponse('Habit not found', 404, 'NOT_FOUND');
        }

        const body = await request.json();

        // Validate frequency if provided
        if (body.frequency) {
            const validFrequencies = ['daily', 'weekly', 'custom'];
            if (!validFrequencies.includes(body.frequency)) {
                return errorResponse(`Invalid frequency. Must be one of: ${validFrequencies.join(', ')}`, 400, 'VALIDATION_ERROR');
            }
        }

        const updateData = {
            ...(body.name && { name: body.name }),
            ...(body.description !== undefined && { description: body.description }),
            ...(body.frequency && { frequency: body.frequency }),
            ...(body.target_days !== undefined && { target_days: body.target_days }),
            ...(body.reminder_time !== undefined && { reminder_time: body.reminder_time }),
            ...(body.color !== undefined && { color: body.color }),
            ...(body.icon !== undefined && { icon: body.icon }),
            ...(body.is_active !== undefined && { is_active: body.is_active }),
            updated_at: Date.now(),
            version: existing.version + 1,
            sync_status: 'pending',
        };

        const { data, error } = await supabase
            .from('habits')
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
 * DELETE /api/habits/[id]
 * 
 * Delete a habit
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

    // Check if habit exists
    const { data: existing, error: fetchError } = await supabase
        .from('habits')
        .select('id')
        .eq('id', id)
        .eq('user_id', userId!)
        .single();

    if (fetchError || !existing) {
        return errorResponse('Habit not found', 404, 'NOT_FOUND');
    }

    // Delete the habit (logs will remain or can be cascade deleted)
    const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id)
        .eq('user_id', userId!);

    if (error) {
        return errorResponse(error.message, 500, 'DELETE_ERROR');
    }

    return successResponse({ success: true, id });
}
