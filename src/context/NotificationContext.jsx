import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { subscribeToNotifications } from '../services/realtimeClient';
import { sendAlertNotification, stopAlarm } from '../services/notificationService';
import apiClient from '../api/apiClient';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAlarmMuted, setIsAlarmMuted] = useState(false);
  const [activeAlarm, setActiveAlarm] = useState(false);

  useEffect(() => {
    if (!currentUser || (currentUser.role !== 'Supervisor' && currentUser.role !== 'Admin')) {
      return;
    }

    const loadUnread = async () => {
      try {
        const { data } = await apiClient.get('/notifications/unread');
        setNotifications(data.notifications || []);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      }
    };
    loadUnread();

    const handleNewNotification = (notification) => {
      setNotifications(prev => [notification, ...prev]);
      if (notification.priority === 'Critical') {
        setActiveAlarm(true);
      }
      
      if (!isAlarmMuted) {
        sendAlertNotification({
          title: notification.title,
          message: notification.message,
          priority: notification.priority
        });
      }
    };

    const handleNotificationRead = (payload) => {
      if (payload && payload.id) {
        setNotifications(prev => prev.filter(n => n.id !== payload.id));
      } else {
        setNotifications([]);
        setActiveAlarm(false);
      }
    };

    const unsubscribe = subscribeToNotifications(handleNewNotification, handleNotificationRead);
    return () => unsubscribe();
  }, [currentUser, isAlarmMuted]);

  // Handle active alarm toggling
  useEffect(() => {
    if (!activeAlarm || isAlarmMuted) {
      stopAlarm();
    }
  }, [activeAlarm, isAlarmMuted]);

  useEffect(() => {
    setUnreadCount(notifications.length);
  }, [notifications]);

  const markAsRead = async (id) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      
      // If no critical notifications left, stop alarm
      const remainingCritical = notifications.filter(n => n.id !== id && n.priority === 'Critical');
      if (remainingCritical.length === 0) {
        setActiveAlarm(false);
      }
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.patch('/notifications/mark-all-read');
      setNotifications([]);
      setActiveAlarm(false);
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      isAlarmMuted,
      setIsAlarmMuted,
      activeAlarm,
      setActiveAlarm,
      markAsRead,
      markAllAsRead
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
