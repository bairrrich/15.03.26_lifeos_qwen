'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dumbbell } from 'lucide-react';

interface WorkoutCardProps {
    totalWorkouts?: number;
    totalDuration?: number;
    avgRating?: number;
}

export function WorkoutCard({ totalWorkouts = 0, totalDuration = 0, avgRating = 0 }: WorkoutCardProps) {
    const router = useRouter();

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Тренировки</CardTitle>
                        <CardDescription>Последняя активность</CardDescription>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => router.push('/workouts')}>
                        Все
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {totalWorkouts === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                        <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-sm">Нет тренировок за неделю</p>
                        <Button size="sm" className="mt-4" onClick={() => router.push('/workouts')}>
                            Начать тренировку
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold">{totalWorkouts}</p>
                                <p className="text-xs text-muted-foreground">тренировок</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold">{Math.round(totalDuration / 60)}м</p>
                                <p className="text-xs text-muted-foreground">время</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold">{avgRating}</p>
                                <p className="text-xs text-muted-foreground">рейтинг</p>
                            </div>
                        </div>
                        <Button className="w-full" onClick={() => router.push('/workouts')}>
                            <Dumbbell className="h-4 w-4 mr-2" />
                            Начать тренировку
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
