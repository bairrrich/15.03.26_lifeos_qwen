'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/components/card';
import { Button } from '@/ui/components/button';
import { Input } from '@/ui/components/input';
import { Label } from '@/ui/components/label';
import { Progress } from '@/ui/components/progress';
import { Badge } from '@/ui/components/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/ui/components/dialog';
import {
  useBudgets,
  useCategories,
  useCreateBudget,
  useUpdateBudget,
  useDeleteBudget,
  useTransactions,
} from '@/modules/finance/hooks';
import type { Budget } from '@/modules/finance/entities';
import { getCurrentUserId } from '@/shared/hooks/use-user-id';
import { Plus, AlertCircle, CheckCircle2, Pencil, Trash2, PiggyBank } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { toast } from 'sonner';
import { EmptyState } from '@/ui/components/empty-state';
import { PageTransition } from '@/ui/components/page-transition';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/ui/components/alert-dialog';

export default function BudgetsPage() {
  const { data: budgets = [] } = useBudgets();
  const { data: categories = [] } = useCategories();
  const { data: transactions = [] } = useTransactions();
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const deleteBudget = useDeleteBudget();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [statsPeriod, setStatsPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [deleteBudgetId, setDeleteBudgetId] = useState<string | null>(null);

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setDialogOpen(true);
  };

  const handleDelete = (budgetId: string) => {
    setDeleteBudgetId(budgetId);
  };

  const confirmDelete = () => {
    if (deleteBudgetId) {
      deleteBudget.mutate(deleteBudgetId, {
        onSuccess: () => {
          toast.success('Бюджет удалён');
        },
        onError: () => {
          toast.error('Ошибка при удалении бюджета');
        },
      });
      setDeleteBudgetId(null);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const userId = getCurrentUserId();

    const budgetData = {
      category_id: formData.get('category_id') as string,
      amount: Number(formData.get('amount')),
      currency: 'RUB',
      period: formData.get('period') as 'month' | 'week' | 'year',
      start_date: Date.now(),
      user_id: userId,
    };

    if (editingBudget) {
      updateBudget.mutate(
        { id: editingBudget.id, data: budgetData },
        {
          onSuccess: () => {
            toast.success('Бюджет обновлён');
            setDialogOpen(false);
            setEditingBudget(null);
          },
          onError: () => {
            toast.error('Ошибка при обновлении бюджета');
          },
        }
      );
    } else {
      createBudget.mutate(
        budgetData,
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
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingBudget(null);
  };

  // Получение всех категорий (родительской и всех подкатегорий) для подсчёта расходов
  const getCategoryIdsWithSubcategories = (categoryId: string): string[] => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return [categoryId];

    // Находим все подкатегории этой категории
    const subcategories = categories.filter((c) => c.parent_id === categoryId);

    // Рекурсивно получаем ID всех подкатегорий
    const allSubcategoryIds = subcategories.flatMap((sub) =>
      getCategoryIdsWithSubcategories(sub.id)
    );

    return [categoryId, ...allSubcategoryIds];
  };

  // Подсчёт расходов по категории и всем её подкатегориям за период бюджета
  const getBudgetExpenses = (budget: Budget) => {
    const now = Date.now();
    let periodStart: number;
    let periodEnd: number = now;

    // Получаем все ID категорий (родительская + все подкатегории)
    const categoryIds = getCategoryIdsWithSubcategories(budget.category_id as string);

    // Определяем начало и конец периода
    switch (budget.period) {
      case 'week':
        // Начало текущей недели (понедельник)
        const currentDate = new Date();
        const dayOfWeek = currentDate.getDay(); // 0 = воскресенье
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Корректировка для понедельника
        const monday = new Date(currentDate);
        monday.setDate(currentDate.getDate() + mondayOffset);
        monday.setHours(0, 0, 0, 0);
        periodStart = monday.getTime();
        // Конец недели (воскресенье 23:59:59)
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);
        periodEnd = sunday.getTime();
        break;

      case 'month':
        // С начала текущего месяца до конца
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
        const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999).getTime();
        periodStart = monthStart;
        periodEnd = monthEnd;
        break;

      case 'year':
        // С начала текущего года до конца
        const yearStart = new Date(new Date().getFullYear(), 0, 1).getTime();
        const yearEnd = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59, 999).getTime();
        periodStart = yearStart;
        periodEnd = yearEnd;
        break;

      default:
        // Если период не задан, используем start_date
        periodStart = (budget.start_date as number) || now;
    }

    // Суммируем расходы по всем категориям (родительская + подкатегории)
    return transactions
      .filter(
        (t) =>
          t.category_id && categoryIds.includes(t.category_id) &&
          t.type === 'expense' &&
          t.date >= periodStart &&
          t.date <= periodEnd
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // Подсчёт статистики за выбранный период
  const getStatsForPeriod = (period: 'week' | 'month' | 'year') => {
    let periodStart: number;

    switch (period) {
      case 'week':
        const currentDate = new Date();
        const dayOfWeek = currentDate.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const monday = new Date(currentDate);
        monday.setDate(currentDate.getDate() + mondayOffset);
        monday.setHours(0, 0, 0, 0);
        periodStart = monday.getTime();
        break;
      case 'month':
        periodStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
        break;
      case 'year':
        periodStart = new Date(new Date().getFullYear(), 0, 1).getTime();
        break;
    }

    const budgetsInPeriod = budgets.filter((b: Budget) => b.start_date >= periodStart);
    const totalLimit = budgetsInPeriod.reduce((sum, b) => sum + b.amount, 0);
    const withinBudget = budgetsInPeriod.filter((b) => getBudgetExpenses(b) <= b.amount).length;

    return {
      count: budgetsInPeriod.length,
      totalLimit,
      withinBudget,
    };
  };

  const stats = getStatsForPeriod(statsPeriod);

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Кнопка создания бюджета - в самом верху */}
        <div className="flex flex-wrap gap-2 justify-end">
          <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingBudget(null)}>
                <Plus className="mr-2 h-4 w-4" />
                <span>Создать бюджет</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingBudget ? 'Редактировать бюджет' : 'Новый бюджет'}</DialogTitle>
                  <DialogDescription>
                    {editingBudget ? 'Внесите изменения в бюджет' : 'Установите лимит расходов на категорию'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category_id">Категория</Label>
                    <select
                      name="category_id"
                      defaultValue={editingBudget?.category_id}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      required
                    >
                      <option value="">Выберите категорию</option>
                      {expenseCategories
                        .filter((c) => !c.parent_id)
                        .map((rootCategory) => {
                          const children = expenseCategories.filter(
                            (c) => c.parent_id === rootCategory.id
                          );
                          return [
                            // Родительская категория
                            <option key={rootCategory.id} value={rootCategory.id}>
                              {rootCategory.name}
                            </option>,
                            // Подкатегории с отступом
                            ...children.map((child) => (
                              <option key={child.id} value={child.id}>
                                {'\u00A0\u00A0'}└─ {child.name}
                              </option>
                            ))
                          ];
                        })}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Лимит (₽)</Label>
                    <Input name="amount" type="number" step="0.01" defaultValue={editingBudget?.amount} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="period">Период</Label>
                    <select
                      name="period"
                      defaultValue={editingBudget?.period || 'month'}
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

        {/* Общая статистика */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Статистика</CardTitle>
                <CardDescription>{format(new Date(), 'LLLL yyyy', { locale: ru })}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={statsPeriod === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatsPeriod('week')}
                >
                  Неделя
                </Button>
                <Button
                  variant={statsPeriod === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatsPeriod('month')}
                >
                  Месяц
                </Button>
                <Button
                  variant={statsPeriod === 'year' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatsPeriod('year')}
                >
                  Год
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
              <div className="col-span-1">
                <p className="text-sm text-muted-foreground">Всего бюджетов</p>
                <p className="text-2xl font-bold">{stats.count}</p>
              </div>
              <div className="col-span-1">
                <p className="text-sm text-muted-foreground">В пределах бюджета</p>
                <p className="text-2xl font-bold">{stats.withinBudget}</p>
              </div>
              <div className="col-span-2 md:col-span-1">
                <p className="text-sm text-muted-foreground">Общий лимит</p>
                <p className="text-2xl font-bold">{stats.totalLimit.toLocaleString()} ₽</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Карточки бюджетов */}
        <div className="grid gap-4 md:grid-cols-2">
          {budgets.length === 0 ? (
            <EmptyState
              icon={PiggyBank}
              title="Нет бюджетов"
              description="Создайте свой первый бюджет для контроля расходов"
              actionLabel="Создать бюджет"
              onAction={() => setDialogOpen(true)}
            />
          ) : (
            budgets.map((budget) => {
              const category = categories.find((c) => c.id === budget.category_id);
              const spent = getBudgetExpenses(budget);
              const percentage = Math.round((spent / budget.amount) * 100);
              const remaining = budget.amount - spent;
              const isOverBudget = spent > budget.amount;
              const alertThreshold = budget.alert_threshold || 80;
              const isNearLimit = percentage >= alertThreshold && !isOverBudget;

              return (
                <Card key={budget.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">{category?.name || 'Категория'}</CardTitle>
                        <CardDescription>
                          Лимит: {budget.amount.toLocaleString()} ₽ / {budget.period === 'month' ? 'месяц' : budget.period === 'week' ? 'неделя' : 'год'}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(budget)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(budget.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-end mt-2">
                      <Badge variant={isOverBudget ? 'destructive' : isNearLimit ? 'default' : 'secondary'}>
                        {isOverBudget ? (
                          <AlertCircle className="h-3 w-3 mr-1" />
                        ) : isNearLimit ? (
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
                      <Progress value={percentage} max={Math.max(100, percentage)} className={`h-2 ${isOverBudget ? '[&>div]:bg-red-600' : isNearLimit ? '[&>div]:bg-yellow-600' : ''}`} />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Потрачено: {spent.toLocaleString()} ₽
                        </span>
                        <span className={isOverBudget ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                          {isOverBudget ? 'Превышен!' : `Остаток: ${remaining.toLocaleString()} ₽`}
                        </span>
                      </div>
                      {isNearLimit && (
                        <p className="text-xs text-yellow-600 font-medium">
                          ⚠️ Внимание: израсходовано {percentage}% бюджета
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Диалог подтверждения удаления */}
        <AlertDialog open={!!deleteBudgetId} onOpenChange={() => setDeleteBudgetId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Удаление бюджета</AlertDialogTitle>
              <AlertDialogDescription>
                Вы уверены, что хотите удалить этот бюджет? Это действие нельзя отменить.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>Удалить</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageTransition>
  );
}

