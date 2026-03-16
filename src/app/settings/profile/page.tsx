'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppStore } from '@/shared/hooks/use-app-store';
import { User, Mail, Camera, Save, X, Target, Calendar, Award } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);

  // Демо данные профиля (в реальности загружать из бэкенда)
  const [profile, setProfile] = useState({
    name: 'Пользователь',
    email: 'user@example.com',
    bio: 'Добро пожаловать в LifeOS!',
    avatar: '',
    location: '',
    website: '',
    goals: 'Здоровье, Финансы, Саморазвитие',
    joinedDate: new Date().toLocaleDateString('ru-RU'),
  });

  const [formData, setFormData] = useState(profile);

  const handleSave = () => {
    setProfile(formData);
    setIsEditing(false);
    toast.success('Профиль обновлён');
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions - пустой блок для единообразия */}
      <div className="flex flex-wrap gap-2 justify-end"></div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Левая колонка - Аватар и основная информация */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="relative inline-block">
              <Avatar className="h-32 w-32">
                <AvatarImage src={profile.avatar} alt={profile.name} />
                <AvatarFallback className="text-2xl">{getInitials(profile.name)}</AvatarFallback>
              </Avatar>
              {isEditing && (
                <label className="absolute bottom-0 right-0 p-2 bg-primary rounded-full cursor-pointer hover:bg-primary/90">
                  <Camera className="h-4 w-4 text-primary-foreground" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <CardTitle className="mt-4">{profile.name}</CardTitle>
            <CardDescription className="flex items-center justify-center gap-1">
              <Mail className="h-3 w-3" />
              {profile.email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>На сайте с {profile.joinedDate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="line-clamp-2">{profile.goals}</span>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-bold">0</p>
                <p className="text-xs text-muted-foreground">Проектов</p>
              </div>
              <div>
                <p className="text-lg font-bold">0</p>
                <p className="text-xs text-muted-foreground">Достижений</p>
              </div>
              <div>
                <p className="text-lg font-bold">0</p>
                <p className="text-xs text-muted-foreground">Дней</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Правая колонка - Форма редактирования */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Личная информация</CardTitle>
              <CardDescription>Измените данные вашего профиля</CardDescription>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>Редактировать</Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Отмена
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Сохранить
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Имя</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    value={isEditing ? formData.name : profile.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={isEditing ? formData.email : profile.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">О себе</Label>
              <Input
                id="bio"
                value={isEditing ? formData.bio : profile.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                disabled={!isEditing}
                placeholder="Расскажите немного о себе"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Город</Label>
                <Input
                  id="location"
                  value={isEditing ? formData.location : profile.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Москва, Россия"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Сайт</Label>
                <Input
                  id="website"
                  value={isEditing ? formData.website : profile.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  disabled={!isEditing}
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="goals">Цели в LifeOS</Label>
              <Input
                id="goals"
                value={isEditing ? formData.goals : profile.goals}
                onChange={(e) => handleChange('goals', e.target.value)}
                disabled={!isEditing}
                placeholder="Здоровье, Финансы, Саморазвитие"
              />
              <p className="text-xs text-muted-foreground">
                Укажите основные направления, над которыми хотите работать
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Уведомления</h4>
                  <p className="text-xs text-muted-foreground">
                    Получать уведомления о достижениях и напоминаниях
                  </p>
                </div>
                {/* Здесь будет переключатель уведомлений */}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Секция безопасности */}
      <Card>
        <CardHeader>
          <CardTitle>Безопасность</CardTitle>
          <CardDescription>Управление паролем и доступом</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <p className="font-medium">Пароль</p>
              <p className="text-sm text-muted-foreground">Последний раз изменён 30 дней назад</p>
            </div>
            <Button variant="outline" disabled>
              Изменить пароль
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <p className="font-medium">Двухфакторная аутентификация</p>
              <p className="text-sm text-muted-foreground">Дополнительная защита аккаунта</p>
            </div>
            <Button variant="outline" disabled>
              Включить
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Опасная зона */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Опасная зона</CardTitle>
          <CardDescription>Необратимые действия с аккаунтом</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Удалить аккаунт</p>
              <p className="text-sm text-muted-foreground">Все данные будут безвозвратно удалены</p>
            </div>
            <Button variant="destructive" disabled>
              Удалить аккаунт
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
