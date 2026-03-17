'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageTransitionProps extends HTMLMotionProps<'div'> {
    children: ReactNode;
    variant?: 'fade' | 'slide' | 'scale';
    delay?: number;
}

/**
 * Page transition component with Framer Motion animations
 */
export function PageTransition({
    children,
    variant = 'fade',
    delay = 0,
    className,
    ...props
}: PageTransitionProps) {
    const variants = {
        fade: {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
        },
        slide: {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -20 },
        },
        scale: {
            initial: { opacity: 0, scale: 0.95 },
            animate: { opacity: 1, scale: 1 },
            exit: { opacity: 0, scale: 1.05 },
        },
    };

    return (
        <motion.div
            className={cn(className)}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants[variant]}
            transition={{
                duration: 0.3,
                delay,
                ease: 'easeOut',
            }}
            {...props}
        >
            {children}
        </motion.div>
    );
}

/**
 * Staggered children animation container
 */
export function StaggerContainer({
    children,
    className,
    staggerDelay = 0.1,
}: {
    children: ReactNode;
    className?: string;
    staggerDelay?: number;
}) {
    return (
        <motion.div
            className={className}
            initial="initial"
            animate="animate"
            variants={{
                animate: {
                    transition: {
                        staggerChildren: staggerDelay,
                    },
                },
            }}
        >
            {children}
        </motion.div>
    );
}

/**
 * Animated list item
 */
export function AnimatedListItem({
    children,
    className,
    index = 0,
}: {
    children: ReactNode;
    className?: string;
    index?: number;
}) {
    return (
        <motion.div
            className={className}
            variants={{
                initial: { opacity: 0, x: -20 },
                animate: {
                    opacity: 1,
                    x: 0,
                    transition: {
                        duration: 0.3,
                        delay: index * 0.05,
                    },
                },
            }}
        >
            {children}
        </motion.div>
    );
}

/**
 * Fade in animation wrapper
 */
export function FadeIn({
    children,
    className,
    delay = 0,
}: {
    children: ReactNode;
    className?: string;
    delay?: number;
}) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay }}
        >
            {children}
        </motion.div>
    );
}

/**
 * Slide up animation wrapper
 */
export function SlideUp({
    children,
    className,
    delay = 0,
}: {
    children: ReactNode;
    className?: string;
    delay?: number;
}) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay, ease: 'easeOut' }}
        >
            {children}
        </motion.div>
    );
}

/**
 * Scale animation wrapper
 */
export function ScaleIn({
    children,
    className,
    delay = 0,
}: {
    children: ReactNode;
    className?: string;
    delay?: number;
}) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay, ease: 'easeOut' }}
        >
            {children}
        </motion.div>
    );
}

/**
 * Card hover animation
 */
export function CardHover({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            className={className}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
        >
            {children}
        </motion.div>
    );
}

/**
 * Button press animation
 */
export function ButtonPress({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            className={className}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.1 }}
        >
            {children}
        </motion.div>
    );
}
