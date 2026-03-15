'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { useFamily, useFamilyMembers, useCreateFamily, useCreateInvitation, useRemoveMember } from '@/modules/sharing/hooks'
import { Plus, Users, Mail, Shield, UserX, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

const roleLabels: Record<string, string> = {
  owner: 'Владелец',
  admin: 'Администратор',
  member: 'Участник',
  child: 'Ребёнок',
}

const roleColors: Record<string, string> = {
  owner: 'bg-purple-500',
  admin: 'bg-blue-500',
  member: 'bg-green-500',
  child: 'bg-yellow-500',
}

export default function SharingPage() {
  const { data: families = [] } = useFamily()
  const currentFamily = families[0]
  const { data: members = [] } = useFamilyMembers(currentFamily?.id)
  const createFamily = useCreateFamily()
  const createInvitation = useCreateInvitation()
  const removeMember = useRemoveMember()

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCreateFamily = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    createFamily.mutate(
      {
        name: formData.get('name') as string,
        description: formData.get('description') as string || undefined,
        owner_id: 'current-user',
        user_id: 'current-user',
        settings: {
          require_approval: true,
          default_share_scope: 'all',
        },
      },
      {
        onSuccess: () => {
          toast.success('Семья создана')
        },
        onError: () => {
          toast.error('Ошибка при создании')
        },
      }
    )
  }

  const handleInvite = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    if (!currentFamily) return

    createInvitation.mutate(
      {
        family_id: currentFamily.id,
        email: formData.get('email') as string,
        invited_by: 'current-user',
        invited_by_name: 'Вы',
        role: formData.get('role') as any,
        share_scope: ['all'],
      },
      {
        onSuccess: () => {
          toast.success('Приглашение отправлено')
          setInviteDialogOpen(false)
        },
        onError: () => {
          toast.error('Ошибка при отправке')
        },
      }
    )
  }

  const handleRemove = (memberId: string, memberName: string) => {
    if (confirm(`Удалить ${memberName} из семьи?`)) {
      removeMember.mutate(memberId, {
        onSuccess: () => {
          toast.success('Участник удалён')
        },
      })
    }
  }

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/invite/${token}`
    navigator.clipboard.writeText(link)
    setCopiedId(token)
    setTimeout(() => setCopiedId(null), 2000)
    toast.success('Ссылка скопирована')
  }

  if (!currentFamily) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Семейный доступ</h1>
          <p className="text-muted-foreground">Делитесь данными с членами семьи</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Создать семью</CardTitle>
            <CardDescription>Создайте семейную группу для общего доступа к данным</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateFamily} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Название семьи</Label>
                <Input id="name" name="name" placeholder="Например: Семья Ивановых" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Описание (опционально)</Label>
                <Input id="description" name="description" placeholder="Краткое описание" />
              </div>
              <Button type="submit">
                <Plus className="mr-2 h-4 w-4" />
                Создать семью
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Как это работает</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">1</div>
              <div>
                <p className="font-medium">Создайте семью</p>
                <p className="text-sm text-muted-foreground">Задайте название и пригласите участников</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">2</div>
              <div>
                <p className="font-medium">Пригласите участников</p>
                <p className="text-sm text-muted-foreground">Отправьте приглашения по email или ссылке</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">3</div>
              <div>
                <p className="font-medium">Настройте доступ</p>
                <p className="text-sm text-muted-foreground">Выберите какие данные будут общими</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{currentFamily.name}</h1>
          <p className="text-muted-foreground">Управление семейным доступом</p>
        </div>
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Mail className="mr-2 h-4 w-4" />
              Пригласить
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleInvite}>
              <DialogHeader>
                <DialogTitle>Пригласить участника</DialogTitle>
                <DialogDescription>
                  Отправьте приглашение по email
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input name="email" type="email" placeholder="user@example.com" required />
                </div>
                <div className="grid gap-2">
                  <Label>Роль</Label>
                  <select
                    name="role"
                    defaultValue="member"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {Object.entries(roleLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setInviteDialogOpen(false)}>Отмена</Button>
                <Button type="submit">Отправить</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Участников</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Приглашений</CardTitle>
            <Mail className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Общих данных</CardTitle>
            <Shield className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Участники</CardTitle>
          <CardDescription>Члены вашей семьи</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="" />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={roleColors[member.role]}>
                    {roleLabels[member.role]}
                  </Badge>
                  {member.role !== 'owner' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(member.id, member.name)}
                    >
                      <UserX className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {members.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Нет участников</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Пригласительные ссылки</CardTitle>
          <CardDescription>Поделитесь ссылкой для быстрого вступления</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div>
                <p className="font-medium">Основная ссылка</p>
                <p className="text-sm text-muted-foreground">Действует бессрочно</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyInviteLink('main-invite-token')}
              >
                {copiedId === 'main-invite-token' ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                Копировать
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
