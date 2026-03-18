'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/components/card';

interface HabitsChartProps {
    data?: Array<{ day: string; completed: number }>;
    isLoading?: boolean;
}

export function HabitsChart({ data, isLoading }: HabitsChartProps) {
    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Привычки по дням</CardTitle>
                <CardDescription>Выполненные привычки за неделю</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        Загрузка...
                    </div>
                ) : (
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data || []}>
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
    );
}

