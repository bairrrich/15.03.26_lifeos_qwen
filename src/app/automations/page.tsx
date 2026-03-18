'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/components/card'
import { Button } from '@/ui/components/button'
import { Input } from '@/ui/components/input'
import { Label } from '@/ui/components/label'
import { Switch } from '@/ui/components/switch'
import { Badge } from '@/ui/components/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/ui/components/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/components/select'
import { useActiveAutomations, useCreateAutomation, useToggleAutomation, useRecentAutomationLogs } from '@/modules/automations/hooks'
import { getCurrentUserId } from '@/shared/hooks/use-user-id'
import { Plus, Zap, Clock, CheckCircle2, XCircle, Activity } from 'lucide-react'
import { toast } from 'sonner'
import { PageTransition } from '@/ui/components/page-transition';
import { format } from 'date-fns'
import type { TriggerType, ActionType, AutomationLog } from '@/modules/automations/entities'
import { EmptyAutomations } from '@/ui/components/empty-state-variants'
import { TouchButton, useIsMobile } from '@/ui/components/touch-targets'

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
  const isMobile = useIsMobile()
  const [selectedTriggerType, setSelectedTriggerType] = useState<string>('time_of_day')
  const [selectedActionType, setSelectedActionType] = useState<string>('send_notification')

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const userId = getCurrentUserId()

    createAutomation.mutate(
      {
        name: formData.get('name') as string,
        description: formData.get('description') as string || undefined,
        trigger: {
          type: selectedTriggerType as TriggerType,
          config: {},
        },
        actions: [
          {
            type: selectedActionType as ActionType,
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
          setSelectedTriggerType('time_of_day') // Reset for next use
          setSelectedActionType('send_notification') // Reset for next use
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
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2 justify-end">
          <TouchButton touchFriendly size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            <span>Создать правило</span>
          </TouchButton>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                    <Select value={selectedTriggerType} onValueChange={(value: string | null) => setSelectedTriggerType(value || 'time_of_day')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите триггер" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(triggerLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Действие</Label>
                    <Select value={selectedActionType} onValueChange={(value: string | null) => setSelectedActionType(value || 'send_notification')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите действие" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(actionLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                <EmptyAutomations onAction={() => setDialogOpen(true)} />
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
                <div className="text-center py-8">
                  <Activity className="mx-auto h-8 w-8 text-muted-foreground mb-2 opacity-50" />
                  <p className="text-muted-foreground">Нет срабатываний</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentLogs.map((log: AutomationLog) => (
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
    </PageTransition>
  )
}

