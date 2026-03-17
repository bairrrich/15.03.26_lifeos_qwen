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
import { Plus, Target, CheckCircle2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { PageTransition } from '@/components/ui/page-transition';
import { Goal } from '@/modules/goals/entities';
import { getCategoryColor } from '@/lib/category-colors';
import { EmptyGoals, EmptyCompletedGoals } from '@/components/ui/empty-state-variants';
import { StatCard } from '@/components/ui/stat-card';
import { TouchButton, TouchListItem } from '@/components/ui/touch-targets';
import { useSwipeGesture } from '@/hooks/use-swipe-gesture';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function GoalItem({
  goal,
  onProgressChange,
  onDelete
}: {
  goal: Goal;
  onProgressChange: (goalId: string, progress: number) => void;
  onDelete: (goalId: string) => void;
}) {
  const { ref, isSwiping } = useSwipeGesture<HTMLDivElement>(
    () => onDelete(goal.id), // Swipe left to delete
    undefined, // No swipe right action
    { threshold: 80, velocity: 0.3 }
  );

  return (
    <TouchListItem ref={ref} className={isSwiping ? 'bg-red-50 border-red-200' : ''}>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2 flex-1">
          <div
            className={`h-3 w-3 rounded-full ${getCategoryColor(goal.category)}`}
          />
          <div className="flex-1">
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
      <div className="flex items-center gap-4 mt-3 w-full">
        <Progress value={goal.progress} className="flex-1 h-2" />
        <Input
          type="number"
          min="0"
          max="100"
          value={goal.progress}
          onChange={(e) => onProgressChange(goal.id, Number(e.target.value))}
          className="w-20"
        />
      </div>
    </TouchListItem>
  );
}

export default function GoalsPage() {
  const { data: goals = [], isLoading: goalsLoading } = useGoals();
  const { data: activeGoals = [], isLoading: activeGoalsLoading } = useActiveGoals();
  const createGoal = useCreateGoal();
  const updateProgress = useUpdateGoalProgress();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('other');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const userId = getCurrentUserId();

    createGoal.mutate(
      {
        title: formData.get('title') as string,
        description: (formData.get('description') as string) || undefined,
        category: selectedCategory as Goal['category'],
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
          setSelectedCategory('other'); // Reset for next use
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

  const handleDeleteGoal = (goalId: string) => {
    // For now, just show a message - delete functionality would need backend support
    toast.info('Функция удаления целей будет добавлена в следующих обновлениях');
  };

  const completedCount = goals.filter((g) => g.status === 'completed').length;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2 justify-end">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <TouchButton touchFriendly size="sm">
                <Plus className="h-4 w-4 mr-2" />
                <span>Новая цель</span>
              </TouchButton>
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
                    <Select value={selectedCategory} onValueChange={(value: string | null) => setSelectedCategory(value || 'other')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите категорию" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fitness">Фитнес</SelectItem>
                        <SelectItem value="health">Здоровье</SelectItem>
                        <SelectItem value="finance">Финансы</SelectItem>
                        <SelectItem value="learning">Обучение</SelectItem>
                        <SelectItem value="career">Карьера</SelectItem>
                        <SelectItem value="personal">Личное</SelectItem>
                        <SelectItem value="other">Другое</SelectItem>
                      </SelectContent>
                    </Select>
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
          <StatCard
            title="Всего целей"
            value={goals.length}
            icon={Target}
            isLoading={goalsLoading}
          />
          <StatCard
            title="Активные"
            value={activeGoals.length}
            icon={TrendingUp}
            isLoading={activeGoalsLoading}
          />
          <StatCard
            title="Завершённые"
            value={completedCount}
            icon={CheckCircle2}
            isLoading={goalsLoading}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Активные цели</CardTitle>
            </CardHeader>
            <CardContent>
              {activeGoals.length === 0 ? (
                <EmptyGoals onAction={() => setDialogOpen(true)} />
              ) : (
                <div className="space-y-4">
                  {activeGoals.map((goal) => (
                    <GoalItem
                      key={goal.id}
                      goal={goal}
                      onProgressChange={handleProgressChange}
                      onDelete={handleDeleteGoal}
                    />
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
                <EmptyCompletedGoals />
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
    </PageTransition>);
}
