'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Dumbbell, Clock, Calendar, TrendingUp, Play, BarChart3, List } from 'lucide-react';
import { toast } from 'sonner';
import { PageTransition } from '@/components/ui/page-transition';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

import {
  useWorkouts,
  useWorkoutLogs,
  useWeeklyWorkoutStats,
  useCreateWorkout,
  useActiveWorkoutPlan,
  useExercises,
} from '@/modules/workouts/hooks';
import { getCurrentUserId } from '@/shared/hooks/use-user-id';
import { ActiveWorkoutScreen } from '@/modules/workouts/components';
import { initializeSeedExercises } from '@/modules/workouts/data/seed-init';

export default function WorkoutsPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = today.getTime();

  const { data: workouts = [] } = useWorkouts();
  const { data: logs = [] } = useWorkoutLogs(todayTimestamp);
  const { data: weeklyStats } = useWeeklyWorkoutStats(todayTimestamp);
  const { data: exercises = [], isLoading: exercisesLoading } = useExercises();
  const { data: activePlan } = useActiveWorkoutPlan();
  const createWorkout = useCreateWorkout();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(null);
  const [newWorkoutName, setNewWorkoutName] = useState('');
  const [newWorkoutDescription, setNewWorkoutDescription] = useState('');

  // Инициализация seed-данных
  useEffect(() => {
    if (!exercisesLoading && exercises.length === 0) {
      initializeSeedExercises();
    }
  }, [exercises, exercisesLoading]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}ч ${minutes}м`;
    return `${minutes}м`;
  };

  const handleCreateWorkout = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const userId = getCurrentUserId();

    await createWorkout.mutateAsync(
      {
        user_id: userId,
        name: newWorkoutName,
        description: newWorkoutDescription,
        exercises: [],
        difficulty: 'intermediate',
        estimated_duration_minutes: 60,
      },
      {
        onSuccess: (data) => {
          toast.success('Тренировка создана');
          setDialogOpen(false);
          setNewWorkoutName('');
          setNewWorkoutDescription('');
          // Начинаем активную тренировку
          setActiveWorkoutId(data.id);
        },
        onError: () => {
          toast.error('Ошибка при создании');
        },
      }
    );
  };

  const handleStartWorkout = (workoutId: string) => {
    setActiveWorkoutId(workoutId);
  };

  const handleFinishActiveWorkout = () => {
    setActiveWorkoutId(null);
  };

  // Если активная тренировка — показываем экран логирования
  if (activeWorkoutId) {
    const workout = workouts.find((w) => w.id === activeWorkoutId);
    return (
      <ActiveWorkoutScreen
        workoutId={activeWorkoutId}
        workoutName={workout?.name || 'Тренировка'}
        onFinish={handleFinishActiveWorkout}
      />
    );
  }

  return (
    <PageTransition>
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-wrap gap-2 justify-end">
        <Button variant="outline" size="sm" style={{ height: '32px' }} onClick={() => window.location.href = '/workouts/history'}>
          <Clock className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">История</span>
        </Button>
        <Button variant="outline" size="sm" style={{ height: '32px' }} onClick={() => window.location.href = '/workouts/exercises'}>
          <List className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Упражнения</span>
        </Button>
        <Button variant="outline" size="sm" style={{ height: '32px' }} onClick={() => window.location.href = '/workouts/programs'}>
          <Calendar className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Программы</span>
        </Button>
        <Button variant="outline" size="sm" style={{ height: '32px' }} onClick={() => window.location.href = '/workouts/progress'}>
          <BarChart3 className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Прогресс</span>
        </Button>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" style={{ height: '32px' }}>
              <Plus className="h-4 w-4 mr-2" />
              <span>Тренировка</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreateWorkout}>
              <DialogHeader>
                <DialogTitle>Новая тренировка</DialogTitle>
                <DialogDescription>
                  Создайте тренировку и начните выполнять
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Название</Label>
                  <Input
                    id="name"
                    value={newWorkoutName}
                    onChange={(e) => setNewWorkoutName(e.target.value)}
                    placeholder="Например: День ног"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Описание</Label>
                  <Input
                    id="description"
                    value={newWorkoutDescription}
                    onChange={(e) => setNewWorkoutDescription(e.target.value)}
                    placeholder="Краткое описание"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Отмена
                </Button>
                <Button type="submit" disabled={createWorkout.isPending}>
                  {createWorkout.isPending ? 'Создание...' : 'Создать и начать'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Weekly Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">За неделю</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyStats?.totalWorkouts || 0}</div>
            <p className="text-xs text-muted-foreground">тренировок</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Время за неделю</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(weeklyStats?.totalDuration || 0)}
            </div>
            <p className="text-xs text-muted-foreground">общее время</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Средняя оценка</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyStats?.avgRating || 0}/5</div>
            <p className="text-xs text-muted-foreground">за неделю</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Plan */}
      {
        activePlan && (
          <Card className="border-primary/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Активная программа</CardTitle>
                  <CardDescription>{activePlan.name}</CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={() => window.location.href = '/workouts/programs'}>
                  Управление
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {activePlan.workouts.slice(0, 3).map((w, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted">
                    <Dumbbell className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{w.workout_name || `День ${w.day}`}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      }

      {/* Quick Start */}
      <Card>
        <CardHeader>
          <CardTitle>Быстрый старт</CardTitle>
          <CardDescription>Начните тренировку прямо сейчас</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <Button variant="outline" className="h-auto py-4 flex flex-col items-start gap-2" onClick={() => {
              setNewWorkoutName('Полная тренировка тела');
              setNewWorkoutDescription('Фулбоди для всех групп мышц');
              setDialogOpen(true);
            }}>
              <Dumbbell className="h-6 w-6" />
              <span>Полная тренировка тела</span>
            </Button>

            <Button variant="outline" className="h-auto py-4 flex flex-col items-start gap-2" onClick={() => {
              setNewWorkoutName('Верх тела');
              setNewWorkoutDescription('Грудь, спина, плечи, руки');
              setDialogOpen(true);
            }}>
              <Dumbbell className="h-6 w-6" />
              <span>Верх тела</span>
            </Button>

            <Button variant="outline" className="h-auto py-4 flex flex-col items-start gap-2" onClick={() => {
              setNewWorkoutName('Низ тела');
              setNewWorkoutDescription('Ноги и ягодицы');
              setDialogOpen(true);
            }}>
              <Dumbbell className="h-6 w-6" />
              <span>Низ тела</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Workouts and Today */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Мои тренировки</CardTitle>
                <CardDescription>Список ваших программ</CardDescription>
              </div>
              <Button size="sm" variant="ghost" onClick={() => window.location.href = '/workouts/programs'}>
                Все
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {workouts.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Dumbbell className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>Нет созданных тренировок</p>
                <p className="text-sm">Создайте первую тренировку</p>
              </div>
            ) : (
              <div className="space-y-3">
                {workouts.slice(0, 5).map((workout) => (
                  <div
                    key={workout.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{workout.name}</p>
                      {workout.description && (
                        <p className="text-sm text-muted-foreground truncate">
                          {workout.description}
                        </p>
                      )}
                    </div>
                    <Button size="sm" onClick={() => handleStartWorkout(workout.id)}>
                      <Play className="h-4 w-4 mr-1" />
                      Старт
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Сегодня</CardTitle>
                <CardDescription>{format(today, 'dd MMMM yyyy', { locale: ru })}</CardDescription>
              </div>
              <Button size="sm" variant="ghost" onClick={() => window.location.href = '/workouts/progress'}>
                История
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Dumbbell className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>Нет тренировок за сегодня</p>
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{log.workout_name}</p>
                      {log.rating && (
                        <span className="text-sm font-medium">{log.rating}/5</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(log.duration_seconds)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Dumbbell className="h-3 w-3" />
                        {log.exercises.length} упр.
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </PageTransition>
  );
}
