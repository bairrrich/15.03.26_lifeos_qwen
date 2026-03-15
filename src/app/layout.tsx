import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/shared/hooks/providers';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'LifeOS — Ваша панель управления жизнью',
  description: 'Универсальная платформа для управления всеми аспектами жизни',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
