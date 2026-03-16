'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ChevronRight,
  ChevronLeft,
  Plus,
  Save,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Award,
} from 'lucide-react';
import { toast } from 'sonner';

import { useActiveWorkout, useCreateWorkoutLog, useUpdatePR, useExercisePRs } from '@/modules/workouts/hooks';
import { getCurrentUserId } from '@/shared/hooks/use-user-id';
import { RestTimer, SetRow, ExerciseSearch, PRBadge } from '@/modules/workouts/components';
import type { SetType as SetTypeEnum, WorkoutExercise, Exercise } from '@/modules/workouts/entities';

interface ActiveWorkoutScreenProps {
  workoutId: string;
  workoutName: string;
  onFinish?: () => void;
}

interface ActiveSet {
  exercise_id: string;
  exercise_name: string;
  order: number;
  set_number: number;
  type: SetTypeEnum;
  reps: number;
  weight: number;
  rpe?: number;
  tempo?: string;
  rest_seconds?: number;
  completed: boolean;
  notes?: string;
}

export function ActiveWorkoutScreen({ workoutId, workoutName, onFinish }: ActiveWorkoutScreenProps) {
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState(0);
  const [showExerciseSearch, setShowExerciseSearch] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [rating, setRating] = useState(4);
  const [feeling, setFeeling] = useState(3);
  const [notes, setNotes] = useState('');
  const [newPRs, setNewPRs] = useState<Array<{ exerciseName: string; oneRepMax: number }>>([]);

  // Упражнения тренировки (заглушка - в реальности загружать из workoutId)
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([
    {
      exercise_id: 'ex_1',
      exercise_name: 'Приседания со штангой',
      order: 0,
      target_sets: 4,
      target_reps: 8,
      target_weight: 100,
      rest_seconds: 120,
    },
    {
      exercise_id: 'ex_2',
      exercise_name: 'Жим лёжа',
      order: 1,
      target_sets: 4,
      target_reps: 8,
      target_weight: 80,
      rest_seconds: 120,
    },
    {
      exercise_id: 'ex_3',
      exercise_name: 'Становая тяга',
      order: 2,
      target_sets: 3,
      target_reps: 5,
      target_weight: 120,
      rest_seconds: 180,
    },
  ]);

  const currentExercise = workoutExercises[selectedExerciseIndex];

  const { sets, addSet } = useActiveWorkout(workoutId);
  const createWorkoutLog = useCreateWorkoutLog();
  const updatePR = useUpdatePR();
  const { data: exercisePRs = [] } = useExercisePRs(
    currentExercise?.exercise_id || ''
  );

  // Таймер elapsed времени
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  // Сеты текущего упражнения
  const currentSets = sets.filter((s) => s.exercise_id === currentExercise?.exercise_id);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddSet = () => {
    if (!currentExercise) return;

    const previousSet = currentSets[currentSets.length - 1];
    const newSet: ActiveSet = {
      exercise_id: currentExercise.exercise_id,
      exercise_name: currentExercise.exercise_name || '',
      order: currentExercise.order,
      set_number: currentSets.length + 1,
      type: currentSets.length === 0 ? 'warmup' : 'working',
      reps: previousSet?.reps || currentExercise.target_reps || 8,
      weight: previousSet?.weight || currentExercise.target_weight || 0,
      rpe: previousSet?.rpe,
      rest_seconds: currentExercise.rest_seconds || 90,
      completed: false,
    };

    addSet({
      ...newSet,
      exercise_id: newSet.exercise_id,
      exercise_name: newSet.exercise_name,
      order: newSet.order,
      set_number: newSet.set_number,
      type: newSet.type,
      reps: newSet.reps,
      weight: newSet.weight,
      rpe: newSet.rpe,
      tempo: newSet.tempo,
      rest_seconds: newSet.rest_seconds,
      notes: newSet.notes,
    });
  };

  const handleCompleteSet = async (setIndex: number) => {
    const set = currentSets[setIndex];
    if (!set) return;

    // Проверка на PR
    const oneRepMax = Math.round(set.weight * (1 + set.reps / 30));
    const currentMaxPR = exercisePRs.length > 0
      ? Math.max(...exercisePRs.map((pr) => pr.one_rep_max))
      : 0;

    if (oneRepMax > currentMaxPR && currentMaxPR > 0) {
      // Новый PR!
      setNewPRs((prev) => [
        ...prev,
        { exerciseName: set.exercise_name, oneRepMax },
      ]);

      await updatePR.mutateAsync({
        exerciseId: set.exercise_id,
        exerciseName: set.exercise_name,
        weight: set.weight,
        reps: set.reps,
        date: Date.now(),
      });

      toast.success(`🏆 Новый рекорд в упражнении "${set.exercise_name}"! ${oneRepMax} кг`);
    }

    // Запуск таймера отдыха
    if (set.rest_seconds) {
      setShowRestTimer(true);
    }
  };

  const handleUpdateSet = (setIndex: number, updates: Partial<ActiveSet>) => {
    // В реальной реализации здесь был бы update set
    console.log('Update set:', setIndex, updates);
  };

  const handleAddExercise = (exercise: Exercise) => {
    setWorkoutExercises([
      ...workoutExercises,
      {
        exercise_id: exercise.id,
        exercise_name: exercise.name,
        order: workoutExercises.length,
        target_sets: 3,
        target_reps: 10,
        target_weight: 0,
        rest_seconds: 90,
      },
    ]);
    setShowExerciseSearch(false);
    toast.success(`Упражнение "${exercise.name}" добавлено`);
  };

  const handleRemoveExercise = (index: number) => {
    setWorkoutExercises(workoutExercises.filter((_, i) => i !== index));
    if (selectedExerciseIndex >= index && selectedExerciseIndex > 0) {
      setSelectedExerciseIndex(selectedExerciseIndex - 1);
    }
  };

  const handleFinishWorkout = async () => {
    const duration = Math.floor((Date.now() - startTime) / 1000);
    const userId = getCurrentUserId();

    // Группировка сетов по упражнениям для лога
    const exercisesLog = workoutExercises.map((ex) => ({
      exercise_id: ex.exercise_id,
      exercise_name: ex.exercise_name || '',
      sets: sets
        .filter((s) => s.exercise_id === ex.exercise_id && s.completed)
        .map((s) => ({
          reps: s.reps,
          weight: s.weight,
          rpe: s.rpe,
          completed: s.completed,
        })),
    }));

    await createWorkoutLog.mutateAsync({
      workout_id: workoutId,
      workout_name: workoutName,
      date: Date.now(),
      duration_seconds: duration,
      exercises: exercisesLog,
      rating: rating as 1 | 2 | 3 | 4 | 5,
      feeling: feeling as 1 | 2 | 3 | 4 | 5,
      notes: notes || undefined,
      user_id: userId,
    });

    toast.success('Тренировка сохранена!');
    onFinish?.();
  };

  const completedSetsCount = sets.filter((s) => s.completed).length;
  const totalSetsCount = workoutExercises.reduce((sum, ex) => sum + ex.target_sets, 0);

  return (
    <div className="space-y-4">
      {/* Header с таймером */}
      <div className="flex items-center justify-between sticky top-0 bg-background z-10 py-2 border-b">
        <div>
          <h2 className="text-lg font-semibold">{workoutName}</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatTime(elapsedTime)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {completedSetsCount}/{totalSetsCount} сетов
          </Badge>
          <Button size="sm" variant="outline" onClick={() => setShowFinishDialog(true)}>
            Завершить
          </Button>
        </div>
      </div>

      {/* Навигация по упражнениям */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Button
          size="icon"
          variant="outline"
          disabled={selectedExerciseIndex === 0}
          onClick={() => setSelectedExerciseIndex(selectedExerciseIndex - 1)}
          className="shrink-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {workoutExercises.map((ex, index) => (
          <Button
            key={ex.exercise_id}
            variant={selectedExerciseIndex === index ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedExerciseIndex(index)}
            className="shrink-0 max-w-[150px] truncate"
          >
            {ex.exercise_name}
          </Button>
        ))}

        <Button
          size="icon"
          variant="outline"
          disabled={selectedExerciseIndex === workoutExercises.length - 1}
          onClick={() => setSelectedExerciseIndex(selectedExerciseIndex + 1)}
          className="shrink-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          onClick={() => setShowExerciseSearch(true)}
          className="shrink-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Уведомления о новых PR */}
      {newPRs.length > 0 && (
        <div className="space-y-2">
          {newPRs.map((pr, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30"
            >
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">{pr.exerciseName}</span>
              </div>
              <PRBadge value={`${pr.oneRepMax} кг`} />
            </div>
          ))}
        </div>
      )}

      {/* Текущее упражнение */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{currentExercise?.exercise_name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Цель: {currentExercise?.target_sets} x {currentExercise?.target_reps} @{' '}
                {currentExercise?.target_weight} кг
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleRemoveExercise(selectedExerciseIndex)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Список сетов */}
          <div className="space-y-2 mb-4">
            {currentSets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Нет сетов. Добавьте первый сет.</p>
              </div>
            ) : (
              currentSets.map((s, index) => (
                <div key={s.id || index} className="relative">
                  <SetRow
                    setNumber={s.set_number}
                    type={s.type}
                    reps={s.reps}
                    weight={s.weight}
                    rpe={s.rpe}
                    completed={s.completed}
                    onComplete={() => handleCompleteSet(index)}
                    onRepsChange={(value) =>
                      handleUpdateSet(index, { reps: value })
                    }
                    onWeightChange={(value) =>
                      handleUpdateSet(index, { weight: value })
                    }
                    onRPEChange={(value) =>
                      handleUpdateSet(index, { rpe: value })
                    }
                  />
                  {s.completed && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Кнопка добавления сета */}
          <Button onClick={handleAddSet} className="w-full" size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Добавить сет
          </Button>
        </CardContent>
      </Card>

      {/* Диалог завершения тренировки */}
      <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Завершение тренировки</DialogTitle>
            <DialogDescription>
              Оцените тренировку и сохраните результат
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Длительность</Label>
              <p className="text-lg font-medium">{formatTime(elapsedTime)}</p>
            </div>

            <div className="space-y-2">
              <Label>
                Оценка: <span className="font-medium">{rating}/5</span>
              </Label>
              <Slider
                value={[rating]}
                onValueChange={(v) => setRating(Array.isArray(v) ? v[0] : v)}
                min={1}
                max={5}
                step={1}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                Самочувствие: <span className="font-medium">{feeling}/5</span>
              </Label>
              <Slider
                value={[feeling]}
                onValueChange={(v) => setFeeling(Array.isArray(v) ? v[0] : v)}
                min={1}
                max={5}
                step={1}
                className="py-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Заметки</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Как прошла тренировка?"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFinishDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleFinishWorkout}>
              <Save className="h-4 w-4 mr-2" />
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Поиск упражнений */}
      <ExerciseSearch
        open={showExerciseSearch}
        onOpenChange={setShowExerciseSearch}
        onSelect={handleAddExercise}
      />

      {/* Таймер отдыха */}
      <Dialog open={showRestTimer} onOpenChange={setShowRestTimer}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Отдых</DialogTitle>
            <DialogDescription>
              Восстанавливайтесь перед следующим сетом
            </DialogDescription>
          </DialogHeader>
          <RestTimer
            initialSeconds={currentExercise?.rest_seconds || 90}
            onComplete={() => setShowRestTimer(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
