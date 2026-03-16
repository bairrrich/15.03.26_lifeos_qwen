'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SetType } from '../entities';

interface SetRowProps {
  setNumber: number;
  type: SetType;
  reps: number;
  weight: number;
  rpe?: number;
  completed: boolean;
  previousSet?: { reps: number; weight: number };
  onRepsChange: (value: number) => void;
  onWeightChange: (value: number) => void;
  onRPEChange?: (value: number) => void;
  onComplete: () => void;
  className?: string;
}

export function SetRow({
  setNumber,
  type,
  reps,
  weight,
  rpe,
  completed,
  previousSet,
  onRepsChange,
  onWeightChange,
  onRPEChange,
  onComplete,
  className,
}: SetRowProps) {
  const getTypeColor = () => {
    switch (type) {
      case 'warmup':
        return 'border-blue-500/50 bg-blue-500/10';
      case 'dropset':
        return 'border-purple-500/50 bg-purple-500/10';
      case 'failure':
        return 'border-red-500/50 bg-red-500/10';
      case 'superset':
        return 'border-orange-500/50 bg-orange-500/10';
      default:
        return 'border-border bg-card';
    }
  };

  return (
    <div
      className={cn(
        'grid grid-cols-[40px_1fr_1fr_80px_60px] gap-2 items-center p-3 rounded-lg border transition-colors',
        getTypeColor(),
        completed && 'opacity-60',
        className
      )}
    >
      {/* Номер сета */}
      <div className="flex flex-col items-center">
        <span className="text-sm font-medium text-muted-foreground">#{setNumber}</span>
        {type !== 'working' && (
          <span className="text-[10px] uppercase text-muted-foreground">{type}</span>
        )}
      </div>

      {/* Вес */}
      <div className="relative">
        <Input
          type="number"
          value={weight}
          onChange={(e) => onWeightChange(Number(e.target.value))}
          className={cn(
            'text-center font-semibold',
            previousSet && weight > previousSet.weight && 'text-green-600 dark:text-green-400',
            previousSet && weight < previousSet.weight && 'text-red-600 dark:text-red-400'
          )}
          step={0.25}
          min={0}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          кг
        </span>
      </div>

      {/* Повторы */}
      <div className="relative">
        <Input
          type="number"
          value={reps}
          onChange={(e) => onRepsChange(Number(e.target.value))}
          className="text-center font-semibold"
          step={1}
          min={0}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          повт
        </span>
      </div>

      {/* RPE */}
      {onRPEChange && (
        <div className="flex flex-col items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => onRPEChange(Math.min(10, (rpe || 5) + 1))}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium w-6 text-center">{rpe || '-'}</span>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => onRPEChange(Math.max(1, (rpe || 5) - 1))}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Кнопка завершения */}
      <Button
        size="icon"
        variant={completed ? 'default' : 'outline'}
        className={cn('h-10 w-10 rounded-full', completed && 'bg-green-600 hover:bg-green-700')}
        onClick={onComplete}
      >
        <Check className="h-5 w-5" />
      </Button>
    </div>
  );
}
