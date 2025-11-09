'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '../../contexts/NotificationContext';
import { Button } from '../ui/button';
import { Bell, Check, Trash2 } from 'lucide-react';

export const NotificationPanel: React.FC = () => {
  const { notifications, markAsRead, deleteNotification } = useNotifications();
  const router = useRouter();

  return (
    <div className="w-80 bg-background border rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Notifications</h3>
        <Button variant="ghost" size="sm" onClick={() => router.push('/notifications')}>
          View All
        </Button>
      </div>
      <div className="space-y-3">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`p-3 rounded-lg border-2 ${notification.read ? 'border-transparent' : 'border-red-500'}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold">{notification.title}</h4>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
              </div>
              {!notification.read && (
                <div className="w-2 h-2 bg-red-500 rounded-full mt-1"></div>
              )}
            </div>
            <div className="flex items-center justify-end space-x-2 mt-2">
              <Button variant="ghost" size="icon" onClick={() => markAsRead(notification.id)}>
                <Check className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => deleteNotification(notification.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
