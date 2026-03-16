import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/shared/hooks/providers';
import { Toaster } from '@/components/ui/sonner';
import { PWAInstallPrompt } from '@/shared/components/pwa-install-prompt';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import AppLayout from './app-layout';

export const viewport: Viewport = {
  themeColor: '#6366f1',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'LifeOS — Ваша панель управления жизнью',
  description: 'Универсальная платформа для управления всеми аспектами жизни',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LifeOS',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="antialiased">
        <ErrorBoundary>
          <Providers>
            <AppLayout>{children}</AppLayout>
            <Toaster />
            <PWAInstallPrompt />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
