import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from './useApi';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();
  const { request } = useApi();

  const fetchNotifications = async () => {
    if (!user) return;
    const data = await request({
      method: 'GET',
      url: '/api/notifications'
    });
    setNotifications(data);
  };

  useEffect(() => {
    fetchNotifications();
    // Set up WebSocket connection for real-time notifications
    const ws = new WebSocket(process.env.REACT_APP_WS_URL);
    
    ws.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      setNotifications(prev => [notification, ...prev]);
    };

    return () => ws.close();
  }, [user]);

  const markAsRead = async (notificationId) => {
    await request({
      method: 'PUT',
      url: `/api/notifications/${notificationId}/read`
    });
    await fetchNotifications();
  };

  return {
    notifications,
    markAsRead,
    refreshNotifications: fetchNotifications
  };
};