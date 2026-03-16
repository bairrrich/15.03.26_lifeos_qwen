'use client';

import { useRouter } from 'next/navigation';
import { DollarSign, Dumbbell, Target, Utensils } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const actions = [
    {
        label: 'Добавить транзакцию',
        href: '/finance',
        icon: DollarSign,
    },
    {
        label: 'Завершить тренировку',
        href: '/workouts',
        icon: Dumbbell,
    },
    {
        label: 'Отметить привычку',
        href: '/habits',
        icon: Target,
    },
    {
        label: 'Добавить продукт',
        href: '/nutrition',
        icon: Utensils,
    },
];

export function QuickActions() {
    const router = useRouter();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Быстрые действия</CardTitle>
                <CardDescription>Частые операции</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-2">
                    {actions.map((action) => (
                        <button
                            key={action.href}
                            className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition-colors text-left"
                            onClick={() => router.push(action.href)}
                        >
                            <span className="text-sm font-medium">{action.label}</span>
                            <action.icon className="h-4 w-4 text-muted-foreground" />
                        </button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
