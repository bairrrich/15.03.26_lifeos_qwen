import { cn } from '@/lib/utils';

/**
 * Standardized grid layout utilities for consistent responsive design
 * across all LifeOS pages and components
 */

// Stats Grid - For metric/stat cards
export function StatsGrid({
    children,
    className,
    variant = 'default'
}: {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'compact' | 'wide';
}) {
    const variants = {
        default: 'grid gap-4 md:grid-cols-2 lg:grid-cols-4',
        compact: 'grid gap-3 md:grid-cols-3 lg:grid-cols-6',
        wide: 'grid gap-4 md:grid-cols-1 lg:grid-cols-5'
    };

    return (
        <div className={cn(variants[variant], className)}>
            {children}
        </div>
    );
}

// Content Grid - For main content areas (2 columns)
export function ContentGrid({
    children,
    className,
    variant = 'default'
}: {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'sidebar' | 'equal';
}) {
    const variants = {
        default: 'grid gap-4 md:grid-cols-2',
        sidebar: 'grid gap-4 md:grid-cols-3', // For sidebar layouts
        equal: 'grid gap-4 md:grid-cols-2 lg:grid-cols-2'
    };

    return (
        <div className={cn(variants[variant], className)}>
            {children}
        </div>
    );
}

// List Grid - For item lists and cards
export function ListGrid({
    children,
    className,
    variant = 'default'
}: {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'dense' | 'wide';
}) {
    const variants = {
        default: 'grid gap-4 md:grid-cols-2 lg:grid-cols-3',
        dense: 'grid gap-3 md:grid-cols-3 lg:grid-cols-4',
        wide: 'grid gap-4 md:grid-cols-1 lg:grid-cols-4'
    };

    return (
        <div className={cn(variants[variant], className)}>
            {children}
        </div>
    );
}

// Form Grid - For form layouts
export function FormGrid({
    children,
    className,
    variant = 'default'
}: {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'compact';
}) {
    const variants = {
        default: 'grid gap-4 py-4',
        compact: 'grid gap-3 py-3'
    };

    return (
        <div className={cn(variants[variant], className)}>
            {children}
        </div>
    );
}

// Responsive Container - For consistent page spacing
export function PageContainer({
    children,
    className,
    spacing = 'default'
}: {
    children: React.ReactNode;
    className?: string;
    spacing?: 'default' | 'compact' | 'loose';
}) {
    const spacings = {
        default: 'space-y-6',
        compact: 'space-y-4',
        loose: 'space-y-8'
    };

    return (
        <div className={cn(spacings[spacing], className)}>
            {children}
        </div>
    );
}

// Header Actions Container - For consistent action button placement
export function HeaderActions({
    children,
    className,
    justify = 'end'
}: {
    children: React.ReactNode;
    className?: string;
    justify?: 'start' | 'center' | 'end' | 'between';
}) {
    const justifications = {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        between: 'justify-between'
    };

    return (
        <div className={cn('flex flex-wrap gap-2', justifications[justify], className)}>
            {children}
        </div>
    );
}