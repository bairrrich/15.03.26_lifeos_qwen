'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  NotificationService,
  type NotificationPermission,
} from '@/core/notifications/notification-service';

interface UseNotificationOptions {
  autoRequest?: boolean;
  onPermissionChange?: (permission: NotificationPermission) => void;
}

export function useNotification(options: UseNotificationOptions = {}) {
  const { onPermissionChange } = options;
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>({
    granted: false,
    denied: false,
    default: true,
  });

  useEffect(() => {
    setIsSupported(NotificationService.isSupported());

    setPermission(NotificationService.getPermissionStatus());
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    const granted = await NotificationService.requestPermission();
    setPermission(NotificationService.getPermissionStatus());
    return granted;
  }, [isSupported]);

  useEffect(() => {
    onPermissionChange?.(permission);
  }, [permission, onPermissionChange]);

  const sendNotification = useCallback(
    async (title: string, body: string, icon?: string): Promise<Notification | null> => {
      if (!isSupported) return null;

      return NotificationService.send({ title, body, icon });
    },
    [isSupported]
  );

  const sendHabitReminder = useCallback(async (habitName: string) => {
    return NotificationService.sendHabitReminder(habitName);
  }, []);

  const sendWorkoutReminder = useCallback(async (workoutName: string) => {
    return NotificationService.sendWorkoutReminder(workoutName);
  }, []);

  const sendWaterReminder = useCallback(async () => {
    return NotificationService.sendWaterReminder();
  }, []);

  const sendGoalProgress = useCallback(async (goalName: string, progress: number) => {
    return NotificationService.sendGoalProgress(goalName, progress);
  }, []);

  const sendProductExpiryAlert = useCallback(async (productName: string, daysLeft: number) => {
    return NotificationService.sendProductExpiryAlert(productName, daysLeft);
  }, []);

  const sendAchievement = useCallback(async (achievementName: string) => {
    return NotificationService.sendAchievement(achievementName);
  }, []);

  return {
    isSupported,
    permission,
    requestPermission,
    sendNotification,
    sendHabitReminder,
    sendWorkoutReminder,
    sendWaterReminder,
    sendGoalProgress,
    sendProductExpiryAlert,
    sendAchievement,
  };
}
