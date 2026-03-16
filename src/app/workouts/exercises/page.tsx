'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Filter, Star, StarOff, Dumbbell, Video, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';

import {
  useExercises,
  useCreateExercise,
  useFavoriteExercises,
  useToggleExerciseFavorite,
} from '@/modules/workouts/hooks';
import { ExerciseCard } from '@/modules/workouts/components';
import type { Exercise, MuscleGroup, Equipment, Difficulty } from '@/modules/workouts/entities';

export default function ExercisesPage() {
  const { data: exercises = [], isLoading } = useExercises();
  const { data: favorites = [] } = useFavoriteExercises();
  const createExercise = useCreateExercise();
  const toggleFavorite = useToggleExerciseFavorite();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup | 'all'>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  // Форма нового упражнения
  const [newExercise, setNewExercise] = useState<{
    name: string;
    description: string;
    muscle_group: MuscleGroup;
    equipment: Equipment;
    difficulty: Difficulty;
    is_compound: boolean;
    video_url: string;
  }>({
    name: '',
    description: '',
    muscle_group: 'other',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    is_compound: false,
    video_url: '',
  });

  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise) => {
      const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMuscleGroup =
        selectedMuscleGroup === 'all' || exercise.muscle_group === selectedMuscleGroup;
      const matchesEquipment =
        selectedEquipment === 'all' || exercise.equipment === selectedEquipment;
      const matchesDifficulty =
        selectedDifficulty === 'all' || exercise.difficulty === selectedDifficulty;
      const matchesFavorite =
        !showFavoritesOnly || favorites.some((f) => f.id === exercise.id);

      return matchesSearch && matchesMuscleGroup && matchesEquipment && matchesDifficulty && matchesFavorite;
    });
  }, [exercises, searchQuery, selectedMuscleGroup, selectedEquipment, selectedDifficulty, showFavoritesOnly, favorites]);

  const handleCreateExercise = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await createExercise.mutateAsync({
      ...newExercise,
      user_id: 'current-user',
    }, {
      onSuccess: () => {
        toast.success('Упражнение создано');
        setCreateDialogOpen(false);
        setNewExercise({
          name: '',
          description: '',
          muscle_group: 'other',
          equipment: 'bodyweight',
          difficulty: 'beginner',
          is_compound: false,
          video_url: '',
        });
      },
      onError: () => {
        toast.error('Ошибка при создании');
      },
    });
  };

  const handleToggleFavorite = async (id: string) => {
    await toggleFavorite.mutateAsync(id);
  };

  const muscleGroups: { value: MuscleGroup; label: string }[] = [
    { value: 'chest', label: 'Грудь' },
    { value: 'back', label: 'Спина' },
    { value: 'legs', label: 'Ноги' },
    { value: 'shoulders', label: 'Плечи' },
    { value: 'arms', label: 'Руки' },
    { value: 'core', label: 'Пресс' },
    { value: 'cardio', label: 'Кардио' },
    { value: 'other', label: 'Другое' },
  ];

  const equipmentList: { value: Equipment; label: string }[] = [
    { value: 'barbell', label: 'Штанга' },
    { value: 'dumbbell', label: 'Гантели' },
    { value: 'bodyweight', label: 'Свой вес' },
    { value: 'machine', label: 'Тренажёр' },
    { value: 'cable', label: 'Блок' },
    { value: 'kettlebell', label: 'Гиря' },
    { value: 'other', label: 'Другое' },
  ];

  const difficulties: { value: Difficulty; label: string }[] = [
    { value: 'beginner', label: 'Новичок' },
    { value: 'intermediate', label: 'Средний' },
    { value: 'advanced', label: 'Продвинутый' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Упражнения</h1>
          <p className="text-muted-foreground">Библиотека упражнений</p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Добавить
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <form onSubmit={handleCreateExercise}>
              <DialogHeader>
                <DialogTitle>Новое упражнение</DialogTitle>
                <DialogDescription>
                  Добавьте пользовательское упражнение в библиотеку
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Название</Label>
                  <Input
                    id="name"
                    value={newExercise.name}
                    onChange={(e) =>
                      setNewExercise({ ...newExercise, name: e.target.value })
                    }
                    placeholder="Например: Приседания со штангой"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Описание</Label>
                  <Input
                    id="description"
                    value={newExercise.description}
                    onChange={(e) =>
                      setNewExercise({ ...newExercise, description: e.target.value })
                    }
                    placeholder="Краткое описание техники"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Группа мышц</Label>
                    <Select
                      value={newExercise.muscle_group}
                      onValueChange={(value) =>
                        setNewExercise({ ...newExercise, muscle_group: value as MuscleGroup })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {muscleGroups.map((mg) => (
                          <SelectItem key={mg.value} value={mg.value}>
                            {mg.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>Оборудование</Label>
                    <Select
                      value={newExercise.equipment}
                      onValueChange={(value) =>
                        setNewExercise({ ...newExercise, equipment: value as Equipment })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {equipmentList.map((eq) => (
                          <SelectItem key={eq.value} value={eq.value}>
                            {eq.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Сложность</Label>
                    <Select
                      value={newExercise.difficulty}
                      onValueChange={(value) =>
                        setNewExercise({ ...newExercise, difficulty: value as Difficulty })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {difficulties.map((d) => (
                          <SelectItem key={d.value} value={d.value}>
                            {d.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newExercise.is_compound}
                        onChange={(e) =>
                          setNewExercise({
                            ...newExercise,
                            is_compound: e.target.checked,
                          })
                        }
                        className="h-4 w-4"
                      />
                      Базовое упражнение
                    </Label>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="video_url">Ссылка на видео (YouTube)</Label>
                  <Input
                    id="video_url"
                    value={newExercise.video_url}
                    onChange={(e) =>
                      setNewExercise({ ...newExercise, video_url: e.target.value })
                    }
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Отмена
                </Button>
                <Button type="submit" disabled={createExercise.isPending}>
                  {createExercise.isPending ? 'Создание...' : 'Создать'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Фильтры</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск упражнений..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Button
              variant={showFavoritesOnly ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            >
              <Star className={showFavoritesOnly ? 'fill-white mr-1 h-4 w-4' : 'mr-1 h-4 w-4'} />
              Избранное
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            <Select
              value={selectedMuscleGroup}
              onValueChange={(value) =>
                setSelectedMuscleGroup(value as MuscleGroup | 'all')
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Группа мышц" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все группы</SelectItem>
                {muscleGroups.map((mg) => (
                  <SelectItem key={mg.value} value={mg.value}>
                    {mg.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedEquipment}
              onValueChange={(value) =>
                setSelectedEquipment(value as Equipment | 'all')
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Оборудование" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всё оборудование</SelectItem>
                {equipmentList.map((eq) => (
                  <SelectItem key={eq.value} value={eq.value}>
                    {eq.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedDifficulty}
              onValueChange={(value) =>
                setSelectedDifficulty(value as Difficulty | 'all')
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Сложность" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Любая</SelectItem>
                {difficulties.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Exercises Grid */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Все ({exercises.length})</TabsTrigger>
          <TabsTrigger value="favorites">Избранное ({favorites.length})</TabsTrigger>
          <TabsTrigger value="compound">
            Базовые ({exercises.filter((e) => e.is_compound).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredExercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                isFavorite={favorites.some((f) => f.id === exercise.id)}
                onToggleFavorite={() => handleToggleFavorite(exercise.id)}
              />
            ))}
          </div>

          {filteredExercises.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Упражнения не найдены</p>
              <p className="text-sm">Измените параметры поиска или фильтры</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {favorites.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                isFavorite
                onToggleFavorite={() => handleToggleFavorite(exercise.id)}
              />
            ))}
          </div>

          {favorites.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Нет избранных упражнений</p>
              <p className="text-sm">
                Добавьте упражнения в избранное, нажав на звёздочку
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="compound" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {exercises
              .filter((e) => e.is_compound)
              .map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  isFavorite={favorites.some((f) => f.id === exercise.id)}
                  onToggleFavorite={() => handleToggleFavorite(exercise.id)}
                />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
