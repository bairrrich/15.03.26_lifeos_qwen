import { useRef, useState, useEffect } from 'react';

interface SwipeConfig {
    threshold?: number; // Minimum distance to trigger swipe
    velocity?: number; // Minimum velocity for swipe
    restorePosition?: boolean; // Whether to restore position after swipe
}

interface SwipeState {
    isSwiping: boolean;
    direction: 'left' | 'right' | 'up' | 'down' | null;
    distance: number;
    velocity: number;
}

/**
 * Hook for detecting swipe gestures on touch devices
 * Supports swipe-to-delete, pull-to-refresh, and other swipe interactions
 */
export function useSwipeGesture<T extends HTMLElement>(
    onSwipeLeft?: () => void,
    onSwipeRight?: () => void,
    config: SwipeConfig = {}
) {
    const elementRef = useRef<T>(null);
    const [swipeState, setSwipeState] = useState<SwipeState>({
        isSwiping: false,
        direction: null,
        distance: 0,
        velocity: 0,
    });

    const {
        threshold = 50,
        velocity: minVelocity = 0.3,
        restorePosition = true,
    } = config;

    const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let currentY = 0;
        let startTime = 0;

        const handleTouchStart = (e: TouchEvent) => {
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            currentX = touch.clientX;
            currentY = touch.clientY;
            startTime = Date.now();

            touchStartRef.current = { x: startX, y: startY, time: startTime };

            setSwipeState({
                isSwiping: false,
                direction: null,
                distance: 0,
                velocity: 0,
            });
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!touchStartRef.current) return;

            const touch = e.touches[0];
            currentX = touch.clientX;
            currentY = touch.clientY;

            const deltaX = currentX - startX;
            const deltaY = currentY - startY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const timeElapsed = Date.now() - startTime;
            const velocity = distance / timeElapsed;

            // Determine primary direction
            let direction: 'left' | 'right' | 'up' | 'down' | null = null;
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                direction = deltaX > 0 ? 'right' : 'left';
            } else {
                direction = deltaY > 0 ? 'down' : 'up';
            }

            setSwipeState({
                isSwiping: distance > 10, // Start swiping after 10px movement
                direction,
                distance,
                velocity,
            });

            // Apply transform for visual feedback (horizontal swipes only)
            if (Math.abs(deltaX) > Math.abs(deltaY) && element) {
                element.style.transform = `translateX(${deltaX}px)`;
            }
        };

        const handleTouchEnd = (e: TouchEvent) => {
            if (!touchStartRef.current) return;

            const deltaX = currentX - startX;
            const deltaY = currentY - startY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const timeElapsed = Date.now() - startTime;
            const velocity = distance / timeElapsed;

            // Reset transform
            if (element && restorePosition) {
                element.style.transform = '';
            }

            // Check if swipe meets thresholds
            if (distance > threshold && velocity > minVelocity) {
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    // Horizontal swipe
                    if (deltaX > 0 && onSwipeRight) {
                        onSwipeRight();
                    } else if (deltaX < 0 && onSwipeLeft) {
                        onSwipeLeft();
                    }
                }
            }

            setSwipeState({
                isSwiping: false,
                direction: null,
                distance: 0,
                velocity: 0,
            });

            touchStartRef.current = null;
        };

        // Add touch event listeners
        element.addEventListener('touchstart', handleTouchStart, { passive: true });
        element.addEventListener('touchmove', handleTouchMove, { passive: true });
        element.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            element.removeEventListener('touchstart', handleTouchStart);
            element.removeEventListener('touchmove', handleTouchMove);
            element.removeEventListener('touchend', handleTouchEnd);
        };
    }, [onSwipeLeft, onSwipeRight, threshold, minVelocity, restorePosition]);

    return {
        ref: elementRef,
        ...swipeState,
    };
}

/**
 * Hook for pull-to-refresh functionality
 */
export function usePullToRefresh<T extends HTMLElement>(
    onRefresh: () => void | Promise<void>,
    config: { threshold?: number } = {}
) {
    const elementRef = useRef<T>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);

    const { threshold = 80 } = config;
    const touchStartRef = useRef<{ y: number } | null>(null);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        let startY = 0;
        let currentY = 0;
        let isPulling = false;

        const handleTouchStart = (e: TouchEvent) => {
            const touch = e.touches[0];
            startY = touch.clientY;
            currentY = touch.clientY;
            touchStartRef.current = { y: startY };
            isPulling = false;
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!touchStartRef.current || isRefreshing) return;

            const touch = e.touches[0];
            currentY = touch.clientY;
            const deltaY = currentY - startY;

            // Only handle downward pulls from the top
            if (deltaY > 0 && element.scrollTop === 0) {
                isPulling = true;
                const distance = Math.min(deltaY * 0.5, threshold * 2); // Dampen the pull
                setPullDistance(distance);
                element.style.transform = `translateY(${distance}px)`;
                e.preventDefault(); // Prevent default scrolling
            }
        };

        const handleTouchEnd = async () => {
            if (!isPulling || isRefreshing) {
                setPullDistance(0);
                if (element) element.style.transform = '';
                return;
            }

            if (pullDistance >= threshold) {
                setIsRefreshing(true);
                try {
                    await onRefresh();
                } finally {
                    setIsRefreshing(false);
                }
            }

            // Animate back to original position
            setPullDistance(0);
            if (element) {
                element.style.transition = 'transform 0.3s ease-out';
                element.style.transform = '';
                setTimeout(() => {
                    if (element) element.style.transition = '';
                }, 300);
            }

            touchStartRef.current = null;
            isPulling = false;
        };

        element.addEventListener('touchstart', handleTouchStart, { passive: true });
        element.addEventListener('touchmove', handleTouchMove, { passive: false });
        element.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            element.removeEventListener('touchstart', handleTouchStart);
            element.removeEventListener('touchmove', handleTouchMove);
            element.removeEventListener('touchend', handleTouchEnd);
        };
    }, [onRefresh, threshold, isRefreshing, pullDistance]);

    return {
        ref: elementRef,
        isRefreshing,
        pullDistance,
    };
}