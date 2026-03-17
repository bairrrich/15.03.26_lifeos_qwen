'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Вынесено в отдельную функцию для соблюдения purity правил React
function getExpiringProducts(products: Array<{ expiry_date?: number }>) {
  const now = Date.now();
  const monthFromNow = now + 30 * 24 * 60 * 60 * 1000;
  return products.filter((p) => p.expiry_date && p.expiry_date <= monthFromNow);
}
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useBeautyProducts,
  useActiveBeautyRoutines,
  useCreateBeautyProduct,
  useLatestSkinAnalysis,
} from '@/modules/beauty/hooks';
import { getCurrentUserId } from '@/shared/hooks/use-user-id';
import { Plus, Sparkles, Droplets, Calendar, Star, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { PageTransition } from '@/components/ui/page-transition';
import { BeautyProduct } from '@/modules/beauty/entities';
import { StatCard } from '@/components/ui/stat-card';
import { EmptyBeauty, EmptyRoutines } from '@/components/ui/empty-state-variants';
import { TouchButton, useIsMobile } from '@/components/ui/touch-targets';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useSwipeGesture } from '@/hooks/use-swipe-gesture';

const categoryLabels: Record<string, string> = {
  skincare: 'Уход за кожей',
  haircare: 'Уход за волосами',
  makeup: 'Макияж',
  fragrance: 'Парфюм',
  body: 'Уход за телом',
  other: 'Другое',
};

const skinTypeLabels: Record<string, string> = {
  dry: 'Сухая',
  oily: 'Жирная',
  normal: 'Нормальная',
  combination: 'Комбинированная',
  sensitive: 'Чувствительная',
};

export default function BeautyPage() {
  const { data: products = [], isLoading: productsLoading } = useBeautyProducts();
  const { data: routines = [], isLoading: routinesLoading } = useActiveBeautyRoutines();
  const { data: latestAnalysis, isLoading: analysisLoading } = useLatestSkinAnalysis();
  const createProduct = useCreateBeautyProduct();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'routines' | 'analysis'>('products');
  const [selectedCategory, setSelectedCategory] = useState<string>('skincare');
  const isMobile = useIsMobile();

  const favorites = useMemo(() => products.filter((p) => p.is_favorite), [products]);
  const expiring = useMemo(() => getExpiringProducts(products), [products]);

  const handleCreateProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const userId = getCurrentUserId();

    createProduct.mutate(
      {
        name: formData.get('name') as string,
        brand: (formData.get('brand') as string) || undefined,
        category: selectedCategory as BeautyProduct['category'],
        type: formData.get('type') as string,
        purchase_date: Date.now(),
        is_favorite: false,
        is_empty: false,
        user_id: userId,
      },
      {
        onSuccess: () => {
          toast.success('Продукт добавлен');
          setDialogOpen(false);
          setSelectedCategory('skincare'); // Reset for next use
        },
        onError: () => {
          toast.error('Ошибка при добавлении');
        },
      }
    );
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2 justify-end">
          <TouchButton touchFriendly size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            <span>Добавить продукт</span>
          </TouchButton>

          {isMobile ? (
            <BottomSheet
              isOpen={dialogOpen}
              onClose={() => setDialogOpen(false)}
              title="Новый продукт"
            >
              <form onSubmit={handleCreateProduct}>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Добавьте косметический продукт</p>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Название</Label>
                      <Input name="name" required />
                    </div>
                    <div className="grid gap-2">
                      <Label>Бренд</Label>
                      <Input name="brand" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Категория</Label>
                      <Select value={selectedCategory} onValueChange={(value: string | null) => setSelectedCategory(value || 'skincare')}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите категорию" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(categoryLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Тип</Label>
                      <Input name="type" placeholder="Например: увлажняющий крем" />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Отмена
                    </Button>
                    <Button type="submit">Добавить</Button>
                  </div>
                </div>
              </form>
            </BottomSheet>
          ) : (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent>
                <form onSubmit={handleCreateProduct}>
                  <DialogHeader>
                    <DialogTitle>Новый продукт</DialogTitle>
                    <DialogDescription>Добавьте косметический продукт</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Название</Label>
                      <Input name="name" required />
                    </div>
                    <div className="grid gap-2">
                      <Label>Бренд</Label>
                      <Input name="brand" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Категория</Label>
                      <Select value={selectedCategory} onValueChange={(value: string | null) => setSelectedCategory(value || 'skincare')}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите категорию" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(categoryLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Тип</Label>
                      <Input name="type" placeholder="Например: увлажняющий крем" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Отмена
                    </Button>
                    <Button type="submit">Добавить</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="Всего продуктов"
            value={products.length}
            icon={Sparkles}
            isLoading={productsLoading}
          />
          <StatCard
            title="Избранное"
            value={favorites.length}
            icon={Star}
            isLoading={productsLoading}
          />
          <StatCard
            title="Истекает"
            value={expiring.length}
            icon={AlertTriangle}
            isLoading={productsLoading}
          />
          <StatCard
            title="Рутин"
            value={routines.length}
            icon={Calendar}
            isLoading={routinesLoading}
          />
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) =>
            setActiveTab(v)
          }
        >
          <TabsList className="grid grid-cols-3 gap-2">
            <TabsTrigger value="products">Продукты</TabsTrigger>
            <TabsTrigger value="routines">Рутины</TabsTrigger>
            <TabsTrigger value="analysis">Анализ кожи</TabsTrigger>
          </TabsList>
          <TabsContent value="products" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {products.length === 0 ? (
                <div className="col-span-full">
                  <EmptyBeauty onAction={() => setDialogOpen(true)} />
                </div>
              ) : (
                products.map((product) => (
                  <Card key={product.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{product.name}</CardTitle>
                          {product.brand && <CardDescription>{product.brand}</CardDescription>}
                        </div>
                        {product.is_favorite && (
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{categoryLabels[product.category]}</Badge>
                        {product.expiry_date && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(product.expiry_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
          <TabsContent value="routines" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {routines.length === 0 ? (
                <div className="col-span-full">
                  <EmptyRoutines />
                </div>
              ) : (
                routines.map((routine) => (
                  <Card key={routine.id}>
                    <CardHeader>
                      <CardTitle>{routine.name}</CardTitle>
                      {routine.description && (
                        <CardDescription>{routine.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {routine.steps.map((step, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs">
                              {step.order}
                            </span>
                            <span>{step.action}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
          <TabsContent value="analysis" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5" />
                  Последний анализ кожи
                </CardTitle>
              </CardHeader>
              <CardContent>
                {latestAnalysis ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Тип кожи</p>
                        <p className="font-medium">{skinTypeLabels[latestAnalysis.skin_type]}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Дата</p>
                        <p className="font-medium">
                          {new Date(latestAnalysis.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {latestAnalysis.concerns.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Проблемы</p>
                        <div className="flex flex-wrap gap-2">
                          {latestAnalysis.concerns.map((concern, i) => (
                            <Badge key={i} variant="outline">
                              {concern}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Увлажнённость</p>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`h-2 w-4 rounded ${level <= (latestAnalysis.hydration_level || 0)
                                ? 'bg-blue-500'
                                : 'bg-muted'
                                }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Чувствительность</p>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`h-2 w-4 rounded ${level <= (latestAnalysis.sensitivity_level || 0)
                                ? 'bg-red-500'
                                : 'bg-muted'
                                }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <Clock className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p>Нет данных анализа кожи</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}
