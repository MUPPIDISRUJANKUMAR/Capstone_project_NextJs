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
  const [stats, setStats] = useState<Array<{ label: string; value: string; icon: any; trend: string }>>([
    { label: "Active Connections", value: "0", icon: Users, trend: "0" },
    { label: "Messages", value: "0", icon: MessageSquare, trend: "0" },
    { label: "Job Applications", value: "0", icon: Briefcase, trend: "0" },
    { label: "Upcoming Events", value: "0", icon: Calendar, trend: "0" },
  ])
  const [recentActivity, setRecentActivity] = useState<Array<{ type: string; text: string; time: string }>>([])

  const { user } = useAuth()
  const [aiRecommendations, setAiRecommendations] = useState<AIMatch[]>([])
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)
  const [hasRequestedRecommendations, setHasRequestedRecommendations] = useState(false)
  const [pendingMap, setPendingMap] = useState<Record<string, { status: string; createdAt: string }>>({})
  const [blockedUntil, setBlockedUntil] = useState<Record<string, number>>({})

  // Load live stats and activity for the student
  useEffect(() => {
    const loadLive = async () => {
      if (!user || user.role !== 'student') return
      try {
        // Connections (accepted requests sent by the student)
        const accRes = await fetch(`/api/chat-requests?userId=${encodeURIComponent(user.id)}&status=approved&role=student`)
        const accData = await accRes.json()
        const connections = accRes.ok && Array.isArray(accData.requests) ? accData.requests.length : 0

        // Pending requests sent by the student (for trend/pending info)
        const pendRes = await fetch(`/api/chat-requests?userId=${encodeURIComponent(user.id)}&status=pending&role=student`)
        const pendData = await pendRes.json()
        const pending = pendRes.ok && Array.isArray(pendData.requests) ? pendData.requests.length : 0

        // Messages: use connections as a proxy if no messages API is present
        const messages = connections

        setStats([
          { label: 'Active Connections', value: String(connections), icon: Users, trend: pending > 0 ? `+${pending}` : '0' },
          { label: 'Messages', value: String(messages), icon: MessageSquare, trend: '0' },
          { label: 'Job Applications', value: '0', icon: Briefcase, trend: '0' },
          { label: 'Upcoming Events', value: '0', icon: Calendar, trend: '0' },
        ])

        // Recent activity based on the latest sent requests
        const sentRes = await fetch(`/api/chat-requests?userId=${encodeURIComponent(user.id)}&status=sent`)
        const sentData = await sentRes.json()
        let items: Array<{ type: string; text: string; time: string }> = []
        if (sentRes.ok && Array.isArray(sentData.requests)) {
          const sorted = [...sentData.requests].sort((a: any, b: any) => new Date(b.createdAt || b.updatedAt || 0).getTime() - new Date(a.createdAt || a.updatedAt || 0).getTime())
          const top = sorted.slice(0, 4)
          for (const r of top) {
            try {
              const ures = await fetch(`/api/users/${r.toUserId}`)
              const u = ures.ok ? await ures.json() : { name: 'User' }
              items.push({
                type: 'request',
                text: `Request to ${u.name || 'User'} is ${r.status}`,
                time: new Date(r.createdAt || r.updatedAt || Date.now()).toLocaleString()
              })
            } catch {}
          }
        }
        setRecentActivity(items)
      } catch (e) {
        // keep defaults
      }
    }
    loadLive()
  }, [user?.id])

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
        let matches: AIMatch[] = data.matches || []
        // Filter out locally blocked alumni for 5 minutes
        const now = Date.now()
        matches = matches.filter(m => {
          const until = blockedUntil[m.alumni.id]
          return !until || now < 0 || now > until
        })
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

  const SIX_HOURS_MS = 6 * 60 * 60 * 1000
  const FIVE_MIN_MS = 5 * 60 * 1000

  const refreshPendingMap = async () => {
    if (!user) return
    try {
      const resp = await fetch(`/api/chat-requests?userId=${encodeURIComponent(user.id)}&status=sent`)
      const data = await resp.json()
      if (resp.ok && Array.isArray(data.requests)) {
        const map: Record<string, { status: string; createdAt: string }> = {}
        for (const r of data.requests as any[]) {
          // Only track requests sent by this student to alumni
          map[r.toUserId] = { status: r.status, createdAt: r.createdAt || r.updatedAt || new Date().toISOString() }
        }
        setPendingMap(map)
      }
    } catch (e) {
      // ignore
    }
  }

  useEffect(() => {
    if (user?.id && user.role === 'student') {
      refreshPendingMap()
    }
  }, [user?.id])

  const isPendingRecent = (alumniId: string) => {
    const entry = pendingMap[alumniId]
    if (!entry) return false
    if (entry.status !== 'pending') return false
    const ts = new Date(entry.createdAt).getTime()
    return Date.now() - ts < SIX_HOURS_MS
  }

  const handleRequest = async (alumniId: string) => {
    if (!user) return
    // Prevent duplicate within 6 hours if pending exists
    if (isPendingRecent(alumniId)) return
    try {
      const res = await fetch('/api/chat-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', fromUserId: user.id, toUserId: alumniId, message: '' })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setPendingMap(prev => ({ ...prev, [alumniId]: { status: 'pending', createdAt: new Date().toISOString() } }))
      }
    } catch (err) {
      console.error('Failed to send chat request', err)
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
      const until = Date.now() + FIVE_MIN_MS
      setBlockedUntil(prev => ({ ...prev, [alumniId]: until }))
      // Immediately filter from current list
      setAiRecommendations(prev => prev.filter(m => m.alumni.id !== alumniId))
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
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name || 'Student'}!</h1>
        <p className="text-muted-foreground">
          Check your latest connections and recommendations.
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
            >
              <Card>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    {stat.trend !== "0" && (
                      <span className="text-sm text-green-600 font-medium">{stat.trend}</span>
                    )}
                  </div>
                  <Icon className="h-6 w-6 text-muted-foreground" />
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
                    {isPendingRecent(match.alumni.id) ? (
                      <Badge variant="secondary">Pending</Badge>
                    ) : (
                      <Button size="sm" onClick={() => handleRequest(match.alumni.id)}>Request</Button>
                    )}
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
