import { cn } from '@/lib/utils';
import { Button } from './button';

/**
 * Touch-friendly components ensuring 44px minimum touch targets
 * for better mobile accessibility and user experience
 */

// Enhanced Button with guaranteed touch targets
export function TouchButton({
    className,
    size = 'default',
    touchFriendly = false,
    ...props
}: React.ComponentProps<typeof Button> & {
    size?: 'default' | 'sm' | 'lg';
    touchFriendly?: boolean;
}) {
    return (
        <Button
            className={cn(
                touchFriendly && 'min-h-[44px] min-w-[44px] px-4 py-3',
                className
            )}
            size={size}
            {...props}
        />
    );
}

// Touch-friendly card actions
export function TouchCardAction({
    children,
    className,
    ...props
}: React.ComponentProps<'div'>) {
    return (
        <div
            className={cn(
                'flex items-center justify-center min-h-[44px] min-w-[44px] p-2 rounded-md hover:bg-muted transition-colors',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

// Touch-friendly list item
export function TouchListItem({
    children,
    className,
    onClick,
    ...props
}: React.ComponentProps<'div'> & {
    onClick?: () => void;
}) {
    return (
        <div
            className={cn(
                'flex items-center min-h-[44px] px-4 py-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer',
                onClick && 'cursor-pointer',
                className
            )}
            onClick={onClick}
            {...props}
        >
            {children}
        </div>
    );
}

// Touch-friendly form inputs
export function TouchInput({
    className,
    ...props
}: React.ComponentProps<'input'>) {
    return (
        <input
            className={cn(
                'flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                className
            )}
            {...props}
        />
    );
}

// Touch-friendly select trigger
export function TouchSelectTrigger({
    className,
    children,
    ...props
}: React.ComponentProps<'button'>) {
    return (
        <button
            className={cn(
                'flex h-12 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}

// Utility hook for detecting mobile devices
export function useIsMobile() {
    if (typeof window === 'undefined') return false;

    return window.innerWidth < 768 || 'ontouchstart' in window;
}

// Utility hook for touch detection
export function useIsTouchDevice() {
    if (typeof window === 'undefined') return false;

    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}
