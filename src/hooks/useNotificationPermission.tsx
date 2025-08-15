import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export const useNotificationPermission = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const { user } = useAuth();

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return 'denied';
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (permission === 'granted' && 'Notification' in window) {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
      
      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000);
      
      return notification;
    }
  };

  const scheduleDailyReminder = () => {
    if (permission !== 'granted' || !user) return;

    // Check if user has already checked in today
    const today = new Date().toISOString().split('T')[0];
    const hasCheckedToday = localStorage.getItem(`checked-${today}-${user.id}`);
    
    if (!hasCheckedToday) {
      // Send reminder if it's after 6 PM and they haven't checked in
      const now = new Date();
      const currentHour = now.getHours();
      
      if (currentHour >= 18) { // After 6 PM
        sendNotification('Daily Check-in Reminder', {
          body: 'Remember to check in with your discipline status for today!',
          tag: 'daily-reminder',
        });
      }
    }
  };

  return {
    permission,
    requestPermission,
    sendNotification,
    scheduleDailyReminder,
  };
};