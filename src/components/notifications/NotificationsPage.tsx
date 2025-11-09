'use client'

import React from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { Button } from '../ui/button';
import { Check, Trash2 } from 'lucide-react';

const NotificationsPage: React.FC = () => {
  const { notifications, markAsRead, deleteNotification } = useNotifications();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">All Notifications</h1>
      <div className="space-y-4">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg border-2 ${notification.read ? 'border-transparent bg-card' : 'border-red-500 bg-card'}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold">{notification.title}</h2>
                <p className="text-muted-foreground">{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-2">{new Date(notification.timestamp).toLocaleString()}</p>
              </div>
              <div className="flex items-center space-x-2">
                {!notification.read && (
                  <Button variant="outline" size="sm" onClick={() => markAsRead(notification.id)}>
                    <Check className="h-4 w-4 mr-2" />
                    Mark as Read
                  </Button>
                )}
                <Button variant="destructive" size="sm" onClick={() => deleteNotification(notification.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;
