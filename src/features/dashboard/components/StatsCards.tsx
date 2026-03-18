'use client';

import {
    DollarSign,
    TrendingDown,
    TrendingUp,
    Target,
    Dumbbell,
    Moon,
    Utensils,
    Award,
    Zap,
    type LucideIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/components/card';

interface StatsCardsProps {
    stats?: {
        balance: number;
        totalIncome: number;
        totalExpenses: number;
        habitsCompleted: number;
        habitsTotal: number;
        habitsCompletionRate: number;
        workoutsCompleted: number;
        totalWorkoutDuration: number;
        avgSleepDuration: number;
        avgSleepQuality: number;
        avgDailyCalories: number;
        avgDailyProtein: number;
        avgDailyFat: number;
        avgDailyCarbs: number;
        completedGoals: number;
        activeGoals: number;
        avgGoalProgress: number;
    };
    netWorth?: number;
    investmentValue?: number;
}

type Trend = 'up' | 'down' | 'neutral';

interface Widget {
    title: string;
    value: string;
    change: string;
    trend: Trend;
    icon: LucideIcon;
    color: string;
}

export function StatsCards({ stats, netWorth = 0, investmentValue = 0 }: StatsCardsProps) {
    const widgets: Widget[] = [
        {
            title: 'Баланс',
            value: stats ? `${stats.balance.toLocaleString()} ₽` : '...',
            change: stats?.totalIncome ? `+${Math.round((stats.totalIncome / 30) * 100)} ₽/день` : '',
            trend: stats && stats.balance >= 0 ? 'up' : 'down',
            icon: DollarSign,
            color: 'text-green-600',
        },
        {
            title: 'Расходы (мес)',
            value: stats ? `${stats.totalExpenses.toLocaleString()} ₽` : '...',
            change: '',
            trend: 'down',
            icon: TrendingDown,
            color: 'text-red-600',
        },
        {
            title: 'Net Worth',
            value: `${netWorth.toLocaleString()} ₽`,
            change: `${investmentValue.toLocaleString()} ₽ в инвестициях`,
            trend: 'up',
            icon: TrendingUp,
            color: 'text-blue-600',
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
                            <p
                                className={`text-xs ${widget.trend === 'up'
                                    ? 'text-green-600'
                                    : widget.trend === 'down'
                                        ? 'text-red-600'
                                        : 'text-muted-foreground'
                                    }`}
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
    );
}

