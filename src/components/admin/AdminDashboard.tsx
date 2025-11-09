'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Shield, 
  BarChart3, 
  Calendar, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  MessageSquare
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'

export const AdminDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('overview')

  const stats = [
    { label: 'Total Users', value: '2,847', icon: Users, change: '+12%' },
    { label: 'Pending Verifications', value: '23', icon: Shield, change: '-5%' },
    { label: 'Active Conversations', value: '156', icon: MessageSquare, change: '+8%' },
    { label: 'This Month Events', value: '12', icon: Calendar, change: '+3%' }
  ]

  const pendingVerifications = [
    {
      id: '1',
      name: 'Jennifer Walsh',
      email: 'jennifer.walsh@company.com',
      role: 'Alumni',
      company: 'Tech Innovations Inc.',
      graduationYear: 2020,
      submittedAt: '2024-01-15',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '2',
      name: 'Robert Chen',
      email: 'robert.chen@startup.io',
      role: 'Alumni',
      company: 'StartupIO',
      graduationYear: 2019,
      submittedAt: '2024-01-14',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    }
  ]

  const recentActivity = [
    { action: 'New user registration', user: 'Alex Johnson', time: '2 minutes ago', type: 'info' },
    { action: 'Alumni verified', user: 'Maria Garcia', time: '15 minutes ago', type: 'success' },
    { action: 'Event created', user: 'Career Fair 2024', time: '1 hour ago', type: 'info' },
    { action: 'Report submitted', user: 'Inappropriate content', time: '3 hours ago', type: 'warning' }
  ]

  const moderationQueue = [
    {
      id: '1',
      type: 'Message Report',
      reporter: 'Student User',
      reported: 'Alumni User',
      reason: 'Inappropriate content',
      status: 'pending',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      type: 'Profile Report',
      reporter: 'System',
      reported: 'John Doe',
      reason: 'Fake credentials',
      status: 'reviewing',
      createdAt: '2024-01-14'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor platform activity and manage user verification.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${
                        stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </span>
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'success' ? 'bg-green-500' :
                      activity.type === 'warning' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.action}</p>
                      <p className="text-sm font-medium">{activity.user}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Platform Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Daily Active Users</span>
                  <span className="font-semibold">1,234</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Messages Sent Today</span>
                  <span className="font-semibold">456</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">New Connections</span>
                  <span className="font-semibold">89</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Job Applications</span>
                  <span className="font-semibold">23</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="verification" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Pending Alumni Verifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingVerifications.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={request.avatar} alt={request.name} />
                        <AvatarFallback>
                          {request.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{request.name}</h4>
                        <p className="text-sm text-muted-foreground">{request.email}</p>
                        <p className="text-sm text-muted-foreground">
                          {request.company} • Class of {request.graduationYear}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Submitted: {new Date(request.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        Review
                      </Button>
                      <Button size="sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive">
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Moderation Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {moderationQueue.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold">{item.type}</h4>
                        <Badge variant={
                          item.status === 'pending' ? 'destructive' :
                          item.status === 'reviewing' ? 'secondary' :
                          'default'
                        }>
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Reported by: {item.reporter}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Target: {item.reported}
                      </p>
                      <p className="text-sm font-medium">{item.reason}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        Investigate
                      </Button>
                      <Button size="sm">
                        Resolve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Platform Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center p-6 border rounded-lg">
                  <h3 className="text-2xl font-bold">85%</h3>
                  <p className="text-sm text-muted-foreground">Message Response Rate</p>
                </div>
                <div className="text-center p-6 border rounded-lg">
                  <h3 className="text-2xl font-bold">3.2</h3>
                  <p className="text-sm text-muted-foreground">Avg. Connections per User</p>
                </div>
                <div className="text-center p-6 border rounded-lg">
                  <h3 className="text-2xl font-bold">67%</h3>
                  <p className="text-sm text-muted-foreground">Alumni Engagement Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}