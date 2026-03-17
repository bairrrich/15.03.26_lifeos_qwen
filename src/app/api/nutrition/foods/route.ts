import { NextRequest } from 'next/server';
import { getAuthenticatedSupabase, handleDatabaseError } from '@/lib/api-utils';
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

    if (error) return handleDatabaseError('foods fetch');

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
            name: body.name?.substring(0, 200) || '',
            calories_per_100g: Math.max(body.calories_per_100g || 0, 0),
            protein_per_100g: Math.max(body.protein_per_100g || 0, 0),
            carbs_per_100g: Math.max(body.carbs_per_100g || 0, 0),
            fat_per_100g: Math.max(body.fat_per_100g || 0, 0),
            serving_size: Math.max(body.serving_size || 100, 1),
            barcode: body.barcode?.substring(0, 50) || null,
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

        if (error) return handleDatabaseError('foods insert');

        return successResponse(data, 201);
    } catch {
        return errorResponse('Invalid request body', 400, 'PARSE_ERROR');
    }
}
