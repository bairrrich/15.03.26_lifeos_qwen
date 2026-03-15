'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useNotification } from '@/core/notifications/use-notification';
import { Bell, BellOff, Check, Clock, Target, Droplets, Award, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationSettings {
  habits: boolean;
  workouts: boolean;
  water: boolean;
  goals: boolean;
  productExpiry: boolean;
  achievements: boolean;
  waterInterval: number; // минут
}

export function NotificationSettingsCard() {
  const {
    isSupported,
    permission,
    requestPermission,
    sendNotification,
    sendHabitReminder,
    sendWorkoutReminder,
    sendWaterReminder,
  } = useNotification();

  const [settings, setSettings] = useState<NotificationSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('notification-settings');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return {
      habits: true,
      workouts: true,
      water: true,
      goals: true,
      productExpiry: true,
      achievements: true,
      waterInterval: 60,
    };
  });

  const [isTesting, setIsTesting] = useState(false);

  const saveSettings = (newSettings: NotificationSettings) => {
    setSettings(newSettings);
    localStorage.setItem('notification-settings', JSON.stringify(newSettings));
  };

  const handleToggle = (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
    toast.success('Настройки сохранены');
  };

  const handleTestNotification = async () => {
    setIsTesting(true);
    const granted = await requestPermission();

    if (granted) {
      await sendNotification(
        '🔔 Тест уведомления LifeOS',
        'Уведомления работают корректно!',
        '/icons/icon-192x192.png'
      );
      toast.success('Тестовое уведомление отправлено');
    } else {
      toast.error('Разрешение на уведомления не получено');
    }
    setIsTesting(false);
  };

  const handleTestHabit = async () => {
    await sendHabitReminder('Чтение книг');
    toast.success('Тест: напоминание о привычке');
  };

  const handleTestWorkout = async () => {
    await sendWorkoutReminder('День ног');
    toast.success('Тест: напоминание о тренировке');
  };

  const handleTestWater = async () => {
    await sendWaterReminder();
    toast.success('Тест: напоминание о воде');
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Уведомления
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Ваш браузер не поддерживает уведомления</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {permission.granted ? (
              <Bell className="h-5 w-5 text-green-600" />
            ) : (
              <BellOff className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <CardTitle>Уведомления</CardTitle>
              <CardDescription>
                {permission.granted
                  ? 'Уведомления включены'
                  : permission.denied
                    ? 'Уведомления заблокированы'
                    : 'Требуется разрешение'}
              </CardDescription>
            </div>
          </div>
          {!permission.granted && (
            <Button size="sm" onClick={requestPermission}>
              <Check className="h-4 w-4 mr-2" />
              Разрешить
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Тестовые уведомления */}
        <div className="flex items-center justify-between">
          <div>
            <Label>Тест уведомлений</Label>
            <p className="text-sm text-muted-foreground">Отправить тестовое уведомление</p>
          </div>
          <Button
            variant="outline"
            onClick={handleTestNotification}
            disabled={isTesting || !permission.granted}
          >
            <Bell className="h-4 w-4 mr-2" />
            Тест
          </Button>
        </div>

        <Separator />

        {/* Привычки */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              <div>
                <Label>Привычки</Label>
                <p className="text-sm text-muted-foreground">Напоминания о привычках</p>
              </div>
            </div>
            <Switch checked={settings.habits} onCheckedChange={(v) => handleToggle('habits', v)} />
          </div>
          {settings.habits && permission.granted && (
            <Button variant="outline" size="sm" onClick={handleTestHabit}>
              Тест привычки
            </Button>
          )}
        </div>

        <Separator />

        {/* Тренировки */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-500" />
              <div>
                <Label>Тренировки</Label>
                <p className="text-sm text-muted-foreground">Напоминания о тренировках</p>
              </div>
            </div>
            <Switch
              checked={settings.workouts}
              onCheckedChange={(v) => handleToggle('workouts', v)}
            />
          </div>
          {settings.workouts && permission.granted && (
            <Button variant="outline" size="sm" onClick={handleTestWorkout}>
              Тест тренировки
            </Button>
          )}
        </div>

        <Separator />

        {/* Вода */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-cyan-500" />
              <div>
                <Label>Вода</Label>
                <p className="text-sm text-muted-foreground">Напоминания пить воду</p>
              </div>
            </div>
            <Switch checked={settings.water} onCheckedChange={(v) => handleToggle('water', v)} />
          </div>
          {settings.water && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="water-interval" className="text-sm">
                  Интервал (мин):
                </Label>
                <Input
                  id="water-interval"
                  type="number"
                  min="15"
                  max="240"
                  value={settings.waterInterval}
                  onChange={(e) =>
                    saveSettings({ ...settings, waterInterval: Number(e.target.value) })
                  }
                  className="w-20"
                />
              </div>
              {permission.granted && (
                <Button variant="outline" size="sm" onClick={handleTestWater}>
                  Тест воды
                </Button>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* Цели */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-yellow-500" />
            <div>
              <Label>Цели</Label>
              <p className="text-sm text-muted-foreground">Прогресс и достижения целей</p>
            </div>
          </div>
          <Switch checked={settings.goals} onCheckedChange={(v) => handleToggle('goals', v)} />
        </div>

        <Separator />

        {/* Истекающие продукты */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <div>
              <Label>Продукты</Label>
              <p className="text-sm text-muted-foreground">Истекающий срок годности</p>
            </div>
          </div>
          <Switch
            checked={settings.productExpiry}
            onCheckedChange={(v) => handleToggle('productExpiry', v)}
          />
        </div>

        <Separator />

        {/* Достижения */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-green-500" />
            <div>
              <Label>Достижения</Label>
              <p className="text-sm text-muted-foreground">Разблокировка достижений</p>
            </div>
          </div>
          <Switch
            checked={settings.achievements}
            onCheckedChange={(v) => handleToggle('achievements', v)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
