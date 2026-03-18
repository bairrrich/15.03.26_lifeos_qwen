import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { errorResponse } from './api-response';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { NextResponse } from 'next/server';

/**
 * Handle database errors safely - sanitize error messages
 */
export function handleDatabaseError(operation: string): NextResponse {
    console.error(`Database error during ${operation}`);
    return errorResponse(`Database error during ${operation}`, 500, 'DB_ERROR');
}

/**
 * Get authenticated Supabase client for API routes
 * This handles both cookie-based and token-based authentication
 */
export async function getAuthenticatedSupabase(): Promise<{
    supabase: SupabaseClient;
    userId: string | null;
    error: NextResponse | null;
}> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        return {
            supabase: null as unknown as SupabaseClient,
            userId: null,
            error: errorResponse('Supabase not configured', 500, 'CONFIG_ERROR'),
        };
    }

    const cookieStore = await cookies();

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        cookieStore.set(name, value, options);
                    });
                } catch {
                    // Called from Server Component
                }
            },
        },
    });

    // Get the authenticated user
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return {
            supabase,
            userId: null,
            error: errorResponse('Unauthorized', 401, 'UNAUTHORIZED'),
        };
    }

    return {
        supabase,
        userId: user.id,
        error: null,
    };
}

