'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CreditCard,
  Utensils,
  Dumbbell,
  Target,
  Heart,
  BookOpen,
  Sparkles,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from '@/core/auth';
import { toast } from 'sonner';

const navigation = [
  { name: 'Дашборд', href: '/', icon: LayoutDashboard },
  { name: 'Финансы', href: '/finance', icon: CreditCard },
  { name: 'Питание', href: '/nutrition', icon: Utensils },
  { name: 'Тренировки', href: '/workouts', icon: Dumbbell },
  { name: 'Привычки', href: '/habits', icon: Target },
  { name: 'Цели', href: '/goals', icon: Target },
  { name: 'Здоровье', href: '/health', icon: Heart },
  { name: 'Ум', href: '/mind', icon: BookOpen },
  { name: 'Красота', href: '/beauty', icon: Sparkles },
  { name: 'Настройки', href: '/settings', icon: Settings },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r bg-background transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && <span className="text-lg font-bold">LifeOS</span>}
        <Button variant="ghost" size="icon" onClick={onToggle} className="ml-auto">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="space-y-1 p-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-4 left-0 right-0 p-2">
        <Button
          variant="ghost"
          className={cn('w-full justify-start gap-3', collapsed && 'justify-center')}
          onClick={async () => {
            await signOut();
            toast.success('Вы успешно вышли');
          }}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Выйти</span>}
        </Button>
      </div>
    </aside>
  );
}
