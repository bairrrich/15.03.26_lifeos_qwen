'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Target,
  Dumbbell,
  Utensils,
  Zap,
  Moon,
  Award,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useDashboardStats, useFinanceChartData, useHabitsChartData } from '@/core/analytics/use-analytics';
import { useWeeklyWorkoutStats } from '@/modules/workouts/hooks';
import { useAccounts, useInvestments } from '@/modules/finance/hooks';

const COLORS = ['#6366f1', '#22c55e', '#eab308', '#f97316', '#ec4899', '#8b5cf6', '#06b6d4'];

export default function DashboardPage() {
  const { data: stats } = useDashboardStats(30);
  const { data: financeData, isLoading: financeLoading } = useFinanceChartData(6);
  const { data: habitsData, isLoading: habitsLoading } = useHabitsChartData();
  const { data: weeklyWorkoutStats } = useWeeklyWorkoutStats(Date.now());
  const { data: accounts = [] } = useAccounts();
  const { data: investments = [] } = useInvestments();

  // Расчет Net Worth
  const totalBankBalance = accounts
    .filter((a) => a.type !== 'investment' && a.type !== 'crypto')
    .reduce((sum, acc) => sum + acc.balance, 0);

  const totalInvestmentValue = investments.reduce((sum, inv) => {
    const price = inv.current_price || inv.purchase_price;
    return sum + price * inv.quantity;
  }, 0);

  const netWorth = totalBankBalance + totalInvestmentValue;

  const widgets = [
    {
      title: 'Баланс',
      value: stats ? `${stats.balance.toLocaleString()} ₽` : '...',
      change: stats?.totalIncome ? `+${Math.round((stats.totalIncome / 30) * 100)} ₽/день` : '',
      trend: stats && stats.balance >= 0 ? 'up' : 'down',
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Net Worth',
      value: netWorth ? `${netWorth.toLocaleString()} ₽` : '...',
      change: `${totalInvestmentValue.toLocaleString()} ₽ в инвестициях`,
      trend: 'up',
      icon: TrendingUp,
      color: 'text-blue-600',
    },
    {
      title: 'Расходы (мес)',
      value: stats ? `${stats.totalExpenses.toLocaleString()} ₽` : '...',
      change: financeData?.[financeData.length - 1]?.expenses
        ? `${financeData[financeData.length - 1].expenses.toLocaleString()} ₽`
        : '',
      trend: 'down',
      icon: TrendingDown,
      color: 'text-red-600',
    },
    {
      title: 'Привычки',
      value: stats ? `${stats.habitsCompleted}/${stats.habitsTotal}` : '...',
      change: stats ? `${stats.habitsCompletionRate}%` : '',
      trend: 'up',
      icon: Target,
      color: 'text-blue-600',
    },
    {
      title: 'Тренировки',
      value: stats ? `${stats.workoutsCompleted}` : '...',
      change: stats ? `${Math.round(stats.totalWorkoutDuration / 60)}ч всего` : '',
      trend: 'up',
      icon: Dumbbell,
      color: 'text-purple-600',
    },
    {
      title: 'Сон',
      value: stats ? `${stats.avgSleepDuration}ч` : '...',
      change: stats ? `Качество: ${stats.avgSleepQuality}/5` : '',
      trend: stats && stats.avgSleepQuality >= 4 ? 'up' : 'neutral',
      icon: Moon,
      color: 'text-indigo-600',
    },
    {
      title: 'КБЖУ (сред.)',
      value: stats ? `${stats.avgDailyCalories} ккал` : '...',
      change: stats ? `Б: ${stats.avgDailyProtein}г | Ж: ${stats.avgDailyFat}г | У: ${stats.avgDailyCarbs}г` : '',
      trend: 'neutral',
      icon: Utensils,
      color: 'text-orange-600',
    },
    {
      title: 'Цели',
      value: stats ? `${stats.completedGoals}/${stats.activeGoals + stats.completedGoals}` : '...',
      change: stats ? `${stats.avgGoalProgress}% средний прогресс` : '',
      trend: stats && stats.avgGoalProgress >= 50 ? 'up' : 'neutral',
      icon: Award,
      color: 'text-yellow-600',
    },
    {
      title: 'Автоматизации',
      value: '⚡',
      change: 'Активны',
      trend: 'up',
      icon: Zap,
      color: 'text-cyan-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {widgets.map((widget) => (
          <Card key={widget.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
              <widget.icon className={`h-4 w-4 ${widget.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{widget.value}</div>
              {widget.change && (
                <p className={`text-xs ${widget.trend === 'up' ? 'text-green-600' : widget.trend === 'down' ? 'text-red-600' : 'text-muted-foreground'}`}>
                  {widget.trend === 'up' && '↑ '}
                  {widget.trend === 'down' && '↓ '}
                  {widget.change}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Обзор финансов</CardTitle>
            <CardDescription>Доходы и расходы за последние 6 месяцев</CardDescription>
          </CardHeader>
          <CardContent>
            {financeLoading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Загрузка...
              </div>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={financeData || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="income"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={{ fill: '#22c55e' }}
                      name="Доходы"
                    />
                    <Line
                      type="monotone"
                      dataKey="expenses"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ fill: '#ef4444' }}
                      name="Расходы"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Привычки по дням</CardTitle>
            <CardDescription>Выполненные привычки за неделю</CardDescription>
          </CardHeader>
          <CardContent>
            {habitsLoading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Загрузка...
              </div>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={habitsData || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="completed" fill="#6366f1" radius={[4, 4, 0, 0]} name="Выполнено" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Тренировки - виджет */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Тренировки</CardTitle>
                <CardDescription>Последняя активность</CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => (window.location.href = '/workouts')}
              >
                Все
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {weeklyWorkoutStats?.totalWorkouts === 0 || !weeklyWorkoutStats ? (
              <div className="py-8 text-center text-muted-foreground">
                <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Нет тренировок за неделю</p>
                <Button
                  size="sm"
                  className="mt-4"
                  onClick={() => (window.location.href = '/workouts')}
                >
                  Начать тренировку
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{weeklyWorkoutStats.totalWorkouts}</p>
                    <p className="text-xs text-muted-foreground">тренировок</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {Math.round((weeklyWorkoutStats.totalDuration || 0) / 60)}м
                    </p>
                    <p className="text-xs text-muted-foreground">время</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{weeklyWorkoutStats.avgRating || 0}</p>
                    <p className="text-xs text-muted-foreground">рейтинг</p>
                  </div>
                </div>
                <Button className="w-full" onClick={() => (window.location.href = '/workouts')}>
                  <Dumbbell className="h-4 w-4 mr-2" />
                  Начать тренировку
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Быстрые действия</CardTitle>
            <CardDescription>Частые операции</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <button className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition-colors text-left">
                <span className="text-sm font-medium">Добавить транзакцию</span>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </button>
              <button className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition-colors text-left">
                <span className="text-sm font-medium">Завершить тренировку</span>
                <Dumbbell className="h-4 w-4 text-muted-foreground" />
              </button>
              <button className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition-colors text-left">
                <span className="text-sm font-medium">Отметить привычку</span>
                <Target className="h-4 w-4 text-muted-foreground" />
              </button>
              <button className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition-colors text-left">
                <span className="text-sm font-medium">Добавить продукт</span>
                <Utensils className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Категории расходов</CardTitle>
            <CardDescription>Распределение по категориям</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              <PieChart width={200} height={200}>
                <Pie
                  data={[
                    { name: 'Еда', value: 35 },
                    { name: 'Транспорт', value: 20 },
                    { name: 'Развлечения', value: 15 },
                    { name: 'Другое', value: 30 },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
