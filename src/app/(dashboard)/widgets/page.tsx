'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useWidgetDefinitions, useVisibleWidgets, useCreateWidgetInstance, useCreateCustomWidget } from '@/modules/widgets/hooks'
import { getCurrentUserId } from '@/shared/hooks/use-user-id'
import { Plus, LayoutGrid, Code, Settings, Trash2, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

const typeLabels: Record<string, string> = {
  stats: 'Статистика',
  chart: 'График',
  list: 'Список',
  calendar: 'Календарь',
  progress: 'Прогресс',
  custom: 'Кастомный',
}

const categoryLabels: Record<string, string> = {
  habits: 'Привычки',
  goals: 'Цели',
  finance: 'Финансы',
  nutrition: 'Питание',
  workouts: 'Тренировки',
  health: 'Здоровье',
  sleep: 'Сон',
}

export default function WidgetsPage() {
  const { data: definitions = [] } = useWidgetDefinitions()
  const { data: visibleWidgets = [] } = useVisibleWidgets(getCurrentUserId())
  const createWidget = useCreateWidgetInstance()
  const createCustomWidget = useCreateCustomWidget()

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [customDialogOpen, setCustomDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredDefinitions = selectedCategory === 'all'
    ? definitions
    : definitions.filter((d) => d.category === selectedCategory)

  const handleAddWidget = (widget: typeof definitions[0]) => {
    createWidget.mutate(
      {
        widget_id: widget.id,
        user_id: getCurrentUserId(),
        title: widget.name,
        config: {},
        position: { row: 0, col: 0, width: 1, height: 1 },
        is_visible: true,
      },
      {
        onSuccess: () => {
          toast.success('Виджет добавлен')
          setAddDialogOpen(false)
        },
      }
    )
  }

  const handleCreateCustom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const userId = getCurrentUserId()

    createCustomWidget.mutate(
      {
        name: formData.get('name') as string,
        code: formData.get('code') as string,
        config: {},
        is_active: true,
        user_id: userId,
      },
      {
        onSuccess: () => {
          toast.success('Кастомный виджет создан')
          setCustomDialogOpen(false)
        },
        onError: (error) => {
          toast.error(error.message)
        },
      }
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Виджеты</h1>
          <p className="text-muted-foreground">Настройте свой дашборд</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={customDialogOpen} onOpenChange={setCustomDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Code className="mr-2 h-4 w-4" />
                Создать виджет
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <form onSubmit={handleCreateCustom}>
                <DialogHeader>
                  <DialogTitle>Кастомный виджет</DialogTitle>
                  <DialogDescription>
                    Создайте свой виджет с помощью JavaScript
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Название</Label>
                    <Input name="name" placeholder="Мой виджет" required />
                  </div>
                  <div className="grid gap-2">
                    <Label>Код (JavaScript)</Label>
                    <Textarea
                      name="code"
                      placeholder={`// Пример:
const habits = await db.table('habits').toArray();
return { count: habits.length };`}
                      className="font-mono text-sm h-48"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Код выполняется в контексте с доступом к <code>db</code> (Dexie.js)
                  </p>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCustomDialogOpen(false)}>Отмена</Button>
                  <Button type="submit">Создать</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Добавить виджет
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Добавить виджет</DialogTitle>
                <DialogDescription>
                  Выберите виджет для добавления на дашборд
                </DialogDescription>
              </DialogHeader>
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList className="grid grid-cols-4 gap-2">
                  <TabsTrigger value="all">Все</TabsTrigger>
                  <TabsTrigger value="habits">Привычки</TabsTrigger>
                  <TabsTrigger value="finance">Финансы</TabsTrigger>
                  <TabsTrigger value="health">Здоровье</TabsTrigger>
                </TabsList>
                <TabsContent value={selectedCategory} className="mt-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredDefinitions.map((widget) => (
                      <Card
                        key={widget.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleAddWidget(widget)}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`h-8 w-8 rounded-lg flex items-center justify-center bg-${widget.color || 'gray'}-500/20`}>
                                <Settings className="h-4 w-4" />
                              </div>
                              <div>
                                <CardTitle className="text-base">{widget.name}</CardTitle>
                                <CardDescription className="text-xs">
                                  {typeLabels[widget.type]}
                                </CardDescription>
                              </div>
                            </div>
                            <Badge variant="secondary">{categoryLabels[widget.category]}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{widget.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5" />
            Мои виджеты
          </CardTitle>
          <CardDescription>
            {visibleWidgets.length} виджет(а) на дашборде
          </CardDescription>
        </CardHeader>
        <CardContent>
          {visibleWidgets.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <LayoutGrid className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Нет добавленных виджетов</p>
              <p className="text-sm">Нажмите "Добавить виджет" чтобы начать</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {visibleWidgets.map((instance) => {
                const definition = definitions.find((d) => d.id === instance.widget_id)
                return (
                  <Card key={instance.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{instance.title}</CardTitle>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <EyeOff className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {definition && (
                        <CardDescription>
                          {typeLabels[definition.type]} • {categoryLabels[definition.category]}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="h-24 bg-muted/50 rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                        Предпросмотр
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Примеры кастомных виджетов</CardTitle>
          <CardDescription>Идеи для создания своих виджетов</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="p-3 rounded-lg bg-muted/50 font-mono text-xs">
              <p className="font-medium mb-2">📊 Счётчик привычек</p>
              <pre className="whitespace-pre-wrap">
                {`const habits = await db.table('habits').toArray();
const logs = await db.table('habit_logs').toArray();
const today = new Date();
today.setHours(0, 0, 0, 0);
const completed = logs.filter(l => l.date >= today && l.completed);
return { total: habits.length, completed: completed.length };`}
              </pre>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 font-mono text-xs">
              <p className="font-medium mb-2">💰 Последние транзакции</p>
              <pre className="whitespace-pre-wrap">
                {`const transactions = await db.table('transactions').toArray();
const recent = transactions.slice(-5).reverse();
return { transactions: recent };`}
              </pre>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 font-mono text-xs">
              <p className="font-medium mb-2">🎯 Прогресс цели</p>
              <pre className="whitespace-pre-wrap">
                {`const goals = await db.table('goals').toArray();
const active = goals.filter(g => g.status === 'active');
const avgProgress = active.reduce((sum, g) => sum + g.progress, 0) / active.length;
return { progress: avgProgress || 0 };`}
              </pre>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 font-mono text-xs">
              <p className="font-medium mb-2">💧 Потребление воды</p>
              <pre className="whitespace-pre-wrap">
                {`const logs = await db.table('nutrition_logs').toArray();
const today = new Date();
today.setHours(0, 0, 0, 0);
const waterLogs = logs.filter(l => l.date >= today && l.meal_name?.includes('вода'));
return { glasses: waterLogs.length };`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
