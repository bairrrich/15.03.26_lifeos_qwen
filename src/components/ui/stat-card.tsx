import { Card, CardContent, CardHeader, CardTitle } from './card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

interface StatCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon?: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
    isLoading?: boolean;
    size?: 'default' | 'sm';
}

/**
 * Reusable StatCard component for displaying metrics and KPIs
 * Used across all modules for consistent metric presentation
 */
export function StatCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    className,
    isLoading = false,
    size = 'default'
}: StatCardProps) {
    if (isLoading) {
        return (
            <Card className={cn('', className)}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={cn(
                        'text-sm font-medium',
                        size === 'sm' && 'text-xs'
                    )}>
                        <Skeleton className="h-4 w-24" />
                    </CardTitle>
                    {Icon && <Skeleton className="h-4 w-4" />}
                </CardHeader>
                <CardContent>
                    <Skeleton className={cn(
                        'h-8 w-16 mb-1',
                        size === 'sm' && 'h-6 w-12'
                    )} />
                    {description && <Skeleton className="h-3 w-20" />}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn('', className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={cn(
                    'text-sm font-medium',
                    size === 'sm' && 'text-xs'
                )}>
                    {title}
                </CardTitle>
                {Icon && (
                    <Icon className={cn(
                        'h-4 w-4 text-muted-foreground',
                        size === 'sm' && 'h-3 w-3'
                    )} />
                )}
            </CardHeader>
            <CardContent>
                <div className={cn(
                    'text-2xl font-bold',
                    size === 'sm' && 'text-lg'
                )}>
                    {value}
                    {trend && (
                        <span className={cn(
                            'ml-2 text-xs font-normal',
                            trend.isPositive ? 'text-green-600' : 'text-red-600'
                        )}>
                            {trend.isPositive ? '+' : ''}{trend.value}%
                        </span>
                    )}
                </div>
                {description && (
                    <p className={cn(
                        'text-xs text-muted-foreground',
                        size === 'sm' && 'text-xs'
                    )}>
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

/**
 * Compact version of StatCard for use in grids or lists
 */
export function CompactStatCard({
    title,
    value,
    icon: Icon,
    className,
    isLoading = false
}: Omit<StatCardProps, 'description' | 'trend' | 'size'>) {
    return (
        <StatCard
            title={title}
            value={value}
            icon={Icon}
            size="sm"
            className={cn('h-auto', className)}
            isLoading={isLoading}
        />
    );
}

/**
 * Large stat card for hero metrics
 */
export function HeroStatCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    className,
    isLoading = false
}: Omit<StatCardProps, 'size'>) {
    return (
        <Card className={cn('border-2', className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-base font-semibold">
                    {isLoading ? <Skeleton className="h-5 w-32" /> : title}
                </CardTitle>
                {Icon && !isLoading && (
                    <Icon className="h-5 w-5 text-muted-foreground" />
                )}
                {isLoading && <Skeleton className="h-5 w-5" />}
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold mb-2">
                    {isLoading ? <Skeleton className="h-9 w-24" /> : value}
                </div>
                {description && (
                    <p className="text-sm text-muted-foreground mb-2">
                        {isLoading ? <Skeleton className="h-4 w-40" /> : description}
                    </p>
                )}
                {trend && !isLoading && (
                    <div className={cn(
                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                        trend.isPositive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                    )}>
                        {trend.isPositive ? '+' : ''}{trend.value}% от прошлого периода
                    </div>
                )}
                {isLoading && trend && <Skeleton className="h-6 w-32" />}
            </CardContent>
        </Card>
    );
}