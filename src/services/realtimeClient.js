import { io } from 'socket.io-client';
import apiClient from '../api/apiClient.js';

const backendUrl = apiClient.defaults.baseURL.replace('/api', '');

let socketInstance = null;

export function initRealtimeClient(role) {
  if (!socketInstance) {
    socketInstance = io(backendUrl, {
      transports: ['websocket', 'polling']
    });
    
    socketInstance.on('connect', () => {
      // If the user is a Supervisor or Admin, join the supervisors room
      if (role === 'Supervisor' || role === 'Admin') {
        socketInstance.emit('join_room', 'supervisors');
      }
    });
  }
  return socketInstance;
}

export function subscribeToRealtimeComplaints(onChangeCallback) {
  if (!socketInstance) return () => {};

  const listener = (payload) => onChangeCallback(payload);
  socketInstance.on('complaint_updated', listener);

  return () => {
    socketInstance.off('complaint_updated', listener);
  };
}

export function subscribeToNotifications(onNewNotification, onNotificationsRead) {
  if (!socketInstance) return () => {};

  socketInstance.on('new_notification', onNewNotification);
  socketInstance.on('notification_read', onNotificationsRead);
  socketInstance.on('all_notifications_read', onNotificationsRead);

  return () => {
    socketInstance.off('new_notification', onNewNotification);
    socketInstance.off('notification_read', onNotificationsRead);
    socketInstance.off('all_notifications_read', onNotificationsRead);
  };
}
