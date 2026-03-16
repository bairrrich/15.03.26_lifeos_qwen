'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { migrateLocalToSupabase, hasLocalData, getLocalUser, signOutLocally } from '@/core/auth';
import { getCurrentUser } from '@/core/auth';
import { toast } from 'sonner';
import { Database, ArrowRight, Loader2 } from 'lucide-react';

/**
 * Компонент предлагает миграцию данных из локального режима в Supabase
 * после успешного входа зарегистрированного пользователя
 */
export function MigrationPrompt() {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [localDataCount, setLocalDataCount] = useState(0);

  useEffect(() => {
    checkForMigration();
  }, []);

  const checkForMigration = async () => {
    try {
      // Проверяем, есть ли локальные данные
      const localUser = getLocalUser();
      if (!localUser) return;

      const { hasData, recordCount } = await hasLocalData(localUser.id);
      
      if (hasData) {
        // Проверяем, вошёл ли пользователь в Supabase
        const supabaseUser = await getCurrentUser();
        if (supabaseUser) {
          setLocalDataCount(recordCount);
          setShowDialog(true);
        }
      }
    } catch (error) {
      console.error('Migration check error:', error);
    }
  };

  const handleMigrate = async () => {
    setMigrating(true);
    
    try {
      const localUser = getLocalUser();
      const supabaseUser = await getCurrentUser();

      if (!localUser || !supabaseUser) {
        toast.error('Не удалось выполнить миграцию');
        return;
      }

      const result = await migrateLocalToSupabase(localUser.id, supabaseUser.id);

      if (result.success) {
        toast.success(`Мигрировано ${result.migratedCount} записей`);
        // Очищаем локальный режим
        signOutLocally();
      } else {
        toast.error(`Миграция завершена с ошибками: ${result.errors.length}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка миграции');
    } finally {
      setMigrating(false);
      setShowDialog(false);
      router.refresh();
    }
  };

  const handleSkip = () => {
    setShowDialog(false);
    // Пользователь может позже зайти в настройки для миграции
  };

  const handleSignOut = () => {
    // Выход из Supabase, возврат к локальному режиму
    signOutLocally();
    window.location.href = '/login';
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Миграция данных
          </DialogTitle>
          <DialogDescription>
            У вас есть {localDataCount} записей в локальном режиме.
            Хотите перенести их в аккаунт Supabase для синхронизации?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="font-medium mb-2">Что произойдёт:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li className="flex items-center gap-2">
                <ArrowRight className="h-3 w-3" />
                Все записи будут привязаны к вашему аккаунту
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-3 w-3" />
                Данные будут синхронизироваться между устройствами
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-3 w-3" />
                Локальный режим будет отключён
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={migrating}
          >
            Позже
          </Button>
          <Button
            variant="outline"
            onClick={handleSignOut}
            disabled={migrating}
          >
            Выйти
          </Button>
          <Button
            onClick={handleMigrate}
            disabled={migrating}
          >
            {migrating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Миграция...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Мигрировать
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
