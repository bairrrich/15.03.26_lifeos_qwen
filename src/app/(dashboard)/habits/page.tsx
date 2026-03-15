'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
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
  useHabits,
  useCreateHabit,
  useCompleteHabit,
  useTodayHabitsLog,
} from '@/modules/habits/hooks';
import { Plus, Check, Flame, Calendar, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function HabitsPage() {
  const { data: habits = [] } = useHabits();
  const { data: todayLogs = [] } = useTodayHabitsLog();
  const createHabit = useCreateHabit();
  const completeHabit = useCompleteHabit();

  const [dialogOpen, setDialogOpen] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = today.getTime();

  const completedToday = new Set(
    todayLogs.filter((log) => log.completed).map((log) => log.habit_id)
  );

  const handleComplete = (habitId: string) => {
    completeHabit.mutate(
      { habitId, date: todayTimestamp },
      {
        onSuccess: () => {
          toast.success('Привычка выполнена!');
        },
        onError: () => {
          toast.error('Ошибка при обновлении');
        },
      }
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    createHabit.mutate(
      {
        name: formData.get('name') as string,
        description: (formData.get('description') as string) || undefined,
        frequency: formData.get('frequency') as 'daily' | 'weekly' | 'monthly',
        target_count: Number(formData.get('target_count')) || 1,
        color: (formData.get('color') as string) || undefined,
        streak: 0,
        completed_total: 0,
        user_id: 'current-user',
      },
      {
        onSuccess: () => {
          toast.success('Привычка создана');
          setDialogOpen(false);
        },
        onError: () => {
          toast.error('Ошибка при создании');
        },
      }
    );
  };

  const completedCount = habits.filter((h) => completedToday.has(h.id)).length;
  const totalCount = habits.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Привычки</h1>
          <p className="text-muted-foreground">Трекер привычек для достижения целей</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Новая привычка
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Новая привычка</DialogTitle>
                <DialogDescription>Создайте новую привычку для отслеживания</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Название</Label>
                  <Input name="name" placeholder="Например: Чтение книг" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Описание (опционально)</Label>
                  <Input name="description" placeholder="30 минут в день" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="frequency">Частота</Label>
                  <Select name="frequency" defaultValue="daily">
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите частоту" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Ежедневно</SelectItem>
                      <SelectItem value="weekly">Еженедельно</SelectItem>
                      <SelectItem value="monthly">Ежемесячно</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="target_count">Цель (раз)</Label>
                  <Input name="target_count" type="number" min="1" defaultValue="1" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="color">Цвет</Label>
                  <Input name="color" type="color" defaultValue="#6366f1" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Отмена
                </Button>
                <Button type="submit">Создать</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Прогресс сегодня</CardTitle>
          <CardDescription>
            {completedCount} из {totalCount} привычек выполнено
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={completionPercentage} className="h-3" />
            <p className="text-sm text-muted-foreground text-right">{completionPercentage}%</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {habits.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center text-muted-foreground">
              У вас пока нет привычек. Создайте первую!
            </CardContent>
          </Card>
        ) : (
          habits.map((habit) => {
            const isCompleted = completedToday.has(habit.id);
            return (
              <Card
                key={habit.id}
                className={cn(
                  'relative overflow-hidden',
                  isCompleted && 'bg-green-50 dark:bg-green-950/20'
                )}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${habit.color || '#6366f1'}20` }}
                      >
                        <Check
                          className={cn('h-5 w-5', isCompleted ? 'text-green-600' : '')}
                          style={{ color: !isCompleted ? habit.color : undefined }}
                        />
                      </div>
                      <div>
                        <CardTitle className="text-base">{habit.name}</CardTitle>
                        {habit.description && (
                          <CardDescription className="text-xs">{habit.description}</CardDescription>
                        )}
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant={isCompleted ? 'default' : 'outline'}
                      className={cn('h-8 w-8', isCompleted && 'bg-green-600 hover:bg-green-700')}
                      onClick={() => handleComplete(habit.id)}
                      disabled={isCompleted}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Flame
                        className={cn(
                          'h-4 w-4',
                          habit.streak && habit.streak > 0 ? 'text-orange-500' : ''
                        )}
                      />
                      <span>{habit.streak || 0} дней</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {habit.frequency === 'daily'
                          ? 'Ежедневно'
                          : habit.frequency === 'weekly'
                            ? 'Еженедельно'
                            : 'Ежемесячно'}
                      </span>
                    </div>
                    {habit.completed_total && habit.completed_total > 0 && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        <span>{habit.completed_total} раз</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
