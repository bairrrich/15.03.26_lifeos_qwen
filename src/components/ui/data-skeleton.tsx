import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

interface DataSkeletonProps {
    /** Количество строк для отображения */
    rows?: number;
    /** Показывать ли заголовок таблицы */
    showHeader?: boolean;
    /** Дополнительные классы */
    className?: string;
}

/**
 * Skeleton загрузчик для списков данных
 * Используется во время загрузки данных
 */
export function DataSkeleton({
    rows = 5,
    showHeader = true,
    className,
}: DataSkeletonProps) {
    return (
        <div className={cn('space-y-3', className)}>
            {showHeader && (
                <div className="flex gap-4">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                </div>
            )}

            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-4">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                </div>
            ))}
        </div>
    );
}

/**
 * Skeleton для карточки
 */
export function CardSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn('space-y-3', className)}>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
        </div>
    );
}

/**
 * Skeleton для списка карточек
 */
export function CardListSkeleton({
    count = 3,
    className,
}: {
    count?: number;
    className?: string;
}) {
    return (
        <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-3', className)}>
            {Array.from({ length: count }).map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    );
}
