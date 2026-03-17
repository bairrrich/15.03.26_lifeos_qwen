import { NextRequest } from 'next/server';
import { getAuthenticatedSupabase } from '@/lib/api-utils';
import { successResponse, errorResponse } from '@/lib/api-response';

/**
 * POST /api/habits/[id]/log
 * 
 * Log habit completion
 * 
 * Body:
 * - completed: boolean (required)
 * - note: string (optional)
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Check authentication
    const { supabase, userId, error: authError } = await getAuthenticatedSupabase();

    if (authError) {
        return authError;
    }

    const { id: habitId } = await params;

    try {
        const body = await request.json();

        // Validate required fields
        if (body.completed === undefined) {
            return errorResponse('Missing required field: completed', 400, 'VALIDATION_ERROR');
        }

        // Check if habit exists
        const { data: habit, error: habitError } = await supabase
            .from('habits')
            .select('id')
            .eq('id', habitId)
            .eq('user_id', userId!)
            .single();

        if (habitError || !habit) {
            return errorResponse('Habit not found', 404, 'NOT_FOUND');
        }

        const logData = {
            user_id: userId,
            habit_id: habitId,
            completed: body.completed,
            note: body.note || null,
            completed_at: body.completed ? Date.now() : null,
            created_at: Date.now(),
            updated_at: Date.now(),
            version: 1,
            sync_status: 'pending',
        };

        const { data, error } = await supabase
            .from('habit_logs')
            .insert(logData)
            .select()
            .single();

        if (error) {
            return errorResponse(error.message, 500, 'INSERT_ERROR');
        }

        return successResponse(data, 201);
    } catch (err) {
        return errorResponse('Invalid request body', 400, 'PARSE_ERROR');
    }
}
