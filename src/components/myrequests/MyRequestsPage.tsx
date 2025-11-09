'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, HelpCircle, BarChart2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';

// TODO: Remove hardcoded data and fetch from Firebase
// import { collection, query, where, getDocs } from "firebase/firestore";
// import { db } from '../../lib/firebase';

const MyRequestsPage: React.FC = () => {
  const pendingRequests = [
    {
      id: 'req1',
      alumniName: 'Sarah Rodriguez',
      alumniPosition: 'Senior Product Manager at TechCorp',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      requestDate: '2025-10-20',
      status: 'Pending',
    },
  ];

  const pastRequests = [
    {
      id: 'req2',
      alumniName: 'Michael Chen',
      alumniPosition: 'Data Scientist at Insight Analytics',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face',
      requestDate: '2025-09-15',
      status: 'Accepted',
    },
    {
      id: 'req3',
      alumniName: 'Jessica Williams',
      alumniPosition: 'UX/UI Designer at Creative Solutions',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
      requestDate: '2025-09-10',
      status: 'Declined',
    },
     {
      id: 'req4',
      alumniName: 'David Lee',
      alumniPosition: 'Software Engineer at Google',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      requestDate: '2025-08-22',
      status: 'Accepted',
    },
  ];

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

      {/* Hardcoded Data Section */}
      <div className="border-2 border-red-500 border-dashed rounded-xl p-4">
        <p className="text-red-500 text-sm font-semibold mb-4 text-center">
          Developer Note: The data below is hardcoded. This section should be replaced with live data from Firebase.
        </p>

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
                {pendingRequests.map((req, index) => (
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
                        <p className="text-sm text-muted-foreground">{req.alumniPosition}</p>
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
                {pastRequests.map((req, index) => (
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
                        <p className="text-sm text-muted-foreground">{req.alumniPosition}</p>
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
                  <span className="font-bold text-lg">4</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Accepted</span>
                  <span className="font-bold text-lg text-green-600">2</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Pending</span>
                  <span className="font-bold text-lg text-yellow-600">1</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Acceptance Rate</span>
                  <span className="font-bold text-lg">66%</span>
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
      </div>
    </motion.div>
  );
};

export default MyRequestsPage;