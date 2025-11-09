'use client'

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '../../contexts/NotificationContext';
import { Button } from '../ui/button';
import { X } from 'lucide-react';

export const Notifications: React.FC = () => {
  const { notifications, deleteNotification } = useNotifications();
  const router = useRouter();

  return (
    <div className="fixed top-16 right-4 z-50 space-y-3">
      {notifications.filter(n => !n.read).map(notification => (
        <div
          key={notification.id}
          className="w-80 bg-background border-2 border-red-500 rounded-lg shadow-lg p-4 animate-slide-in-right"
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold">{notification.title}</h4>
              <p className="text-sm text-muted-foreground">{notification.message}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => deleteNotification(notification.id)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-end space-x-2 mt-2">
            <Button variant="outline" size="sm" onClick={() => router.push(`/${notification.link}`)}>
              View
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
