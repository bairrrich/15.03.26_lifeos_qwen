'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppStore } from '@/shared/hooks/use-app-store';
import { Plus, DollarSign, Target, BookOpen, Utensils, Dumbbell } from 'lucide-react';
import { toast } from 'sonner';
import { TouchButton, useIsMobile } from '@/components/ui/touch-targets';
import { BottomSheet } from '@/components/ui/bottom-sheet';

export function QuickAdd() {
  const [open, setOpen] = useState(false);
  const [fabExpanded, setFabExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('finance');
  const [selectValue, setSelectValue] = useState('finance'); // Local state for select
  const { setQuickAddOpen } = useAppStore();
  const isMobile = useIsMobile();

  // Form states
  const [financeData, setFinanceData] = useState({
    type: '',
    amount: '',
    description: ''
  });
  const [habitData, setHabitData] = useState({
    name: '',
    frequency: ''
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Offline-first state
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSync, setPendingSync] = useState<any[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);

  // Tab options for mobile select
  const tabOptions = [
    { value: 'finance', label: '💰 Финансы' },
    { value: 'habit', label: '🎯 Привычка' },
    { value: 'food', label: '🥗 Питание' },
    { value: 'workout', label: '💪 Тренировка' },
    { value: 'book', label: '📚 Книга' },
    { value: 'goal', label: '🏆 Цель' }
  ];



  // Quick actions for morphing FAB
  const quickActions = [
    {
      id: 'expense',
      icon: '💸',
      label: 'Расход',
      action: () => {
        setFinanceData({ type: 'expense', amount: '', description: '' });
        setActiveTab('finance');
        setOpen(true);
        setFabExpanded(false);
      }
    },
    {
      id: 'income',
      icon: '💰',
      label: 'Доход',
      action: () => {
        setFinanceData({ type: 'income', amount: '', description: '' });
        setActiveTab('finance');
        setOpen(true);
        setFabExpanded(false);
      }
    },
    {
      id: 'habit',
      icon: '🎯',
      label: 'Привычка',
      action: () => {
        setHabitData({ name: '', frequency: '' });
        setActiveTab('habit');
        setOpen(true);
        setFabExpanded(false);
      }
    },
    {
      id: 'food',
      icon: '🥗',
      label: 'Еда',
      action: () => {
        setActiveTab('food');
        setOpen(true);
        setFabExpanded(false);
      }
    }
  ];

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    setQuickAddOpen(isOpen);
  };

  const validateForm = (tab: string, data: any) => {
    const newErrors: Record<string, string> = {};

    switch (tab) {
      case 'finance':
        if (!data.type) newErrors.type = 'Выберите тип транзакции';
        if (!data.amount || parseFloat(data.amount) <= 0) newErrors.amount = 'Введите корректную сумму';
        if (!data.description.trim()) newErrors.description = 'Введите описание';
        break;
      case 'habit':
        if (!data.name.trim()) newErrors.name = 'Введите название привычки';
        if (!data.frequency) newErrors.frequency = 'Выберите частоту';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enhanced add function with offline support
  const handleAddOffline = (type: string, tab: string, data: any) => {
    if (!validateForm(tab, data)) {
      return;
    }

    const record = {
      id: Date.now().toString(),
      type,
      tab,
      data,
      timestamp: Date.now(),
      synced: false
    };

    if (isOnline) {
      // Online: try to save immediately
      console.log('Saving online:', record);
      toast.success(`${type} добавлен!`);
    } else {
      // Offline: add to pending sync
      const newPending = [...pendingSync, record];
      setPendingSync(newPending);
      localStorage.setItem('lifeos_pending_sync', JSON.stringify(newPending));
      toast.success(`${type} сохранен для синхронизации`);
    }

    handleOpenChange(false);

    // Reset form data
    if (tab === 'finance') {
      setFinanceData({ type: '', amount: '', description: '' });
    } else if (tab === 'habit') {
      setHabitData({ name: '', frequency: '' });
    }
    setErrors({});
  };

  // Offline-first functionality
  useEffect(() => {
    // Load data from localStorage
    const loadOfflineData = () => {
      try {
        const savedData = localStorage.getItem('lifeos_quickadd_data');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          setFinanceData({
            type: parsed.financeData?.type || '',
            amount: parsed.financeData?.amount || '',
            description: parsed.financeData?.description || ''
          });
          setHabitData({
            name: parsed.habitData?.name || '',
            frequency: parsed.habitData?.frequency || ''
          });
        }

        const pending = localStorage.getItem('lifeos_pending_sync');
        if (pending) {
          setPendingSync(JSON.parse(pending));
        }

        const lastSync = localStorage.getItem('lifeos_last_sync');
        if (lastSync) {
          setLastSyncTime(parseInt(lastSync));
        }
      } catch (error) {
        console.error('Failed to load offline data:', error);
      }
    };

    // Online/offline detection
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingData();
    };
    const handleOffline = () => setIsOnline(false);

    // Load initial data
    loadOfflineData();

    // Setup online/offline listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Separate effect for saving data changes
  useEffect(() => {
    const saveOfflineData = () => {
      try {
        const dataToSave = {
          financeData,
          habitData,
          timestamp: Date.now()
        };
        localStorage.setItem('lifeos_quickadd_data', JSON.stringify(dataToSave));
      } catch (error) {
        console.error('Failed to save offline data:', error);
      }
    };

    // Debounced save to avoid too frequent writes
    const timeoutId = setTimeout(saveOfflineData, 1000);
    return () => clearTimeout(timeoutId);
  }, [financeData, habitData]);

  // Sync select value with active tab
  useEffect(() => {
    setSelectValue(activeTab);
  }, [activeTab]);

  // Sync pending data when online
  const syncPendingData = async () => {
    if (pendingSync.length === 0) return;

    try {
      // Here we would sync with real API
      console.log('Syncing pending data:', pendingSync);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setPendingSync([]);
      setLastSyncTime(Date.now());
      localStorage.removeItem('lifeos_pending_sync');
      localStorage.setItem('lifeos_last_sync', Date.now().toString());

      toast.success(`Синхронизировано ${pendingSync.length} записей`);
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error('Ошибка синхронизации');
    }
  };

  // Render form content based on active tab
  const renderFormContent = () => {
    switch (activeTab) {
      case 'finance':
        return (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Тип</Label>
              <select
                value={financeData.type}
                onChange={(e) => setFinanceData(prev => ({ ...prev, type: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Выберите тип транзакции</option>
                <option value="expense">💸 Расход</option>
                <option value="income">💰 Доход</option>
              </select>
              {errors.type && <span className="text-sm text-destructive">{errors.type}</span>}
            </div>
            <div className="grid gap-2">
              <Label>Сумма</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={financeData.amount}
                onChange={(e) => setFinanceData(prev => ({ ...prev, amount: e.target.value }))}
              />
              {errors.amount && <span className="text-sm text-destructive">{errors.amount}</span>}
            </div>
            <div className="grid gap-2">
              <Label>Описание</Label>
              <Input
                placeholder="Например: Продукты"
                value={financeData.description}
                onChange={(e) => setFinanceData(prev => ({ ...prev, description: e.target.value }))}
              />
              {errors.description && <span className="text-sm text-destructive">{errors.description}</span>}
            </div>
            <Button onClick={() => handleAddOffline('Транзакция', 'finance', financeData)} className="w-full">
              {isOnline ? 'Добавить транзакцию' : '💾 Сохранить (оффлайн)'}
            </Button>
          </div>
        );

      case 'habit':
        return (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Название</Label>
              <Input
                placeholder="Например: Чтение книг"
                value={habitData.name}
                onChange={(e) => setHabitData(prev => ({ ...prev, name: e.target.value }))}
              />
              {errors.name && <span className="text-sm text-destructive">{errors.name}</span>}
            </div>
            <div className="grid gap-2">
              <Label>Частота</Label>
              <select
                value={habitData.frequency}
                onChange={(e) => setHabitData(prev => ({ ...prev, frequency: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Выберите частоту</option>
                <option value="daily">📅 Ежедневно</option>
                <option value="weekly">📆 Еженедельно</option>
                <option value="monthly">📊 Ежемесячно</option>
              </select>
              {errors.frequency && <span className="text-sm text-destructive">{errors.frequency}</span>}
            </div>
            <Button onClick={() => handleAddOffline('Привычка', 'habit', habitData)} className="w-full">
              {isOnline ? 'Создать привычку' : '💾 Сохранить (оффлайн)'}
            </Button>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Название</Label>
              <Input placeholder="Введите название" value="" />
            </div>
            <Button onClick={() => handleAddOffline('Запись', activeTab, {})} className="w-full">
              {isOnline ? 'Добавить запись' : '💾 Сохранить (оффлайн)'}
            </Button>
          </div>
        );
    }
  };

  return (
    <>
      {/* Morphing Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {fabExpanded ? (
          <div className="flex flex-col items-end gap-3">
            {quickActions.map((action, index) => (
              <div
                key={action.id}
                className="flex items-center gap-3 animate-in slide-in-from-right-full duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="bg-black/80 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap">
                  {action.label}
                </div>
                <TouchButton
                  touchFriendly
                  className="h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-110"
                  onClick={action.action}
                >
                  <span className="text-lg">{action.icon}</span>
                </TouchButton>
              </div>
            ))}
            <TouchButton
              touchFriendly
              className="h-14 w-14 rounded-full shadow-lg bg-muted hover:bg-muted/90 transition-all duration-200 hover:scale-110"
              onClick={() => setFabExpanded(false)}
            >
              <span className="text-xl">✕</span>
            </TouchButton>
          </div>
        ) : (
          <div className="relative">
            <TouchButton
              touchFriendly
              className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 active:scale-95"
              onClick={() => setOpen(true)}
              onContextMenu={(e) => {
                e.preventDefault();
                setFabExpanded(true);
              }}
            >
              <Plus className="h-6 w-6 transition-transform group-hover:rotate-90 duration-200" />
            </TouchButton>
            {/* Hint for long press */}
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
              Удерживайте для быстрого меню
            </div>
          </div>
        )}
      </div>

      {isMobile ? (
        <BottomSheet
          isOpen={open}
          onClose={() => handleOpenChange(false)}
          title="Быстрое добавление"
        >
          {/* Offline indicator */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-orange-500'}`} />
              <span className="text-sm text-muted-foreground">
                {isOnline ? 'Онлайн' : 'Оффлайн'}
              </span>
            </div>
            {pendingSync.length > 0 && (
              <div className="flex items-center gap-1 text-sm text-orange-600">
                <span>⏳</span>
                <span>{pendingSync.length} на синхронизацию</span>
              </div>
            )}
            {lastSyncTime && (
              <div className="text-xs text-muted-foreground">
                Синхр.: {new Date(lastSyncTime).toLocaleTimeString()}
              </div>
            )}
          </div>
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">Выберите тип записи и заполните данные</p>

            {/* Mobile tab selector */}
            <div className="mb-6">
              <Label className="text-sm font-medium">Тип записи</Label>
              <select
                value={selectValue}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setSelectValue(newValue);
                  setActiveTab(newValue);
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-2"
              >
                {tabOptions.map((tab) => (
                  <option key={tab.value} value={tab.value}>
                    {tab.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Conditional form content */}
            {renderFormContent()}
          </div>
        </BottomSheet>
      ) : (
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">Быстрое добавление</DialogTitle>
              <DialogDescription>
                Выберите тип записи и заполните данные
              </DialogDescription>
              {/* Offline indicator */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-orange-500'}`} />
                  <span className="text-sm text-muted-foreground">
                    {isOnline ? 'Онлайн' : 'Оффлайн'}
                  </span>
                </div>
                {pendingSync.length > 0 && (
                  <div className="flex items-center gap-1 text-sm text-orange-600">
                    <span>⏳</span>
                    <span>{pendingSync.length} на синхронизацию</span>
                  </div>
                )}
                {lastSyncTime && (
                  <div className="text-xs text-muted-foreground">
                    Синхр.: {new Date(lastSyncTime).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </DialogHeader>

            <div className="space-y-6">

              {/* Desktop tabs remain as they were */}
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">Все доступные категории:</div>
                <div className="grid grid-cols-3 gap-2">
                  {tabOptions.map((tab) => (
                    <Button
                      key={tab.value}
                      variant={activeTab === tab.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        // Small delay to prevent dropdown from closing immediately
                        setTimeout(() => setActiveTab(tab.value), 10);
                      }}
                      className="justify-start"
                    >
                      {tab.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Conditional form content */}
              {renderFormContent()}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
