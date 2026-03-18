import { NextRequest } from 'next/server';
import { getAuthenticatedSupabase, handleDatabaseError } from '@/lib/api-utils';
import {
    successResponse,
    paginatedResponse,
    errorResponse,
    getPaginationParams
} from '@/lib/api-response';
import { validateInteger, sanitizeString, truncateString } from '@/lib/input-validation';

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

    if (error) return handleDatabaseError('sleep logs fetch');

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
            sleep_duration_minutes: Math.max(sleep_duration_minutes || 0, 0),
            quality: body.quality ? Math.min(Math.max(body.quality, 1), 5) : null,
            notes: body.notes?.substring(0, 2000) || null,
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

        if (error) return handleDatabaseError('sleep log insert');

        return successResponse(data, 201);
    } catch {
        return errorResponse('Invalid request body', 400, 'PARSE_ERROR');
    }
}

