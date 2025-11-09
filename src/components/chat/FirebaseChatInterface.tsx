'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { useAuth } from '../../contexts/AuthContext'

interface Message {
  id: string
  content: string
  senderId: string
  senderName: string
  timestamp: any
  type: string
}

interface FirebaseChatInterfaceProps {
  title?: string
  type?: 'chat' | 'faq'
  contact?: {
    name: string
    avatar?: string
  }
  sessionId?: string
}

export const FirebaseChatInterface: React.FC<FirebaseChatInterfaceProps> = ({
  title = "Chat",
  type = 'chat',
  contact,
  sessionId
}) => {
  const { user, firebaseUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages when component mounts or sessionId changes
  useEffect(() => {
    if (sessionId && user?.id) {
      fetchMessages();
      // Set up polling for new messages (every 3 seconds)
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [sessionId, user?.id]);

  const fetchMessages = async () => {
    if (!sessionId) return;

    try {
      const response = await fetch(`/api/chat-sessions/${sessionId}`);
      const data = await response.json();

      if (response.status === 410) {
        setSessionExpired(true);
        return;
      }

      if (response.ok) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !sessionId || !user?.id || isSending) return;

    setIsSending(true);
    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      const response = await fetch(`/api/chat-sessions/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageContent,
          senderId: user.id,
          senderName: user.name || user.email || 'You'
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Add the message optimistically
        const optimisticMessage: Message = {
          id: data.message.id,
          content: messageContent,
          senderId: user.id,
          senderName: user.name || user.email || 'You',
          timestamp: new Date(),
          type: 'text'
        };
        setMessages(prev => [...prev, optimisticMessage]);
      } else {
        // Show error and restore the message
        setNewMessage(messageContent);
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageContent);
      alert('Network error. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  if (sessionExpired) {
    return (
      <Card className="h-[600px] flex flex-col">
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="text-red-500 text-4xl">⏰</div>
            <h3 className="font-semibold text-red-600">Session Expired</h3>
            <p className="text-sm text-muted-foreground">
              This chat session has expired (24-hour limit)
            </p>
            <p className="text-xs text-muted-foreground">
              Please send a new request to start a new conversation
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="h-[600px] flex flex-col">
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground">Loading chat session...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-5xl mx-auto h-full">
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 justify-center">
            {type === 'faq' ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
            {title}
            {type === 'faq' && <Badge variant="secondary">AI Powered</Badge>}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex gap-3 ${ 
                    message.senderId === user?.id ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <Avatar className="w-8 h-8">
                    {message.senderId === user?.id ? (
                      <AvatarFallback>
                        {(user.name || user.email || 'You').split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    ) : contact?.avatar ? (
                      <AvatarImage src={contact.avatar} />
                    ) : (
                      <AvatarFallback>
                        {message.senderName?.split(' ').map(n => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div className={`max-w-[70%] ${ 
                    message.senderId === user?.id ? 'text-right' : 'text-left'
                  }`}> 
                    <div className={`inline-block px-4 py-2 rounded-lg ${ 
                      message.senderId === user?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}> 
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {message.senderName} • {message.timestamp?.toDate?.()?.toLocaleTimeString() || new Date().toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <p className="text-sm">No messages yet. Start the conversation!</p>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
                disabled={isSending}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!newMessage.trim() || isSending}
              >
                {isSending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
