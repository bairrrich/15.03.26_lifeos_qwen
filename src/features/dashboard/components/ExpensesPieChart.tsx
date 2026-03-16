'use client';

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const COLORS = ['#6366f1', '#22c55e', '#eab308', '#f97316', '#ec4899', '#8b5cf6', '#06b6d4'];

const DEFAULT_DATA = [
    { name: 'Еда', value: 35 },
    { name: 'Транспорт', value: 20 },
    { name: 'Развлечения', value: 15 },
    { name: 'Другое', value: 30 },
];

export function ExpensesPieChart() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Категории расходов</CardTitle>
                <CardDescription>Распределение по категориям</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                    <PieChart width={200} height={200}>
                        <Pie
                            data={DEFAULT_DATA}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {DEFAULT_DATA.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </div>
            </CardContent>
        </Card>
    );
}
