'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, Clock, CheckCircle, XCircle, Loader2, User } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { useAuth } from '../../contexts/AuthContext'

interface User {
  id: string
  name: string
  role: string
  avatar: string
  email?: string
}

interface ChatRequest {
  id: string
  fromUserId: string
  toUserId: string
  message: string
  status: 'pending' | 'accepted' | 'declined'
  createdAt: Date
}

interface UserListWithRequestsProps {
  users: User[]
  onSessionStart?: (sessionId: string) => void
}

export const UserListWithRequests: React.FC<UserListWithRequestsProps> = ({
  users,
  onSessionStart
}) => {
  const { user, firebaseUser } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [requestModal, setRequestModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [requestLoading, setRequestLoading] = useState(false);
  const [sentRequests, setSentRequests] = useState<ChatRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<ChatRequest[]>([]);
  const [showRequestManagement, setShowRequestManagement] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');

  // Fetch user's requests
  useEffect(() => {
    if (user?.id) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/chat-requests?userId=${user.id}&status=sent`);
      const data = await response.json();
      
      if (response.ok) {
        setSentRequests(data.requests || []);
      } else {
        // If Firebase Admin is not configured, use empty array for demo
        console.warn('Firebase Admin not configured, using empty requests for demo');
        setSentRequests([]);
      }
    } catch (error) {
      console.error('Error fetching sent requests:', error);
      setSentRequests([]);
    }

    try {
      const response = await fetch(`/api/chat-requests?userId=${user.id}&status=received`);
      const data = await response.json();
      
      if (response.ok) {
        setReceivedRequests(data.requests || []);
      } else {
        // If Firebase Admin is not configured, use empty array for demo
        console.warn('Firebase Admin not configured, using empty requests for demo');
        setReceivedRequests([]);
      }
    } catch (error) {
      console.error('Error fetching received requests:', error);
      setReceivedRequests([]);
    }
  };

  const handleSendRequest = async () => {
    if (!selectedUser || !user?.id) return;

    setRequestLoading(true);
    try {
      const response = await fetch('/api/chat-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send',
          fromUserId: user.id,
          toUserId: selectedUser.id,
          message: requestMessage || 'Would like to start a conversation with you'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Show success notification
        setRequestModal(false);
        setRequestMessage('');
        fetchRequests(); // Refresh requests
        
        // Show success toast/popup
        alert('✅ Chat request sent successfully!');
      } else {
        console.error('Failed to send request:', data.error);
        alert('❌ Failed to send request. Please try again.');
      }
    } catch (error) {
      console.error('Error sending request:', error);
      alert('❌ Network error. Please try again.');
    } finally {
      setRequestLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const response = await fetch('/api/chat-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'accept',
          requestId: requestId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('✅ Chat request accepted! You can now start the session.');
        fetchRequests();
        if (onSessionStart) {
          // Use the requestId as the session identifier because the chat API
          // looks up chatSessions by requestId
          onSessionStart(requestId);
        }
      } else {
        alert('❌ Failed to accept request.');
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('❌ Network error. Please try again.');
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      const response = await fetch('/api/chat-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'decline',
          requestId: requestId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('✅ Chat request declined.');
        fetchRequests();
      } else {
        alert('❌ Failed to decline request.');
      }
    } catch (error) {
      console.error('Error declining request:', error);
      alert('❌ Network error. Please try again.');
    }
  };

  const hasPendingRequest = (userId: string) => {
    return sentRequests.some(req => req.toUserId === userId && req.status === 'pending');
  };

  const hasAcceptedRequest = (userId: string) => {
    // Accepted request either sent by me to them, or received by me from them
    const sentAccepted = sentRequests.some(req => req.toUserId === userId && req.status === 'accepted');
    const receivedAccepted = receivedRequests.some(req => req.fromUserId === userId && req.status === 'accepted');
    return sentAccepted || receivedAccepted;
  };

  return (
    <>
      <Card className="h-full">
        <CardHeader className="border-b">
          <CardTitle className="text-sm font-medium flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Connect with Users
            </div>
            {receivedRequests.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowRequestManagement(!showRequestManagement)}
                className="text-xs"
              >
                <Clock className="h-3 w-3 mr-1" />
                {receivedRequests.length} Requests
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Request Management Section */}
          <AnimatePresence>
            {showRequestManagement && receivedRequests.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-b bg-muted/30 p-3"
              >
                <h4 className="text-xs font-medium mb-2">Pending Requests</h4>
                <div className="space-y-2">
                  {receivedRequests.map((request) => (
                    <div key={request.id} className="bg-background rounded p-2 text-xs">
                      <p className="font-medium">{request.message}</p>
                      <p className="text-muted-foreground mb-2">
                        From: {users.find(u => u.id === request.fromUserId)?.name || 'Unknown User'}
                      </p>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptRequest(request.id)}
                          className="flex-1 h-6 text-xs"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeclineRequest(request.id)}
                          className="flex-1 h-6 text-xs"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* User List */}
          <ul className="divide-y">
            {users.map((userItem) => (
              <motion.li
                key={userItem.id}
                className={`p-3 transition-colors ${
                  selectedId === userItem.id ? 'bg-muted' : 'hover:bg-muted'
                }`}
                whileHover={{ x: 2 }}
                onClick={() => setSelectedId(userItem.id)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={userItem.avatar} />
                    <AvatarFallback>
                      {userItem.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{userItem.name}</p>
                      <Badge variant="secondary" className="text-[10px] capitalize">{userItem.role}</Badge>
                    </div>
                    {userItem.email && (
                      <p className="text-xs text-muted-foreground truncate">{userItem.email}</p>
                    )}
                  </div>
                  <div className="ml-auto">
                    {hasAcceptedRequest(userItem.id) ? (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Find the accepted request (sent or received) and start it using its requestId
                          const request =
                            sentRequests.find(req => req.toUserId === userItem.id && req.status === 'accepted') ||
                            receivedRequests.find(req => req.fromUserId === userItem.id && req.status === 'accepted');
                          if (request && onSessionStart) {
                            onSessionStart(request.id);
                          }
                        }}
                        className="text-xs"
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Start Session
                      </Button>
                    ) : hasPendingRequest(userItem.id) ? (
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUser(userItem);
                          setRequestModal(true);
                        }}
                        className="text-xs"
                      >
                        <Send className="h-3 w-3 mr-1" />
                        Request
                      </Button>
                    )}
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Send Request Modal */}
      <AnimatePresence>
        {requestModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setRequestModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={selectedUser.avatar} />
                  <AvatarFallback>
                    {selectedUser.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">Send Chat Request</h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.name}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Message (optional)</label>
                  <textarea
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    placeholder="Introduce yourself and mention why you'd like to connect..."
                    className="w-full min-h-[80px] p-2 border rounded-md text-sm resize-none"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setRequestModal(false);
                      setRequestMessage('');
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendRequest}
                    disabled={requestLoading}
                    className="flex-1"
                  >
                    {requestLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Send Request
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
