import { NextRequest } from 'next/server';
import { getAuthenticatedSupabase } from '@/lib/api-utils';
import {
    successResponse,
    paginatedResponse,
    errorResponse,
    getPaginationParams
} from '@/lib/api-response';

/**
 * GET /api/nutrition/foods
 * 
 * Get all foods for the authenticated user
 */
export async function GET(request: NextRequest) {
    const { supabase, userId, error: authError } = await getAuthenticatedSupabase();

    if (authError) return authError;

    const { page, limit, offset } = getPaginationParams(request.nextUrl.searchParams);

    const { data, error, count } = await supabase
        .from('foods')
        .select('*', { count: 'exact' })
        .eq('user_id', userId!)
        .order('name', { ascending: true })
        .range(offset, offset + limit - 1);

    if (error) return errorResponse(error.message, 500, 'FETCH_ERROR');

    return paginatedResponse(data || [], page, limit, count || 0);
}

/**
 * POST /api/nutrition/foods
 * 
 * Add a new food
 */
export async function POST(request: NextRequest) {
    const { supabase, userId, error: authError } = await getAuthenticatedSupabase();

    if (authError) return authError;

    try {
        const body = await request.json();

        if (!body.name) {
            return errorResponse('Missing required field: name', 400, 'VALIDATION_ERROR');
        }

        const foodData = {
            user_id: userId,
            name: body.name,
            calories_per_100g: body.calories_per_100g || 0,
            protein_per_100g: body.protein_per_100g || 0,
            carbs_per_100g: body.carbs_per_100g || 0,
            fat_per_100g: body.fat_per_100g || 0,
            serving_size: body.serving_size || 100,
            barcode: body.barcode || null,
            created_at: Date.now(),
            updated_at: Date.now(),
            version: 1,
            sync_status: 'pending',
        };

        const { data, error } = await supabase
            .from('foods')
            .insert(foodData)
            .select()
            .single();

        if (error) return errorResponse(error.message, 500, 'INSERT_ERROR');

        return successResponse(data, 201);
    } catch {
        return errorResponse('Invalid request body', 400, 'PARSE_ERROR');
    }
}
