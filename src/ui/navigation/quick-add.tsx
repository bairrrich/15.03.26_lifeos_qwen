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
  const { setQuickAddOpen } = useAppStore();

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

          <Tabs defaultValue="finance">
            <TabsList className="grid grid-cols-6 gap-2 mb-6">
              <TabsTrigger value="finance" className="flex items-center justify-center gap-2">
                <DollarSign className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm truncate">Финансы</span>
              </TabsTrigger>
              <TabsTrigger value="habit" className="flex items-center justify-center gap-2">
                <Target className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm truncate">Привычка</span>
              </TabsTrigger>
              <TabsTrigger value="food" className="flex items-center justify-center gap-2">
                <Utensils className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm truncate">Питание</span>
              </TabsTrigger>
              <TabsTrigger value="workout" className="flex items-center justify-center gap-2">
                <Dumbbell className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm truncate">Тренировка</span>
              </TabsTrigger>
              <TabsTrigger value="book" className="flex items-center justify-center gap-2">
                <BookOpen className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm truncate">Книга</span>
              </TabsTrigger>
              <TabsTrigger value="goal" className="flex items-center justify-center gap-2">
                <Target className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm truncate">Цель</span>
              </TabsTrigger>
            </TabsList>

            {/* Finance */}
            <TabsContent value="finance" className="space-y-4">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Тип</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="expense">Расход</option>
                    <option value="income">Доход</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label>Сумма</Label>
                  <Input type="number" placeholder="0.00" />
                </div>
                <div className="grid gap-2">
                  <Label>Описание</Label>
                  <Input placeholder="Например: Продукты" />
                </div>
                <Button onClick={() => handleAdd('Транзакция')} className="w-full">
                  Добавить транзакцию
                </Button>
              </div>
            </TabsContent>

            {/* Habit */}
            <TabsContent value="habit" className="space-y-4">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Название</Label>
                  <Input placeholder="Например: Чтение книг" />
                </div>
                <div className="grid gap-2">
                  <Label>Частота</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
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
            <TabsContent value="food" className="space-y-4">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Название</Label>
                  <Input placeholder="Например: Яблоко" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Ккал</Label>
                    <Input type="number" placeholder="0" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Белки (г)</Label>
                    <Input type="number" placeholder="0" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Жиры (г)</Label>
                    <Input type="number" placeholder="0" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Углеводы (г)</Label>
                    <Input type="number" placeholder="0" />
                  </div>
                </div>
                <Button onClick={() => handleAdd('Продукт')} className="w-full">
                  Добавить продукт
                </Button>
              </div>
            </TabsContent>

            {/* Workout */}
            <TabsContent value="workout" className="space-y-4">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Название</Label>
                  <Input placeholder="Например: День ног" />
                </div>
                <div className="grid gap-2">
                  <Label>Длительность (мин)</Label>
                  <Input type="number" placeholder="60" />
                </div>
                <Button onClick={() => handleAdd('Тренировка')} className="w-full">
                  Завершить тренировку
                </Button>
              </div>
            </TabsContent>

            {/* Book */}
            <TabsContent value="book" className="space-y-4">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Название</Label>
                  <Input placeholder="Например: Атомные привычки" />
                </div>
                <div className="grid gap-2">
                  <Label>Автор</Label>
                  <Input placeholder="Джеймс Клир" />
                </div>
                <Button onClick={() => handleAdd('Книга')} className="w-full">
                  Добавить книгу
                </Button>
              </div>
            </TabsContent>

            {/* Goal */}
            <TabsContent value="goal" className="space-y-4">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Название</Label>
                  <Input placeholder="Например: Выучить английский" />
                </div>
                <div className="grid gap-2">
                  <Label>Описание</Label>
                  <Input placeholder="Достичь уровня B2" />
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
