'use client';

import { useState } from 'react';
import type { HealthMetric, SleepLog } from '@/modules/health/entities';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  useWeeklySleepStats,
  useSleepLogs,
  useCreateSleepLog,
  useLatestHealthMetric,
} from '@/modules/health/hooks';
import { Plus, Moon, Heart, Activity, Thermometer } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { toast } from 'sonner';

export default function HealthPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = today.getTime();

  const { data: weeklySleep } = useWeeklySleepStats(todayTimestamp);
  const { data: sleepLog } = useSleepLogs(todayTimestamp);
  const { data: weight } = useLatestHealthMetric('weight');
  const createSleepLog = useCreateSleepLog();

  const [sleepDialogOpen, setSleepDialogOpen] = useState(false);

  const handleSleepSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const bedtime = new Date(formData.get('bedtime') as string);
    const wakeTime = new Date(formData.get('wake_time') as string);
    const durationHours = (wakeTime.getTime() - bedtime.getTime()) / (1000 * 60 * 60);

    createSleepLog.mutate(
      {
        date: todayTimestamp,
        bedtime: bedtime.getTime(),
        wake_time: wakeTime.getTime(),
        duration_hours: Math.round(durationHours * 10) / 10,
        quality: Number(formData.get('quality')) as 1 | 2 | 3 | 4 | 5,
        user_id: 'current-user',
      },
      {
        onSuccess: () => {
          toast.success('Данные о сне сохранены');
          setSleepDialogOpen(false);
        },
        onError: () => {
          toast.error('Ошибка при сохранении');
        },
      }
    );
  };

  const getQualityEmoji = (quality: number) => {
    const emojis: Record<number, string> = {
      1: '😴',
      2: '😕',
      3: '😐',
      4: '😊',
      5: '😁',
    };
    return emojis[quality] || '😐';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 justify-end">
        <Dialog open={sleepDialogOpen} onOpenChange={setSleepDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" style={{ height: '32px' }}>
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Добавить сон</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSleepSubmit}>
              <DialogHeader>
                <DialogTitle>Данные о сне</DialogTitle>
                <DialogDescription>Укажите время отхода ко сну и пробуждения</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="bedtime">Время отхода ко сну</Label>
                  <Input name="bedtime" type="datetime-local" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="wake_time">Время пробуждения</Label>
                  <Input name="wake_time" type="datetime-local" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quality">Качество сна</Label>
                  <select
                    name="quality"
                    defaultValue="3"


                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Выберите качество</option>
                    <option value="1">1 - Очень плохо 😴</option>
                    <option value="2">2 - Плохо 😕</option>
                    <option value="3">3 - Нормально 😐</option>
                    <option value="4">4 - Хорошо 😊</option>
                    <option value="5">5 - Отлично 😁</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setSleepDialogOpen(false)}>
                  Отмена
                </Button>
                <Button type="submit">Сохранить</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Сон (средний)</CardTitle>
            <Moon className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklySleep?.avgDuration.toFixed(1) || 0}ч</div>
            <p className="text-xs text-muted-foreground">за последнюю неделю</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Качество сна</CardTitle>
            <Heart className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {weeklySleep?.avgQuality ? getQualityEmoji(Math.round(weeklySleep.avgQuality)) : '-'}{' '}
              {weeklySleep?.avgQuality.toFixed(1) || 0}/5
            </div>
            <p className="text-xs text-muted-foreground">за последнюю неделю</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Вес</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {weight && weight !== null && typeof weight === 'object' && 'value' in weight
                ? `${(weight as HealthMetric).value} ${(weight as HealthMetric).unit}`
                : '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              {weight && weight !== null && typeof weight === 'object' && 'recorded_at' in weight
                ? format((weight as HealthMetric).recorded_at, 'dd MMM', { locale: ru })
                : 'Нет данных'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Сон сегодня</CardTitle>
            <Thermometer className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sleepLog && (sleepLog as SleepLog[]).length > 0
                ? `${(sleepLog as SleepLog[])[0].duration_hours}ч ${getQualityEmoji((sleepLog as SleepLog[])[0].quality)}`
                : '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              {sleepLog && (sleepLog as SleepLog[]).length > 0
                ? `Качество: ${(sleepLog as SleepLog[])[0].quality}/5`
                : 'Нет данных'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Сон сегодня</CardTitle>
            <Thermometer className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sleepLog && (sleepLog as SleepLog[]).length > 0
                ? `${(sleepLog as SleepLog[])[0].duration_hours}ч ${getQualityEmoji((sleepLog as SleepLog[])[0].quality)}`
                : '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              {sleepLog && (sleepLog as SleepLog[]).length > 0
                ? `Качество: ${(sleepLog as SleepLog[])[0].quality}/5`
                : 'Нет данных'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Быстрые метрики</CardTitle>
            <CardDescription>Добавьте данные о здоровье</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Button variant="outline" className="justify-start">
                <Activity className="mr-2 h-4 w-4" />
                Добавить вес
              </Button>
              <Button variant="outline" className="justify-start">
                <Heart className="mr-2 h-4 w-4" />
                Добавить давление
              </Button>
              <Button variant="outline" className="justify-start">
                <Thermometer className="mr-2 h-4 w-4" />
                Добавить температуру
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Статистика сна</CardTitle>
            <CardDescription>Последние 7 дней</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sleepLog && (sleepLog as SleepLog[]).length > 0 ? (
                <div className="p-3 rounded-lg bg-muted">
                  <p className="font-medium">Сегодня</p>
                  <p className="text-sm text-muted-foreground">
                    {(sleepLog as SleepLog[])[0].duration_hours}ч • Качество: {(sleepLog as SleepLog[])[0].quality}/5
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Нет данных за сегодня</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
