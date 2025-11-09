'use client'

import React from "react";
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";
import {
  Users,
  MessageSquare,
  Briefcase,
  Calendar,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";

export const StudentDashboard: React.FC = () => {
  const router = useRouter();
  const stats = [
    { label: "Active Connections", value: "12", icon: Users, trend: "+2" },
    { label: "Messages", value: "28", icon: MessageSquare, trend: "+5" },
    { label: "Job Applications", value: "7", icon: Briefcase, trend: "+1" },
    { label: "Upcoming Events", value: "3", icon: Calendar, trend: "0" },
  ];

  const recentActivity = [
    {
      type: "message",
      text: "New message from Sarah Rodriguez",
      time: "2 hours ago",
    },
    {
      type: "match",
      text: "New alumni match: Michael Chen",
      time: "5 hours ago",
    },
    {
      type: "application",
      text: "Applied to Software Engineer Intern at TechCorp",
      time: "1 day ago",
    },
    {
      type: "event",
      text: "Registered for Career Fair 2024",
      time: "2 days ago",
    },
  ];

  const aiRecommendations = [
    {
      id: "1",
      name: "Sarah Rodriguez",
      position: "Senior Product Manager at TechCorp",
      matchScore: 95,
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      reasons: [
        "Product Management interest",
        "Tech industry focus",
        "95% skill match",
      ],
    },
    {
      id: "2",
      name: "David Kim",
      position: "Software Engineer at StartupXYZ",
      matchScore: 87,
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      reasons: [
        "JavaScript expertise",
        "Startup experience",
        "Machine Learning interest",
      ],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-6xl mx-auto"
    >
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/10 via-blue-500/10 to-purple-500/10 rounded-xl p-6 border">
        <h1 className="text-2xl font-bold mb-2">Welcome back, Alex!</h1>
        <p className="text-muted-foreground">
          You have 3 new alumni matches and 2 pending mentorship requests.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
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
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {stat.trend !== "0" && (
                        <span className="text-sm text-green-600 font-medium">
                          {stat.trend}
                        </span>
                      )}
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              AI Alumni Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiRecommendations.map((alumni) => (
              <motion.div
                key={alumni.id}
                className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                whileHover={{ scale: 1.02 }}
              >
                <Avatar>
                  <AvatarImage src={alumni.avatar} alt={alumni.name} />
                  <AvatarFallback>
                    {alumni.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{alumni.name}</h4>
                    <Badge variant="secondary">
                      {alumni.matchScore}% match
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {alumni.position}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {alumni.reasons.map((reason, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {reason}
                      </Badge>
                    ))}
                  </div>
                  <Button size="sm" className="mt-2">
                    Connect
                  </Button>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

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
              <motion.div
                key={index}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm">{activity.text}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.time}
                  </p>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={() => router.push("/discover")}>Find Alumni</Button>
            <Button variant="outline" onClick={() => router.push("/jobboard")}>Browse Jobs</Button>
            <Button variant="outline" onClick={() => router.push("/events")}>Join Events</Button>
            <Button variant="outline" onClick={() => router.push("/faq")}>Ask AI Career Bot</Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
