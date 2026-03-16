'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useTransactions,
  useCategories,
  useAccounts,
} from '@/modules/finance/hooks';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  Download,
} from 'lucide-react';
import { format, subMonths, subWeeks, subYears } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

const COLORS = ['#6366f1', '#22c55e', '#eab308', '#f97316', '#ec4899', '#8b5cf6', '#06b6d4', '#ef4444'];

export default function FinanceAnalyticsPage() {
  const { data: transactions = [] } = useTransactions();
  const { data: categories = [] } = useCategories();
  const { data: accounts = [] } = useAccounts();

  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year' | 'all'>('quarter');
  const [categoryChartType, setCategoryChartType] = useState<'pie' | 'bar'>('pie');

  // Фильтрация транзакций по периоду
  const getFilteredTransactions = () => {
    const now = Date.now();
    let startDate: number;

    switch (timeRange) {
      case 'month':
        startDate = subMonths(new Date(), 1).getTime();
        break;
      case 'quarter':
        startDate = subMonths(new Date(), 3).getTime();
        break;
      case 'year':
        startDate = subYears(new Date(), 1).getTime();
        break;
      default:
        startDate = 0;
    }

    return transactions.filter((t) => t.date >= startDate);
  };

  const filteredTransactions = getFilteredTransactions();

  // Общие метрики
  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100) : 0;

  // Данные для графика доходов/расходов по месяцам
  const incomeExpenseByMonth = (() => {
    const months: Record<string, { income: number; expenses: number; month: string }> = {};

    filteredTransactions.forEach((t) => {
      const monthKey = format(t.date, 'yyyy-MM');
      const monthLabel = format(t.date, 'MMM', { locale: ru });

      if (!months[monthKey]) {
        months[monthKey] = { income: 0, expenses: 0, month: monthLabel };
      }

      if (t.type === 'income') {
        months[monthKey].income += t.amount;
      } else {
        months[monthKey].expenses += t.amount;
      }
    });

    return Object.values(months).sort((a, b) => {
      const aDate = new Date(a.month + ' 1');
      const bDate = new Date(b.month + ' 1');
      return aDate.getTime() - bDate.getTime();
    });
  })();

  // Расходы по категориям
  const expensesByCategory = (() => {
    const categoryTotals: Record<string, number> = {};

    filteredTransactions
      .filter((t) => t.type === 'expense' && t.category_id)
      .forEach((t) => {
        categoryTotals[t.category_id!] = (categoryTotals[t.category_id!] || 0) + t.amount;
      });

    return Object.entries(categoryTotals)
      .map(([categoryId, amount]) => {
        const category = categories.find((c) => c.id === categoryId);
        return {
          name: category?.name || 'Без категории',
          value: amount,
          color: category?.color || COLORS[Object.keys(categoryTotals).length % COLORS.length],
        };
      })
      .sort((a, b) => b.value - a.value);
  })();

  // Топ категорий за период
  const topCategories = expensesByCategory.slice(0, 5);

  // Динамика накоплений
  const savingsTrend = (() => {
    const trend: Array<{ month: string; savings: number; cumulative: number }> = [];
    let cumulative = 0;

    incomeExpenseByMonth.forEach((data) => {
      const savings = data.income - data.expenses;
      cumulative += savings;
      trend.push({
        month: data.month,
        savings,
        cumulative,
      });
    });

    return trend;
  })();

  // Средние расходы в день
  const daysInPeriod = timeRange === 'month' ? 30 : timeRange === 'quarter' ? 90 : timeRange === 'year' ? 365 : 30;
  const avgDailyExpenses = totalExpenses / daysInPeriod;

  // Экспорт данных
  const handleExportCSV = () => {
    const headers = ['Дата', 'Тип', 'Описание', 'Категория', 'Сумма'];
    const rows = filteredTransactions.map((t) => {
      const category = categories.find((c) => c.id === t.category_id);
      return [
        format(t.date, 'yyyy-MM-dd'),
        t.type === 'income' ? 'Доход' : 'Расход',
        t.description,
        category?.name || '',
        t.amount.toFixed(2),
      ];
    });

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finance_analytics_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-wrap gap-2 justify-end">
        <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Месяц</SelectItem>
            <SelectItem value="quarter">Квартал</SelectItem>
            <SelectItem value="year">Год</SelectItem>
            <SelectItem value="all">Всё время</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Экспорт
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Доходы</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{totalIncome.toLocaleString()} ₽</div>
            <p className="text-xs text-muted-foreground">за выбранный период</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Расходы</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-{totalExpenses.toLocaleString()} ₽</div>
            <p className="text-xs text-muted-foreground">за выбранный период</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Накопления</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netSavings >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {netSavings >= 0 ? '+' : ''}{netSavings.toLocaleString()} ₽
            </div>
            <p className="text-xs text-muted-foreground">{savingsRate.toFixed(1)}% от доходов</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">В день</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDailyExpenses.toFixed(0)} ₽</div>
            <p className="text-xs text-muted-foreground">средние расходы</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Обзор
          </TabsTrigger>
          <TabsTrigger value="categories">
            <PieChartIcon className="h-4 w-4 mr-2" />
            Категории
          </TabsTrigger>
          <TabsTrigger value="trends">
            <TrendingUp className="h-4 w-4 mr-2" />
            Тренды
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Доходы и расходы</CardTitle>
              <CardDescription>Динамика по месяцам</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={incomeExpenseByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                      }}
                      formatter={(value) => [`${(value ?? 0).toLocaleString()} ₽`, '']}
                    />
                    <Legend />
                    <Bar dataKey="income" fill="#22c55e" name="Доходы" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" fill="#ef4444" name="Расходы" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={categoryChartType === 'pie' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryChartType('pie')}
              >
                <PieChartIcon className="h-4 w-4 mr-2" />
                Круг
              </Button>
              <Button
                variant={categoryChartType === 'bar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryChartType('bar')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Столбцы
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Структура расходов</CardTitle>
                <CardDescription>
                  {categoryChartType === 'pie' ? 'Круговая диаграмма' : 'Столбчатая диаграмма'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    {categoryChartType === 'pie' ? (
                      <PieChart>
                        <Pie
                          data={expensesByCategory}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {expensesByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1F2937',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                          }}
                          formatter={(value) => [`${(value ?? 0).toLocaleString()} ₽`, '']}
                        />
                      </PieChart>
                    ) : (
                      <BarChart data={expensesByCategory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                        <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} angle={-45} textAnchor="end" height={80} />
                        <YAxis stroke="#9CA3AF" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1F2937',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                          }}
                          formatter={(value) => [`${(value ?? 0).toLocaleString()} ₽`, '']}
                        />
                        <Bar dataKey="value" name="Расходы">
                          {expensesByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Топ категорий</CardTitle>
                <CardDescription>Наибольшие расходы</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCategories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{category.value.toLocaleString()} ₽</div>
                        <div className="text-xs text-muted-foreground">
                          {((category.value / totalExpenses) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Динамика накоплений</CardTitle>
              <CardDescription>Накопленная сумма за период</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={savingsTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                      }}
                      formatter={(value) => [`${(value ?? 0).toLocaleString()} ₽`, '']}
                    />
                    <Area
                      type="monotone"
                      dataKey="cumulative"
                      stroke="#6366f1"
                      fill="#6366f1"
                      fillOpacity={0.3}
                      name="Накопления"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ежемесячные накопления</CardTitle>
              <CardDescription>Разница между доходами и расходами</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={savingsTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                      }}
                      formatter={(value) => [`${(value ?? 0).toLocaleString()} ₽`, '']}
                    />
                    <Bar
                      dataKey="savings"
                      fill="#22c55e"
                      name="Накопления"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
