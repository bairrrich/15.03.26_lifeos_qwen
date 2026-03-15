'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RefreshCw, Download } from 'lucide-react';

// Тип для события установки PWA
interface BeforeInstallPromptEvent extends Event {
  prompt: () => void;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWA_DISMISSED_KEY = 'pwa-install-dismissed';
const PWA_DISMISSED_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 дней

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    // Проверяем, не нажимал ли пользователь "Позже" недавно
    const dismissed = localStorage.getItem(PWA_DISMISSED_KEY);
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const now = Date.now();
      if (now - dismissedTime < PWA_DISMISSED_EXPIRY) {
        return; // Не показываем диалог
      }
      // Истекло время, удаляем запись
      localStorage.removeItem(PWA_DISMISSED_KEY);
    }

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);

    // Проверка обновлений service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setShowUpdate(true);
              }
            });
          }
        });
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstall(false);
      // Пользователь установил — больше не показываем
      localStorage.setItem(PWA_DISMISSED_KEY, 'installed');
    } else {
      // Пользователь отменил — запоминаем на 7 дней
      localStorage.setItem(PWA_DISMISSED_KEY, Date.now().toString());
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    // Запоминаем, что пользователь нажал "Позже"
    localStorage.setItem(PWA_DISMISSED_KEY, Date.now().toString());
    setShowInstall(false);
    setDeferredPrompt(null);
  };

  const handleUpdate = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      registration.update();
      window.location.reload();
    }
  };

  return (
    <>
      <Dialog open={showInstall} onOpenChange={handleDismiss}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Установить LifeOS
            </DialogTitle>
            <DialogDescription>
              Установите приложение для быстрого доступа и офлайн-режима
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleDismiss}>
              Позже
            </Button>
            <Button onClick={handleInstall}>
              <Download className="h-4 w-4 mr-2" />
              Установить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showUpdate} onOpenChange={setShowUpdate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Доступно обновление
            </DialogTitle>
            <DialogDescription>
              Новая версия LifeOS готова к установке. Перезагрузите страницу для применения
              обновлений.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpdate(false)}>
              Позже
            </Button>
            <Button onClick={handleUpdate}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Обновить и перезагрузить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
