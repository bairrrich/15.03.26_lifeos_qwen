'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  useCategories,
  useCreateCategory,
  useDeleteCategory,
} from '@/modules/finance/hooks';
import { Plus, Folder, FolderOpen, Trash2, ChevronRight, ChevronDown, RotateCcw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import type { Category } from '@/modules/finance/entities';
import { resetFinanceCategories } from '@/modules/finance/data/seed-init';
import { cn } from '@/lib/utils';
import { getCurrentUserId } from '@/shared/hooks/use-user-id';
import { PageTransition } from '@/components/ui/page-transition';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function FinanceCategoriesPage() {
  const { data: categories = [] } = useCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<string>('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedType, setSelectedType] = useState<'income' | 'expense'>('expense');
  const [selectedIcon, setSelectedIcon] = useState<string>('🍔');
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [deleteCategoryName, setDeleteCategoryName] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Предустановленные emoji для категорий
  const expenseIcons = [
    // Еда
    '🍔', '🍕', '🍟', '🌭', '🍿',
    // Транспорт
    '🚗', '🚕', '🚌', '🚲', '⛽',
    // Дом
    '🏠', '🏢', '🏪', '🏦', '🏥',
    // Покупки
    '🛍️', '🛒', '🎁', '💎', '👕',
    // Финансы
    '💵', '💳', '💰', '📊', '🏦',
    // Развлечения
    '🎬', '🎮', '🎵', '⚽', '🎉',
    // Здоровье
    '💊', '🏋️', '🧘', '💉', '🦷',
    // Образование
    '📚', '🎓', '✏️', '📝', '🎨',
    // Технологии
    '💻', '📱', '⌚', '📷', '🎧',
    // Природа
    '🌟', '⚡', '🔥', '💡', '🌈',
  ];
  const incomeIcons = ['💼', '🏢', '📈', '🎁', '💸', '💰', '🏆', '🌟', '📊', '💎', '💵', '💳', '🏅', '🎯', '🚀'];

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Добавляем выбранную иконку к названию
    const nameWithIcon = `${selectedIcon} ${formData.get('name')}`;
    const userId = getCurrentUserId();

    createCategory.mutate(
      {
        name: nameWithIcon,
        type: formData.get('type') as 'income' | 'expense',
        color: formData.get('color') as string || '#6366f1',
        parent_id: selectedParent || undefined,
        user_id: userId,
      },
      {
        onSuccess: () => {
          toast.success('Категория создана');
          setDialogOpen(false);
          setSelectedParent('');
          setIconPickerOpen(false);
        },
        onError: () => {
          toast.error('Ошибка при создании категории');
        },
      }
    );
  };

  // Закрытие попапа при клике вне
  useEffect(() => {
    const handleClickOutside = () => {
      if (iconPickerOpen) {
        setIconPickerOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [iconPickerOpen]);

  const handleDelete = (id: string, name: string) => {
    setDeleteCategoryId(id);
    setDeleteCategoryName(name);
  };

  const confirmDelete = () => {
    if (deleteCategoryId) {
      deleteCategory.mutate(deleteCategoryId, {
        onSuccess: () => {
          toast.success('Категория удалена');
        },
        onError: () => {
          toast.error('Ошибка при удалении категории');
        },
      });
      setDeleteCategoryId(null);
      setDeleteCategoryName('');
    }
  };

  const handleResetSeed = () => {
    setShowResetConfirm(true);
  };

  const confirmResetSeed = async () => {
    await resetFinanceCategories();
    toast.success('Категории сброшены и пересозданы');
    setShowResetConfirm(false);
    window.location.reload();
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCategories(newExpanded);
  };

  // Построение дерева категорий
  const buildCategoryTree = (type: 'income' | 'expense') => {
    const typeCategories = categories.filter((c) => c.type === type);
    const rootCategories = typeCategories.filter((c) => !c.parent_id);

    const findChildren = (parentId: string): Category[] => {
      return typeCategories
        .filter((c) => c.parent_id === parentId)
        .map((child) => ({
          ...child,
          children: findChildren(child.id),
        }));
    };

    return rootCategories.map((root) => ({
      ...root,
      children: findChildren(root.id),
    }));
  };

  const incomeTree = buildCategoryTree('income');
  const expenseTree = buildCategoryTree('expense');

  const renderCategoryTree = (tree: Category[], level: number = 0) => {
    return tree.map((category) => (
      <div key={(category.id as string)}>
        <div
          className={cn(
            "flex items-center justify-between py-2 rounded-md transition-colors",
            level === 0
              ? "bg-muted/30 px-3 font-semibold"
              : "px-3 hover:bg-muted/50"
          )}
          style={{
            paddingLeft: level === 0 ? '12px' : `${level * 24 + 20}px`,
            borderLeft: level > 0 ? `2px solid ${category.color}` : 'none',
          }}
        >
          <div className="flex items-center gap-2">
            {category.children && category.children.length > 0 ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => toggleExpand(category.id)}
              >
                {expandedCategories.has(category.id) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            ) : (
              <span className="w-6" />
            )}
            {level === 0 ? (
              <FolderOpen className="h-4 w-4" style={{ color: category.color }} />
            ) : (
              <Folder className="h-3 w-3" style={{ color: category.color }} />
            )}
            <span className={level === 0 ? 'text-base' : 'text-sm'}>{category.name}</span>
            {level === 0 && (
              <Badge variant="secondary" className="text-xs">
                {category.children?.length || 0} подкатегорий
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={() => handleDelete(category.id, category.name)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        {expandedCategories.has(category.id) && category.children && (
          <div>{renderCategoryTree(category.children, level + 1)}</div>
        )}
      </div>
    ));
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-wrap gap-2 justify-end">
          <Button variant="destructive" size="sm" style={{ height: '32px' }} onClick={handleResetSeed}>
            <RotateCcw className="h-4 w-4 mr-2" />
            <span>Сбросить</span>
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button style={{ height: '32px' }}>
                <Plus className="mr-2 h-4 w-4" />
                <span>Добавить категорию</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreate}>
                <DialogHeader>
                  <DialogTitle>Новая категория</DialogTitle>
                  <DialogDescription>Добавьте новую категорию для транзакций</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Название</Label>
                    <Input name="name" placeholder="Например: Продукты" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type">Тип</Label>
                    <select
                      name="type"
                      defaultValue="expense"
                      onChange={(e) => {
                        setSelectedType(e.target.value as 'income' | 'expense');
                        setSelectedParent('');
                        setSelectedIcon(e.target.value === 'expense' ? '🍔' : '💼');
                      }}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="expense">Расход</option>
                      <option value="income">Доход</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Иконка</Label>
                      <div className="relative">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full justify-start"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIconPickerOpen(!iconPickerOpen);
                          }}
                        >
                          <span className="text-xl mr-2">{selectedIcon}</span>
                          <span className="text-sm">Выбрать</span>
                        </Button>
                        {iconPickerOpen && (
                          <div
                            className="fixed left-2 right-2 sm:absolute sm:left-0 sm:right-auto sm:w-auto sm:min-w-[400px] sm:max-w-[700px] top-auto sm:top-full z-50 mt-1 p-3 bg-popover border rounded-lg shadow-lg"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="grid grid-cols-[repeat(10,36px)] gap-0 max-h-80 overflow-y-auto justify-center">
                              {(selectedType === 'expense' ? expenseIcons : incomeIcons).map((icon, index) => (
                                <button
                                  key={`${icon}-${index}`}
                                  type="button"
                                  onClick={() => {
                                    setSelectedIcon(icon);
                                    setIconPickerOpen(false);
                                  }}
                                  className={cn(
                                    "flex h-9 w-9 items-center justify-center rounded-md text-lg transition-colors shrink-0",
                                    selectedIcon === icon
                                      ? "bg-primary text-primary-foreground"
                                      : "hover:bg-muted"
                                  )}
                                >
                                  {icon}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="color">Цвет</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          name="color"
                          type="color"
                          defaultValue="#6366f1"
                          className="w-16 h-10 p-1"
                        />
                        <span className="text-sm text-muted-foreground">
                          Выберите цвет
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="parent_id">Родительская категория (опционально)</Label>
                    <select
                      value={selectedParent}
                      onChange={(e) => setSelectedParent(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Без родительской</option>
                      {categories
                        .filter((c) => !c.parent_id && c.type === selectedType)
                        .map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                    </select>
                    <p className="text-xs text-muted-foreground">
                      Если выбрать родительскую категорию, будет создана подкатегория
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => {
                    setDialogOpen(false);
                    setSelectedParent('');
                    setSelectedIcon('🍔');
                    setIconPickerOpen(false);
                  }}>
                    Отмена
                  </Button>
                  <Button type="submit" disabled={createCategory.isPending}>
                    {createCategory.isPending ? 'Создание...' : 'Создать'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Income Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-green-600" />
              Категории доходов
            </CardTitle>
            <CardDescription>Дерево категорий доходов</CardDescription>
          </CardHeader>
          <CardContent>
            {incomeTree.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Нет категорий доходов
              </p>
            ) : (
              <div className="space-y-1">
                {renderCategoryTree(incomeTree)}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expense Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5 text-red-600" />
              Категории расходов
            </CardTitle>
            <CardDescription>Дерево категорий расходов</CardDescription>
          </CardHeader>
          <CardContent>
            {expenseTree.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Нет категорий расходов
              </p>
            ) : (
              <div className="space-y-1">
                {renderCategoryTree(expenseTree)}
              </div>
            )}
          </CardContent>
        </Card>

        <AlertDialog open={!!deleteCategoryId} onOpenChange={() => setDeleteCategoryId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Удаление категории</AlertDialogTitle>
              <AlertDialogDescription>
                Вы уверены, что хотите удалить категорию "{deleteCategoryName}"? Подкатегории также будут удалены.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>Удалить</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Сброс категорий
              </AlertDialogTitle>
              <AlertDialogDescription>
                Это УДАЛИТ ВСЕ категории и создаст их заново с правильной иерархией. Продолжить?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction onClick={confirmResetSeed}>Продолжить</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageTransition>
  );
}
