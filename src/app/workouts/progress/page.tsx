'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  TrendingUp,
  Dumbbell,
  Calendar,
  Award,
  Activity,
  BarChart3,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

import { usePRs, useWorkoutLogs, useWeeklyWorkoutStats, useExercises } from '@/modules/workouts/hooks';
import { PRBadge } from '@/modules/workouts/components';

export default function ProgressPage() {
  const { data: prs = [] } = usePRs();
  const { data: exercises = [] } = useExercises();
  const [selectedExercise, setSelectedExercise] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  // Заглушка для данных логов - в реальности использовать useWorkoutLogs с датой
  const { data: weeklyStats } = useWeeklyWorkoutStats(Date.now());

  // Генерация данных для графиков (заглушка)
  const strengthProgressData = useMemo(() => {
    // В реальности: агрегировать данные из workoutLogs по упражнениям
    const mockData = [
      { date: '01.02', weight: 100, volume: 2400 },
      { date: '08.02', weight: 102.5, volume: 2500 },
      { date: '15.02', weight: 105, volume: 2600 },
      { date: '22.02', weight: 107.5, volume: 2700 },
      { date: '01.03', weight: 110, volume: 2800 },
      { date: '08.03', weight: 112.5, volume: 2900 },
      { date: '15.03', weight: 115, volume: 3000 },
    ];
    return mockData;
  }, []);

  const volumeByMuscleGroup = useMemo(() => {
    // В реальности: рассчитать из workoutLogs
    return [
      { name: 'Грудь', volume: 4500 },
      { name: 'Спина', volume: 5200 },
      { name: 'Ноги', volume: 6800 },
      { name: 'Плечи', volume: 3200 },
      { name: 'Руки', volume: 2800 },
      { name: 'Пресс', volume: 1200 },
    ];
  }, []);

  const weeklyWorkoutsData = useMemo(() => {
    return [
      { day: 'Пн', workouts: 1, volume: 3500 },
      { day: 'Вт', workouts: 0, volume: 0 },
      { day: 'Ср', workouts: 1, volume: 4200 },
      { day: 'Чт', workouts: 0, volume: 0 },
      { day: 'Пт', workouts: 1, volume: 3800 },
      { day: 'Сб', workouts: 0, volume: 0 },
      { day: 'Вс', workouts: 0, volume: 0 },
    ];
  }, []);

  const topPRs = useMemo(() => {
    return [...prs].sort((a, b) => b.one_rep_max - a.one_rep_max).slice(0, 10);
  }, [prs]);

  const prsByExercise = useMemo(() => {
    const grouped: Record<string, number> = {};
    prs.forEach((pr) => {
      if (!grouped[pr.exercise_id]) {
        grouped[pr.exercise_id] = pr.one_rep_max;
      } else {
        grouped[pr.exercise_id] = Math.max(grouped[pr.exercise_id], pr.one_rep_max);
      }
    });
    return Object.entries(grouped).map(([exerciseId, max]) => {
      const exercise = exercises.find((e) => e.id === exerciseId);
      return {
        exercise_name: exercise?.name || prs.find((p) => p.exercise_id === exerciseId)?.exercise_name || 'Unknown',
        one_rep_max: max,
      };
    }).sort((a, b) => b.one_rep_max - a.one_rep_max);
  }, [prs, exercises]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Прогресс</h1>
          <p className="text-muted-foreground">Аналитика и достижения</p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Неделя</SelectItem>
              <SelectItem value="month">Месяц</SelectItem>
              <SelectItem value="year">Год</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedExercise} onValueChange={(value) => setSelectedExercise(value as string)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Все упражнения" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все упражнения</SelectItem>
              {exercises.map((ex) => (
                <SelectItem key={ex.id} value={ex.id}>
                  {ex.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего PR</CardTitle>
            <Award className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{prs.length}</div>
            <p className="text-xs text-muted-foreground">персональных рекордов</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Тренировок за неделю</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyStats?.totalWorkouts || 0}</div>
            <p className="text-xs text-muted-foreground">
              {weeklyStats?.totalDuration ? `${Math.round(weeklyStats.totalDuration / 60)} мин` : '0 мин'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Средняя оценка</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyStats?.avgRating || 0}/5</div>
            <p className="text-xs text-muted-foreground">за неделю</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Упражнений</CardTitle>
            <Dumbbell className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exercises.length}</div>
            <p className="text-xs text-muted-foreground">в библиотеке</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="strength">
        <TabsList>
          <TabsTrigger value="strength">
            <TrendingUp className="h-4 w-4 mr-2" />
            Сила
          </TabsTrigger>
          <TabsTrigger value="volume">
            <BarChart3 className="h-4 w-4 mr-2" />
            Объём
          </TabsTrigger>
          <TabsTrigger value="weekly">
            <Activity className="h-4 w-4 mr-2" />
            Неделя
          </TabsTrigger>
          <TabsTrigger value="prs">
            <Award className="h-4 w-4 mr-2" />
            PRs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="strength" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Прогресс силы (1RM)</CardTitle>
              <CardDescription>
                Динамика одноповторного максимума по времени
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={strengthProgressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`${Number(value)} кг`, 'Вес']}
                      labelFormatter={(label) => `Дата: ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="weight"
                      stroke="hsl(240, 70%, 50%)"
                      fill="hsl(240, 70%, 50%)"
                      fillOpacity={0.1}
                      strokeWidth={2}
                      name="1RM (кг)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="volume" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Объём по группам мышц</CardTitle>
              <CardDescription>
                Суммарный тоннаж за выбранный период
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeByMuscleGroup}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`${Number(value)} кг`, 'Объём']}
                    />
                    <Bar
                      dataKey="volume"
                      fill="hsl(240, 70%, 50%)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Тренировки за неделю</CardTitle>
              <CardDescription>
                Количество тренировок и объём по дням
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyWorkoutsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Bar
                      yAxisId="left"
                      dataKey="workouts"
                      fill="hsl(240, 70%, 50%)"
                      radius={[4, 4, 0, 0]}
                      name="Тренировки"
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="volume"
                      fill="hsl(140, 70%, 40%)"
                      radius={[4, 4, 0, 0]}
                      name="Объём (кг)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prs" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Топ PR</CardTitle>
                <CardDescription>
                  Лучшие персональные рекорды
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topPRs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Нет персональных рекордов</p>
                    </div>
                  ) : (
                    topPRs.map((pr, index) => (
                      <div
                        key={pr.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{pr.exercise_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {pr.reps} повт × {pr.weight} кг
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <PRBadge value={`${pr.one_rep_max} кг`} />
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(pr.date).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>PR по упражнениям</CardTitle>
                <CardDescription>
                  Максимальный 1RM по каждому упражнению
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {prsByExercise.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Нет данных</p>
                    </div>
                  ) : (
                    prsByExercise.map((pr, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div>
                          <p className="font-medium">{pr.exercise_name}</p>
                        </div>
                        <div className="text-lg font-bold text-primary">
                          {pr.one_rep_max} кг
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
