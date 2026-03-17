import { NextRequest } from 'next/server';
import { getAuthenticatedSupabase } from '@/lib/api-utils';
import {
    successResponse,
    paginatedResponse,
    errorResponse,
    getPaginationParams
} from '@/lib/api-response';

/**
 * GET /api/habits
 * 
 * Get all habits for the authenticated user
 * 
 * Query params:
 * - page: page number (default: 1)
 * - limit: items per page (default: 20, max: 100)
 */
export async function GET(request: NextRequest) {
    // Check authentication
    const { supabase, userId, error: authError } = await getAuthenticatedSupabase();

    if (authError) {
        return authError;
    }

    const searchParams = request.nextUrl.searchParams;
    const { page, limit, offset } = getPaginationParams(searchParams);

    const { data, error, count } = await supabase
        .from('habits')
        .select('*', { count: 'exact' })
        .eq('user_id', userId!)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

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
 * POST /api/habits
 * 
 * Create a new habit
 * 
 * Body:
 * - name: string (required)
 * - description: string (optional)
 * - frequency: string (required) - 'daily', 'weekly', 'custom'
 * - target_days: number[] (optional) - days of week [0-6]
 * - reminder_time: string (optional) - HH:mm format
 * - color: string (optional) - hex color
 * - icon: string (optional) - icon name
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
        if (!body.name) {
            return errorResponse('Missing required field: name', 400, 'VALIDATION_ERROR');
        }

        if (!body.frequency) {
            return errorResponse('Missing required field: frequency', 400, 'VALIDATION_ERROR');
        }

        // Validate frequency
        const validFrequencies = ['daily', 'weekly', 'custom'];
        if (!validFrequencies.includes(body.frequency)) {
            return errorResponse(`Invalid frequency. Must be one of: ${validFrequencies.join(', ')}`, 400, 'VALIDATION_ERROR');
        }

        const habitData = {
            user_id: userId,
            name: body.name,
            description: body.description || null,
            frequency: body.frequency,
            target_days: body.target_days || null,
            reminder_time: body.reminder_time || null,
            color: body.color || null,
            icon: body.icon || null,
            created_at: Date.now(),
            updated_at: Date.now(),
            version: 1,
            sync_status: 'pending',
        };

        const { data, error } = await supabase
            .from('habits')
            .insert(habitData)
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
