'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
import { useActiveAutomations, useCreateAutomation, useToggleAutomation, useRecentAutomationLogs } from '@/modules/automations/hooks'
import { getCurrentUserId } from '@/shared/hooks/use-user-id'
import { Plus, Zap, Clock, CheckCircle2, XCircle, Activity } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import type { TriggerType, ActionType } from '@/modules/automations/entities'

const triggerLabels: Record<string, string> = {
  habit_completed: 'Привычка выполнена',
  habit_missed: 'Привычка пропущена',
  workout_completed: 'Тренировка завершена',
  goal_progress: 'Прогресс цели',
  budget_exceeded: 'Превышен бюджет',
  product_expiring: 'Срок продукта истекает',
  time_of_day: 'Время суток',
}

const actionLabels: Record<string, string> = {
  send_notification: 'Отправить уведомление',
  send_email: 'Отправить email',
  create_habit_log: 'Создать запись привычки',
  send_webhook: 'Отправить webhook',
  log_message: 'Записать в лог',
}

export default function AutomationsPage() {
  const { data: automations = [] } = useActiveAutomations()
  const { data: recentLogs = [] } = useRecentAutomationLogs()
  const createAutomation = useCreateAutomation()
  const toggleAutomation = useToggleAutomation()

  const [dialogOpen, setDialogOpen] = useState(false)

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const userId = getCurrentUserId()

    createAutomation.mutate(
      {
        name: formData.get('name') as string,
        description: formData.get('description') as string || undefined,
        trigger: {
          type: formData.get('trigger_type') as TriggerType,
          config: {},
        },
        actions: [
          {
            type: formData.get('action_type') as ActionType,
            config: {
              message: formData.get('action_message') as string,
            },
          },
        ],
        is_active: true,
        trigger_count: 0,
        user_id: userId,
      },
      {
        onSuccess: () => {
          toast.success('Автоматизация создана')
          setDialogOpen(false)
        },
        onError: () => {
          toast.error('Ошибка при создании')
        },
      }
    )
  }

  const handleToggle = (id: string, isActive: boolean) => {
    toggleAutomation.mutate(
      { id, isActive: !isActive },
      {
        onSuccess: () => {
          toast.success('Статус изменён')
        },
      }
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" style={{ height: '32px' }}>
              <Plus className="h-4 w-4 mr-2" />
              <span>Создать правило</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Новое правило</DialogTitle>
                <DialogDescription>
                  Настройте триггер и действие для автоматизации
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Название</Label>
                  <Input name="name" placeholder="Например: Утреннее напоминание" required />
                </div>
                <div className="grid gap-2">
                  <Label>Описание</Label>
                  <Input name="description" placeholder="Описание правила" />
                </div>
                <div className="grid gap-2">
                  <Label>Триггер</Label>
                  <select
                    name="trigger_type"
                    defaultValue="time_of_day"


                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Выберите триггер</option>

                  </select>
                </div>
                <div className="grid gap-2">
                  <Label>Действие</Label>
                  <select
                    name="action_type"
                    defaultValue="send_notification"


                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Выберите действие</option>

                  </select>
                </div>
                <div className="grid gap-2">
                  <Label>Сообщение</Label>
                  <Input name="action_message" placeholder="Текст уведомления" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button>
                <Button type="submit">Создать</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Активные правила
            </CardTitle>
          </CardHeader>
          <CardContent>
            {automations.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Нет активных правил</p>
            ) : (
              <div className="space-y-3">
                {automations.map((rule) => (
                  <div key={rule.id} className="p-3 rounded-lg border flex items-center justify-between">
                    <div>
                      <p className="font-medium">{rule.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {triggerLabels[rule.trigger.type]} → {actionLabels[rule.actions[0]?.type]}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{rule.trigger_count} раз</Badge>
                      <Switch
                        checked={rule.is_active}
                        onCheckedChange={() => handleToggle(rule.id, rule.is_active)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Последние срабатывания
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentLogs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Нет срабатываний</p>
            ) : (
              <div className="space-y-3">
                {recentLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{log.rule_name}</p>
                      <span className="text-xs text-muted-foreground">
                        {format(log.triggered_at, 'HH:mm dd.MM')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {log.actions_executed.every((a) => a.success) ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm text-muted-foreground">
                        {log.actions_executed.length} действий
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Примеры использования
          </CardTitle>
          <CardDescription>Идеи для автоматизаций</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="font-medium">☀️ Утреннее напоминание</p>
              <p className="text-sm text-muted-foreground">
                Триггер: 8:00 → Действие: Уведомление "Доброе утро! Не забудьте выпить стакан воды"
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="font-medium">💪 После тренировки</p>
              <p className="text-sm text-muted-foreground">
                Триггер: Тренировка завершена → Действие: Уведомление "Отлично! Запишите приём пищи"
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="font-medium">🎯 Прогресс цели</p>
              <p className="text-sm text-muted-foreground">
                Триггер: Цель 50% → Действие: Уведомление "Половина пути пройдена!"
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="font-medium">⚠️ Истекающий продукт</p>
              <p className="text-sm text-muted-foreground">
                Триггер: Срок &lt; 7 дней → Действие: Уведомление "Проверьте срок годности"
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
