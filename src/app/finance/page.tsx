'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  useTransactions,
  useCategories,
  useAccounts,
  useCreateTransaction,
  useCreateAccount,
  useCreateCategory,
} from '@/modules/finance/hooks';
import { Plus, ArrowUpRight, ArrowDownRight, Trash2, Wallet, Tags, PieChart, Repeat, Download, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function FinancePage() {
  const { data: transactions = [] } = useTransactions();
  const { data: categories = [] } = useCategories();
  const { data: accounts = [] } = useAccounts();
  const createTransaction = useCreateTransaction();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedType, setSelectedType] = useState<'income' | 'expense'>('expense');

  const filteredTransactions = transactions.filter((t) => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    createTransaction.mutate(
      {
        account_id: formData.get('account_id') as string,
        amount: Number(formData.get('amount')),
        currency: 'USD',
        category_id: formData.get('category_id') as string,
        type: formData.get('type') as 'income' | 'expense',
        description: formData.get('description') as string,
        date: Date.now(),
        merchant: (formData.get('merchant') as string) || undefined,
        user_id: 'current-user',
      },
      {
        onSuccess: () => {
          toast.success('Транзакция добавлена');
          setDialogOpen(false);
        },
        onError: () => {
          toast.error('Ошибка при добавлении транзакции');
        },
      }
    );
  };

  const handleExportCSV = () => {
    const headers = ['Дата', 'Тип', 'Описание', 'Мерчант', 'Категория', 'Сумма', 'Валюта'];
    const rows = filteredTransactions.map((t) => {
      const category = categories.find((c) => c.id === t.category_id);
      return [
        format(t.date, 'yyyy-MM-dd'),
        t.type === 'income' ? 'Доход' : 'Расход',
        t.description,
        t.merchant || '',
        category?.name || '',
        t.amount.toFixed(2),
        t.currency,
      ];
    });

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Экспорт выполнен');
  };

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Данные для графика расходов по категориям
  const expensesByCategory = categories
    .filter((c) => c.type === 'expense')
    .map((category) => ({
      name: category.name,
      value: transactions
        .filter((t) => t.category_id === category.id && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0),
      color: category.color || '#6366f1',
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Финансы</h1>
          <p className="text-muted-foreground">Управляйте своими финансами</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/finance/accounts'}>
            <Wallet className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Счета</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/finance/budgets'}>
            <PieChart className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Бюджеты</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/finance/subscriptions'}>
            <Repeat className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Подписки</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/finance/investments'}>
            <TrendingUp className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Инвестиции</span>
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Транзакцию</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Новая транзакция</DialogTitle>
                  <DialogDescription>Добавьте новую транзакцию в систему</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="type">Тип</Label>
                    <select
                      name="type"
                      value={selectedType}
                      onChange={(e) => {
                        if (e.target.value) setSelectedType(e.target.value as 'income' | 'expense');
                      }}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Выберите тип</option>
                      <option value="expense">Расход</option>
                      <option value="income">Доход</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Сумма</Label>
                    <Input name="amount" type="number" step="0.01" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="account_id">Счёт</Label>
                    <select
                      name="account_id"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                    >
                      <option value="">Выберите категорию</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Описание</Label>
                    <Input name="description" placeholder="Например: Продукты" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="merchant">Мерчант (опционально)</Label>
                    <Input name="merchant" placeholder="Например: Пятёрочка" />
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

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Доходы</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{totalIncome.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Расходы</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-{totalExpenses.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Баланс</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalIncome - totalExpenses).toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* График расходов по категориям */}
      {expensesByCategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Расходы по категориям</CardTitle>
            <CardDescription>Текущий месяц</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expensesByCategory} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="#9CA3AF" fontSize={12} width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                    formatter={(value) => [`${Number(value).toLocaleString()} ₽`, 'Расходы']}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Транзакции</CardTitle>
              <CardDescription>История всех ваших операций</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              Экспорт CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Все
            </Button>
            <Button
              variant={filter === 'income' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('income')}
            >
              Доходы
            </Button>
            <Button
              variant={filter === 'expense' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('expense')}
            >
              Расходы
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>Описание</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead className="text-right">Сумма</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Нет транзакций
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => {
                  const category = categories.find((c) => c.id === transaction.category_id);
                  return (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {format(transaction.date, 'dd MMM yyyy', { locale: ru })}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.description}</div>
                          {transaction.merchant && (
                            <div className="text-xs text-muted-foreground">
                              {transaction.merchant}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor: `${category?.color || '#e5e7eb'}20`,
                            color: category?.color || '#6b7280',
                          }}
                        >
                          {category?.name || 'Без категории'}
                        </span>
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {transaction.amount.toFixed(2)} {transaction.currency}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            // TODO: implement delete
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
