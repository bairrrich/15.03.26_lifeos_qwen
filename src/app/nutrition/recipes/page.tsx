'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
  useRecipes,
  useCreateRecipe,
} from '@/modules/nutrition/hooks';
import { getCurrentUserId } from '@/shared/hooks/use-user-id';
import { Plus, ChefHat, Clock, Users, Trash2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/ui/empty-state';

export default function RecipesPage() {
  const { data: recipes = [] } = useRecipes();
  const createRecipe = useCreateRecipe();

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Парсим ингредиенты из JSON строки
    let ingredients = [];
    try {
      ingredients = JSON.parse(formData.get('ingredients') as string);
    } catch {
      ingredients = [];
    }

    // Парсим инструкции
    const instructions = (formData.get('instructions') as string)
      .split('\n')
      .filter((line) => line.trim());
    const userId = getCurrentUserId();

    createRecipe.mutate(
      {
        name: formData.get('name') as string,
        description: (formData.get('description') as string) || undefined,
        ingredients,
        instructions,
        servings: Number(formData.get('servings')) || 1,
        prep_time_minutes: (formData.get('prep_time') as string)
          ? Number(formData.get('prep_time'))
          : undefined,
        cook_time_minutes: (formData.get('cook_time') as string)
          ? Number(formData.get('cook_time'))
          : undefined,
        user_id: userId,
      },
      {
        onSuccess: () => {
          toast.success('Рецепт добавлен');
          setDialogOpen(false);
        },
        onError: () => {
          toast.error('Ошибка при добавлении рецепта');
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" style={{ height: '32px' }}>
              <Plus className="h-4 w-4 mr-2" />
              <span>Добавить рецепт</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Новый рецепт</DialogTitle>
                <DialogDescription>Добавьте рецепт с ингредиентами</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Название</Label>
                  <Input name="name" placeholder="Например: Овсяная каша" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Описание</Label>
                  <Textarea name="description" placeholder="Краткое описание блюда" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="prep_time">Время подготовки (мин)</Label>
                    <Input name="prep_time" type="number" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cook_time">Время готовки (мин)</Label>
                    <Input name="cook_time" type="number" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="servings">Количество порций</Label>
                  <Input name="servings" type="number" min="1" defaultValue="1" />
                </div>
                <div className="grid gap-2">
                  <Label>Ингредиенты</Label>
                  <div className="text-xs text-muted-foreground">
                    Выберите продукты и укажите количество в формате JSON:
                    <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                      {`[{"food_id": "id", "quantity": 100, "unit": "г"}]`}
                    </pre>
                  </div>
                  <Textarea
                    name="ingredients"
                    placeholder='[{"food_id": "...", "quantity": 100, "unit": "г"}]'
                    className="font-mono text-sm"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="instructions">Инструкции</Label>
                  <Textarea
                    name="instructions"
                    placeholder="Шаг 1:&#10;Шаг 2:&#10;Шаг 3:"
                    className="min-h-[100px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Отмена
                </Button>
                <Button type="submit">Добавить</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Recipes List */}
      <div className="grid gap-4 md:grid-cols-2">
        {recipes.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Нет рецептов"
            description="Добавьте свои любимые рецепты"
            actionLabel="Добавить рецепт"
            onAction={() => setDialogOpen(true)}
          />
        ) : (
          recipes.map((recipe) => (
            <Card key={recipe.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{recipe.name}</CardTitle>
                    {recipe.description && (
                      <CardDescription className="text-xs">
                        {recipe.description}
                      </CardDescription>
                    )}
                  </div>
                  <Badge variant="outline">
                    <Users className="h-3 w-3 mr-1" />
                    {recipe.servings} порц.
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(recipe.prep_time_minutes || recipe.cook_time_minutes) && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {recipe.prep_time_minutes && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Подготовка: {recipe.prep_time_minutes} мин</span>
                        </div>
                      )}
                      {recipe.cook_time_minutes && (
                        <div className="flex items-center gap-1">
                          <ChefHat className="h-3 w-3" />
                          <span>Готовка: {recipe.cook_time_minutes} мин</span>
                        </div>
                      )}
                    </div>
                  )}
                  {recipe.ingredients && recipe.ingredients.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Ингредиенты:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {recipe.ingredients.map((ing, i) => (
                          <li key={i}>
                            • {ing.quantity} {ing.unit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {recipe.instructions && recipe.instructions.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Приготовление:</p>
                      <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                        {recipe.instructions.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
                <Button variant="ghost" size="icon" className="mt-4">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
