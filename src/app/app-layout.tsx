'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/shared/hooks/use-app-store';
import { Sidebar } from '@/ui/navigation/sidebar';
import { CommandPalette } from '@/ui/navigation/command-palette';
import { QuickAdd } from '@/ui/navigation/quick-add';
import { Button } from '@/components/ui/button';
import { Menu, Bell, X, LayoutDashboard, CreditCard, Utensils, Dumbbell, Target, Heart, BookOpen, Sparkles, Zap, Settings, LogOut, LogIn, DollarSign, PieChart, Repeat, TrendingUp, Wallet, Calendar, CalendarCheck, Tags, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut, isLocalMode, getLocalUser } from '@/core/auth';
import { toast } from 'sonner';

interface AppLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Дашборд', href: '/', icon: LayoutDashboard },
  { name: 'Финансы', href: '/finance', icon: CreditCard },
  { name: 'Питание', href: '/nutrition', icon: Utensils },
  { name: 'Тренировки', href: '/workouts', icon: Dumbbell },
  { name: 'Привычки', href: '/habits', icon: CalendarCheck },
  { name: 'Цели', href: '/goals', icon: Target },
  { name: 'Ум', href: '/mind', icon: BookOpen },
  { name: 'Здоровье', href: '/health', icon: Heart },
  { name: 'Красота', href: '/beauty', icon: Sparkles },
  { name: 'Автоматизации', href: '/automations', icon: Zap },
  { name: 'Настройки', href: '/settings', icon: Settings },
];

const financeSubItems = [
  { name: 'Транзакции', href: '/finance', icon: DollarSign },
  { name: 'Категории', href: '/finance/categories', icon: Tags },
  { name: 'Счета', href: '/finance/accounts', icon: Wallet },
  { name: 'Бюджеты', href: '/finance/budgets', icon: PieChart },
  { name: 'Подписки', href: '/finance/subscriptions', icon: Repeat },
  { name: 'Инвестиции', href: '/finance/investments', icon: TrendingUp },
  { name: 'Аналитика', href: '/finance/analytics', icon: BarChart3 },
];

const nutritionSubItems = [
  { name: 'Дневник', href: '/nutrition', icon: Utensils },
  { name: 'Продукты', href: '/nutrition/foods', icon: DollarSign },
  { name: 'Рецепты', href: '/nutrition/recipes', icon: DollarSign },
];

const workoutsSubItems = [
  { name: 'Обзор', href: '/workouts', icon: Dumbbell },
  { name: 'Упражнения', href: '/workouts/exercises', icon: Target },
  { name: 'Программы', href: '/workouts/programs', icon: Calendar },
  { name: 'Прогресс', href: '/workouts/progress', icon: TrendingUp },
  { name: 'История', href: '/workouts/history', icon: DollarSign },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isFinanceSection = pathname.startsWith('/finance');
  const isNutritionSection = pathname.startsWith('/nutrition');
  const isWorkoutsSection = pathname.startsWith('/workouts');

  // Определяем заголовок и подзаголовок для текущего раздела
  const getPageHeader = () => {
    // Главная страница
    if (pathname === '/') {
      return { title: 'LifeOS', subtitle: 'Ваша персональная панель управления жизнью' };
    }
    // Финансы
    if (pathname === '/finance') {
      return { title: 'Финансы', subtitle: 'Управляйте своими финансами' };
    }
    if (pathname === '/finance/categories') {
      return { title: 'Категории', subtitle: 'Управление категориями транзакций' };
    }
    if (pathname === '/finance/analytics') {
      return { title: 'Аналитика', subtitle: 'Детальный анализ финансов' };
    }
    if (pathname === '/finance/accounts') {
      return { title: 'Счета', subtitle: 'Управление финансовыми счетами' };
    }
    if (pathname === '/finance/budgets') {
      return { title: 'Бюджеты', subtitle: 'Контроль расходов по категориям' };
    }
    if (pathname === '/finance/subscriptions') {
      return { title: 'Подписки', subtitle: 'Учёт периодических платежей' };
    }
    if (pathname === '/finance/investments') {
      return { title: 'Инвестиции', subtitle: 'Учёт активов и портфель' };
    }

    // Питание
    if (pathname === '/nutrition') {
      return { title: 'Питание', subtitle: 'Дневник питания и подсчёт КБЖУ' };
    }
    if (pathname === '/nutrition/foods') {
      return { title: 'Продукты', subtitle: 'База продуктов' };
    }
    if (pathname === '/nutrition/recipes') {
      return { title: 'Рецепты', subtitle: 'Кулинарные рецепты' };
    }

    // Тренировки
    if (pathname === '/workouts') {
      return { title: 'Тренировки', subtitle: 'Планы, журнал и прогресс' };
    }
    if (pathname === '/workouts/exercises') {
      return { title: 'Упражнения', subtitle: 'Библиотека упражнений' };
    }
    if (pathname === '/workouts/programs') {
      return { title: 'Программы', subtitle: 'Планы тренировок' };
    }
    if (pathname === '/workouts/progress') {
      return { title: 'Прогресс', subtitle: 'Аналитика и достижения' };
    }
    if (pathname === '/workouts/history') {
      return { title: 'История', subtitle: 'Все тренировки' };
    }

    // Остальные модули
    if (pathname === '/habits') {
      return { title: 'Привычки', subtitle: 'Трекер привычек' };
    }
    if (pathname === '/goals') {
      return { title: 'Цели', subtitle: 'Долгосрочные цели и задачи' };
    }
    if (pathname === '/health') {
      return { title: 'Здоровье', subtitle: 'Метрики и самочувствие' };
    }
    if (pathname === '/mind') {
      return { title: 'Ум', subtitle: 'Книги, курсы, заметки' };
    }
    if (pathname === '/beauty') {
      return { title: 'Красота', subtitle: 'Уход и косметика' };
    }
    if (pathname === '/automations') {
      return { title: 'Автоматизации', subtitle: 'Правила и триггеры' };
    }
    if (pathname === '/settings/profile') {
      return { title: 'Профиль', subtitle: 'Настройки профиля' };
    }
    if (pathname === '/settings') {
      return { title: 'Настройки', subtitle: 'Параметры приложения' };
    }
    if (pathname === '/widgets') {
      return { title: 'Виджеты', subtitle: 'Настройка дашборда' };
    }
    if (pathname === '/sharing') {
      return { title: 'Семейный доступ', subtitle: 'Общий доступ к данным' };
    }
    return null;
  };

  const pageHeader = getPageHeader();

  // Страницы без layout (login и т.д.)
  const isAuthPage = pathname === '/login';
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkAuth = useCallback(() => {
    const local = isLocalMode();
    const localUser = getLocalUser();
    const hasSession = local || document.cookie.includes('supabase-auth-token');
    setIsLoggedIn(hasSession || !!localUser);
  }, []);

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

  useEffect(() => {
    checkAuth();

    const handleStorageChange = () => checkAuth();
    window.addEventListener('storage', handleStorageChange);

    // Проверяем cookie каждую секунду
    const cookieCheckInterval = setInterval(checkAuth, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(cookieCheckInterval);
    };
  }, [checkAuth]);

  // Закрывать мобильное меню при навигации
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  const isOpen = isMobile ? mobileOpen : sidebarOpen;
  const handleToggle = isMobile ? () => setMobileOpen(!mobileOpen) : toggleSidebar;
  const handleCloseMobile = () => setMobileOpen(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Overlay */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={handleCloseMobile}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed left-0 top-0 z-50 h-screen border-r bg-background transition-transform duration-300',
          isMobile
            ? mobileOpen
              ? 'translate-x-0'
              : '-translate-x-full'
            : isOpen
              ? 'translate-x-0'
              : '-translate-x-[calc(100%-3.5rem)]',
          isMobile ? 'w-64' : 'w-64'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b px-4">
            <span className="text-lg font-bold">LifeOS</span>
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={handleCloseMobile}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const isFinance = item.href === '/finance';
              const isNutrition = item.href === '/nutrition';
              const isWorkouts = item.href === '/workouts';

              const showFinanceSubItems = isFinance && sidebarOpen && isFinanceSection;
              const showNutritionSubItems = isNutrition && sidebarOpen && isNutritionSection;
              const showWorkoutsSubItems = isWorkouts && sidebarOpen && isWorkoutsSection;

              return (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    onClick={handleCloseMobile}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>

                  {/* Finance Sub-Items */}
                  {showFinanceSubItems && (
                    <div className="ml-6 mt-1 space-y-1">
                      {financeSubItems.map((subItem) => {
                        const isSubActive = pathname === subItem.href;
                        return (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            onClick={handleCloseMobile}
                            className={cn(
                              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                              isSubActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                          >
                            <subItem.icon className="h-4 w-4 flex-shrink-0" />
                            <span>{subItem.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {/* Nutrition Sub-Items */}
                  {showNutritionSubItems && (
                    <div className="ml-6 mt-1 space-y-1">
                      {nutritionSubItems.map((subItem) => {
                        const isSubActive = pathname === subItem.href;
                        return (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            onClick={handleCloseMobile}
                            className={cn(
                              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                              isSubActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                          >
                            <subItem.icon className="h-4 w-4 flex-shrink-0" />
                            <span>{subItem.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {/* Workouts Sub-Items */}
                  {showWorkoutsSubItems && (
                    <div className="ml-6 mt-1 space-y-1">
                      {workoutsSubItems.map((subItem) => {
                        const isSubActive = pathname === subItem.href;
                        return (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            onClick={handleCloseMobile}
                            className={cn(
                              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                              isSubActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                          >
                            <subItem.icon className="h-4 w-4 flex-shrink-0" />
                            <span>{subItem.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="border-t p-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3"
              onClick={async () => {
                if (isLoggedIn) {
                  try {
                    await signOut();
                  } catch (error) {
                    toast.error('Ошибка при выходе');
                  }
                } else {
                  window.location.href = '/login';
                }
              }}
            >
              {isLoggedIn ? (
                <LogOut className="h-5 w-5" />
              ) : (
                <LogIn className="h-5 w-5" />
              )}
              <span>{isLoggedIn ? 'Выйти' : 'Войти'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main
        className={cn(
          'min-h-screen transition-all duration-300',
          isMobile ? 'ml-0' : sidebarOpen ? 'ml-64' : 'ml-16'
        )}
      >
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
          )}

          {pageHeader && (
            <div className="flex flex-col justify-center">
              <h1 className="text-base font-semibold">{pageHeader.title}</h1>
              <p className="text-xs text-muted-foreground">{pageHeader.subtitle}</p>
            </div>
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
