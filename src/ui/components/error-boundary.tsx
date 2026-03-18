'use client';

import { Component, type ReactNode, type ErrorInfo } from 'react';
import { useState } from 'react';
import { Button } from '@/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/components/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

/**
 * Error Boundary — перехватывает ошибки в дочерних компонентах
 * Предотвращает падение всего приложения при ошибке в одном компоненте
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined });
    };

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex min-h-[400px] items-center justify-center p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <CardTitle>Что-то пошло не так</CardTitle>
                            <CardDescription>
                                Произошла непредвиденная ошибка. Попробуйте перезагрузить страницу.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {this.state.error && (
                                <div className="rounded bg-muted p-2 text-xs text-muted-foreground">
                                    {this.state.error.message}
                                </div>
                            )}
                            <div className="flex gap-2">
                                <Button onClick={this.handleReset} variant="outline" className="flex-1">
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Попробовать снова
                                </Button>
                                <Button onClick={this.handleGoHome} className="flex-1">
                                    <Home className="mr-2 h-4 w-4" />
                                    На главную
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Хук для использования Error Boundary как компонента
 */

interface UseErrorBoundaryOptions {
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
    onReset?: () => void;
}

export function useErrorBoundary(options: UseErrorBoundaryOptions = {}) {
    const [error, setError] = useState<Error | null>(null);

    const resetError = () => {
        setError(null);
        options.onReset?.();
    };

    const catchError = (err: Error) => {
        setError(err);
        options.onError?.(err, { componentStack: '' });
    };

    return {
        error,
        hasError: error !== null,
        resetError,
        catchError,
    };
}

