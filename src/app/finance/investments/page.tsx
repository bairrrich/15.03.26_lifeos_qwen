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
} from '@/components/ui/dialog'
import {
  useInvestments,
  useCreateInvestment,
  useUpdateInvestment,
  useAccounts,
  useCreateTransaction,
  useCreateInvestmentTransaction,
} from '@/modules/finance/hooks'
import { getCurrentUserId } from '@/shared/hooks/use-user-id'
import { Plus, TrendingUp, TrendingDown, DollarSign, Percent, History } from 'lucide-react'
import { toast } from 'sonner';
import type { InvestmentTransaction as InvestmentTransactionType } from '@/modules/finance/entities';

const typeLabels: Record<string, string> = {
  stock: 'Акции',
  bond: 'Облигации',
  etf: 'ETF',
  crypto: 'Криптовалюта',
  real_estate: 'Недвижимость',
  other: 'Другое',
};

const transactionTypeLabels: Record<InvestmentTransactionType['type'], string> = {
  buy: 'Покупка',
  sell: 'Продажа',
  dividend: 'Дивиденд',
  fee: 'Комиссия',
  split: 'Сплит',
  interest: 'Процент',
};

export default function InvestmentsPage() {
  const { data: investments = [] } = useInvestments();
  const { data: accounts = [] } = useAccounts();
  const createInvestment = useCreateInvestment();
  const updateInvestment = useUpdateInvestment();
  const createInvestmentTransaction = useCreateInvestmentTransaction();
  const createTransaction = useCreateTransaction();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<string | null>(null);
  const [transactionType, setTransactionType] = useState<InvestmentTransactionType['type']>('buy');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const userId = getCurrentUserId();

    createInvestment.mutate(
      {
        name: formData.get('name') as string,
        type: formData.get('type') as 'stock' | 'bond' | 'etf' | 'crypto' | 'real_estate' | 'other',
        ticker: (formData.get('ticker') as string) || undefined,
        quantity: Number(formData.get('quantity')),
        purchase_price: Number(formData.get('purchase_price')),
        current_price: (formData.get('current_price') as string)
          ? Number(formData.get('current_price'))
          : undefined,
        currency: 'RUB',
        user_id: userId,
      },
      {
        onSuccess: () => {
          toast.success('Инвестиция добавлена');
          setDialogOpen(false);
        },
        onError: () => {
          toast.error('Ошибка при добавлении инвестиции');
        },
      }
    );
  };

  const handleTransactionSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const investment = investments.find((i) => i.id === selectedInvestment);
    const userId = getCurrentUserId();

    if (!investment || !selectedInvestment) return;

    const quantity = Number(formData.get('quantity'));
    const price = Number(formData.get('price'));
    const total = quantity * price;
    const accountId = formData.get('account_id') as string;

    // Создаём операцию с инвестицией
    createInvestmentTransaction.mutate(
      {
        investment_id: selectedInvestment,
        type: transactionType,
        date: Date.now(),
        quantity,
        price,
        total: transactionType === 'buy' ? -total : total,
        currency: investment.currency,
        user_id: userId,
      },
      {
        onSuccess: () => {
          // Обновляем позицию при покупке/продаже
          if (transactionType === 'buy' || transactionType === 'sell') {
            const newQuantity = transactionType === 'buy'
              ? investment.quantity + quantity
              : investment.quantity - quantity;

            updateInvestment.mutate({
              id: selectedInvestment,
              data: { quantity: newQuantity },
            });
          }

          // Создаём обычную транзакцию для учёта денег
          if (accountId && (transactionType === 'buy' || transactionType === 'sell' || transactionType === 'dividend')) {
            createTransaction.mutate({
              account_id: accountId,
              amount: total,
              currency: investment.currency,
              category_id: transactionType === 'dividend' ? undefined : undefined, // TODO: категория
              type: transactionType === 'buy' ? 'expense' : 'income',
              description: `${transactionTypeLabels[transactionType]} ${investment.ticker || investment.name}`,
              date: Date.now(),
              merchant: investment.name,
              tags: ['investment', transactionType],
              user_id: userId,
            });
          }

          toast.success('Операция добавлена');
          setTransactionDialogOpen(false);
        },
        onError: () => {
          toast.error('Ошибка при добавлении операции');
        },
      }
    );
  };

  // Подсчёт общей стоимости портфеля
  const totalValue = investments.reduce((sum, inv) => {
    const price = inv.current_price || inv.purchase_price;
    return sum + price * inv.quantity;
  }, 0);

  // Подсчёт общей суммы вложений
  const totalInvested = investments.reduce((sum, inv) => {
    return sum + inv.purchase_price * inv.quantity;
  }, 0);

  // Общий доход/убыток
  const totalProfit = totalValue - totalInvested;
  const profitPercent = totalInvested > 0 ? ((totalProfit / totalInvested) * 100) : 0;

  // Группировка по типам
  const byType = investments.reduce((acc, inv) => {
    acc[inv.type] = (acc[inv.type] || 0) + (inv.current_price || inv.purchase_price) * inv.quantity;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 justify-end">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setTransactionDialogOpen(true)} style={{ height: '32px' }}>
            <History className="h-4 w-4 mr-2" />
            <span>Операция</span>
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button style={{ height: '32px' }}>
                <Plus className="mr-2 h-4 w-4" />
                <span>Добавить актив</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Новая инвестиция</DialogTitle>
                  <DialogDescription>Добавьте актив в портфель</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Название</Label>
                    <Input name="name" placeholder="Например: Apple Inc." required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type">Тип</Label>
                    <select
                      name="type"
                      defaultValue="stock"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="stock">Акции</option>
                      <option value="bond">Облигации</option>
                      <option value="etf">ETF</option>
                      <option value="crypto">Криптовалюта</option>
                      <option value="real_estate">Недвижимость</option>
                      <option value="other">Другое</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="ticker">Тикер (опционально)</Label>
                    <Input name="ticker" placeholder="AAPL" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="quantity">Количество</Label>
                      <Input name="quantity" type="number" step="0.01" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="purchase_price">Цена покупки</Label>
                      <Input name="purchase_price" type="number" step="0.01" required />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="current_price">Текущая цена (опционально)</Label>
                    <Input name="current_price" type="number" step="0.01" />
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
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Стоимость</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalValue.toLocaleString()} ₽</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Вложено</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvested.toLocaleString()} ₽</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Доход</CardTitle>
            {totalProfit >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalProfit >= 0 ? '+' : ''}{totalProfit.toLocaleString()} ₽
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Доходность</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${profitPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Allocation by Type */}
      {Object.keys(byType).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Распределение по типам</CardTitle>
            <CardDescription>Структура портфеля</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(byType).map(([type, value]) => (
                <div key={type} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{typeLabels[type] || type}</p>
                    <p className="text-sm text-muted-foreground">
                      {((value / totalValue) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <p className="text-lg font-bold">{value.toLocaleString()} ₽</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Investments List */}
      <Card>
        <CardHeader>
          <CardTitle>Активы</CardTitle>
          <CardDescription>Ваш инвестиционный портфель</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {investments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                У вас пока нет инвестиций
              </p>
            ) : (
              investments.map((inv) => {
                const currentValue = (inv.current_price || inv.purchase_price) * inv.quantity;
                const profit = currentValue - (inv.purchase_price * inv.quantity);
                const profitPercent = ((profit / (inv.purchase_price * inv.quantity)) * 100);

                return (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        {inv.ticker ? (
                          <span className="text-sm font-bold text-primary">{inv.ticker.slice(0, 3)}</span>
                        ) : (
                          <DollarSign className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{inv.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline">{typeLabels[inv.type]}</Badge>
                          {inv.ticker && <span>{inv.ticker}</span>}
                          <span>{inv.quantity} шт.</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{currentValue.toLocaleString()} ₽</p>
                      <p className={`text-sm ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {profit >= 0 ? '+' : ''}{profit.toLocaleString()} ₽ ({profitPercent.toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Dialog */}
      <Dialog open={transactionDialogOpen} onOpenChange={setTransactionDialogOpen}>
        <DialogContent>
          <form onSubmit={handleTransactionSubmit}>
            <DialogHeader>
              <DialogTitle>Операция с инвестицией</DialogTitle>
              <DialogDescription>Добавьте операцию покупки, продажи или дивиденда</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="investment_id">Актив</Label>
                <select
                  name="investment_id"
                  value={selectedInvestment || ''}
                  onChange={(e) => setSelectedInvestment(e.target.value || null)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Выберите актив</option>
                  {investments.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.name} ({inv.ticker || inv.type})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Тип операции</Label>
                <select
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value as InvestmentTransactionType['type'])}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="buy">Покупка</option>
                  <option value="sell">Продажа</option>
                  <option value="dividend">Дивиденд</option>
                  <option value="fee">Комиссия</option>
                  <option value="split">Сплит</option>
                  <option value="interest">Процент</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Количество</Label>
                  <Input name="quantity" type="number" step="0.01" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price">Цена за единицу</Label>
                  <Input name="price" type="number" step="0.01" required />
                </div>
              </div>
              {(transactionType === 'buy' || transactionType === 'sell' || transactionType === 'dividend') && (
                <div className="grid gap-2">
                  <Label htmlFor="account_id">Счёт</Label>
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
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setTransactionDialogOpen(false)}>
                Отмена
              </Button>
              <Button type="submit">Добавить</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
