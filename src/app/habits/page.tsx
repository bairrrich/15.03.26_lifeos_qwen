'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  useHabits,
  useCreateHabit,
  useCompleteHabit,
  useTodayHabitsLog,
} from '@/modules/habits/hooks';
import { Plus, Check, Flame, Calendar, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function HabitsPage() {
  const { data: habits = [] } = useHabits();
  const { data: todayLogs = [] } = useTodayHabitsLog();
  const createHabit = useCreateHabit();
  const completeHabit = useCompleteHabit();

  const [dialogOpen, setDialogOpen] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = today.getTime();

  const completedToday = new Set(
    todayLogs.filter((log) => log.completed).map((log) => log.habit_id)
  );

  const handleComplete = (habitId: string) => {
    completeHabit.mutate(
      { habitId, date: todayTimestamp },
      {
        onSuccess: () => {
          toast.success('РџСЂРёРІС‹С‡РєР° РІС‹РїРѕР»РЅРµРЅР°!');
        },
        onError: () => {
          toast.error('РћС€РёР±РєР° РїСЂРё РѕР±РЅРѕРІР»РµРЅРёРё');
        },
      }
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    createHabit.mutate(
      {
        name: formData.get('name') as string,
        description: (formData.get('description') as string) || undefined,
        frequency: formData.get('frequency') as 'daily' | 'weekly' | 'monthly',
        target_count: Number(formData.get('target_count')) || 1,
        color: (formData.get('color') as string) || undefined,
        streak: 0,
        completed_total: 0,
        user_id: 'current-user',
      },
      {
        onSuccess: () => {
          toast.success('РџСЂРёРІС‹С‡РєР° СЃРѕР·РґР°РЅР°');
          setDialogOpen(false);
        },
        onError: () => {
          toast.error('РћС€РёР±РєР° РїСЂРё СЃРѕР·РґР°РЅРёРё');
        },
      }
    );
  };

  const completedCount = habits.filter((h) => completedToday.has(h.id)).length;
  const totalCount = habits.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">РџСЂРёРІС‹С‡РєРё</h1>
          <p className="text-muted-foreground">РўСЂРµРєРµСЂ РїСЂРёРІС‹С‡РµРє РґР»СЏ РґРѕСЃС‚РёР¶РµРЅРёСЏ С†РµР»РµР№</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              РќРѕРІР°СЏ РїСЂРёРІС‹С‡РєР°
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>РќРѕРІР°СЏ РїСЂРёРІС‹С‡РєР°</DialogTitle>
                <DialogDescription>РЎРѕР·РґР°Р№С‚Рµ РЅРѕРІСѓСЋ РїСЂРёРІС‹С‡РєСѓ РґР»СЏ РѕС‚СЃР»РµР¶РёРІР°РЅРёСЏ</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">РќР°Р·РІР°РЅРёРµ</Label>
                  <Input name="name" placeholder="РќР°РїСЂРёРјРµСЂ: Р§С‚РµРЅРёРµ РєРЅРёРі" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">РћРїРёСЃР°РЅРёРµ (РѕРїС†РёРѕРЅР°Р»СЊРЅРѕ)</Label>
                  <Input name="description" placeholder="30 РјРёРЅСѓС‚ РІ РґРµРЅСЊ" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="frequency">Р§Р°СЃС‚РѕС‚Р°</Label>
                  <select
                    name="frequency"
                    defaultValue="daily"
                    
                    
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Р’С‹Р±РµСЂРёС‚Рµ С‡Р°СЃС‚РѕС‚Сѓ</option>
                      <option value="daily">Р•Р¶РµРґРЅРµРІРЅРѕ</option>
                      <option value="weekly">Р•Р¶РµРЅРµРґРµР»СЊРЅРѕ</option>
                      <option value="monthly">Р•Р¶РµРјРµСЃСЏС‡РЅРѕ</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="target_count">Р¦РµР»СЊ (СЂР°Р·)</Label>
                  <Input name="target_count" type="number" min="1" defaultValue="1" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="color">Р¦РІРµС‚</Label>
                  <Input name="color" type="color" defaultValue="#6366f1" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  РћС‚РјРµРЅР°
                </Button>
                <Button type="submit">РЎРѕР·РґР°С‚СЊ</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>РџСЂРѕРіСЂРµСЃСЃ СЃРµРіРѕРґРЅСЏ</CardTitle>
          <CardDescription>
            {completedCount} РёР· {totalCount} РїСЂРёРІС‹С‡РµРє РІС‹РїРѕР»РЅРµРЅРѕ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={completionPercentage} className="h-3" />
            <p className="text-sm text-muted-foreground text-right">{completionPercentage}%</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {habits.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center text-muted-foreground">
              РЈ РІР°СЃ РїРѕРєР° РЅРµС‚ РїСЂРёРІС‹С‡РµРє. РЎРѕР·РґР°Р№С‚Рµ РїРµСЂРІСѓСЋ!
            </CardContent>
          </Card>
        ) : (
          habits.map((habit) => {
            const isCompleted = completedToday.has(habit.id);
            return (
              <Card
                key={habit.id}
                className={cn(
                  'relative overflow-hidden',
                  isCompleted && 'bg-green-50 dark:bg-green-950/20'
                )}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${habit.color || '#6366f1'}20` }}
                      >
                        <Check
                          className={cn('h-5 w-5', isCompleted ? 'text-green-600' : '')}
                          style={{ color: !isCompleted ? habit.color : undefined }}
                        />
                      </div>
                      <div>
                        <CardTitle className="text-base">{habit.name}</CardTitle>
                        {habit.description && (
                          <CardDescription className="text-xs">{habit.description}</CardDescription>
                        )}
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant={isCompleted ? 'default' : 'outline'}
                      className={cn('h-8 w-8', isCompleted && 'bg-green-600 hover:bg-green-700')}
                      onClick={() => handleComplete(habit.id)}
                      disabled={isCompleted}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Flame
                        className={cn(
                          'h-4 w-4',
                          habit.streak && habit.streak > 0 ? 'text-orange-500' : ''
                        )}
                      />
                      <span>{habit.streak || 0} РґРЅРµР№</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {habit.frequency === 'daily'
                          ? 'Р•Р¶РµРґРЅРµРІРЅРѕ'
                          : habit.frequency === 'weekly'
                            ? 'Р•Р¶РµРЅРµРґРµР»СЊРЅРѕ'
                            : 'Р•Р¶РµРјРµСЃСЏС‡РЅРѕ'}
                      </span>
                    </div>
                    {habit.completed_total && habit.completed_total > 0 && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        <span>{habit.completed_total} СЂР°Р·</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
