import { NextRequest } from 'next/server';
import { getAuthenticatedSupabase, handleDatabaseError } from '@/lib/api-utils';
import {
    successResponse,
    paginatedResponse,
    errorResponse,
    getPaginationParams,
    getSortParams
} from '@/lib/api-response';
import { validatePositiveNumber, sanitizeString, truncateString, validateInteger } from '@/lib/input-validation';

/**
 * GET /api/health/metrics
 * 
 * Get all health metrics with pagination and filtering
 * 
 * Query params:
 * - page: page number (default: 1)
 * - limit: items per page (default: 20, max: 100)
 * - type: filter by metric type (weight, height, blood_pressure, heart_rate)
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
    const { page, limit, offset } = getPaginationParams(searchParams);
    const { sort, order } = getSortParams(searchParams, 'date', 'desc');

    // Build query
    let query = supabase
        .from('health_metrics')
        .select('*', { count: 'exact' })
        .eq('user_id', userId!)
        .order(sort, { ascending: order === 'asc' })
        .range(offset, offset + limit - 1);

    // Filter by type
    const type = searchParams.get('type');
    if (type) {
        query = query.eq('type', type.substring(0, 30));
    }

    // Filter by date
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
        return handleDatabaseError('health metrics fetch');
    }

    return paginatedResponse(
        data || [],
        page,
        limit,
        count || 0
    );
}

/**
 * POST /api/health/metrics
 * 
 * Create a new health metric
 * 
 * Body:
 * - type: string (required) - 'weight', 'height', 'blood_pressure', 'heart_rate', 'blood_sugar', 'oxygen'
 * - value: number (required)
 * - unit: string (required) - 'kg', 'cm', 'mmHg', 'bpm', 'mg/dL', '%'
 * - date: number (timestamp, default: now)
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
        if (!body.type) {
            return errorResponse('Missing required field: type', 400, 'VALIDATION_ERROR');
        }

        if (body.value === undefined || body.value === null) {
            return errorResponse('Missing required field: value', 400, 'VALIDATION_ERROR');
        }

        if (!body.unit) {
            return errorResponse('Missing required field: unit', 400, 'VALIDATION_ERROR');
        }

        // Validate metric type
        const validTypes = ['weight', 'height', 'blood_pressure', 'heart_rate', 'blood_sugar', 'oxygen'];
        if (!validTypes.includes(body.type)) {
            return errorResponse(`Invalid type. Must be one of: ${validTypes.join(', ')}`, 400, 'VALIDATION_ERROR');
        }

        const metricData = {
            user_id: userId,
            type: body.type,
            value: Math.abs(body.value),
            unit: body.unit?.substring(0, 20) || '',
            date: body.date || Date.now(),
            notes: body.notes?.substring(0, 2000) || null,
            created_at: Date.now(),
            updated_at: Date.now(),
            version: 1,
            sync_status: 'pending',
        };

        const { data, error } = await supabase
            .from('health_metrics')
            .insert(metricData)
            .select()
            .single();

        if (error) {
            return handleDatabaseError('health metric insert');
        }

        return successResponse(data, 201);
    } catch (err) {
        return errorResponse('Invalid request body', 400, 'PARSE_ERROR');
    }
}
