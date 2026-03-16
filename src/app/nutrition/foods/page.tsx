'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  useFoods,
  useCreateFood,
} from '@/modules/nutrition/hooks';
import { Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const categoryLabels: Record<string, string> = {
  protein: 'Белки',
  carbs: 'Углеводы',
  fat: 'Жиры',
  vegetable: 'Овощи',
  fruit: 'Фрукты',
  other: 'Другое',
};

export default function FoodsPage() {
  const { data: foods = [] } = useFoods();
  const createFood = useCreateFood();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    createFood.mutate(
      {
        name: formData.get('name') as string,
        brand: (formData.get('brand') as string) || undefined,
        calories: Number(formData.get('calories')),
        protein: Number(formData.get('protein')),
        fat: Number(formData.get('fat')),
        carbs: Number(formData.get('carbs')),
        serving_size: Number(formData.get('serving_size')) || 100,
        serving_unit: formData.get('serving_unit') as string || 'г',
        category: formData.get('category') as any || 'other',
        user_id: 'current-user',
      },
      {
        onSuccess: () => {
          toast.success('Продукт добавлен');
          setDialogOpen(false);
        },
        onError: () => {
          toast.error('Ошибка при добавлении продукта');
        },
      }
    );
  };

  const filteredFoods = foods.filter((food) =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Продукты</h1>
          <p className="text-muted-foreground">База продуктов для расчёта КБЖУ</p>
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
                <DialogTitle>Новый продукт</DialogTitle>
                <DialogDescription>Добавьте продукт в базу</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Название</Label>
                  <Input name="name" placeholder="Например: Яблоко" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="brand">Бренд (опционально)</Label>
                  <Input name="brand" placeholder="Например: Darling" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="calories">Ккал (на 100г)</Label>
                    <Input name="calories" type="number" step="0.1" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="protein">Белки (г)</Label>
                    <Input name="protein" type="number" step="0.1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fat">Жиры (г)</Label>
                    <Input name="fat" type="number" step="0.1" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="carbs">Углеводы (г)</Label>
                    <Input name="carbs" type="number" step="0.1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="serving_size">Размер порции</Label>
                    <Input name="serving_size" type="number" step="1" defaultValue="100" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="serving_unit">Ед. измерения</Label>
                    <select
                      name="serving_unit"
                      defaultValue="г"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="г">грамм</option>
                      <option value="мл">мл</option>
                      <option value="шт">шт</option>
                    </select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Категория</Label>
                  <select
                    name="category"
                    defaultValue="other"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="protein">Белки</option>
                    <option value="carbs">Углеводы</option>
                    <option value="fat">Жиры</option>
                    <option value="vegetable">Овощи</option>
                    <option value="fruit">Фрукты</option>
                    <option value="other">Другое</option>
                  </select>
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

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск продуктов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredFoods.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center text-muted-foreground">
              {searchQuery ? 'Продукты не найдены' : 'У вас пока нет продуктов'}
            </CardContent>
          </Card>
        ) : (
          filteredFoods.map((food) => (
            <Card key={food.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{food.name}</CardTitle>
                    {food.brand && (
                      <CardDescription className="text-xs">{food.brand}</CardDescription>
                    )}
                  </div>
                  <Badge variant="outline">{categoryLabels[food.category || 'other']}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Ккал:</span>
                    <span className="font-medium">{food.calories}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Б/Ж/У:</span>
                    <span className="font-medium">
                      {food.protein}/{food.fat}/{food.carbs}г
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Порция:</span>
                    <span className="font-medium">
                      {food.serving_size}{food.serving_unit}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="mt-2">
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
