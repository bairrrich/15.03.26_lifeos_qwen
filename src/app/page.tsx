'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DollarSign,
  TrendingDown,
  Target,
  Dumbbell,
  BookOpen,
  Heart,
  Sparkles,
  Utensils,
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
} from 'recharts';

const widgets = [
  {
    title: 'Баланс',
    value: '$12,450',
    change: '+12.5%',
    trend: 'up',
    icon: DollarSign,
    color: 'text-green-600',
  },
  {
    title: 'Расходы за месяц',
    value: '$2,340',
    change: '-5.2%',
    trend: 'down',
    icon: TrendingDown,
    color: 'text-red-600',
  },
  {
    title: 'Привычки сегодня',
    value: '4/6',
    change: '67%',
    trend: 'up',
    icon: Target,
    color: 'text-blue-600',
  },
  {
    title: 'Тренировки за неделю',
    value: '3',
    change: '+1',
    trend: 'up',
    icon: Dumbbell,
    color: 'text-purple-600',
  },
  {
    title: 'Книги в процессе',
    value: '2',
    change: '',
    trend: 'neutral',
    icon: BookOpen,
    color: 'text-amber-600',
  },
  {
    title: 'Сон (средний)',
    value: '7.5ч',
    change: '+0.5ч',
    trend: 'up',
    icon: Heart,
    color: 'text-rose-600',
  },
  {
    title: 'Продукты',
    value: '12',
    change: '',
    trend: 'neutral',
    icon: Sparkles,
    color: 'text-pink-600',
  },
];

// Демо данные для графиков
const financeData = [
  { month: 'Янв', income: 4000, expenses: 2400 },
  { month: 'Фев', income: 3000, expenses: 1398 },
  { month: 'Мар', income: 2000, expenses: 9800 },
  { month: 'Апр', income: 2780, expenses: 3908 },
  { month: 'Май', income: 1890, expenses: 4800 },
  { month: 'Июн', income: 2390, expenses: 3800 },
];

const habitsData = [
  { day: 'Пн', completed: 5 },
  { day: 'Вт', completed: 3 },
  { day: 'Ср', completed: 6 },
  { day: 'Чт', completed: 4 },
  { day: 'Пт', completed: 5 },
  { day: 'Сб', completed: 2 },
  { day: 'Вс', completed: 4 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Добро пожаловать в LifeOS</h1>
        <p className="text-muted-foreground">Ваша персональная панель управления жизнью</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {widgets.map((widget) => (
          <Card key={widget.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
              <widget.icon className={`h-4 w-4 ${widget.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{widget.value}</div>
              {widget.change && (
                <p
                  className={`text-xs ${widget.trend === 'up' ? 'text-green-600' : widget.trend === 'down' ? 'text-red-600' : 'text-muted-foreground'}`}
                >
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
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={financeData}>
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
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Активные привычки</CardTitle>
            <CardDescription>Прогресс за неделю</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={habitsData}>
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
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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
            <CardTitle>Последняя активность</CardTitle>
            <CardDescription>Ваши последние действия</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Тренировка завершена</p>
                  <p className="text-xs text-muted-foreground">2 часа назад</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Привычка выполнена</p>
                  <p className="text-xs text-muted-foreground">4 часа назад</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Транзакция добавлена</p>
                  <p className="text-xs text-muted-foreground">Вчера</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-orange-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Книга обновлена</p>
                  <p className="text-xs text-muted-foreground">2 дня назад</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
