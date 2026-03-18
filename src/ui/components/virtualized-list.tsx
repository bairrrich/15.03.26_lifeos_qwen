'use client';

import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '@/lib/utils';

interface VirtualizedListProps<T> {
    /** Data items to render */
    items: T[];
    /** Render function for each item */
    renderItem: (item: T, index: number) => React.ReactNode;
    /** Height of each item in pixels */
    itemHeight: number;
    /** Additional CSS classes for container */
    className?: string;
    /** Number of overscan items to render outside viewport */
    overscan?: number;
    /** Height of the container. Defaults to 400px */
    height?: number | string;
    /** Loading state */
    isLoading?: boolean;
    /** Optional message when no items */
    emptyMessage?: string;
}

/**
 * Virtualized list component for rendering large datasets efficiently.
 * Uses @tanstack/react-virtual to only render items in the viewport.
 * 
 * @example
 * ```tsx
 * <VirtualizedList
 *   items={transactions}
 *   itemHeight={72}
 *   renderItem={(tx) => <TransactionCard transaction={tx} />}
 * />
 * ```
 */
export function VirtualizedList<T>({
    items,
    renderItem,
    itemHeight,
    className,
    overscan = 5,
    height = 400,
    isLoading,
    emptyMessage = 'No items to display',
}: VirtualizedListProps<T>) {
    const parentRef = useRef<HTMLDivElement>(null);

    const virtualizer = useVirtualizer({
        count: items.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => itemHeight,
        overscan,
    });

    if (isLoading) {
        return (
            <div
                className={cn('overflow-auto', className)}
                style={{ height }}
            >
                <div className="space-y-2 p-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-16 animate-pulse rounded-md bg-muted"
                            style={{ height: itemHeight }}
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div
                className={cn('flex items-center justify-center text-muted-foreground', className)}
                style={{ height }}
            >
                {emptyMessage}
            </div>
        );
    }

    return (
        <div
            ref={parentRef}
            className={cn('overflow-auto', className)}
            style={{ height }}
        >
            <div
                style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                }}
            >
                {virtualizer.getVirtualItems().map((virtualItem) => (
                    <div
                        key={virtualItem.key}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: `${virtualItem.size}px`,
                            transform: `translateY(${virtualItem.start}px)`,
                        }}
                    >
                        {renderItem(items[virtualItem.index], virtualItem.index)}
                    </div>
                ))}
            </div>
        </div>
    );
}

