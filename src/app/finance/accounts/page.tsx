'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  useAccounts,
  useCreateAccount,
  useUpdateAccount,
  useDeleteAccount,
} from '@/modules/finance/hooks';
import type { Account } from '@/modules/finance/entities';
import { Plus, Wallet, CreditCard, DollarSign, TrendingUp, Bitcoin, PiggyBank, Archive, Edit, Trash2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { initializeFinanceAccounts, resetFinanceAccounts } from '@/modules/finance/data/accounts-seed-init';
import { getCurrentUserId } from '@/shared/hooks/use-user-id';
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

const typeIcons: Record<string, React.ElementType> = {
  cash: Wallet,
  bank: DollarSign,
  card: CreditCard,
  investment: TrendingUp,
  crypto: Bitcoin,
  savings: PiggyBank,
  other: Wallet,
};

const typeLabels: Record<string, string> = {
  cash: 'Наличные',
  bank: 'Банковский счёт',
  card: 'Карта',
  investment: 'Инвестиции',
  crypto: 'Криптовалюта',
  savings: 'Вклад',
  other: 'Другое',
};

export default function AccountsPage() {
  const { data: accounts = [], isLoading } = useAccounts();
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();
  const deleteAccount = useDeleteAccount();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<{ id: string; name: string; balance: number; type: string; currency?: string } | null>(null);
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
  const [deleteAccountName, setDeleteAccountName] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Инициализация счетов по умолчанию
  useEffect(() => {
    if (!isLoading && accounts.length === 0) {
      initializeFinanceAccounts();
    }
  }, [isLoading, accounts.length]);

  const handleResetAccounts = () => {
    setShowResetConfirm(true);
  };

  const confirmResetAccounts = async () => {
    await resetFinanceAccounts();
    toast.success('Счета сброшены и пересозданы');
    setShowResetConfirm(false);
    window.location.reload();
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteAccountId(id);
    setDeleteAccountName(name);
  };

  const confirmDelete = () => {
    if (deleteAccountId) {
      deleteAccount.mutate(deleteAccountId, {
        onSuccess: () => {
          toast.success('Счёт удалён');
        },
        onError: () => {
          toast.error('Ошибка при удалении счёта');
        },
      });
      setDeleteAccountId(null);
      setDeleteAccountName('');
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const userId = getCurrentUserId();

    const accountData = {
      name: formData.get('name') as string,
      type: formData.get('type') as 'cash' | 'bank' | 'card' | 'investment' | 'crypto' | 'savings' | 'other',
      balance: Number(formData.get('balance')),
      currency: formData.get('currency') as string || 'RUB',
      user_id: userId,
    };

    if (editingAccount) {
      updateAccount.mutate(
        { id: editingAccount.id, data: accountData },
        {
          onSuccess: () => {
            toast.success('Счёт обновлён');
            setDialogOpen(false);
            setEditingAccount(null);
          },
          onError: () => {
            toast.error('Ошибка при обновлении счёта');
          },
        }
      );
    } else {
      createAccount.mutate(accountData, {
        onSuccess: () => {
          toast.success('Счёт создан');
          setDialogOpen(false);
        },
        onError: () => {
          toast.error('Ошибка при создании счёта');
        },
      });
    }
  };

  const handleEdit = (account: Account) => {
    setEditingAccount({
      id: account.id as string,
      name: account.name as string,
      balance: account.balance as number,
      type: account.type as string,
      currency: account.currency as string,
    });
    setDialogOpen(true);
  };

  const handleArchive = (account: Account) => {
    updateAccount.mutate(
      { id: account.id as string, data: { ...account, is_archived: !account.is_archived } },
      {
        onSuccess: () => {
          toast.success(account.is_archived ? 'Счёт активирован' : 'Счёт архивирован');
        },
      }
    );
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const activeAccounts = accounts.filter((a) => !a.is_archived);
  const archivedAccounts = accounts.filter((a) => a.is_archived);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 justify-end">
        <Button variant="destructive" size="sm" style={{ height: '32px' }} onClick={handleResetAccounts}>
          <RotateCcw className="h-4 w-4 mr-2" />
          <span>Сбросить</span>
        </Button>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingAccount(null)} style={{ height: '32px' }}>
              <Plus className="mr-2 h-4 w-4" />
              <span>Добавить счёт</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingAccount ? 'Редактировать счёт' : 'Новый счёт'}</DialogTitle>
                <DialogDescription>Добавьте новый финансовый счёт</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Название</Label>
                  <Input
                    name="name"
                    defaultValue={editingAccount?.name || ''}
                    placeholder="Например: Основной счёт"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Тип</Label>
                  <select
                    name="type"
                    defaultValue={editingAccount?.type || 'bank'}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="cash">Наличные</option>
                    <option value="bank">Банковский счёт</option>
                    <option value="card">Карта</option>
                    <option value="investment">Инвестиции</option>
                    <option value="savings">Вклад</option>
                    <option value="crypto">Криптовалюта</option>
                    <option value="other">Другое</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="balance">Баланс</Label>
                  <Input
                    name="balance"
                    type="number"
                    step="0.01"
                    defaultValue={editingAccount?.balance || 0}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="currency">Валюта</Label>
                  <select
                    name="currency"
                    defaultValue={editingAccount?.currency || 'RUB'}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="RUB">RUB</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); setEditingAccount(null); }}>
                  Отмена
                </Button>
                <Button type="submit">{editingAccount ? 'Сохранить' : 'Создать'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Общий баланс</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBalance.toLocaleString()} ₽</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активные счета</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAccounts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Архивировано</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{archivedAccounts.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Active Accounts */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Активные счета</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeAccounts.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center text-muted-foreground">
                У вас пока нет активных счетов
              </CardContent>
            </Card>
          ) : (
            activeAccounts.map((account) => {
              const Icon = typeIcons[account.type] || Wallet;
              return (
                <Card key={account.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Icon className="h-5 w-5 text-primary shrink-0" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{account.name}</CardTitle>
                          <CardDescription>{typeLabels[account.type]}</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">
                        {account.balance.toLocaleString()} {account.currency}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => handleEdit(account)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => handleArchive(account)}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDeleteClick(account.id, account.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Archived Accounts */}
      {archivedAccounts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Архивированные счета</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {archivedAccounts.map((account) => {
              const Icon = typeIcons[account.type] || Wallet;
              return (
                <Card key={account.id} className="opacity-60">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{account.name}</CardTitle>
                          <CardDescription>{typeLabels[account.type]}</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">
                        {account.balance.toLocaleString()} {account.currency}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => handleArchive(account)}
                        >
                          <Wallet className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDeleteClick(account.id, account.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Диалог подтверждения удаления счёта */}
      <AlertDialog open={!!deleteAccountId} onOpenChange={() => setDeleteAccountId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удаление счёта</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить счёт "{deleteAccountName}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Диалог подтверждения сброса счетов */}
      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Сброс счетов</AlertDialogTitle>
            <AlertDialogDescription>
              Это УДАЛИТ ВСЕ счета и создаст их заново со стандартными счетами по умолчанию. Продолжить?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={confirmResetAccounts}>Продолжить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
