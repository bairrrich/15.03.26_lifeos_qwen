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
 * GET /api/workouts/history
 * 
 * Get all workout history with pagination and filtering
 * 
 * Query params:
 * - page: page number (default: 1)
 * - limit: items per page (default: 20, max: 100)
 * - sort: field to sort by (default: date)
 * - order: sort order (asc/desc, default: desc)
 * - program_id: filter by program
 */
export async function GET(request: NextRequest) {
    // Check authentication
    const { supabase, userId, error: authError } = await getAuthenticatedSupabase();

    if (authError) {
        return authError;
    }

    const searchParams = request.nextUrl.searchParams;
    const { page, limit, offset } = getPaginationParams(searchParams);
    const { sort, order } = getSortParams(searchParams, 'date', 'desc');

    // Build query
    let query = supabase
        .from('workout_logs')
        .select('*', { count: 'exact' })
        .eq('user_id', userId!)
        .order(sort, { ascending: order === 'asc' })
        .range(offset, offset + limit - 1);

    // Filter by program
    const programId = searchParams.get('program_id');
    if (programId) {
        query = query.eq('program_id', programId);
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
 * POST /api/workouts/history
 * 
 * Create a new workout log
 * 
 * Body:
 * - workout_name: string (required)
 * - program_id: string (optional)
 * - duration_seconds: number (required)
 * - date: number (timestamp, default: now)
 * - exercises: array (optional) - exercise logs
 * - rating: number (optional) - 1-5
 * - feeling: number (optional) - 1-5
 * - notes: string (optional)
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
        if (!body.workout_name) {
            return errorResponse('Missing required field: workout_name', 400, 'VALIDATION_ERROR');
        }

        if (!body.duration_seconds && body.duration_seconds !== 0) {
            return errorResponse('Missing required field: duration_seconds', 400, 'VALIDATION_ERROR');
        }

        // Validate rating and feeling
        if (body.rating && (body.rating < 1 || body.rating > 5)) {
            return errorResponse('Rating must be between 1 and 5', 400, 'VALIDATION_ERROR');
        }

        if (body.feeling && (body.feeling < 1 || body.feeling > 5)) {
            return errorResponse('Feeling must be between 1 and 5', 400, 'VALIDATION_ERROR');
        }

        const workoutData = {
            user_id: userId,
            workout_name: body.workout_name,
            program_id: body.program_id || null,
            duration_seconds: body.duration_seconds,
            date: body.date || Date.now(),
            exercises: body.exercises || [],
            rating: body.rating || null,
            feeling: body.feeling || null,
            notes: body.notes || null,
            created_at: Date.now(),
            updated_at: Date.now(),
            version: 1,
            sync_status: 'pending',
        };

        const { data, error } = await supabase
            .from('workout_logs')
            .insert(workoutData)
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
