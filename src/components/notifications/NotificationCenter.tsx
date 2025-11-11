'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckCircle, XCircle, MessageSquare, X, Check } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { useAuth } from '../../contexts/AuthContext'

interface Notification {
  id: string
  type: 'chat_request' | 'request_accepted' | 'request_declined' | 'request_accepted_confirm'
  title: string
  message: string
  read: boolean
  createdAt: Date
  requestId?: string
  sessionId?: string
}

export const NotificationCenter: React.FC = () => {
  const { user, firebaseUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const fetchNotifications = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/notifications?userId=${user.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setNotifications(data.notifications || []);
        const unread = data.notifications?.filter((n: Notification) => !n.read).length || 0;
        setUnreadCount(unread);
      } else {
        // If Firebase Admin is not configured, use empty array for demo
        console.warn('Firebase Admin not configured, using empty notifications for demo');
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'mark_read',
          notificationId
        })
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'mark_all_read',
          userId: user.id
        })
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleRequestAction = async (notificationId: string, requestId: string, action: 'approve' | 'disapprove') => {
    try {
      const response = await fetch('/api/chat-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: action === 'approve' ? 'approve' : 'decline',
          requestId,
          fromUserId: user?.id
        })
      });

      if (response.ok) {
        // Mark the notification as read and remove it from the list
        setNotifications(prev => 
          prev.filter(n => n.id !== notificationId)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        // Refresh notifications to get any new ones
        fetchNotifications();
      } else {
        console.error('Failed to process request action');
      }
    } catch (error) {
      console.error('Error handling request action:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'chat_request':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'request_accepted':
      case 'request_accepted_confirm':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'request_declined':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'chat_request':
        return 'border-blue-200 bg-blue-50';
      case 'request_accepted':
      case 'request_accepted_confirm':
        return 'border-green-200 bg-green-50';
      case 'request_declined':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-12 w-80 z-50"
          >
            <Card className="shadow-lg border">
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Mark all read
                    </Button>
                  )}
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No notifications yet</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {notifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`p-4 transition-colors hover:bg-muted/50 ${
                            !notification.read ? getNotificationColor(notification.type) : ''
                          }`}
                          onClick={() => !notification.read && notification.type !== 'chat_request' && markAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-medium text-sm truncate">
                                  {notification.title}
                                </p>
                                {!notification.read && (
                                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mb-3">
                                {notification.createdAt?.toLocaleString()}
                              </p>
                              
                              {/* Show approve/disapprove buttons for alumni on chat requests */}
                              {notification.type === 'chat_request' && user?.role === 'alumni' && notification.requestId && (
                                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                  <Button
                                    size="sm"
                                    variant="default"
                                    className="h-7 px-3 text-xs"
                                    onClick={() => handleRequestAction(notification.id, notification.requestId!, 'approve')}
                                  >
                                    <Check className="h-3 w-3 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-3 text-xs"
                                    onClick={() => handleRequestAction(notification.id, notification.requestId!, 'disapprove')}
                                  >
                                    <X className="h-3 w-3 mr-1" />
                                    Disapprove
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
