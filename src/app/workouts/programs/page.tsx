'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { Plus, Dumbbell, Play, CheckCircle2, Calendar, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

import {
  useWorkoutPlans,
  useCreateWorkoutPlan,
  useSetActiveWorkoutPlan,
  useWorkouts,
} from '@/modules/workouts/hooks';
import type { WorkoutPlan, WorkoutGoal } from '@/modules/workouts/entities';

export default function ProgramsPage() {
  const { data: plans = [], isLoading } = useWorkoutPlans();
  const { data: workouts = [] } = useWorkouts();
  const createPlan = useCreateWorkoutPlan();
  const setActivePlan = useSetActiveWorkoutPlan();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);

  const [newPlan, setNewPlan] = useState<{
    name: string;
    description: string;
    goal: WorkoutGoal;
    days_per_week: number;
    duration_weeks: number;
    progression_type: 'linear' | 'wave' | 'periodized';
    progression_increment: number;
  }>({
    name: '',
    description: '',
    goal: 'hypertrophy',
    days_per_week: 3,
    duration_weeks: 8,
    progression_type: 'linear',
    progression_increment: 2.5,
  });

  const handleCreatePlan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Создаём план с пустыми workout'ами (в реальности нужно создать workout'ы)
    const planData = {
      user_id: 'current-user',
      name: newPlan.name,
      description: newPlan.description,
      goal: newPlan.goal,
      days_per_week: newPlan.days_per_week,
      duration_weeks: newPlan.duration_weeks,
      is_active: false,
      workouts: Array.from({ length: newPlan.days_per_week }, (_, i) => ({
        day: i + 1,
        workout_id: '',
        workout_name: `День ${i + 1}`,
      })),
      progression: {
        type: newPlan.progression_type,
        increment: newPlan.progression_increment,
      },
    };

    await createPlan.mutateAsync(planData, {
      onSuccess: () => {
        toast.success('Программа создана');
        setCreateDialogOpen(false);
        setNewPlan({
          name: '',
          description: '',
          goal: 'hypertrophy',
          days_per_week: 3,
          duration_weeks: 8,
          progression_type: 'linear',
          progression_increment: 2.5,
        });
      },
      onError: () => {
        toast.error('Ошибка при создании');
      },
    });
  };

  const handleSetActive = async (planId: string) => {
    await setActivePlan.mutateAsync(planId, {
      onSuccess: () => {
        toast.success('Программа активирована');
      },
      onError: () => {
        toast.error('Ошибка при активации');
      },
    });
  };

  const getGoalLabel = (goal: WorkoutGoal) => {
    const labels: Record<WorkoutGoal, string> = {
      strength: 'Сила',
      hypertrophy: 'Масса',
      endurance: 'Выносливость',
      weight_loss: 'Похудение',
      general_fitness: 'Общая форма',
    };
    return labels[goal] || goal;
  };

  const getGoalColor = (goal: WorkoutGoal) => {
    const colors: Record<WorkoutGoal, string> = {
      strength: 'bg-red-500/10 text-red-600 dark:text-red-400',
      hypertrophy: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      endurance: 'bg-green-500/10 text-green-600 dark:text-green-400',
      weight_loss: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
      general_fitness: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    };
    return colors[goal] || 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
  };

  const activePlan = plans.find((p) => p.is_active);

  // Предустановленные программы
  const presetPrograms = [
    {
      name: 'Starting Strength',
      description: 'Классическая программа для набора силы',
      goal: 'strength' as WorkoutGoal,
      days_per_week: 3,
      duration_weeks: 12,
      workouts: [
        { day: 1, workout_name: 'Тренировка A: Присед, Жим, Становая' },
        { day: 2, workout_name: 'Тренировка B: Присед, Жим, Тяга' },
        { day: 3, workout_name: 'Тренировка A' },
      ],
    },
    {
      name: 'PPL (Push/Pull/Legs)',
      description: 'Трёхдневный сплит для гипертрофии',
      goal: 'hypertrophy' as WorkoutGoal,
      days_per_week: 3,
      duration_weeks: 8,
      workouts: [
        { day: 1, workout_name: 'Push: Грудь, Плечи, Трицепс' },
        { day: 2, workout_name: 'Pull: Спина, Бицепс' },
        { day: 3, workout_name: 'Legs: Ноги, Пресс' },
      ],
    },
    {
      name: 'Upper/Lower',
      description: 'Двухдневный сплит',
      goal: 'general_fitness' as WorkoutGoal,
      days_per_week: 2,
      duration_weeks: 8,
      workouts: [
        { day: 1, workout_name: 'Upper Body' },
        { day: 2, workout_name: 'Lower Body' },
      ],
    },
    {
      name: '5/3/1',
      description: 'Программа силовой подготовки',
      goal: 'strength' as WorkoutGoal,
      days_per_week: 4,
      duration_weeks: 12,
      workouts: [
        { day: 1, workout_name: 'День 1: Присед' },
        { day: 2, workout_name: 'День 2: Жим' },
        { day: 3, workout_name: 'День 3: Становая' },
        { day: 4, workout_name: 'День 4: Жим' },
      ],
    },
  ];

  const handleUsePreset = async (preset: typeof presetPrograms[0]) => {
    const planData: Omit<WorkoutPlan, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'version' | 'sync_status' | 'last_synced_at'> = {
      user_id: 'current-user',
      name: preset.name,
      description: preset.description,
      goal: preset.goal,
      days_per_week: preset.days_per_week,
      duration_weeks: preset.duration_weeks,
      is_active: false,
      workouts: preset.workouts.map((w) => ({
        day: w.day,
        workout_id: '',
        workout_name: w.workout_name,
      })),
      progression: {
        type: 'linear',
        increment: 2.5,
      },
    };

    await createPlan.mutateAsync(planData, {
      onSuccess: () => {
        toast.success(`Программа "${preset.name}" добавлена`);
      },
      onError: () => {
        toast.error('Ошибка при добавлении');
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-wrap gap-2 justify-end">
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" style={{ height: '32px' }}>
              <Plus className="h-4 w-4 mr-2" />
              <span>Создать программу</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <form onSubmit={handleCreatePlan}>
              <DialogHeader>
                <DialogTitle>Новая программа</DialogTitle>
                <DialogDescription>
                  Создайте индивидуальную программу тренировок
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Название</Label>
                  <Input
                    id="name"
                    value={newPlan.name}
                    onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                    placeholder="Например: Моя программа"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Описание</Label>
                  <Input
                    id="description"
                    value={newPlan.description}
                    onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                    placeholder="Краткое описание"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Цель</Label>
                    <Select
                      value={newPlan.goal}
                      onValueChange={(value) => setNewPlan({ ...newPlan, goal: value as WorkoutGoal })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="strength">Сила</SelectItem>
                        <SelectItem value="hypertrophy">Масса</SelectItem>
                        <SelectItem value="endurance">Выносливость</SelectItem>
                        <SelectItem value="weight_loss">Похудение</SelectItem>
                        <SelectItem value="general_fitness">Общая форма</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>Дней в неделю</Label>
                    <Select
                      value={newPlan.days_per_week.toString()}
                      onValueChange={(value) =>
                        setNewPlan({ ...newPlan, days_per_week: Number(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 дня</SelectItem>
                        <SelectItem value="3">3 дня</SelectItem>
                        <SelectItem value="4">4 дня</SelectItem>
                        <SelectItem value="5">5 дней</SelectItem>
                        <SelectItem value="6">6 дней</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Длительность (недель)</Label>
                    <Input
                      type="number"
                      value={newPlan.duration_weeks}
                      onChange={(e) =>
                        setNewPlan({ ...newPlan, duration_weeks: Number(e.target.value) })
                      }
                      min={4}
                      max={52}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Прогрессия</Label>
                    <Select
                      value={newPlan.progression_type}
                      onValueChange={(value) =>
                        setNewPlan({ ...newPlan, progression_type: value as 'linear' | 'wave' | 'periodized' })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="linear">Линейная</SelectItem>
                        <SelectItem value="wave">Волнообразная</SelectItem>
                        <SelectItem value="periodized">Периодизация</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Шаг прогрессии (кг)</Label>
                  <Input
                    type="number"
                    value={newPlan.progression_increment}
                    onChange={(e) =>
                      setNewPlan({ ...newPlan, progression_increment: Number(e.target.value) })
                    }
                    step={0.25}
                    min={0.25}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Отмена
                </Button>
                <Button type="submit" disabled={createPlan.isPending}>
                  {createPlan.isPending ? 'Создание...' : 'Создать'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Program */}
      {activePlan && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-primary" />
                  Активная программа
                </CardTitle>
                <CardDescription>{activePlan.name}</CardDescription>
              </div>
              <Badge className={getGoalColor(activePlan.goal)}>
                {getGoalLabel(activePlan.goal)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{activePlan.days_per_week} дней/неделю</p>
                  <p className="text-xs text-muted-foreground">
                    {activePlan.duration_weeks} недель
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium capitalize">
                    {activePlan.progression?.type || 'linear'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    +{activePlan.progression?.increment} кг
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Dumbbell className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {activePlan.workouts.length} тренировок
                  </p>
                  <p className="text-xs text-muted-foreground">в цикле</p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium mb-2">План тренировок:</p>
              <div className="flex flex-wrap gap-2">
                {activePlan.workouts.map((w, i) => (
                  <Badge key={i} variant="secondary">
                    День {w.day}: {w.workout_name || 'Тренировка'}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preset Programs */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Готовые программы</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {presetPrograms.map((preset, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{preset.name}</CardTitle>
                    <CardDescription>{preset.description}</CardDescription>
                  </div>
                  <Badge className={getGoalColor(preset.goal)}>
                    {getGoalLabel(preset.goal)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span>{preset.days_per_week} дней/неделю</span>
                  <span>•</span>
                  <span>{preset.duration_weeks} недель</span>
                </div>

                <div className="space-y-2 mb-4">
                  {preset.workouts.map((w, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                      <span>{w.workout_name}</span>
                    </div>
                  ))}
                </div>

                <Button onClick={() => handleUsePreset(preset)} className="w-full">
                  Использовать программу
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Programs */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Мои программы</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {plans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </div>
                  <Badge className={getGoalColor(plan.goal)}>
                    {getGoalLabel(plan.goal)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span>{plan.days_per_week} дней/неделю</span>
                  <span>•</span>
                  <span>{plan.duration_weeks} недель</span>
                </div>

                {plan.is_active ? (
                  <Badge className="w-full justify-center">Активная</Badge>
                ) : (
                  <Button onClick={() => handleSetActive(plan.id)} className="w-full">
                    Активировать
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}

          {plans.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Нет созданных программ</p>
              <p className="text-sm">Создайте программу или используйте готовую</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
