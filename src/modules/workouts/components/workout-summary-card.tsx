'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/ui/components/card';
import { Badge } from '@/ui/components/badge';
import { Progress } from '@/ui/components/progress';
import { Clock, Dumbbell, TrendingUp, Award, Star, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface WorkoutSummaryCardProps {
  workoutName: string;
  date: number;
  durationSeconds: number;
  rating?: number;
  feeling?: number;
  exercises: Array<{
    exercise_name: string;
    sets: Array<{
      reps: number;
      weight: number;
      completed: boolean;
    }>;
  }>;
  volume?: number;
  className?: string;
}

export function WorkoutSummaryCard({
  workoutName,
  date,
  durationSeconds,
  rating,
  feeling,
  exercises,
  volume,
  className,
}: WorkoutSummaryCardProps) {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}ч ${minutes}м`;
    return `${minutes}м`;
  };

  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const completedSets = exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
    0
  );
  const totalReps = exercises.reduce((sum, ex) => {
    return sum + ex.sets.reduce((setSum, set) => setSum + set.reps, 0);
  }, 0);
  const calculatedVolume =
    volume ??
    exercises.reduce((sum, ex) => {
      return sum + ex.sets.reduce((setSum, set) => setSum + set.weight * set.reps, 0);
    }, 0);

  const completionPercent = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{workoutName}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {format(date, 'dd MMMM yyyy', { locale: ru })}
            </div>
          </div>
          {rating && (
            <Badge
              variant={rating >= 4 ? 'default' : 'secondary'}
              className="flex items-center gap-1"
            >
              <Star className="h-3 w-3" />
              {rating}/5
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Время
            </div>
            <p className="text-sm font-semibold">{formatDuration(durationSeconds)}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Dumbbell className="h-3 w-3" />
              Объём
            </div>
            <p className="text-sm font-semibold">{(calculatedVolume / 1000).toFixed(1)}т</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              Сеты
            </div>
            <p className="text-sm font-semibold">
              {completedSets}/{totalSets}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Выполнено</span>
            <span>{Math.round(completionPercent)}%</span>
          </div>
          <Progress value={completionPercent} className="h-2" />
        </div>

        {/* Feeling */}
        {feeling && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Award className="h-3 w-3" />
              Самочувствие
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={cn(
                    'h-2 flex-1 rounded-full transition-colors',
                    i <= feeling ? 'bg-primary' : 'bg-muted'
                  )}
                />
              ))}
            </div>
          </div>
        )}

        {/* Exercises Summary */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground mb-2">
            {exercises.length} упражнений • {totalReps} повторений
          </p>
          <div className="flex flex-wrap gap-1">
            {exercises.slice(0, 4).map((ex, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {ex.exercise_name.split(' ')[0]}
              </Badge>
            ))}
            {exercises.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{exercises.length - 4}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

