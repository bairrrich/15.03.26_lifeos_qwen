import { NextResponse } from 'next/server';

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface ApiError {
    error: string;
    code?: string;
    details?: Record<string, string[]>;
}

/**
 * Success response with data
 */
export function successResponse<T>(
    data: T,
    status: number = 200
): NextResponse<T> {
    return NextResponse.json(data, { status });
}

/**
 * Paginated success response
 */
export function paginatedResponse<T>(
    data: T[],
    page: number,
    limit: number,
    total: number
): NextResponse<PaginatedResponse<T>> {
    return NextResponse.json({
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    });
}

/**
 * Error response
 */
export function errorResponse(
    message: string,
    status: number = 500,
    code?: string,
    details?: Record<string, string[]>
): NextResponse<ApiError> {
    return NextResponse.json(
        {
            error: message,
            code,
            details,
        },
        { status }
    );
}

/**
 * Parse pagination params from URL
 */
export function getPaginationParams(searchParams: URLSearchParams): {
    page: number;
    limit: number;
    offset: number;
} {
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;

    return { page, limit, offset };
}

/**
 * Parse sort params from URL
 */
export function getSortParams(
    searchParams: URLSearchParams,
    defaultSort: string = 'created_at',
    defaultOrder: 'asc' | 'desc' = 'desc'
): { sort: string; order: 'asc' | 'desc' } {
    const sort = searchParams.get('sort') || defaultSort;
    const order = (searchParams.get('order') as 'asc' | 'desc') || defaultOrder;

    return { sort, order };
}
