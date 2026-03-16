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
  Zap,
  DollarSign,
  PieChart,
  Repeat,
  TrendingUp,
  Wallet,
  Tags,
} from 'lucide-react'
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
  { name: 'Автоматизации', href: '/automations', icon: Zap },
  { name: 'Настройки', href: '/settings', icon: Settings },
];

const financeSubItems = [
  { name: 'Транзакции', href: '/finance', icon: DollarSign },
  { name: 'Счета', href: '/finance/accounts', icon: Wallet },
  { name: 'Бюджеты', href: '/finance/budgets', icon: PieChart },
  { name: 'Подписки', href: '/finance/subscriptions', icon: Repeat },
  { name: 'Инвестиции', href: '/finance/investments', icon: TrendingUp },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const isFinanceSection = pathname.startsWith('/finance');

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r bg-background transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          isFinanceSection ? (
            <div>
              <span className="text-lg font-bold">Финансы</span>
              <p className="text-xs text-muted-foreground">Управляйте своими финансами</p>
            </div>
          ) : (
            <span className="text-lg font-bold">LifeOS</span>
          )
        )}
        <Button variant="ghost" size="icon" onClick={onToggle} className="ml-auto">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="space-y-1 p-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href);
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

      {/* Finance Sub-Items */}
      {!collapsed && isFinanceSection && (
        <div className="border-t border-border pt-2 mt-2 px-2">
          <p className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">Разделы</p>
          {financeSubItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      )}

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
