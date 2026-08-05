import { io } from 'socket.io-client';
import apiClient from '../api/apiClient.js';

// The URL is dynamically fetched from apiClient's baseURL, which points to the Express backend.
// Extract base URL from apiClient to point Socket.IO to the correct backend host/port.
const backendUrl = apiClient.defaults.baseURL.replace('/api', '');

export const isSupabaseConfigured = () => true; // Always return true for offline mode to work seamlessly

let socketInstance = null;

export function subscribeToRealtimeComplaints(onChangeCallback) {
  if (!socketInstance) {
    socketInstance = io(backendUrl, {
      transports: ['websocket', 'polling']
    });
  }

  const listener = (payload) => {
    // payload is { eventType: 'INSERT'|'UPDATE', new: {...} }
    onChangeCallback(payload);
  };

  socketInstance.on('complaint_updated', listener);

  return () => {
    socketInstance.off('complaint_updated', listener);
  };
}
