/**
 * Simple in-memory rate limiter for API routes
 * 
 * Note: For production, consider using Upstash Redis or similar:
 * https://upstash.com/docs/redis/overall/firstexample
 * 
 * This implementation is suitable for development/single-instance deployment.
 * For multi-instance deployments, use a distributed rate limiter.
 */

import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory store (resets on server restart)
// In production, replace with Redis-based solution
interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Rate limit configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute

/**
 * Clean up expired entries from the store
 */
function cleanupExpiredEntries(): void {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);

/**
 * Get rate limit key from request
 */
function getRateLimitKey(request: NextRequest): string {
    // Use IP address or user ID if available
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
    return `ratelimit:${ip}`;
}

/**
 * Check if request should be rate limited
 */
export function checkRateLimit(request: NextRequest): { allowed: boolean; remaining: number; resetTime: number } {
    const key = getRateLimitKey(request);
    const now = Date.now();

    let entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
        // New window
        entry = {
            count: 0,
            resetTime: now + RATE_LIMIT_WINDOW_MS,
        };
        rateLimitStore.set(key, entry);
    }

    entry.count++;

    const remaining = Math.max(0, RATE_LIMIT_MAX_REQUESTS - entry.count);
    const allowed = entry.count <= RATE_LIMIT_MAX_REQUESTS;

    return {
        allowed,
        remaining,
        resetTime: entry.resetTime,
    };
}

/**
 * Rate limit middleware for API routes
 * 
 * Usage in API routes:
 * 
 * import { rateLimitMiddleware } from '@/lib/rate-limit';
 * 
 * export async function GET(request: NextRequest) {
 *   const rateLimitResponse = rateLimitMiddleware(request);
 *   if (rateLimitResponse) return rateLimitResponse;
 *   // ... rest of handler
 * }
 */
export function rateLimitMiddleware(request: NextRequest): NextResponse | null {
    const { allowed, remaining, resetTime } = checkRateLimit(request);

    // Add rate limit headers
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', String(RATE_LIMIT_MAX_REQUESTS));
    headers.set('X-RateLimit-Remaining', String(remaining));
    headers.set('X-RateLimit-Reset', String(resetTime));

    if (!allowed) {
        return new NextResponse(
            JSON.stringify({
                error: 'Too many requests',
                code: 'RATE_LIMIT_EXCEEDED',
                message: 'Please try again later',
            }),
            {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'Retry-After': String(Math.ceil((resetTime - Date.now()) / 1000)),
                    ...Object.fromEntries(headers),
                },
            }
        );
    }

    return null;
}

/**
 * Create rate-limited handler wrapper
 * 
 * Usage:
 * 
 * export const GET = withRateLimit(async (request) => {
 *   // Your handler code
 * });
 */
export function withRateLimit(
    handler: (request: NextRequest) => Promise<NextResponse>
) {
    return async function (request: NextRequest): Promise<NextResponse> {
        const rateLimitResponse = rateLimitMiddleware(request);
        if (rateLimitResponse) return rateLimitResponse;

        return handler(request);
    };
}

/**
 * Stricter rate limit for authentication endpoints
 */
export function authRateLimitMiddleware(request: NextRequest): NextResponse | null {
    const key = `auth:${getRateLimitKey(request)}`;
    const now = Date.now();

    // Stricter limits for auth: 10 requests per minute
    const AUTH_RATE_LIMIT = 10;
    const AUTH_WINDOW_MS = 60 * 1000;

    let entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
        entry = {
            count: 0,
            resetTime: now + AUTH_WINDOW_MS,
        };
        rateLimitStore.set(key, entry);
    }

    entry.count++;

    const remaining = Math.max(0, AUTH_RATE_LIMIT - entry.count);
    const allowed = entry.count <= AUTH_RATE_LIMIT;

    const headers = new Headers();
    headers.set('X-RateLimit-Limit', String(AUTH_RATE_LIMIT));
    headers.set('X-RateLimit-Remaining', String(remaining));
    headers.set('X-RateLimit-Reset', String(entry.resetTime));

    if (!allowed) {
        return new NextResponse(
            JSON.stringify({
                error: 'Too many authentication attempts',
                code: 'AUTH_RATE_LIMIT_EXCEEDED',
                message: 'Please wait before trying again',
            }),
            {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'Retry-After': String(Math.ceil((entry.resetTime - Date.now()) / 1000)),
                    ...Object.fromEntries(headers),
                },
            }
        );
    }

    return null;
}

