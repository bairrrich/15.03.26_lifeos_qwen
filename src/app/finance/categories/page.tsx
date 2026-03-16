'use client';

import { useState } from 'react';
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
import { Plus, Folder, FolderOpen, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import type { Category } from '@/modules/finance/entities';

export default function FinanceCategoriesPage() {
  const { data: categories = [] } = useCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<string>('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    createCategory.mutate(
      {
        name: formData.get('name') as string,
        type: formData.get('type') as 'income' | 'expense',
        color: formData.get('color') as string || '#6366f1',
        parent_id: selectedParent || undefined,
        user_id: 'current-user',
      },
      {
        onSuccess: () => {
          toast.success('Категория создана');
          setDialogOpen(false);
          setSelectedParent('');
        },
        onError: () => {
          toast.error('Ошибка при создании категории');
        },
      }
    );
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Вы уверены, что хотите удалить категорию "${name}"? Подкатегории также будут удалены.`)) {
      deleteCategory.mutate(id, {
        onSuccess: () => {
          toast.success('Категория удалена');
        },
        onError: () => {
          toast.error('Ошибка при удалении категории');
        },
      });
    }
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

  const renderCategoryTree = (tree: any[], level: number = 0) => {
    return tree.map((category) => (
      <div key={category.id}>
        <div
          className="flex items-center justify-between py-2 px-3 hover:bg-muted/50 rounded-md"
          style={{ paddingLeft: `${level * 24 + 12}px` }}
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
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            <span className="font-medium">{category.name}</span>
            {category.parent_id && (
              <Badge variant="secondary" className="text-xs">
                Подкатегория
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
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-wrap gap-2 justify-end">
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
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="expense">Расход</option>
                    <option value="income">Доход</option>
                  </select>
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
                      .filter((c) => !c.parent_id)
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
                <div className="grid gap-2">
                  <Label htmlFor="color">Цвет</Label>
                  <Input name="color" type="color" defaultValue="#6366f1" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); setSelectedParent(''); }}>
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

      {/* Info */}
      <Card>
        <CardHeader>
          <CardTitle>Как использовать иерархию</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• <strong>Корневые категории</strong> — основные группы (например, "Еда", "Транспорт")</p>
          <p>• <strong>Подкатегории</strong> — детализация (например, "Продукты", "Рестораны" внутри "Еда")</p>
          <p>• При выборе категории для транзакции можно выбрать как корневую, так и подкатегорию</p>
          <p>• При удалении родительской категории все подкатегории также будут удалены</p>
        </CardContent>
      </Card>
    </div>
  );
}
