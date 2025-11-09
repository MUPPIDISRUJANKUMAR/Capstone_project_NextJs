export type UserRole = 'student' | 'alumni' | 'admin'

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: 'student' | 'alumni' | 'admin';
  bio?: string;
  skills?: string[];
  interests?: string[];
  goals?: string[];
  industry?: string;
  company?: string;
  position?: string;
  graduationYear?: number;
  major?: string;
  location?: string;
  availability?: 'open' | 'limited' | 'closed';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  link: string;
  read: boolean;
  timestamp: string;
}


export interface MentorshipRequest {
  id: string
  type: 'mentorship' | 'internship' | 'career_advice'
  fromStudentId: string
  toAlumniId: string
  status: 'pending' | 'accepted' | 'declined' | 'completed'
  title: string
  message: string
  createdAt: string
  updatedAt: string
}

export interface JobPosting {
  id: string
  alumniId: string
  title: string
  description: string
  company: string
  location: string
  type: 'internship' | 'full-time' | 'part-time' | 'contract'
  tags: string[]
  requirements: string[]
  benefits: string[]
  salary?: string
  active: boolean
  createdAt: string
  expiresAt: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  timestamp: string
  type: 'text' | 'system'
}

export interface Conversation {
  id: string
  participants: string[]
  messages: Message[]
  lastMessage?: Message
  aiSummary?: string
  actionItems?: string[]
  createdAt: string
  updatedAt: string
}

export interface Event {
  id: string
  title: string
  description: string
  datetime: string
  location: string
  type: 'networking' | 'workshop' | 'career_fair' | 'social' | 'webinar'
  maxAttendees?: number
  registeredCount: number
  createdBy: string
  tags: string[]
}

export interface AIMatch {
  alumni: User
  matchScore: number
  reasons: string[]
  sharedSkills: string[]
  industryMatch: boolean
}