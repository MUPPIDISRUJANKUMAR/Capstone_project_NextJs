"use client"

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";
import {
  Users,
  MessageSquare,
  Briefcase,
  Calendar,
  TrendingUp,
  RefreshCw,
  Clock,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../lib/firebase'
import { collection, addDoc } from 'firebase/firestore'
import type { AIMatch } from '../../types'

const initialRecommendationFetch = new Set<string>()
const recommendationCache = new Map<string, AIMatch[]>()

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

  const { user } = useAuth()
  const [aiRecommendations, setAiRecommendations] = useState<AIMatch[]>([])
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)
  const [hasRequestedRecommendations, setHasRequestedRecommendations] = useState(false)

  useEffect(() => {
    if (!user || user.role !== 'student') {
      setAiRecommendations([])
      setHasRequestedRecommendations(false)
      return
    }

    const cached = recommendationCache.get(user.id)
    if (cached && cached.length > 0) {
      setAiRecommendations(cached)
      setHasRequestedRecommendations(true)
      return
    }

    if (!initialRecommendationFetch.has(user.id)) {
      initialRecommendationFetch.add(user.id)
      loadRecommendations()
    } else {
      setAiRecommendations([])
      setHasRequestedRecommendations(false)
    }
  }, [user?.id])

  const loadRecommendations = async () => {
    if (!user || user.role !== 'student') {
      setHasRequestedRecommendations(true)
      setAiRecommendations([])
      return
    }

    setLoadingRecommendations(true)
    setHasRequestedRecommendations(true)
    try {
      const res = await fetch(`/api/recommendations?studentId=${encodeURIComponent(user.id)}`)
      const data = await res.json()
      if (!res.ok) {
        console.error('Failed to fetch recommendations', data)
        setAiRecommendations([])
      } else {
        const matches = data.matches || []
        setAiRecommendations(matches)
        recommendationCache.set(user.id, matches)
      }
    } catch (err) {
      console.error('Failed to load recommendations', err)
      setAiRecommendations([])
    } finally {
      setLoadingRecommendations(false)
    }
  }

  const handleRequest = async (alumniId: string) => {
    if (!db || !user) return
    try {
      const requestsRef = collection(db, 'mentorship_requests')
      await addDoc(requestsRef, {
        type: 'mentorship',
        fromStudentId: user.id,
        toAlumniId: alumniId,
        status: 'pending',
        title: 'Request from AI Recommendations',
        message: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      await loadRecommendations()
    } catch (err) {
      console.error('Failed to create mentorship request', err)
    }
  }

  const handleRemove = async (alumniId: string) => {
    if (!db || !user) return
    try {
      const blocksRef = collection(db, 'alumni_recommendation_blocks')
      await addDoc(blocksRef, {
        studentId: user.id,
        alumniId,
        blockedAt: new Date().toISOString(),
      })
      await loadRecommendations()
    } catch (err) {
      console.error('Failed to block alumni recommendation', err)
    }
  }

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
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              AI Alumni Recommendations
            </CardTitle>
            <Button
              size="icon"
              variant="ghost"
              onClick={loadRecommendations}
              disabled={loadingRecommendations || !user || user.role !== 'student'}
              aria-label="Reload recommendations"
            >
              <RefreshCw className={`h-4 w-4 ${loadingRecommendations ? 'animate-spin' : ''}`} />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingRecommendations && <p>Loading recommendations...</p>}
            {!loadingRecommendations && !hasRequestedRecommendations && (
              <p className="text-sm text-muted-foreground">Click the reload icon to generate personalized alumni suggestions.</p>
            )}
            {!loadingRecommendations && hasRequestedRecommendations && aiRecommendations.length === 0 && (
              <p className="text-sm text-muted-foreground">No recommendations available.</p>
            )}

            {aiRecommendations.map((match) => (
              <motion.div
                key={match.alumni.id}
                className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                whileHover={{ scale: 1.02 }}
              >
                <Avatar>
                  <AvatarImage src={match.alumni.avatar} alt={match.alumni.name} />
                  <AvatarFallback>
                    {match.alumni.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{match.alumni.name}</h4>
                    <Badge variant="secondary">
                      {match.matchScore}% match
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {match.alumni.position} {match.alumni.company ? `at ${match.alumni.company}` : ''}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {match.reasons.map((reason, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {reason}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" onClick={() => handleRequest(match.alumni.id)}>Request</Button>
                    <Button size="sm" variant="ghost" onClick={() => handleRemove(match.alumni.id)}>Remove</Button>
                  </div>
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
