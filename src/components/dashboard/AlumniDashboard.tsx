"use client"

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  MessageSquare,
  Calendar,
  TrendingUp,
  Clock,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { useAuth } from '../../contexts/AuthContext'

interface Student {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  major?: string;
  graduationYear?: string;
  bio?: string;
  requestId: string;
  connectedAt: string;
}

export const AlumniDashboard: React.FC = () => {
  const { user } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  const stats = [
    { label: "Connected Students", value: students.length.toString(), icon: UserCheck, trend: students.length > 0 ? `+${students.length}` : "0" },
    { label: "Pending Requests", value: "0", icon: Clock, trend: "0" },
    { label: "Messages", value: "0", icon: MessageSquare, trend: "0" },
    { label: "Profile Views", value: "0", icon: TrendingUp, trend: "0" },
  ];

  useEffect(() => {
    if (!user || user.role !== 'alumni') {
      setStudents([])
      setLoading(false)
      return
    }

    fetchApprovedStudents()
  }, [user?.id])

  const fetchApprovedStudents = async () => {
    if (!user) return

    setLoading(true)
    try {
          const response = await fetch(`/api/chat-requests?userId=${user.id}&status=approved&role=alumni`);
      const data = await response.json()
      
      if (response.ok && data.requests) {
        // Get unique student IDs from approved requests
        const studentIds = [...new Set(data.requests.map((req: any) => req.fromUserId))]
        
        // Fetch student details
        const studentsData: Student[] = []
        for (const studentId of studentIds) {
          try {
            const userResponse = await fetch(`/api/users/${studentId}`)
            if (userResponse.ok) {
              const userData = await userResponse.json()
              const request = data.requests.find((req: any) => req.fromUserId === studentId)
              
              studentsData.push({
                id: userData.id,
                displayName: userData.name || 'Unknown Student',
                email: userData.email || '',
                photoURL: userData.avatar,
                major: userData.major,
                graduationYear: userData.graduationYear?.toString(),
                bio: userData.bio,
                requestId: request.id,
                connectedAt: request.updatedAt || request.createdAt
              })
            }
          } catch (error) {
            console.error('Failed to fetch student details:', error)
          }
        }
        
        setStudents(studentsData)
      } else {
        console.error('Failed to fetch approved requests:', data)
        setStudents([])
      }
    } catch (error) {
      console.error('Error fetching approved students:', error)
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  const handleMessageStudent = async (studentId: string) => {
    // Navigate to chat or open messaging interface
    console.log('Message student:', studentId)
    // TODO: Implement messaging functionality
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-6xl mx-auto"
    >
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/10 via-blue-500/10 to-purple-500/10 rounded-xl p-6 border">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name || 'Alumni'}!</h1>
        <p className="text-muted-foreground">
          You have {students.length} connected student{students.length !== 1 ? 's' : ''}.
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

      {/* Connected Students Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Connected Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No connected students yet</h3>
              <p className="text-muted-foreground mb-4">
                Students will appear here once you approve their chat requests.
              </p>
              <p className="text-sm text-muted-foreground">
                Check your notifications for pending student requests.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {students.map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={student.photoURL} alt={student.displayName} />
                      <AvatarFallback>
                        {student.displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{student.displayName}</h4>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                      {student.major && (
                        <p className="text-sm text-muted-foreground">
                          {student.major} {student.graduationYear && `• Class of ${student.graduationYear}`}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Connected {new Date(student.connectedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Connected</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMessageStudent(student.id)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
