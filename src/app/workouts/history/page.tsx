'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Clock, Dumbbell, Search, Calendar, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

import { useWorkoutLogs } from '@/modules/workouts/hooks';

export default function WorkoutHistoryPage() {
  const { data: allLogs = [] } = useWorkoutLogs();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  // Сортируем логи по дате (новые сначала)
  const sortedLogs = [...allLogs].sort((a, b) => b.date - a.date);

  // Фильтрация
  const filteredLogs = sortedLogs.filter((log) => {
    const matchesSearch = log.workout_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const logDate = new Date(log.date);
    const matchesMonth =
      selectedMonth === 'all' ||
      `${logDate.getFullYear()}-${String(logDate.getMonth() + 1).padStart(2, '0')}` ===
      selectedMonth;

    return matchesSearch && matchesMonth;
  });

  // Группировка по месяцам
  const logsByMonth = filteredLogs.reduce((acc, log) => {
    const date = new Date(log.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(log);
    return acc;
  }, {} as Record<string, typeof allLogs>);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}ч ${minutes}м`;
    return `${minutes}м`;
  };

  const getMonthLabel = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(Number(year), Number(month) - 1);
    return format(date, 'LLLL yyyy', { locale: ru });
  };

  // Доступные месяцы для фильтра
  const availableMonths = Array.from(
    new Set(
      allLogs.map((log) => {
        const date = new Date(log.date);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      })
    )
  ).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">История тренировок</h1>
          <p className="text-muted-foreground">Все ваши тренировки</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Фильтры</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по названию..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Select value={selectedMonth} onValueChange={(value) => setSelectedMonth(value as string)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Все месяцы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все месяцы</SelectItem>
                {availableMonths.map((month) => (
                  <SelectItem key={month} value={month}>
                    {getMonthLabel(month)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs by Month */}
      {Object.keys(logsByMonth).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Нет тренировок</p>
            <p className="text-sm">Завершите первую тренировку</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(logsByMonth).map(([monthKey, logs]) => (
            <div key={monthKey}>
              <h2 className="text-lg font-semibold mb-4 capitalize">
                {getMonthLabel(monthKey)}
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {logs.map((log) => {
                  const totalSets = log.exercises.reduce(
                    (sum, ex) => sum + ex.sets.length,
                    0
                  );
                  const completedSets = log.exercises.reduce((sum, ex) => {
                    return sum + ex.sets.filter((s) => s.completed).length;
                  }, 0);

                  return (
                    <Card
                      key={log.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => (window.location.href = `/workouts/history/${log.id}`)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{log.workout_name}</CardTitle>
                            <CardDescription className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(log.date, 'dd MMMM yyyy', { locale: ru })}
                            </CardDescription>
                          </div>
                          {log.rating && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {log.rating}/5
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(log.duration_seconds)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Dumbbell className="h-3 w-3" />
                            {completedSets}/{totalSets} сетов
                          </span>
                        </div>

                        {log.feeling && (
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Самочувствие</span>
                              <span>{log.feeling}/5</span>
                            </div>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <div
                                  key={i}
                                  className={`h-2 flex-1 rounded-full ${log.feeling && i <= log.feeling
                                    ? 'bg-primary'
                                    : 'bg-muted'
                                    }`}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
