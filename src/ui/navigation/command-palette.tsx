'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/ui/components/command';
import { useAppStore } from '@/shared/hooks/use-app-store';
import {
  CreditCard,
  Settings,
  User,
  Target,
  Heart,
  Book,
  Dumbbell,
  Utensils,
  Sparkles,
} from 'lucide-react';

const navigationItems = [
  {
    group: 'Модули',
    items: [
      { icon: CreditCard, label: 'Финансы', value: 'finance', href: '/finance' },
      { icon: Utensils, label: 'Питание', value: 'nutrition', href: '/nutrition' },
      { icon: Dumbbell, label: 'Тренировки', value: 'workouts', href: '/workouts' },
      { icon: Target, label: 'Привычки', value: 'habits', href: '/habits' },
      { icon: Target, label: 'Цели', value: 'goals', href: '/goals' },
      { icon: Heart, label: 'Здоровье', value: 'health', href: '/health' },
      { icon: Book, label: 'Ум', value: 'mind', href: '/mind' },
      { icon: Sparkles, label: 'Красота', value: 'beauty', href: '/beauty' },
    ],
  },
  {
    group: 'Настройки',
    items: [
      { icon: User, label: 'Профиль', value: 'profile', href: '/settings/profile' },
      { icon: Settings, label: 'Настройки', value: 'settings', href: '/settings' },
    ],
  },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { setCommandPaletteOpen } = useAppStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    setCommandPaletteOpen(open);
  }, [open, setCommandPaletteOpen]);

  const handleSelect = (href: string) => {
    router.push(href);
    setOpen(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Введите команду или поиск..." />
      <CommandList>
        <CommandEmpty>Ничего не найдено.</CommandEmpty>
        {navigationItems.map((group) => (
          <CommandGroup key={group.group} heading={group.group}>
            {group.items.map((item) => (
              <CommandItem
                key={item.value}
                value={item.value}
                onSelect={() => handleSelect(item.href)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}

