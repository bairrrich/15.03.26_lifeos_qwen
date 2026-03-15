'use client';

import { useState } from 'react';
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
  useWorkouts,
  useWorkoutLogs,
  useWeeklyWorkoutStats,
  useCreateWorkoutLog,
  useExercises,
} from '@/modules/workouts/hooks';
import { Plus, Dumbbell, Clock, Calendar, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { toast } from 'sonner';

export default function WorkoutsPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = today.getTime();

  const { data: workouts = [] } = useWorkouts();
  const { data: logs = [] } = useWorkoutLogs(todayTimestamp);
  const { data: weeklyStats } = useWeeklyWorkoutStats(todayTimestamp);
  const { data: exercises = [] } = useExercises();
  const createLog = useCreateWorkoutLog();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}ч ${minutes}м`;
    return `${minutes}м`;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const workout = workouts.find((w) => w.id === formData.get('workout_id'));
    if (!workout) {
      toast.error('Тренировка не найдена');
      return;
    }

    const duration = Number(formData.get('duration')) * 60; // минуты в секунды

    createLog.mutate(
      {
        workout_id: workout.id,
        workout_name: workout.name,
        date: todayTimestamp,
        duration_seconds: duration,
        exercises: workout.exercises.map((ex) => ({
          exercise_id: ex.exercise_id,
          exercise_name: exercises.find((e) => e.id === ex.exercise_id)?.name || 'Unknown',
          sets: [{ reps: ex.reps || 0, weight: ex.weight, completed: true }],
        })),
        rating: 4,
        user_id: 'current-user',
      },
      {
        onSuccess: () => {
          toast.success('Тренировка записана');
          setDialogOpen(false);
        },
        onError: () => {
          toast.error('Ошибка при сохранении');
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Тренировки</h1>
          <p className="text-muted-foreground">Планы и журнал тренировок</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Завершить тренировку
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Завершение тренировки</DialogTitle>
                <DialogDescription>Выберите тренировку и укажите длительность</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="workout_id">Тренировка</Label>
                  <select
                    name="workout_id"
                    onChange={(e) => setSelectedWorkout(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Выберите тренировку</option>
                    {workouts.map((workout) => (
                      <option key={workout.id} value={workout.id}>
                        {workout.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="duration">Длительность (минут)</Label>
                  <Input name="duration" type="number" min="1" defaultValue="60" />
                </div>
                {selectedWorkout !== null && (
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium">Упражнения:</p>
                    <ul className="list-disc list-inside mt-1">
                      {workouts
                        .find((w) => w.id === selectedWorkout)
                        ?.exercises.map((ex, i) => (
                          <li key={i}>
                            {exercises.find((e) => e.id === ex.exercise_id)?.name || 'Unknown'} -{' '}
                            {ex.sets} x {ex.reps || ex.duration_seconds}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Отмена
                </Button>
                <Button type="submit">Завершить</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Мои тренировки</CardTitle>
            <CardDescription>Список ваших программ</CardDescription>
          </CardHeader>
          <CardContent>
            {workouts.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Dumbbell className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>Нет созданных тренировок</p>
              </div>
            ) : (
              <div className="space-y-3">
                {workouts.map((workout) => (
                  <div key={workout.id} className="p-3 rounded-lg border bg-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{workout.name}</p>
                        {workout.description && (
                          <p className="text-sm text-muted-foreground">{workout.description}</p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {workout.exercises.length} упр.
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Сегодня</CardTitle>
            <CardDescription>{format(today, 'dd MMMM yyyy', { locale: ru })}</CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p>Нет тренировок за сегодня</p>
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="p-3 rounded-lg border bg-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{log.workout_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDuration(log.duration_seconds)}
                        </p>
                      </div>
                      {log.rating && <span className="text-sm font-medium">{log.rating}/5</span>}
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
