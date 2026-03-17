'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
  useSubscriptions,
  useCreateSubscription,
  useAccounts,
  useCategories,
  useProcessSubscriptionPayments,
  useSubscriptionPaymentHistory,
} from '@/modules/finance/hooks';
import { getCurrentUserId } from '@/shared/hooks/use-user-id';
import { Plus, Calendar, DollarSign, Link as LinkIcon, Trash2, History, Bell, CreditCard } from 'lucide-react';
import { format, addMonths, addWeeks, addYears } from 'date-fns';
import { ru } from 'date-fns/locale';
import { toast } from 'sonner';
import { EmptyState } from '@/components/ui/empty-state';

export default function SubscriptionsPage() {
  const { data: subscriptions = [] } = useSubscriptions();
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const createSubscription = useCreateSubscription();
  const processPayments = useProcessSubscriptionPayments();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<string | null>(null);

  // Автоматическая обработка подписок при загрузке
  useEffect(() => {
    if (subscriptions.length > 0) {
      processPayments.mutate(undefined, {
        onSuccess: ({ created }) => {
          if (created > 0) {
            toast.success(`Создано ${created} транзакций для подписок`);
          }
        },
      });
    }
  }, [subscriptions.length]);

  // Уведомления о предстоящих платежах
  useEffect(() => {
    if (subscriptions.length > 0) {
      import('@/modules/finance/services').then((m) => {
        m.getUpcomingPayments(7).then((upcoming) => {
          if (upcoming.length > 0) {
            upcoming.forEach((sub) => {
              const daysUntil = Math.ceil(
                (sub.next_billing_date - Date.now()) / (1000 * 60 * 60 * 24)
              );
              if (daysUntil === 1) {
                toast.warning(`Завтра платеж: ${sub.name} (${sub.amount} ₽)`);
              } else if (daysUntil === 0) {
                toast.warning(`Сегодня платеж: ${sub.name} (${sub.amount} ₽)`);
              }
            });
          }
        });
      });
    }
  }, [subscriptions.length]);

  const { data: paymentHistory = [] } = useSubscriptionPaymentHistory(selectedSubscription || undefined);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const period = formData.get('billing_period') as 'monthly' | 'yearly' | 'weekly';
    let nextBillingDate = new Date();

    if (period === 'monthly') {
      nextBillingDate = addMonths(nextBillingDate, 1);
    } else if (period === 'weekly') {
      nextBillingDate = addWeeks(nextBillingDate, 1);
    } else {
      nextBillingDate = addYears(nextBillingDate, 1);
    }
    const userId = getCurrentUserId();

    createSubscription.mutate(
      {
        name: formData.get('name') as string,
        amount: Number(formData.get('amount')),
        currency: 'RUB',
        billing_period: period,
        next_billing_date: nextBillingDate.getTime(),
        account_id: formData.get('account_id') as string,
        category_id: formData.get('category_id') as string,
        description: (formData.get('description') as string) || undefined,
        url: (formData.get('url') as string) || undefined,
        user_id: userId,
      },
      {
        onSuccess: () => {
          toast.success('Подписка добавлена');
          setDialogOpen(false);
        },
        onError: () => {
          toast.error('Ошибка при добавлении подписки');
        },
      }
    );
  };

  const filteredSubscriptions = showActiveOnly
    ? subscriptions.filter((s) => new Date(s.next_billing_date) > new Date())
    : subscriptions;

  const monthlyTotal = subscriptions.reduce((total, sub) => {
    const amount = sub.amount;
    if (sub.billing_period === 'weekly') return total + amount * 4;
    if (sub.billing_period === 'yearly') return total + amount / 12;
    return total + amount;
  }, 0);

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'weekly': return 'в неделю';
      case 'monthly': return 'в месяц';
      case 'yearly': return 'в год';
      default: return '';
    }
  };

  const getNextBillingLabel = (nextBillingDate: number) => {
    const date = new Date(nextBillingDate);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Просрочено';
    if (diffDays === 0) return 'Сегодня';
    if (diffDays === 1) return 'Завтра';
    if (diffDays <= 7) return `Через ${diffDays} дн.`;
    return format(date, 'dd MMM', { locale: ru });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          style={{ height: '32px' }}
          onClick={() => {
            processPayments.mutate(undefined, {
              onSuccess: ({ created }) => {
                toast.success(`Создано ${created} транзакций`);
              },
            });
          }}
        >
          <Bell className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Проверить платежи</span>
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="active-only"
              checked={showActiveOnly}
              onCheckedChange={setShowActiveOnly}
            />
            <Label htmlFor="active-only">Только активные</Label>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button style={{ height: '32px' }}>
                <Plus className="mr-2 h-4 w-4" />
                <span>Добавить</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Новая подписка</DialogTitle>
                  <DialogDescription>Добавьте периодический платёж</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Название</Label>
                    <Input name="name" placeholder="Например: Netflix" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Описание (опционально)</Label>
                    <Input name="description" placeholder="Например: Стриминг фильмов" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="amount">Сумма</Label>
                      <Input name="amount" type="number" step="0.01" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="billing_period">Период</Label>
                      <select
                        name="billing_period"
                        defaultValue="monthly"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="weekly">Еженедельно</option>
                        <option value="monthly">Ежемесячно</option>
                        <option value="yearly">Ежегодно</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="account_id">Счёт списания</Label>
                      <select
                        name="account_id"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                      >
                        <option value="">Выберите счёт</option>
                        {accounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.name} ({account.balance} {account.currency})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category_id">Категория</Label>
                      <select
                        name="category_id"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                      >
                        <option value="">Выберите категорию</option>
                        {categories
                          .filter((c) => !c.parent_id && c.type === 'expense')
                          .map((rootCategory) => {
                            const children = categories.filter(
                              (c) => c.parent_id === rootCategory.id && c.type === 'expense'
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
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="url">Ссылка (опционально)</Label>
                    <Input name="url" type="url" placeholder="https://..." />
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
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего подписок</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">В месяц</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyTotal.toLocaleString()} ₽</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">В год</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(monthlyTotal * 12).toLocaleString()} ₽</div>
          </CardContent>
        </Card>
      </div>

      {/* Subscriptions List */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredSubscriptions.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="Нет подписок"
            description="Добавьте свои подписки для отслеживания расходов"
            actionLabel="Добавить подписку"
            onAction={() => setDialogOpen(true)}
          />
        ) : (
          filteredSubscriptions.map((sub) => {
            const nextBilling = getNextBillingLabel(sub.next_billing_date);
            const isOverdue = new Date(sub.next_billing_date) < new Date();

            return (
              <Card key={sub.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        {sub.url ? (
                          <LinkIcon className="h-5 w-5 text-primary" />
                        ) : (
                          <Calendar className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-base">{sub.name}</CardTitle>
                        <CardDescription>
                          {sub.amount.toLocaleString()} ₽ / {getPeriodLabel(sub.billing_period)}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={isOverdue ? 'destructive' : 'outline'}>
                      {nextBilling}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between gap-2">
                    {sub.url && (
                      <a
                        href={sub.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline truncate"
                      >
                        🔗 Сайт
                      </a>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-auto"
                      onClick={() => setSelectedSubscription(sub.id)}
                    >
                      <History className="h-4 w-4 mr-2" />
                      История
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Payment History Dialog */}
      <Dialog open={!!selectedSubscription} onOpenChange={() => setSelectedSubscription(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>История платежей</DialogTitle>
            <DialogDescription>
              {subscriptions.find((s) => s.id === selectedSubscription)?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {paymentHistory.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                История платежей пуста
              </p>
            ) : (
              paymentHistory.map((transaction) => (
                <div
                  key={(transaction.id as string)}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{transaction.description as string}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(transaction.date as number, 'dd MMM yyyy', { locale: ru })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">-{transaction.amount as number} ₽</p>
                    <p className="text-xs text-muted-foreground">{transaction.currency as string}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
