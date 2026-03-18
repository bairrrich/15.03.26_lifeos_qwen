'use client';

import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '@/lib/utils';

interface VirtualizedGridProps<T> {
    /** Data items to render */
    items: T[];
    /** Render function for each item */
    renderItem: (item: T, index: number) => React.ReactNode;
    /** Number of columns in the grid */
    columns?: number;
    /** Height of each item in pixels */
    itemHeight: number;
    /** Gap between items in pixels */
    gap?: number;
    /** Additional CSS classes for container */
    className?: string;
    /** Number of overscan items to render outside viewport */
    overscan?: number;
    /** Height of the container. Defaults to 600px */
    height?: number | string;
    /** Loading state */
    isLoading?: boolean;
    /** Optional message when no items */
    emptyMessage?: string;
}

/**
 * Virtualized grid component for rendering large datasets in a grid layout efficiently.
 * Uses @tanstack/react-virtual to only render items in the viewport.
 * 
 * @example
 * ```tsx
 * <VirtualizedGrid
 *   items={workouts}
 *   columns={3}
 *   itemHeight={250}
 *   renderItem={(workout) => <WorkoutCard workout={workout} />}
 * />
 * ```
 */
export function VirtualizedGrid<T>({
    items,
    renderItem,
    columns = 3,
    itemHeight,
    gap = 16,
    className,
    overscan = 3,
    height = 600,
    isLoading,
    emptyMessage = 'No items to display',
}: VirtualizedGridProps<T>) {
    const parentRef = useRef<HTMLDivElement>(null);

    const rowCount = Math.ceil(items.length / columns);
    const estimatedRowHeight = itemHeight + gap;

    const virtualizer = useVirtualizer({
        count: rowCount,
        getScrollElement: () => parentRef.current,
        estimateSize: () => estimatedRowHeight,
        overscan,
    });

    if (isLoading) {
        return (
            <div
                className={cn('overflow-auto', className)}
                style={{ height }}
            >
                <div
                    className="grid gap-4 p-1"
                    style={{
                        gridTemplateColumns: `repeat(${columns}, 1fr)`,
                    }}
                >
                    {Array.from({ length: columns * 3 }).map((_, i) => (
                        <div
                            key={i}
                            className="animate-pulse rounded-md bg-muted"
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
                {virtualizer.getVirtualItems().map((virtualRow) => {
                    const rowIndex = virtualRow.index;
                    const startIndex = rowIndex * columns;
                    const rowItems = items.slice(startIndex, startIndex + columns);

                    return (
                        <div
                            key={virtualRow.key}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: `${virtualRow.size}px`,
                                transform: `translateY(${virtualRow.start}px)`,
                            }}
                        >
                            <div
                                className="grid gap-4 h-full"
                                style={{
                                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                                }}
                            >
                                {rowItems.map((item, colIndex) => (
                                    <div key={colIndex} style={{ height: itemHeight }}>
                                        {renderItem(item, startIndex + colIndex)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

