'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAppStore, useTheme } from '@/shared/hooks';
import { Moon, Sun, Monitor, User, Database, LogOut } from 'lucide-react';
import { signOut } from '@/core/auth';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Вы успешно вышли');
    router.push('/login');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Настройки</h1>
        <p className="text-muted-foreground">Управление приложением и профилем</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Тема оформления
          </CardTitle>
          <CardDescription>Выберите тему для приложения</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sun className="h-5 w-5" />
              <Label htmlFor="light-theme" className="cursor-pointer">
                Светлая
              </Label>
            </div>
            <Switch
              id="light-theme"
              checked={theme === 'light'}
              onCheckedChange={() => setTheme('light')}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="h-5 w-5" />
              <Label htmlFor="dark-theme" className="cursor-pointer">
                Тёмная
              </Label>
            </div>
            <Switch
              id="dark-theme"
              checked={theme === 'dark'}
              onCheckedChange={() => setTheme('dark')}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Monitor className="h-5 w-5" />
              <Label htmlFor="system-theme" className="cursor-pointer">
                Системная
              </Label>
            </div>
            <Switch
              id="system-theme"
              checked={theme === 'system'}
              onCheckedChange={() => setTheme('system')}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Интерфейс
          </CardTitle>
          <CardDescription>Настройки отображения</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Label htmlFor="sidebar">Боковая панель</Label>
            </div>
            <Switch id="sidebar" checked={sidebarOpen} onCheckedChange={toggleSidebar} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Данные
          </CardTitle>
          <CardDescription>Управление локальными данными</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Экспорт данных</Label>
              <p className="text-sm text-muted-foreground">Скачать все данные в JSON</p>
            </div>
            <Button variant="outline">Экспорт</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Импорт данных</Label>
              <p className="text-sm text-muted-foreground">Загрузить данные из JSON</p>
            </div>
            <Button variant="outline">Импорт</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-destructive">Очистить все данные</Label>
              <p className="text-sm text-muted-foreground">Удалить все локальные данные</p>
            </div>
            <Button variant="destructive">Очистить</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5" />
            Аккаунт
          </CardTitle>
          <CardDescription>Управление аккаунтом</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleSignOut}>
            Выйти из аккаунта
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
