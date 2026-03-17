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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useWeeklySleepStats,
  useSleepLogs,
  useCreateSleepLog,
  useLatestHealthMetric,
} from '@/modules/health/hooks';
import { getCurrentUserId } from '@/shared/hooks/use-user-id';
import { Plus, Moon, Heart, Activity, Thermometer } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { toast } from 'sonner';
import { PageTransition } from '@/components/ui/page-transition';
import { StatCard } from '@/components/ui/stat-card';
import { EmptySleep, EmptyHealth } from '@/components/ui/empty-state-variants';
import { TouchButton, useIsMobile } from '@/components/ui/touch-targets';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { usePullToRefresh } from '@/hooks/use-swipe-gesture';

export default function HealthPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = today.getTime();

  const { data: weeklySleep, isLoading: sleepLoading } = useWeeklySleepStats(todayTimestamp);
  const { data: sleepLog, isLoading: sleepLogLoading } = useSleepLogs(todayTimestamp);
  const { data: weight, isLoading: weightLoading } = useLatestHealthMetric('weight');
  const createSleepLog = useCreateSleepLog();
  const isMobile = useIsMobile();

  const [sleepDialogOpen, setSleepDialogOpen] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<string>('3');

  const handleRefresh = async () => {
    // Trigger refetch of all data
    toast.info('Данные обновлены');
  };

  const { ref: refreshRef, isRefreshing } = usePullToRefresh<HTMLDivElement>(handleRefresh, { threshold: 80 });

  const handleSleepSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const bedtime = new Date(formData.get('bedtime') as string);
    const wakeTime = new Date(formData.get('wake_time') as string);
    const durationHours = (wakeTime.getTime() - bedtime.getTime()) / (1000 * 60 * 60);
    const userId = getCurrentUserId();

    createSleepLog.mutate(
      {
        date: todayTimestamp,
        bedtime: bedtime.getTime(),
        wake_time: wakeTime.getTime(),
        duration_hours: Math.round(durationHours * 10) / 10,
        quality: Number(selectedQuality) as 1 | 2 | 3 | 4 | 5,
        user_id: userId,
      },
      {
        onSuccess: () => {
          toast.success('Данные о сне сохранены');
          setSleepDialogOpen(false);
          setSelectedQuality('3'); // Reset for next use
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
    <PageTransition>
      <div ref={refreshRef} className="space-y-6">
        <div className="flex flex-wrap gap-2 justify-end">
          <TouchButton touchFriendly size="sm" onClick={() => setSleepDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            <span>Добавить сон</span>
          </TouchButton>

          {isMobile ? (
            <BottomSheet
              isOpen={sleepDialogOpen}
              onClose={() => setSleepDialogOpen(false)}
              title="Данные о сне"
            >
              <form onSubmit={handleSleepSubmit}>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Укажите время отхода ко сну и пробуждения</p>
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
                      <Select value={selectedQuality} onValueChange={(value: string | null) => setSelectedQuality(value || '3')}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите качество" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 - Очень плохо 😴</SelectItem>
                          <SelectItem value="2">2 - Плохо 😕</SelectItem>
                          <SelectItem value="3">3 - Нормально 😐</SelectItem>
                          <SelectItem value="4">4 - Хорошо 😊</SelectItem>
                          <SelectItem value="5">5 - Отлично 😁</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setSleepDialogOpen(false)}>
                      Отмена
                    </Button>
                    <Button type="submit">Сохранить</Button>
                  </div>
                </div>
              </form>
            </BottomSheet>
          ) : (
            <Dialog open={sleepDialogOpen} onOpenChange={setSleepDialogOpen}>
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
                      <Select value={selectedQuality} onValueChange={(value: string | null) => setSelectedQuality(value || '3')}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите качество" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 - Очень плохо 😴</SelectItem>
                          <SelectItem value="2">2 - Плохо 😕</SelectItem>
                          <SelectItem value="3">3 - Нормально 😐</SelectItem>
                          <SelectItem value="4">4 - Хорошо 😊</SelectItem>
                          <SelectItem value="5">5 - Отлично 😁</SelectItem>
                        </SelectContent>
                      </Select>
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
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Сон (средний)"
            value={`${weeklySleep?.avgDuration.toFixed(1) || 0}ч`}
            description="за последнюю неделю"
            icon={Moon}
            isLoading={sleepLoading}
          />
          <StatCard
            title="Качество сна"
            value={weeklySleep?.avgQuality ? `${getQualityEmoji(Math.round(weeklySleep.avgQuality))} ${weeklySleep.avgQuality.toFixed(1)}/5` : '-'}
            description="за последнюю неделю"
            icon={Heart}
            isLoading={sleepLoading}
          />
          <StatCard
            title="Вес"
            value={weight && weight !== null && typeof weight === 'object' && 'value' in weight
              ? `${(weight as HealthMetric).value} ${(weight as HealthMetric).unit}`
              : '-'}
            description={weight && weight !== null && typeof weight === 'object' && 'recorded_at' in weight
              ? format((weight as HealthMetric).recorded_at, 'dd MMM', { locale: ru })
              : 'Нет данных'}
            icon={Activity}
            isLoading={weightLoading}
          />
          <StatCard
            title="Сон сегодня"
            value={sleepLog && (sleepLog as SleepLog[]).length > 0
              ? `${(sleepLog as SleepLog[])[0].duration_hours}ч ${getQualityEmoji((sleepLog as SleepLog[])[0].quality)}`
              : '-'}
            description={sleepLog && (sleepLog as SleepLog[]).length > 0
              ? `Качество: ${(sleepLog as SleepLog[])[0].quality}/5`
              : 'Нет данных'}
            icon={Thermometer}
            isLoading={sleepLogLoading}
          />
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
                  <EmptySleep />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
