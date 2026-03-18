'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/components/card';
import { Button } from '@/ui/components/button';
import { Badge } from '@/ui/components/badge';
import { Progress } from '@/ui/components/progress';
import {
  ArrowLeft,
  Clock,
  Dumbbell,
  Star,
  TrendingUp,
} from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

import { useWorkoutLogs, useExercises } from '@/modules/workouts/hooks';

export default function WorkoutHistoryDetailPage() {
  const params = useParams();
  const workoutLogId = params.id as string;

  // В реальности: использовать useWorkoutLogById(workoutLogId)
  // Сейчас используем заглушку - все логи и фильтруем по ID
  const { data: allLogs = [] } = useWorkoutLogs();
  const { data: exercises = [] } = useExercises();

  // Заглушка: берём первый лог или null
  const log = allLogs.find((l) => l.id === workoutLogId) || allLogs[0];

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}ч ${minutes}м`;
    return `${minutes}м`;
  };

  const calculateTotalVolume = () => {
    if (!log) return 0;
    return log.exercises.reduce((sum, ex) => {
      return sum + ex.sets.reduce((setSum, set) => {
        return setSum + set.weight * set.reps;
      }, 0);
    }, 0);
  };

  const calculateTotalSets = () => {
    if (!log) return 0;
    return log.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  };

  const calculateTotalReps = () => {
    if (!log) return 0;
    return log.exercises.reduce((sum, ex) => {
      return sum + ex.sets.reduce((setSum, set) => setSum + set.reps, 0);
    }, 0);
  };

  if (!log) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>
        <div className="text-center py-12 text-muted-foreground">
          <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Тренировка не найдена</p>
        </div>
      </div>
    );
  }

  const totalVolume = calculateTotalVolume();
  const totalSets = calculateTotalSets();
  const totalReps = calculateTotalReps();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{log.workout_name}</h1>
          <p className="text-muted-foreground">
            {format(log.date, 'dd MMMM yyyy', { locale: ru })}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Длительность</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(log.duration_seconds)}</div>
            <p className="text-xs text-muted-foreground">общее время</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Объём</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalVolume / 1000).toFixed(1)}т</div>
            <p className="text-xs text-muted-foreground">{totalVolume} кг</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Сеты</CardTitle>
            <Dumbbell className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSets}</div>
            <p className="text-xs text-muted-foreground">{totalReps} повторений</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Оценка</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{log.rating || 0}/5</div>
              {log.rating && log.rating >= 4 && (
                <Badge variant="secondary">Отлично</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              самочувствие: {log.feeling || 0}/5
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Exercises */}
      <Card>
        <CardHeader>
          <CardTitle>Упражнения</CardTitle>
          <CardDescription>
            Выполнено {log.exercises.length} упражнений
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {log.exercises.map((exercise, exIndex) => {
            const exerciseData = exercises.find((e) => e.id === exercise.exercise_id);
            const exerciseVolume = exercise.sets.reduce((sum, set) => {
              return sum + set.weight * set.reps;
            }, 0);
            const completedSets = exercise.sets.filter((s) => s.completed).length;

            return (
              <div key={exIndex} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{exercise.exercise_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {exerciseData?.muscle_group} • {exerciseData?.equipment}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {(exerciseVolume / 1000).toFixed(1)}т
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {completedSets}/{exercise.sets.length} сетов
                    </p>
                  </div>
                </div>

                {/* Сеты */}
                <div className="grid gap-2">
                  <div className="grid grid-cols-[60px_1fr_1fr_80px] gap-2 text-xs text-muted-foreground font-medium">
                    <span>Сет</span>
                    <span>Вес (кг)</span>
                    <span>Повторы</span>
                    <span>Статус</span>
                  </div>
                  {exercise.sets.map((set, setIndex) => (
                    <div
                      key={setIndex}
                      className={`grid grid-cols-[60px_1fr_1fr_80px] gap-2 items-center p-2 rounded-lg ${set.completed
                        ? 'bg-green-500/10 border border-green-500/30'
                        : 'bg-muted/50'
                        }`}
                    >
                      <span className="text-sm font-medium">#{setIndex + 1}</span>
                      <span className="text-sm font-semibold">{set.weight}</span>
                      <span className="text-sm">{set.reps}</span>
                      <Badge
                        variant={set.completed ? 'default' : 'secondary'}
                        className="w-fit"
                      >
                        {set.completed ? '✓' : '○'}
                      </Badge>
                    </div>
                  ))}
                </div>

                {/* Прогресс упражнения */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Прогресс</span>
                    <span>{Math.round((completedSets / exercise.sets.length) * 100)}%</span>
                  </div>
                  <Progress value={(completedSets / exercise.sets.length) * 100} className="h-2" />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Notes */}
      {(log.notes || log.calories_burned) && (
        <Card>
          <CardHeader>
            <CardTitle>Заметки</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {log.notes && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Заметки</p>
                <p className="text-sm">{log.notes}</p>
              </div>
            )}
            {log.calories_burned && (
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                <span className="text-sm">
                  Сожжено калорий: <strong>{log.calories_burned}</strong>
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
