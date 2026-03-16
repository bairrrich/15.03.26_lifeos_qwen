'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, Star, StarOff, Video, Trash2, Edit } from 'lucide-react';
import type { Exercise } from '../entities';
import { cn } from '@/lib/utils';

interface ExerciseCardProps {
  exercise: Exercise;
  isFavorite?: boolean;
  onSelect?: () => void;
  onToggleFavorite?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showDetails?: boolean;
  className?: string;
}

export function ExerciseCard({
  exercise,
  isFavorite,
  onSelect,
  onToggleFavorite,
  onEdit,
  onDelete,
  showDetails = true,
  className,
}: ExerciseCardProps) {
  const getMuscleGroupColor = (muscleGroup: string) => {
    const colors: Record<string, string> = {
      chest: 'bg-red-500/10 text-red-600 dark:text-red-400',
      back: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      legs: 'bg-green-500/10 text-green-600 dark:text-green-400',
      shoulders: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      arms: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
      core: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
      cardio: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
    };
    return colors[muscleGroup] || 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
  };

  const getEquipmentIcon = (equipment?: string) => {
    const icons: Record<string, string> = {
      barbell: '🏋️',
      dumbbell: '🎯',
      bodyweight: '🧘',
      machine: '🤖',
      cable: '🔗',
      kettlebell: '🔔',
    };
    return icons[equipment || ''] || '🏃';
  };

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md active:scale-[0.99]',
        onSelect && 'hover:border-primary',
        className
      )}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-2xl">{getEquipmentIcon(exercise.equipment)}</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{exercise.name}</h3>
              {exercise.description && (
                <p className="text-sm text-muted-foreground truncate">{exercise.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onToggleFavorite && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite();
                }}
              >
                {isFavorite ? (
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                ) : (
                  <StarOff className="h-4 w-4" />
                )}
              </Button>
            )}
            {onEdit && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {showDetails && (
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            <Badge className={getMuscleGroupColor(exercise.muscle_group)}>
              {exercise.muscle_group}
            </Badge>
            <Badge variant="secondary">{exercise.difficulty}</Badge>
            {exercise.is_compound && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Dumbbell className="h-3 w-3" />
                Compound
              </Badge>
            )}
            {exercise.video_url && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Video className="h-3 w-3" />
                Видео
              </Badge>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
