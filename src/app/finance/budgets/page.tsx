'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
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
  useBudgets,
  useCategories,
  useCreateBudget,
  useTransactions,
} from '@/modules/finance/hooks';
import { Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { toast } from 'sonner';

export default function BudgetsPage() {
  const { data: budgets = [] } = useBudgets();
  const { data: categories = [] } = useCategories();
  const { data: transactions = [] } = useTransactions();
  const createBudget = useCreateBudget();

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    createBudget.mutate(
      {
        category_id: formData.get('category_id') as string,
        amount: Number(formData.get('amount')),
        currency: 'RUB',
        period: formData.get('period') as 'month' | 'week' | 'year',
        start_date: Date.now(),
        user_id: 'current-user',
      },
      {
        onSuccess: () => {
          toast.success('Бюджет создан');
          setDialogOpen(false);
        },
        onError: () => {
          toast.error('Ошибка при создании бюджета');
        },
      }
    );
  };

  // Подсчёт расходов по категориям за текущий месяц
  const getCurrentMonthExpenses = (categoryId: string) => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).getTime();

    return transactions
      .filter(
        (t) =>
          t.category_id === categoryId &&
          t.type === 'expense' &&
          t.date >= monthStart &&
          t.date <= monthEnd
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button style={{ height: '32px' }}>
              <Plus className="mr-2 h-4 w-4" />
              Создать бюджет
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Новый бюджет</DialogTitle>
                <DialogDescription>Установите лимит расходов на категорию</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="category_id">Категория</Label>
                  <select
                    name="category_id"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Выберите категорию</option>
                    {expenseCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Лимит (₽)</Label>
                  <Input name="amount" type="number" step="0.01" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="period">Период</Label>
                  <select
                    name="period"
                    defaultValue="month"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="week">Неделя</option>
                    <option value="month">Месяц</option>
                    <option value="year">Год</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Отмена
                </Button>
                <Button type="submit">Создать</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {budgets.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center text-muted-foreground">
              У вас пока нет бюджетов. Создайте первый!
            </CardContent>
          </Card>
        ) : (
          budgets.map((budget) => {
            const category = categories.find((c) => c.id === budget.category_id);
            const spent = getCurrentMonthExpenses(budget.category_id);
            const percentage = Math.min(100, Math.round((spent / budget.amount) * 100));
            const remaining = budget.amount - spent;
            const isOverBudget = spent > budget.amount;

            return (
              <Card key={budget.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{category?.name || 'Категория'}</CardTitle>
                      <CardDescription>
                        Лимит: {budget.amount.toLocaleString()} ₽ / {budget.period === 'month' ? 'месяц' : budget.period === 'week' ? 'неделя' : 'год'}
                      </CardDescription>
                    </div>
                    <Badge variant={isOverBudget ? 'destructive' : 'secondary'}>
                      {isOverBudget ? (
                        <AlertCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                      )}
                      {percentage}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Progress value={percentage} className="h-2" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Потрачено: {spent.toLocaleString()} ₽
                      </span>
                      <span className={isOverBudget ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                        {isOverBudget ? 'Превышен!' : `Остаток: ${remaining.toLocaleString()} ₽`}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Общая статистика */}
      <Card>
        <CardHeader>
          <CardTitle>Статистика за месяц</CardTitle>
          <CardDescription>{format(new Date(), 'LLLL yyyy', { locale: ru })}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Всего бюджетов</p>
              <p className="text-2xl font-bold">{budgets.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Общий лимит</p>
              <p className="text-2xl font-bold">
                {budgets.reduce((sum, b) => sum + b.amount, 0).toLocaleString()} ₽
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">В пределах бюджета</p>
              <p className="text-2xl font-bold">
                {budgets.filter((b) => getCurrentMonthExpenses(b.category_id) <= b.amount).length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
