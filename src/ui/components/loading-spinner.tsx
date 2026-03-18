'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    fullScreen?: boolean;
}

const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
};

/**
 * Loading spinner component with optional full-screen overlay
 */
export function LoadingSpinner({
    size = 'md',
    className,
    fullScreen = false,
}: LoadingSpinnerProps) {
    const spinner = (
        <Loader2
            className={cn('animate-spin text-primary', sizeClasses[size], className)}
        />
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
                {spinner}
            </div>
        );
    }

    return spinner;
}

/**
 * Skeleton loader for cards
 */
export function CardSkeleton({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                'animate-pulse rounded-md bg-muted h-32',
                className
            )}
        />
    );
}

/**
 * Skeleton loader for text
 */
export function TextSkeleton({
    lines = 3,
    className,
}: {
    lines?: number;
    className?: string;
}) {
    return (
        <div className={cn('space-y-2', className)}>
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className={cn(
                        'animate-pulse rounded-md bg-muted h-4',
                        i === lines - 1 ? 'w-3/4' : 'w-full'
                    )}
                />
            ))}
        </div>
    );
}

/**
 * Skeleton loader for list items
 */
export function ListSkeleton({
    count = 5,
    className,
}: {
    count?: number;
    className?: string;
}) {
    return (
        <div className={cn('space-y-3', className)}>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="animate-pulse flex items-center space-x-3"
                >
                    <div className="h-10 w-10 rounded-full bg-muted" />
                    <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );
}

/**
 * Table skeleton loader
 */
export function TableSkeleton({
    rows = 5,
    columns = 4,
    className,
}: {
    rows?: number;
    columns?: number;
    className?: string;
}) {
    return (
        <div className={cn('space-y-2', className)}>
            {/* Header */}
            <div className="flex gap-4">
                {Array.from({ length: columns }).map((_, i) => (
                    <div
                        key={`header-${i}`}
                        className="h-6 bg-muted rounded flex-1"
                    />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={`row-${rowIndex}`} className="flex gap-4">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <div
                            key={`cell-${rowIndex}-${colIndex}`}
                            className="h-8 bg-muted rounded flex-1"
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

/**
 * Page loading state with spinner
 */
export function PageLoader() {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner size="lg" />
        </div>
    );
}

