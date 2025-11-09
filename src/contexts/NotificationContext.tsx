
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Notification } from '../types';

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => void;
  markAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    // Hardcoded notifications
    {
      id: '1',
      title: 'New Alumni Match',
      message: 'You have a new alumni match: John Doe.',
      link: '/discover',
      read: false,
      timestamp: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Job Application Update',
      message: 'Your application for Software Engineer at Google has been viewed.',
      link: '/jobboard',
      read: false,
      timestamp: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'Event Reminder',
      message: 'Your upcoming event "Tech Conference 2025" is tomorrow.',
      link: '/events',
      read: true,
      timestamp: new Date().toISOString(),
    },
    {
      id: '4',
      title: 'New Message',
      message: 'You have a new message from Jane Smith.',
      link: '/chat',
      read: true,
      timestamp: new Date().toISOString(),
    },
    {
      id: '5',
      title: 'Profile Completion',
      message: 'Your profile is 80% complete. Complete it now to get better matches.',
      link: '/profile',
      read: true,
      timestamp: new Date().toISOString(),
    },
  ]);

  const addNotification = (notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: new Date().getTime().toString(),
      read: false,
      timestamp: new Date().toISOString(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        deleteNotification,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
