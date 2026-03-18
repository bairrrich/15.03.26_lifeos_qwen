'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { Button } from './button';

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    className?: string;
    maxHeight?: string;
}

/**
 * Mobile-optimized bottom sheet component
 * Provides a native mobile experience for forms and content
 */
export function BottomSheet({
    isOpen,
    onClose,
    title,
    children,
    className,
    maxHeight = '80vh'
}: BottomSheetProps) {
    const sheetRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden'; // Prevent background scroll
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    // Handle backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) {
            onClose();
        }
    };

    if (!isOpen) return null;

    const content = (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleBackdropClick}
        >
            <div
                ref={sheetRef}
                className={cn(
                    'relative w-full max-w-md bg-background rounded-t-xl shadow-xl border animate-in slide-in-from-bottom duration-300',
                    'mx-4 mb-4',
                    className
                )}
                style={{ maxHeight }}
            >
                {/* Handle indicator */}
                <div className="flex justify-center pt-3 pb-2">
                    <div className="w-10 h-1 bg-muted rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-6 pb-4 border-b">
                    {title && (
                        <h2 className="text-lg font-semibold">{title}</h2>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-8 w-8 rounded-full ml-auto"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Content */}
                <div className="px-6 py-4 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );

    // Use portal to render at root level
    if (typeof window !== 'undefined') {
        return createPortal(content, document.body);
    }

    return content;
}

/**
 * Hook for using bottom sheet with mobile detection
 */
export function useBottomSheet() {
    const isMobile = typeof window !== 'undefined' &&
        (window.innerWidth < 768 || 'ontouchstart' in window);

    return { isMobile };
}

/**
 * Conditional renderer for mobile vs desktop components
 */
export function MobileAwareSheet({
  mobile: MobileComponent,
  desktop: DesktopComponent,
  ...props
}: {
  mobile: React.ComponentType<Record<string, unknown>>;
  desktop: React.ComponentType<Record<string, unknown>>;
  [key: string]: unknown;
}) {
  const { isMobile } = useBottomSheet();

  if (isMobile) {
    return <MobileComponent {...props} />;
  }

  return <DesktopComponent {...props} />;
}
