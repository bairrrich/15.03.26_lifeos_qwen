/**
 * Сервис для управления браузерными уведомлениями
 */
export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp?: number;
  data?: Record<string, unknown>;
}

export interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

export class NotificationService {
  private static readonly DEFAULT_ICON = '/icons/icon-192x192.png';
  private static readonly DEFAULT_BADGE = '/icons/icon-96x96.png';

  /**
   * Проверка поддержки уведомлений
   */
  static isSupported(): boolean {
    return 'Notification' in window;
  }

  /**
   * Получение текущего статуса разрешений
   */
  static getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) {
      return { granted: false, denied: false, default: false };
    }

    return {
      granted: Notification.permission === 'granted',
      denied: Notification.permission === 'denied',
      default: Notification.permission === 'default',
    };
  }

  /**
   * Запрос разрешения на уведомления
   */
  static async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  /**
   * Отправка уведомления
   */
  static async send(options: NotificationOptions): Promise<Notification | null> {
    if (!this.isSupported()) {
      console.warn('Notifications not supported');
      return null;
    }

    const permission = await this.requestPermission();
    if (!permission) {
      console.warn('Notification permission denied');
      return null;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || this.DEFAULT_ICON,
        badge: options.badge || this.DEFAULT_BADGE,
        tag: options.tag,
        requireInteraction: options.requireInteraction ?? false,
        silent: options.silent ?? false,
        data: options.data,
      });

      // Автозакрытие через 5 секунд для неважных уведомлений
      if (!options.requireInteraction) {
        setTimeout(() => notification.close(), 5000);
      }

      return notification;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return null;
    }
  }

  /**
   * Отправка уведомления о привычке
   */
  static async sendHabitReminder(habitName: string): Promise<Notification | null> {
    return this.send({
      title: '🎯 Время для привычки!',
      body: `Пора выполнить: ${habitName}`,
      tag: 'habit-reminder',
      requireInteraction: true,
      data: { type: 'habit', habitName },
    });
  }

  /**
   * Отправка уведомления о тренировке
   */
  static async sendWorkoutReminder(workoutName: string): Promise<Notification | null> {
    return this.send({
      title: '💪 Время тренировки!',
      body: `Запланировано: ${workoutName}`,
      tag: 'workout-reminder',
      requireInteraction: true,
      data: { type: 'workout', workoutName },
    });
  }

  /**
   * Отправка уведомления о воде
   */
  static async sendWaterReminder(): Promise<Notification | null> {
    return this.send({
      title: '💧 Не забудьте попить воды!',
      body: 'Поддерживайте водный баланс',
      tag: 'water-reminder',
      data: { type: 'water' },
    });
  }

  /**
   * Отправка уведомления о цели
   */
  static async sendGoalProgress(goalName: string, progress: number): Promise<Notification | null> {
    return this.send({
      title: '🏆 Прогресс цели!',
      body: `${goalName}: ${progress}% выполнено`,
      tag: 'goal-progress',
      data: { type: 'goal', goalName, progress },
    });
  }

  /**
   * Отправка уведомления о продукте (истекает срок)
   */
  static async sendProductExpiryAlert(
    productName: string,
    daysLeft: number
  ): Promise<Notification | null> {
    return this.send({
      title: '⚠️ Срок годности истекает',
      body: `${productName}: осталось ${daysLeft} дн.`,
      tag: 'product-expiry',
      requireInteraction: true,
      data: { type: 'product-expiry', productName, daysLeft },
    });
  }

  /**
   * Отправка уведомления о достижении
   */
  static async sendAchievement(achievementName: string): Promise<Notification | null> {
    return this.send({
      title: '🎉 Достижение разблокировано!',
      body: achievementName,
      tag: 'achievement',
      requireInteraction: true,
      data: { type: 'achievement', achievementName },
    });
  }

  /**
   * Планирование уведомления (через Service Worker)
   */
  static async scheduleNotification(
    options: NotificationOptions & { delay: number }
  ): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return;
    }

    const registration = await navigator.serviceWorker.ready;

    // Отправка сообщения в Service Worker
    registration.active?.postMessage({
      type: 'SCHEDULE_NOTIFICATION',
      payload: options,
    });
  }

  /**
   * Отмена всех запланированных уведомлений
   */
  static async cancelScheduledNotifications(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    registration.active?.postMessage({
      type: 'CANCEL_SCHEDULED_NOTIFICATIONS',
    });
  }
}

