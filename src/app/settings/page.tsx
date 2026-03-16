'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAppStore, useTheme } from '@/shared/hooks';
import { NotificationSettingsCard } from '@/shared/components/notification-settings';
import { Moon, Sun, Monitor, User as UserIcon, Database, LogOut, Download, Upload, Trash2, LayoutGrid, Users, LogIn } from 'lucide-react';
import { signOut, getCurrentUserOrLocal } from '@/core/auth';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { dataExportImportService } from '@/core/database/export-import';
import type { User } from '@supabase/supabase-js';
import type { LocalUser } from '@/core/auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | LocalUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const user = await getCurrentUserOrLocal();
      setCurrentUser(user);
      setIsLoading(false);
    };
    loadUser();
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await dataExportImportService.exportAllData();
      const timestamp = new Date().toISOString().split('T')[0];
      dataExportImportService.downloadExport(data, `lifeos-backup-${timestamp}.json`);
      toast.success('Данные успешно экспортированы');
    } catch {
      toast.error('Ошибка при экспорте данных');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const data = await dataExportImportService.loadFromFile(file);
      const result = await dataExportImportService.importData(data);

      if (result.success) {
        toast.success('Данные успешно импортированы');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast.error(result.errors.join(', '));
      }
    } catch {
      toast.error('Ошибка при импорте данных');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClearAll = () => {
    setShowClearConfirm(true);
  };

  const confirmClearAll = async () => {
    try {
      await dataExportImportService.clearAllData();
      toast.success('Все данные удалены');
      setShowClearConfirm(false);
      setTimeout(() => window.location.reload(), 1000);
    } catch {
      toast.error('Ошибка при удалении данных');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions - пустой блок для единообразия */}
      <div className="flex flex-wrap gap-2 justify-end"></div>

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
            <UserIcon className="h-5 w-5" />
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
          <CardTitle>Интеграции</CardTitle>
          <CardDescription>Дополнительные возможности</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => router.push('/widgets')}>
            <div className="flex items-center gap-3">
              <LayoutGrid className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Виджеты</p>
                <p className="text-sm text-muted-foreground">Настройте свой дашборд</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">Открыть</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => router.push('/sharing')}>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Семейный доступ</p>
                <p className="text-sm text-muted-foreground">Делитесь данными с семьёй</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">Открыть</Button>
          </div>
        </CardContent>
      </Card>

      <NotificationSettingsCard />

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
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={isExporting}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {isExporting ? 'Экспорт...' : 'Экспорт'}
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Импорт данных</Label>
              <p className="text-sm text-muted-foreground">Загрузить данные из JSON</p>
            </div>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                {isImporting ? 'Импорт...' : 'Импорт'}
              </Button>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-destructive">Очистить все данные</Label>
              <p className="text-sm text-muted-foreground">Удалить все локальные данные</p>
            </div>
            <Button variant="destructive" onClick={handleClearAll} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Очистить
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Аккаунт
          </CardTitle>
          <CardDescription>Управление аккаунтом</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Загрузка...</div>
          ) : currentUser ? (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                    {currentUser.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{currentUser.email || 'Пользователь'}</p>
                    <p className="text-sm text-muted-foreground">
                      {'isLocal' in currentUser && currentUser.isLocal
                        ? 'Локальный аккаунт'
                        : 'Зарегистрированный аккаунт'}
                    </p>
                  </div>
                </div>
                {'created_at' in currentUser && currentUser.created_at && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Зарегистрирован: {new Date(currentUser.created_at).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                )}
              </div>
              <Separator />
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Выйти из аккаунта
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Вы не авторизованы. Войдите в аккаунт для управления настройками.
              </p>
              <Button onClick={() => router.push('/login')}>
                <LogIn className="h-4 w-4 mr-2" />
                Войти
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Диалог подтверждения очистки всех данных */}
      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Очистка всех данных</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены? Все данные будут безвозвратно удалены.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClearAll}>Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
