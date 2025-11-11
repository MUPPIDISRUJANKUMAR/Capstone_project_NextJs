'use client'

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, HelpCircle, BarChart2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { useAuth } from '../../contexts/AuthContext';

const MyRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState<Array<{
    id: string;
    alumniName: string;
    alumniPosition?: string;
    avatar?: string;
    requestDate: string;
    status: 'Pending';
  }>>([]);
  const [pastRequests, setPastRequests] = useState<Array<{
    id: string;
    alumniName: string;
    alumniPosition?: string;
    avatar?: string;
    requestDate: string;
    status: 'Accepted' | 'Declined';
  }>>([]);

  const [stats, setStats] = useState({ total: 0, accepted: 0, pending: 0, acceptanceRate: 0 });

  const fetchUserById = async (uid: string) => {
    try {
      const res = await fetch(`/api/users/${uid}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  };

  const loadRequests = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [pendingRes, acceptedRes, declinedRes] = await Promise.all([
        fetch(`/api/chat-requests?userId=${encodeURIComponent(user.id)}&status=pending&role=student`),
        fetch(`/api/chat-requests?userId=${encodeURIComponent(user.id)}&status=approved&role=student`),
        fetch(`/api/chat-requests?userId=${encodeURIComponent(user.id)}&status=declined&role=student`),
      ]);

      const [pendingData, acceptedData, declinedData] = await Promise.all([
        pendingRes.json(), acceptedRes.json(), declinedRes.json()
      ]);

      const buildList = async (reqs: any[], status: 'Pending' | 'Accepted' | 'Declined') => {
        const out: any[] = [];
        for (const r of (reqs || [])) {
          const uid = r.toUserId; // student sent to alumni
          const u = await fetchUserById(uid);
          out.push({
            id: r.id,
            alumniName: u?.name || 'Alumni',
            alumniPosition: u?.position ? `${u.position}${u.company ? ` at ${u.company}` : ''}` : undefined,
            avatar: u?.avatar,
            requestDate: r.createdAt || r.updatedAt || new Date().toISOString(),
            status,
          });
        }
        return out;
      };

      const pendingList = await buildList(pendingData.requests || [], 'Pending');
      const acceptedList = await buildList(acceptedData.requests || [], 'Accepted');
      const declinedList = await buildList(declinedData.requests || [], 'Declined');

      setPendingRequests(pendingList);
      setPastRequests([...acceptedList, ...declinedList].sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()));

      const total = pendingList.length + acceptedList.length + declinedList.length;
      const accepted = acceptedList.length;
      const pendingCount = pendingList.length;
      const acceptanceRate = total > 0 ? Math.round((accepted / total) * 100) : 0;
      setStats({ total, accepted, pending: pendingCount, acceptanceRate });
    } catch (e) {
      setPendingRequests([]);
      setPastRequests([]);
      setStats({ total: 0, accepted: 0, pending: 0, acceptanceRate: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadRequests();
    }
  }, [user?.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold mt-3">My Mentorship Requests</h1>
        <p className="text-muted-foreground mt-1">
          Track the status of your connection requests to alumni.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pending Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : pendingRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pending requests.</p>
              ) : pendingRequests.map((req, index) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between flex-wrap p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={req.avatar} />
                      <AvatarFallback>{req.alumniName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{req.alumniName}</p>
                      {req.alumniPosition && (
                        <p className="text-sm text-muted-foreground">{req.alumniPosition}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">{req.status}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Sent on {new Date(req.requestDate).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Past Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Past Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : pastRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground">No past requests.</p>
              ) : pastRequests.map((req, index) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="flex items-center justify-between flex-wrap p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={req.avatar} />
                      <AvatarFallback>{req.alumniName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{req.alumniName}</p>
                      {req.alumniPosition && (
                        <p className="text-sm text-muted-foreground">{req.alumniPosition}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={req.status === 'Accepted' ? 'default' : 'destructive'}>
                      {req.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Responded on {new Date(req.requestDate).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5" />
                Request Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Requests</span>
                <span className="font-bold text-lg">{stats.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Accepted</span>
                <span className="font-bold text-lg text-green-600">{stats.accepted}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Pending</span>
                <span className="font-bold text-lg text-yellow-600">{stats.pending}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Acceptance Rate</span>
                <span className="font-bold text-lg">{stats.acceptanceRate}%</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Tips for Getting Accepted
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• Personalize your initial message.</p>
              <p>• Clearly state what you'd like to discuss.</p>
              <p>• Be respectful of the alumni's time.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default MyRequestsPage;