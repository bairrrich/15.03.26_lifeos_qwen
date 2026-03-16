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
  useInvestments,
  useCreateInvestment,
} from '@/modules/finance/hooks';
import { Plus, TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';
import { toast } from 'sonner';

const typeLabels: Record<string, string> = {
  stock: 'Акции',
  bond: 'Облигации',
  etf: 'ETF',
  crypto: 'Криптовалюта',
  real_estate: 'Недвижимость',
  other: 'Другое',
};

export default function InvestmentsPage() {
  const { data: investments = [] } = useInvestments();
  const createInvestment = useCreateInvestment();

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    createInvestment.mutate(
      {
        name: formData.get('name') as string,
        type: formData.get('type') as any,
        ticker: (formData.get('ticker') as string) || undefined,
        quantity: Number(formData.get('quantity')),
        purchase_price: Number(formData.get('purchase_price')),
        current_price: (formData.get('current_price') as string)
          ? Number(formData.get('current_price'))
          : undefined,
        currency: 'RUB',
        user_id: 'current-user',
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Инвестиции</h1>
          <p className="text-muted-foreground">Учёт активов и портфель</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Добавить актив
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
    </div>
  );
}
