'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/shared/hooks/use-app-store';
import { Sidebar } from '@/ui/navigation/sidebar';
import { CommandPalette } from '@/ui/navigation/command-palette';
import { QuickAdd } from '@/ui/navigation/quick-add';
import { Button } from '@/components/ui/button';
import { Menu, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={isMobile ? false : !sidebarOpen} onToggle={toggleSidebar} />

      <main
        className={cn(
          'transition-all duration-300',
          isMobile ? 'ml-0' : sidebarOpen ? 'ml-64' : 'ml-16'
        )}
      >
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
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
