'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/shared/hooks/use-app-store';
import { Sidebar } from '@/ui/navigation/sidebar';
import { CommandPalette } from '@/ui/navigation/command-palette';
import { QuickAdd } from '@/ui/navigation/quick-add';
import { Button } from '@/components/ui/button';
import { Menu, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Страницы без layout (login и т.д.)
  const isAuthPage = pathname === '/login';

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isAuthPage) {
    return <>{children}</>;
  }

  const isOpen = isMobile ? mobileOpen : sidebarOpen;
  const handleToggle = isMobile ? () => setMobileOpen(!mobileOpen) : toggleSidebar;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={!isOpen} onToggle={handleToggle} />

      <main
        className={cn(
          'transition-all duration-300',
          isMobile ? 'ml-0' : isOpen ? 'ml-64' : 'ml-16'
        )}
      >
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={handleToggle}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
        </header>

        <div className="p-6">{children}</div>
      </main>

      <CommandPalette />
      <QuickAdd />
    </div>
  );
}
