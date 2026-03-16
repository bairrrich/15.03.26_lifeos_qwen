'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
  useGoals,
  useActiveGoals,
  useCreateGoal,
  useUpdateGoalProgress,
} from '@/modules/goals/hooks';
import { getCurrentUserId } from '@/shared/hooks/use-user-id';
import { Plus, Target, CheckCircle2, Circle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const categoryColors: Record<string, string> = {
  fitness: 'bg-red-500',
  health: 'bg-green-500',
  finance: 'bg-blue-500',
  learning: 'bg-purple-500',
  career: 'bg-orange-500',
  personal: 'bg-pink-500',
  other: 'bg-gray-500',
};

const categoryLabels: Record<string, string> = {
  fitness: 'Фитнес',
  health: 'Здоровье',
  finance: 'Финансы',
  learning: 'Обучение',
  career: 'Карьера',
  personal: 'Личное',
  other: 'Другое',
};

export default function GoalsPage() {
  const { data: goals = [] } = useGoals();
  const { data: activeGoals = [] } = useActiveGoals();
  const createGoal = useCreateGoal();
  const updateProgress = useUpdateGoalProgress();

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const userId = getCurrentUserId();

    createGoal.mutate(
      {
        title: formData.get('title') as string,
        description: (formData.get('description') as string) || undefined,
        category: formData.get('category') as Goal['category'],
        target_date: formData.get('target_date')
          ? new Date(formData.get('target_date') as string).getTime()
          : undefined,
        progress: 0,
        status: 'active',
        user_id: userId,
      },
      {
        onSuccess: () => {
          toast.success('Цель создана');
          setDialogOpen(false);
        },
        onError: () => {
          toast.error('Ошибка при создании');
        },
      }
    );
  };

  const handleProgressChange = (goalId: string, newProgress: number) => {
    updateProgress.mutate(
      { goalId, progress: newProgress },
      {
        onSuccess: () => {
          toast.success('Прогресс обновлён');
        },
      }
    );
  };

  const completedCount = goals.filter((g) => g.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" style={{ height: '32px' }}>
              <Plus className="h-4 w-4 mr-2" />
              <span>Новая цель</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Новая цель</DialogTitle>
                <DialogDescription>Создайте новую цель и отслеживайте прогресс</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Название</Label>
                  <Input name="title" placeholder="Например: Выучить английский" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Описание</Label>
                  <Input name="description" placeholder="Достичь уровня B2" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Категория</Label>
                  <select
                    name="category"
                    defaultValue="other"


                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Выберите категорию</option>

                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="target_date">Целевая дата (опционально)</Label>
                  <Input name="target_date" type="date" />
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

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего целей</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активные</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeGoals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Завершённые</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Активные цели</CardTitle>
          </CardHeader>
          <CardContent>
            {activeGoals.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p>Нет активных целей</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeGoals.map((goal) => (
                  <div key={goal.id} className="p-4 rounded-lg border bg-card space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-3 w-3 rounded-full ${categoryColors[goal.category] || 'bg-gray-500'}`}
                        />
                        <div>
                          <p className="font-medium">{goal.title}</p>
                          {goal.description && (
                            <p className="text-sm text-muted-foreground">{goal.description}</p>
                          )}
                        </div>
                      </div>
                      <Badge variant={goal.status === 'completed' ? 'default' : 'secondary'}>
                        {goal.status === 'completed' ? 'Завершено' : `${goal.progress}%`}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <Progress value={goal.progress} className="flex-1 h-2" />
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={goal.progress}
                        onChange={(e) => handleProgressChange(goal.id, Number(e.target.value))}
                        className="w-20"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Завершённые цели</CardTitle>
          </CardHeader>
          <CardContent>
            {completedCount === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Circle className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>Пока нет завершённых целей</p>
              </div>
            ) : (
              <div className="space-y-3">
                {goals
                  .filter((g) => g.status === 'completed')
                  .map((goal) => (
                    <div key={goal.id} className="p-3 rounded-lg border bg-card opacity-75">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <div>
                            <p className="font-medium line-through">{goal.title}</p>
                            {goal.description && (
                              <p className="text-sm text-muted-foreground">{goal.description}</p>
                            )}
                          </div>
                        </div>
                        <Badge>100%</Badge>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Импортируем тип Goal
type Goal = import('@/modules/goals/entities').Goal;
