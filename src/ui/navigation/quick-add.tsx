'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/shared/hooks/use-app-store';
import { Plus, DollarSign, Target, BookOpen, Utensils, Dumbbell } from 'lucide-react';
import { toast } from 'sonner';

export function QuickAdd() {
  const [open, setOpen] = useState(false);
  const { quickAddOpen, setQuickAddOpen } = useAppStore();

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    setQuickAddOpen(isOpen);
  };

  const handleAdd = (type: string) => {
    toast.success(`${type} добавлен!`);
    handleOpenChange(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          onClick={() => setOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Быстрое добавление</DialogTitle>
            <DialogDescription>
              Выберите тип записи и заполните данные
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="finance" className="mt-6">
            <TabsList className="grid grid-cols-3 gap-2 h-auto">
              <TabsTrigger value="finance" className="flex flex-col gap-1 h-auto py-3">
                <DollarSign className="h-5 w-5" />
                <span className="text-xs">Финансы</span>
              </TabsTrigger>
              <TabsTrigger value="habit" className="flex flex-col gap-1 h-auto py-3">
                <Target className="h-5 w-5" />
                <span className="text-xs">Привычка</span>
              </TabsTrigger>
              <TabsTrigger value="food" className="flex flex-col gap-1 h-auto py-3">
                <Utensils className="h-5 w-5" />
                <span className="text-xs">Питание</span>
              </TabsTrigger>
              <TabsTrigger value="workout" className="flex flex-col gap-1 h-auto py-3">
                <Dumbbell className="h-5 w-5" />
                <span className="text-xs">Тренировка</span>
              </TabsTrigger>
              <TabsTrigger value="book" className="flex flex-col gap-1 h-auto py-3">
                <BookOpen className="h-5 w-5" />
                <span className="text-xs">Книга</span>
              </TabsTrigger>
              <TabsTrigger value="goal" className="flex flex-col gap-1 h-auto py-3">
                <Target className="h-5 w-5" />
                <span className="text-xs">Цель</span>
              </TabsTrigger>
            </TabsList>

            {/* Finance */}
            <TabsContent value="finance" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="fa-type">Тип</Label>
                  <select
                    id="fa-type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="expense">Расход</option>
                    <option value="income">Доход</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fa-amount">Сумма</Label>
                  <Input id="fa-amount" type="number" placeholder="0.00" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fa-description">Описание</Label>
                  <Input id="fa-description" placeholder="Например: Продукты" />
                </div>
                <Button onClick={() => handleAdd('Транзакция')} className="w-full">
                  Добавить транзакцию
                </Button>
              </div>
            </TabsContent>

            {/* Habit */}
            <TabsContent value="habit" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="h-name">Название привычки</Label>
                  <Input id="h-name" placeholder="Например: Чтение книг" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="h-frequency">Частота</Label>
                  <select
                    id="h-frequency"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="daily">Ежедневно</option>
                    <option value="weekly">Еженедельно</option>
                    <option value="monthly">Ежемесячно</option>
                  </select>
                </div>
                <Button onClick={() => handleAdd('Привычка')} className="w-full">
                  Создать привычку
                </Button>
              </div>
            </TabsContent>

            {/* Food */}
            <TabsContent value="food" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="f-name">Название продукта</Label>
                  <Input id="f-name" placeholder="Например: Яблоко" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="f-calories">Ккал</Label>
                    <Input id="f-calories" type="number" placeholder="0" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="f-protein">Белки (г)</Label>
                    <Input id="f-protein" type="number" placeholder="0" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="f-fat">Жиры (г)</Label>
                    <Input id="f-fat" type="number" placeholder="0" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="f-carbs">Углеводы (г)</Label>
                    <Input id="f-carbs" type="number" placeholder="0" />
                  </div>
                </div>
                <Button onClick={() => handleAdd('Продукт')} className="w-full">
                  Добавить продукт
                </Button>
              </div>
            </TabsContent>

            {/* Workout */}
            <TabsContent value="workout" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="w-name">Название тренировки</Label>
                  <Input id="w-name" placeholder="Например: День ног" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="w-duration">Длительность (мин)</Label>
                  <Input id="w-duration" type="number" placeholder="60" />
                </div>
                <Button onClick={() => handleAdd('Тренировка')} className="w-full">
                  Завершить тренировку
                </Button>
              </div>
            </TabsContent>

            {/* Book */}
            <TabsContent value="book" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="b-title">Название книги</Label>
                  <Input id="b-title" placeholder="Например: Атомные привычки" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="b-author">Автор</Label>
                  <Input id="b-author" placeholder="Джеймс Клир" />
                </div>
                <Button onClick={() => handleAdd('Книга')} className="w-full">
                  Добавить книгу
                </Button>
              </div>
            </TabsContent>

            {/* Goal */}
            <TabsContent value="goal" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="g-title">Название цели</Label>
                  <Input id="g-title" placeholder="Например: Выучить английский" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="g-description">Описание</Label>
                  <Input id="g-description" placeholder="Достичь уровня B2" />
                </div>
                <Button onClick={() => handleAdd('Цель')} className="w-full">
                  Создать цель
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
