'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useDailyNutrition,
  useNutritionLogs,
  useCreateNutritionLog,
  useFoods,
  useNutritionGoal,
} from '@/modules/nutrition/hooks';
import { Plus, Utensils, Flame, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { toast } from 'sonner';

export default function NutritionPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = today.getTime();

  const { data: dailyNutrition } = useDailyNutrition(todayTimestamp);
  const { data: logs = [] } = useNutritionLogs(todayTimestamp);
  const { data: foods = [] } = useFoods();
  const { data: goal } = useNutritionGoal();
  const createLog = useCreateNutritionLog();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>(
    'breakfast'
  );

  const caloriesLimit = goal?.daily_calories || 2000;
  const proteinLimit = goal?.daily_protein || 150;
  const fatLimit = goal?.daily_fat || 70;
  const carbsLimit = goal?.daily_carbs || 200;

  const caloriesPercent = Math.min(
    100,
    Math.round(((dailyNutrition?.calories || 0) / caloriesLimit) * 100)
  );
  const proteinPercent = Math.min(
    100,
    Math.round(((dailyNutrition?.protein || 0) / proteinLimit) * 100)
  );
  const fatPercent = Math.min(100, Math.round(((dailyNutrition?.fat || 0) / fatLimit) * 100));
  const carbsPercent = Math.min(100, Math.round(((dailyNutrition?.carbs || 0) / carbsLimit) * 100));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const foodId = formData.get('food_id') as string;
    const food = foods.find((f) => f.id === foodId);

    if (!food) {
      toast.error('Продукт не найден');
      return;
    }

    const quantity = Number(formData.get('quantity'));
    const multiplier = quantity / food.serving_size;

    createLog.mutate(
      {
        date: todayTimestamp,
        meal_type: selectedMeal,
        food_id: foodId,
        meal_name: food.name,
        quantity,
        calories: Math.round(food.calories * multiplier),
        protein: Math.round(food.protein * multiplier),
        fat: Math.round(food.fat * multiplier),
        carbs: Math.round(food.carbs * multiplier),
        fiber: food.fiber ? Math.round(food.fiber * multiplier) : undefined,
        user_id: 'current-user',
      },
      {
        onSuccess: () => {
          toast.success('Продукт добавлен');
          setDialogOpen(false);
        },
        onError: () => {
          toast.error('Ошибка при добавлении');
        },
      }
    );
  };

  const mealLogs = logs.filter((log) => log.meal_type === selectedMeal);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Питание</h1>
          <p className="text-muted-foreground">Дневник питания и подсчёт КБЖУ</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Добавить продукт
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Добавить продукт</DialogTitle>
                <DialogDescription>Выберите продукт и укажите количество</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="meal_type">Приём пищи</Label>
                  <select
                    value={selectedMeal}
                    onChange={(e) => setSelectedMeal(e.target.value as any)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Выберите приём пищи</option>
                    <option value="breakfast">Завтрак</option>
                    <option value="lunch">Обед</option>
                    <option value="dinner">Ужин</option>
                    <option value="snack">Перекус</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="food_id">Продукт</Label>
                  <select
                    name="food_id"



                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Выберите продукт</option>

                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quantity">
                    Количество ({foods.find((f) => f.id === logs[0]?.food_id)?.serving_unit || 'г'})
                  </Label>
                  <Input name="quantity" type="number" min="1" defaultValue="100" />
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Калории</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dailyNutrition?.calories || 0} / {caloriesLimit}
            </div>
            <Progress value={caloriesPercent} className="mt-2 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Белки</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dailyNutrition?.protein || 0} / {proteinLimit}г
            </div>
            <Progress value={proteinPercent} className="mt-2 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Жиры</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dailyNutrition?.fat || 0} / {fatLimit}г
            </div>
            <Progress value={fatPercent} className="mt-2 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Углеводы</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dailyNutrition?.carbs || 0} / {carbsLimit}г
            </div>
            <Progress value={carbsPercent} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Дневник питания</CardTitle>
          <CardDescription>{format(today, 'dd MMMM yyyy', { locale: ru })}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Tabs value={selectedMeal} onValueChange={(v) => setSelectedMeal(v as any)}>
            <TabsList className="grid grid-cols-4 gap-2">
              <TabsTrigger value="breakfast">Завтрак</TabsTrigger>
              <TabsTrigger value="lunch">Обед</TabsTrigger>
              <TabsTrigger value="dinner">Ужин</TabsTrigger>
              <TabsTrigger value="snack">Перекус</TabsTrigger>
            </TabsList>
            <TabsContent value={selectedMeal} className="mt-4">
              {mealLogs.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Utensils className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p>Нет записей за сегодня</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {mealLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">{log.meal_name || 'Продукт'}</p>
                        <p className="text-sm text-muted-foreground">
                          {log.quantity}г • {log.calories} ккал
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Б: {log.protein}г | Ж: {log.fat}г | У: {log.carbs}г
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
