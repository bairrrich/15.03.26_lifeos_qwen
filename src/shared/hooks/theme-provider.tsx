'use client';

import { useTheme } from './use-theme';

/**
 * ThemeProvider component that ensures theme is applied on app initialization.
 * This component uses the useTheme hook to apply the current theme to the DOM
 * when the app loads, ensuring consistent theming from the first visit.
 */
export function ThemeProvider() {
    // Call useTheme to ensure theme application on mount
    useTheme();

    return null;
}