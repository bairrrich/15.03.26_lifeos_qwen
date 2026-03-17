'use client';

import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '@/lib/utils';

interface VirtualizedTableProps<T> {
    /** Data items to render */
    items: T[];
    /** Render function for each row */
    renderRow: (item: T, index: number) => React.ReactNode;
    /** Height of each row in pixels */
    rowHeight: number;
    /** Number of columns (for colSpan) */
    columnCount: number;
    /** Column headers */
    headers?: string[];
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
    /** Show table headers */
    showHeaders?: boolean;
}

/**
 * Virtualized table component for rendering large datasets in a table layout efficiently.
 * Uses @tanstack/react-virtual to only render rows in the viewport.
 * 
 * @example
 * ```tsx
 * <VirtualizedTable
 *   items={transactions}
 *   rowHeight={72}
 *   columnCount={5}
 *   headers={['Date', 'Description', 'Category', 'Amount', 'Actions']}
 *   renderRow={(tx, index) => (
 *     <TableRow key={tx.id}>
 *       <TableCell>{format(tx.date, 'dd MMM')}</TableCell>
 *       ...
 *     </TableRow>
 *   )}
 * />
 * ```
 */
export function VirtualizedTable<T>({
    items,
    renderRow,
    rowHeight,
    columnCount,
    headers,
    className,
    overscan = 5,
    height = 400,
    isLoading,
    emptyMessage = 'No items to display',
    showHeaders = true,
}: VirtualizedTableProps<T>) {
    const parentRef = useRef<HTMLDivElement>(null);

    const virtualizer = useVirtualizer({
        count: items.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => rowHeight,
        overscan,
    });

    if (isLoading) {
        return (
            <div
                ref={parentRef}
                className={cn('overflow-auto border rounded-md', className)}
                style={{ height }}
            >
                {showHeaders && headers && (
                    <div
                        className="grid bg-muted/50 border-b sticky top-0 z-10"
                        style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}
                    >
                        {headers.map((header, i) => (
                            <div key={i} className="px-4 py-3 text-sm font-medium">
                                {header}
                            </div>
                        ))}
                    </div>
                )}
                <div className="p-4 space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-16 animate-pulse rounded-md bg-muted"
                            style={{ height: rowHeight }}
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div
                className={cn('flex items-center justify-center border rounded-md text-muted-foreground', className)}
                style={{ height }}
            >
                {emptyMessage}
            </div>
        );
    }

    return (
        <div
            ref={parentRef}
            className={cn('overflow-auto border rounded-md', className)}
            style={{ height }}
        >
            {/* Sticky Header */}
            {showHeaders && headers && (
                <div
                    className="grid bg-muted/50 border-b sticky top-0 z-10"
                    style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}
                >
                    {headers.map((header, i) => (
                        <div key={i} className="px-4 py-3 text-sm font-medium">
                            {header}
                        </div>
                    ))}
                </div>
            )}

            {/* Virtualized Rows */}
            <div
                style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                }}
            >
                {virtualizer.getVirtualItems().map((virtualRow) => {
                    const item = items[virtualRow.index];
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
                            {renderRow(item, virtualRow.index)}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
