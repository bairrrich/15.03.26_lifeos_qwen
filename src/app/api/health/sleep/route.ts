import { NextRequest } from 'next/server';
import { getAuthenticatedSupabase } from '@/lib/api-utils';
import {
    successResponse,
    paginatedResponse,
    errorResponse,
    getPaginationParams
} from '@/lib/api-response';

/**
 * GET /api/health/sleep
 * 
 * Get all sleep logs for the authenticated user
 */
export async function GET(request: NextRequest) {
    const { supabase, userId, error: authError } = await getAuthenticatedSupabase();

    if (authError) return authError;

    const { page, limit, offset } = getPaginationParams(request.nextUrl.searchParams);

    const { data, error, count } = await supabase
        .from('sleep_logs')
        .select('*', { count: 'exact' })
        .eq('user_id', userId!)
        .order('date', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) return errorResponse(error.message, 500, 'FETCH_ERROR');

    return paginatedResponse(data || [], page, limit, count || 0);
}

/**
 * POST /api/health/sleep
 * 
 * Log sleep data
 */
export async function POST(request: NextRequest) {
    const { supabase, userId, error: authError } = await getAuthenticatedSupabase();

    if (authError) return authError;

    try {
        const body = await request.json();

        if (!body.date) {
            return errorResponse('Missing required field: date', 400, 'VALIDATION_ERROR');
        }

        // Calculate sleep duration if start and end times provided
        let sleep_duration_minutes = body.sleep_duration_minutes;
        if (body.sleep_start && body.sleep_end && !sleep_duration_minutes) {
            const start = new Date(body.sleep_start).getTime();
            const end = new Date(body.sleep_end).getTime();
            sleep_duration_minutes = Math.round((end - start) / (1000 * 60));
        }

        const sleepData = {
            user_id: userId,
            date: body.date,
            sleep_start: body.sleep_start || null,
            sleep_end: body.sleep_end || null,
            sleep_duration_minutes: sleep_duration_minutes || 0,
            quality: body.quality || null, // 1-5
            notes: body.notes || null,
            created_at: Date.now(),
            updated_at: Date.now(),
            version: 1,
            sync_status: 'pending',
        };

        const { data, error } = await supabase
            .from('sleep_logs')
            .insert(sleepData)
            .select()
            .single();

        if (error) return errorResponse(error.message, 500, 'INSERT_ERROR');

        return successResponse(data, 201);
    } catch {
        return errorResponse('Invalid request body', 400, 'PARSE_ERROR');
    }
}
