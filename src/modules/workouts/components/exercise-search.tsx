'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/ui/components/input';
import { Button } from '@/ui/components/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/ui/components/command';
import { Search, Star, Filter } from 'lucide-react';
import { Badge } from '@/ui/components/badge';
import { ScrollArea } from '@/ui/components/scroll-area';
import { useExercises, useFavoriteExercises } from '../hooks';
import type { Exercise, MuscleGroup, Equipment } from '../entities';
import { cn } from '@/lib/utils';

interface ExerciseSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (exercise: Exercise) => void;
  selectedExerciseIds?: string[];
}

export function ExerciseSearch({
  open,
  onOpenChange,
  onSelect,
  selectedExerciseIds,
}: ExerciseSearchProps) {
  const { data: exercises = [] } = useExercises();
  const { data: favorites = [] } = useFavoriteExercises();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup | 'all'>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | 'all'>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise) => {
      const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMuscleGroup =
        selectedMuscleGroup === 'all' || exercise.muscle_group === selectedMuscleGroup;
      const matchesEquipment =
        selectedEquipment === 'all' || exercise.equipment === selectedEquipment;
      const matchesFavorite = !showFavoritesOnly || favorites.some((f) => f.id === exercise.id);

      return matchesSearch && matchesMuscleGroup && matchesEquipment && matchesFavorite;
    });
  }, [exercises, searchQuery, selectedMuscleGroup, selectedEquipment, showFavoritesOnly, favorites]);

  const muscleGroups: { value: MuscleGroup; label: string }[] = [
    { value: 'chest', label: 'Грудь' },
    { value: 'back', label: 'Спина' },
    { value: 'legs', label: 'Ноги' },
    { value: 'shoulders', label: 'Плечи' },
    { value: 'arms', label: 'Руки' },
    { value: 'core', label: 'Пресс' },
    { value: 'cardio', label: 'Кардио' },
  ];

  const equipmentList: { value: Equipment; label: string }[] = [
    { value: 'barbell', label: 'Штанга' },
    { value: 'dumbbell', label: 'Гантели' },
    { value: 'bodyweight', label: 'Свой вес' },
    { value: 'machine', label: 'Тренажёр' },
    { value: 'cable', label: 'Блок' },
    { value: 'kettlebell', label: 'Гиря' },
  ];

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск упражнений..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 px-0"
          />
        </div>

        {/* Фильтры */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-2">
          <Button
            size="sm"
            variant={showFavoritesOnly ? 'default' : 'outline'}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className="shrink-0"
          >
            <Star className={cn('h-4 w-4 mr-1', showFavoritesOnly && 'fill-white')} />
            Избранное
          </Button>

          <div className="h-4 w-px bg-border mx-1" />

          {muscleGroups.map((mg) => (
            <Button
              key={mg.value}
              size="sm"
              variant={selectedMuscleGroup === mg.value ? 'default' : 'outline'}
              onClick={() =>
                setSelectedMuscleGroup(
                  selectedMuscleGroup === mg.value ? 'all' : mg.value
                )
              }
              className="shrink-0"
            >
              {mg.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-2">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          {equipmentList.map((eq) => (
            <Button
              key={eq.value}
              size="sm"
              variant={selectedEquipment === eq.value ? 'secondary' : 'outline'}
              onClick={() =>
                setSelectedEquipment(selectedEquipment === eq.value ? 'all' : eq.value)
              }
              className="shrink-0"
            >
              {eq.label}
            </Button>
          ))}
        </div>
      </div>

      <CommandList>
        <CommandEmpty>
          {searchQuery.length < 2
            ? 'Введите минимум 2 символа для поиска'
            : 'Упражнения не найдены'}
        </CommandEmpty>

        <ScrollArea className="h-[400px]">
          <CommandGroup heading="Упражнения">
            {filteredExercises.map((exercise) => (
              <CommandItem
                key={exercise.id}
                value={exercise.name}
                onSelect={() => onSelect(exercise)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="font-medium">{exercise.name}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{exercise.muscle_group}</span>
                      {exercise.equipment && <span>• {exercise.equipment}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {favorites.some((f) => f.id === exercise.id) && (
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  )}
                  {selectedExerciseIds?.includes(exercise.id) && (
                    <Badge variant="secondary">Выбрано</Badge>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </ScrollArea>
      </CommandList>
    </CommandDialog>
  );
}

