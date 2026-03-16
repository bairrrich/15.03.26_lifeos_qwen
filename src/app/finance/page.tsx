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
  useUpdateTransaction,
  useDeleteTransaction,
} from '@/modules/finance/hooks';
import type { Transaction } from '@/modules/finance/entities';
import { Plus, ArrowUpRight, ArrowDownRight, Trash2, Wallet, Tags, PieChart, Repeat, Download, TrendingUp, BarChart3, Paperclip, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { initializeFinanceCategories } from '@/modules/finance/data/seed-init';
import { getCurrentUserId } from '@/shared/hooks/use-user-id';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

function ColoredTabsTrigger({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <TabsTrigger
      value={value}
      className="transition-all duration-200"
      data-tab-type={value}
    >
      {children}
    </TabsTrigger>
  );
}

export default function FinancePage() {
  const { data: transactions = [] } = useTransactions();
  const { data: categories = [] } = useCategories();
  const { data: accounts = [] } = useAccounts();
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();

  // Инициализация seed-категорий (только один раз)
  useEffect(() => {
    const hasInitialized = sessionStorage.getItem('finance_categories_init');
    if (categories.length === 0 && !hasInitialized) {
      sessionStorage.setItem('finance_categories_init', 'true');
      initializeFinanceCategories();
    }
  }, []); // Пустой массив зависимостей - запускается только один раз при монтировании

  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedType, setSelectedType] = useState<'income' | 'expense' | 'transfer'>('expense');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deleteTransactionId, setDeleteTransactionId] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  // Автозаполнение полей при редактировании
  useEffect(() => {
    if (editingTransaction) {
      setSelectedType(editingTransaction.type as 'income' | 'expense' | 'transfer');
      setSelectedAccountId(editingTransaction.account_id as string || '');
    } else {
      // Сбрасываем тип на расход при открытии новой транзакции
      setSelectedType('expense');
      setSelectedAccountId('');
    }
  }, [editingTransaction]);

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setDialogOpen(true);
  };

  const handleDelete = (transactionId: string) => {
    setDeleteTransactionId(transactionId);
  };

  const confirmDelete = () => {
    if (deleteTransactionId) {
      deleteTransaction.mutate(deleteTransactionId, {
        onSuccess: () => {
          toast.success('Транзакция удалена');
        },
        onError: () => {
          toast.error('Ошибка при удалении транзакции');
        },
      });
      setDeleteTransactionId(null);
    }
  };

  // Получаем валюту выбранного счёта для отображения в форме
  const selectedAccountForCurrency = accounts.find(a => a.id === selectedAccountId);
  const accountCurrency = selectedAccountForCurrency?.currency || 'RUB';

  const filteredTransactions = transactions.filter((t) => {
    // Фильтр по типу
    if (filter !== 'all' && t.type !== filter) return false;

    // Поиск по описанию и мерчанту
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesDescription = t.description.toLowerCase().includes(query);
      const matchesMerchant = t.merchant?.toLowerCase().includes(query);
      if (!matchesDescription && !matchesMerchant) return false;
    }

    // Фильтр по категории
    if (selectedCategory !== 'all' && t.category_id !== selectedCategory) return false;

    // Фильтр по счёту
    if (selectedAccount !== 'all' && t.account_id !== selectedAccount) return false;

    // Фильтр по датам
    if (dateFrom && t.date < new Date(dateFrom).getTime()) return false;
    if (dateTo && t.date > new Date(dateTo).getTime()) return false;

    return true;
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const userId = getCurrentUserId();
    const accountId = formData.get('account_id') as string;
    const account = accounts.find(a => a.id === accountId);

    const transactionData = {
      account_id: accountId,
      amount: Number(formData.get('amount')),
      currency: account?.currency || 'RUB',
      category_id: selectedType !== 'transfer' ? (formData.get('category_id') as string) : undefined,
      type: selectedType,
      description: selectedType === 'transfer' ? 'Перевод между счетами' : (formData.get('description') as string),
      date: Date.now(),
      merchant: (formData.get('merchant') as string) || undefined,
      transfer_to_account_id: selectedType === 'transfer' ? (formData.get('transfer_to_account_id') as string) : undefined,
      receipt_url: (formData.get('receipt_url') as string) || undefined,
      user_id: userId,
    };

    if (editingTransaction) {
      updateTransaction.mutate(
        { id: editingTransaction.id, data: transactionData },
        {
          onSuccess: () => {
            toast.success('Транзакция обновлена');
            setDialogOpen(false);
            setEditingTransaction(null);
          },
          onError: () => {
            toast.error('Ошибка при обновлении транзакции');
          },
        }
      );
    } else {
      createTransaction.mutate(
        transactionData,
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
    }
  };

  const handleExportCSV = () => {
    const headers = ['Дата', 'Тип', 'Описание', 'Мерчант', 'Категория', 'Сумма', 'Валюта', 'Чек'];
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
        t.receipt_url || '',
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

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-wrap gap-2 justify-end">
        <Button variant="outline" size="sm" style={{ height: '32px' }} onClick={() => window.location.href = '/finance/categories'}>
          <Tags className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Категории</span>
        </Button>
        <Button variant="outline" size="sm" style={{ height: '32px' }} onClick={() => window.location.href = '/finance/analytics'}>
          <BarChart3 className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Аналитика</span>
        </Button>
        <Button variant="outline" size="sm" style={{ height: '32px' }} onClick={() => window.location.href = '/finance/accounts'}>
          <Wallet className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Счета</span>
        </Button>
        <Button variant="outline" size="sm" style={{ height: '32px' }} onClick={() => window.location.href = '/finance/budgets'}>
          <PieChart className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Бюджеты</span>
        </Button>
        <Button variant="outline" size="sm" style={{ height: '32px' }} onClick={() => window.location.href = '/finance/subscriptions'}>
          <Repeat className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Подписки</span>
        </Button>
        <Button variant="outline" size="sm" style={{ height: '32px' }} onClick={() => window.location.href = '/finance/investments'}>
          <TrendingUp className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Инвестиции</span>
        </Button>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingTransaction(null); }}>
          <DialogTrigger asChild>
            <Button size="sm" style={{ height: '32px' }} onClick={() => setEditingTransaction(null)}>
              <Plus className="h-4 w-4 mr-2" />
              <span>Транзакцию</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingTransaction ? 'Редактировать транзакцию' : 'Новая транзакция'}</DialogTitle>
                <DialogDescription>
                  {editingTransaction ? 'Внесите изменения в транзакцию' : 'Добавьте новую транзакцию в систему'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Тип транзакции</Label>
                  <Tabs value={selectedType} onValueChange={(v) => setSelectedType(v as 'income' | 'expense' | 'transfer')}>
                    <TabsList className="grid w-full grid-cols-3 bg-muted/50">
                      <ColoredTabsTrigger value="income">
                        <ArrowUpRight className="h-4 w-4 mr-2" />
                        Доход
                      </ColoredTabsTrigger>
                      <ColoredTabsTrigger value="expense">
                        <ArrowDownRight className="h-4 w-4 mr-2" />
                        Расход
                      </ColoredTabsTrigger>
                      <ColoredTabsTrigger value="transfer">
                        <Repeat className="h-4 w-4 mr-2" />
                        Перевод
                      </ColoredTabsTrigger>
                    </TabsList>
                  </Tabs>
                  <style>{`
                    [data-slot="tabs-trigger"][data-tab-type="income"][data-active] {
                      background-color: rgb(22 163 74) !important;
                      color: white !important;
                      border-color: rgb(22 163 74) !important;
                    }
                    [data-slot="tabs-trigger"][data-tab-type="expense"][data-active] {
                      background-color: rgb(220 38 38) !important;
                      color: white !important;
                      border-color: rgb(220 38 38) !important;
                    }
                    [data-slot="tabs-trigger"][data-tab-type="transfer"][data-active] {
                      background-color: rgb(37 99 235) !important;
                      color: white !important;
                      border-color: rgb(37 99 235) !important;
                    }
                  `}</style>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Сумма</Label>
                  <div className="relative">
                    <Input
                      name="amount"
                      type="number"
                      step="0.01"
                      defaultValue={editingTransaction?.amount}
                      required
                      className="pr-12 text-center text-lg font-semibold"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                      {accountCurrency}
                    </span>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="account_id">
                    {selectedType === 'income' ? 'Счёт пополнения' : 'Счёт списания'}
                  </Label>
                  <select
                    name="account_id"
                    defaultValue={editingTransaction?.account_id}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
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

                {selectedType === 'transfer' ? (
                  <div className="grid gap-2">
                    <Label htmlFor="transfer_to_account_id">Счёт зачисления</Label>
                    <select
                      name="transfer_to_account_id"
                      defaultValue={editingTransaction?.transfer_to_account_id}
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
                ) : (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="category_id">Категория</Label>
                      <select
                        name="category_id"
                        defaultValue={editingTransaction?.category_id}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required={selectedType !== ('transfer' as 'income' | 'expense' | 'transfer')}
                      >
                        <option value="">Выберите категорию</option>
                        {categories
                          .filter((c) => !c.parent_id && c.type === selectedType)
                          .map((rootCategory) => {
                            const children = categories.filter(
                              (c) => c.parent_id === rootCategory.id && c.type === selectedType
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
                      <Label htmlFor="description">Описание</Label>
                      <Input name="description" defaultValue={editingTransaction?.description} placeholder="Например: Продукты" required={selectedType !== ('transfer' as 'income' | 'expense' | 'transfer')} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="merchant">Мерчант (опционально)</Label>
                      <Input name="merchant" defaultValue={editingTransaction?.merchant} placeholder="Например: Пятёрочка" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="receipt_url">Чек (URL или ссылка на фото)</Label>
                      <Input name="receipt_url" type="url" defaultValue={editingTransaction?.receipt_url} placeholder="https://..." />
                      <p className="text-xs text-muted-foreground">
                        Ссылка на фото чека или скан (Google Drive, Dropbox и т.д.)
                      </p>
                    </div>
                  </>
                )}
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

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle>Транзакции</CardTitle>
              <CardDescription>История всех ваших операций</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              Экспорт CSV
            </Button>
          </div>

          {/* Filters */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* Search */}
            <div className="lg:col-span-2">
              <Input
                placeholder="Поиск по описанию..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Category */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">Все категории</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Account */}
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">Все счета</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>

            {/* Date Range */}
            <div className="flex gap-2">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="От"
                className="flex-1"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="До"
                className="flex-1"
              />
            </div>
          </div>

          {/* Type Filter Buttons */}
          <div className="mt-4 flex gap-2">
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
            {(searchQuery || selectedCategory !== 'all' || selectedAccount !== 'all' || dateFrom || dateTo) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedAccount('all');
                  setDateFrom('');
                  setDateTo('');
                }}
              >
                Сбросить фильтры
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
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
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{transaction.description}</div>
                            {transaction.receipt_url && (
                              <a
                                href={transaction.receipt_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary"
                                title="Открыть чек"
                              >
                                <Paperclip className="h-4 w-4" />
                              </a>
                            )}
                          </div>
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
                        <div className="flex items-center gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(transaction)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(transaction.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Диалог подтверждения удаления транзакции */}
      <AlertDialog open={!!deleteTransactionId} onOpenChange={() => setDeleteTransactionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удаление транзакции</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить эту транзакцию? Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
