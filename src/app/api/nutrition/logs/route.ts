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
 * GET /api/nutrition/logs
 * 
 * Get all nutrition logs with pagination and filtering
 * 
 * Query params:
 * - page: page number (default: 1)
 * - limit: items per page (default: 20, max: 100)
 * - date_from: filter by start date (ISO string)
 * - date_to: filter by end date (ISO string)
 * - meal_type: filter by meal type (breakfast, lunch, dinner, snack)
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
        .from('nutrition_logs')
        .select('*', { count: 'exact' })
        .eq('user_id', userId!)
        .order(sort, { ascending: order === 'asc' })
        .range(offset, offset + limit - 1);

    // Filter by date
    const dateFrom = searchParams.get('date_from');
    if (dateFrom) {
        query = query.gte('date', new Date(dateFrom).getTime());
    }

    const dateTo = searchParams.get('date_to');
    if (dateTo) {
        query = query.lte('date', new Date(dateTo).getTime());
    }

    // Filter by meal type
    const mealType = searchParams.get('meal_type');
    if (mealType) {
        query = query.eq('meal_type', mealType);
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
 * POST /api/nutrition/logs
 * 
 * Create a new nutrition log
 * 
 * Body:
 * - meal_type: string (required) - 'breakfast', 'lunch', 'dinner', 'snack'
 * - date: number (timestamp, default: now)
 * - foods: array (optional) - { food_id, name, calories, protein, carbs, fat, amount }
 * - total_calories: number (optional)
 * - total_protein: number (optional)
 * - total_carbs: number (optional)
 * - total_fat: number (optional)
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
        if (!body.meal_type) {
            return errorResponse('Missing required field: meal_type', 400, 'VALIDATION_ERROR');
        }

        // Validate meal type
        const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
        if (!validMealTypes.includes(body.meal_type)) {
            return errorResponse(`Invalid meal_type. Must be one of: ${validMealTypes.join(', ')}`, 400, 'VALIDATION_ERROR');
        }

        const nutritionData = {
            user_id: userId,
            meal_type: body.meal_type,
            date: body.date || Date.now(),
            foods: body.foods || [],
            total_calories: body.total_calories || 0,
            total_protein: body.total_protein || 0,
            total_carbs: body.total_carbs || 0,
            total_fat: body.total_fat || 0,
            notes: body.notes || null,
            created_at: Date.now(),
            updated_at: Date.now(),
            version: 1,
            sync_status: 'pending',
        };

        const { data, error } = await supabase
            .from('nutrition_logs')
            .insert(nutritionData)
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
