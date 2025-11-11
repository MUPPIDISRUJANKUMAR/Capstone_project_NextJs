'use client'

import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, MapPin, Building, Award, Star, Send, Loader2, MessageSquare, Clock } from "lucide-react";
import { Card, CardHeader, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { User, UserRole } from "../../types";
import { useAuth } from "../../contexts/AuthContext";

interface ChatRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
}

interface AlumniWithSource extends User {
  verified?: boolean;
  skills: string[];
  interests: string[];
  industry: string;
  company: string;
  position: string;
  graduationYear: number;
  major: string;
  bio: string;
  availability: "open" | "limited" | "closed";
  location: string;
  matchScore: number;
  connections: number;
  source: "static" | "firestore";
}

export const AlumniDiscovery: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniWithSource | null>(null);
  const [requestModal, setRequestModal] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [sentRequests, setSentRequests] = useState<ChatRequest[]>([]);

  const initialAlumni: AlumniWithSource[] = [
    {
      id: "2",
      name: "Sarah Rodriguez",
      email: "sarah.rodriguez@techcorp.com",
      role: "alumni",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      verified: true,
      skills: ["Product Management", "Strategy", "Analytics", "Leadership"],
      interests: ["Product Strategy", "Mentorship", "EdTech"],
      industry: "Technology",
      company: "TechCorp",
      position: "Senior Product Manager",
      graduationYear: 2018,
      major: "Business Administration",
      bio: "Product leader with 6+ years experience in tech. Passionate about mentoring the next generation.",
      availability: "open",
      location: "Seattle, WA",
      matchScore: 95,
      connections: 127,
      source: "static",
    },
    {
      id: "3",
      name: "David Kim",
      email: "david.kim@startup.com",
      role: "alumni",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      verified: true,
      skills: ["JavaScript", "React", "Node.js", "Python", "Machine Learning"],
      interests: ["Full Stack Development", "AI/ML", "Startups"],
      industry: "Technology",
      company: "StartupXYZ",
      position: "Senior Software Engineer",
      graduationYear: 2019,
      major: "Computer Science",
      bio: "Full-stack engineer with startup experience. Love building scalable applications and mentoring junior developers.",
      availability: "limited",
      location: "San Francisco, CA",
      matchScore: 87,
      connections: 89,
      source: "static",
    },
    {
      id: "4",
      name: "Emily Chen",
      email: "emily.chen@designstudio.com",
      role: "alumni",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      verified: true,
      skills: ["UI/UX Design", "Figma", "Design Systems", "User Research"],
      interests: ["Design", "User Experience", "Creative Technology"],
      industry: "Design",
      company: "Design Studio",
      position: "Lead UX Designer",
      graduationYear: 2017,
      major: "Design",
      bio: "Creative designer passionate about user-centered design and emerging technologies.",
      availability: "open",
      location: "New York, NY",
      matchScore: 76,
      connections: 156,
      source: "static",
    },
    {
      id: "5",
      name: "Michael Thompson",
      email: "michael.thompson@consulting.com",
      role: "alumni",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      verified: true,
      skills: [
        "Strategy Consulting",
        "Business Analysis",
        "Project Management",
      ],
      interests: ["Business Strategy", "Leadership", "Mentorship"],
      industry: "Consulting",
      company: "McKinsey & Company",
      position: "Senior Consultant",
      graduationYear: 2015,
      major: "Business Administration",
      bio: "Strategic consultant helping organizations solve complex problems. Passionate about developing future leaders.",
      availability: "limited",
      location: "Chicago, IL",
      matchScore: 82,
      connections: 203,
      source: "static",
    },
  ];

  const [alumniList, setAlumniList] =
    useState<AlumniWithSource[]>(initialAlumni);

  useEffect(() => {
    const fetchAlumniData = async () => {
      try {
        if (!db) return;
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("role", "==", "alumni")); // Filter by role 'alumni'
        const querySnapshot = await getDocs(q);
        const firestoreAlumni: AlumniWithSource[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data(); // Get data without casting to User initially
          firestoreAlumni.push({
            id: doc.id,
            name: (data.name as string) || "",
            email: (data.email as string) || "",
            avatar: (data.avatar as string) || "",
            role: (data.role as UserRole) || "alumni",
            verified: (data.verified as boolean) || false,
            skills: (data.skills as string[]) || [],
            interests: (data.interests as string[]) || [],
            industry: (data.industry as string) || "",
            company: (data.company as string) || "",
            position: (data.position as string) || "",
            graduationYear: (data.graduationYear as number) || 0,
            major: (data.major as string) || "",
            bio: (data.bio as string) || "",
            availability:
              (data.availability as "open" | "limited" | "closed") || "closed",
            location: (data.location as string) || "",
            matchScore: (data.matchScore as number) || 0,
            connections: (data.connections as number) || 0,
            source: "firestore",
          });
        });
        console.log("Firestore Alumni:", firestoreAlumni);

        // Create a map for quick lookup of Firestore alumni by ID or name
        const firestoreAlumniMap = new Map<string, AlumniWithSource>();
        firestoreAlumni.forEach((fa) => {
          if (fa.id) firestoreAlumniMap.set(fa.id, fa);
          if (fa.name) firestoreAlumniMap.set(fa.name, fa);
        });

        // Merge static alumni with Firestore alumni, prioritizing Firestore data
        const combinedAlumni: AlumniWithSource[] = initialAlumni.map((staticAlumni) => {
          const firestoreMatchById = staticAlumni.id
            ? firestoreAlumniMap.get(staticAlumni.id)
            : undefined;
          const firestoreMatchByName = staticAlumni.name
            ? firestoreAlumniMap.get(staticAlumni.name)
            : undefined;
          const firestoreMatch = firestoreMatchById || firestoreMatchByName;

          return firestoreMatch
            ? { ...staticAlumni, ...firestoreMatch, source: "firestore" }
            : staticAlumni;
        });
        console.log("Combined Alumni (after merging static with Firestore matches):", combinedAlumni);

        // Add any Firestore alumni that were not in the initial static list
        firestoreAlumni.forEach((fa) => {
          if (
            !combinedAlumni.some((ca) => ca.id === fa.id || ca.name === fa.name)
          ) {
            combinedAlumni.push(fa);
          }
        });
        console.log("Combined Alumni (after adding unique Firestore entries):", combinedAlumni);

        setAlumniList(combinedAlumni);
        console.log("Final Alumni List state:", combinedAlumni);
      } catch (error) {
        console.error("Error fetching alumni from Firestore:", error);
      }
    };

    fetchAlumniData();
  }, []);

  // Fetch user's sent requests
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
        console.warn('Firebase Admin not configured, using empty requests for demo');
        setSentRequests([]);
      }
    } catch (error) {
      console.error('Error fetching sent requests:', error);
      setSentRequests([]);
    }
  };

  const handleSendRequest = async () => {
    if (!selectedAlumni || !user?.id) return;

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
          toUserId: selectedAlumni.id,
          message: requestMessage || `Hi ${selectedAlumni.name}, I'd like to connect with you and learn more about your experience at ${selectedAlumni.company}.`
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setRequestModal(false);
        setRequestMessage('');
        fetchRequests(); // Refresh requests
        
        // Show success toast/popup
        alert('✅ Connection request sent successfully! The alumni will be notified.');
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

  const hasPendingRequest = (alumniId: string) => {
    return sentRequests.some(req => req.toUserId === alumniId && req.status === 'pending');
  };

  const hasAcceptedRequest = (alumniId: string) => {
    return sentRequests.some(req => req.toUserId === alumniId && req.status === 'accepted');
  };

  const industries = [
    "all",
    "Technology",
    "Design",
    "Consulting",
    "Finance",
    "Healthcare",
  ];

  const filteredAlumni = alumniList.filter((alumni) => {
    const matchesSearch =
      alumni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alumni.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alumni.skills.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesIndustry =
      selectedIndustry === "all" || alumni.industry === selectedIndustry;

    return matchesSearch && matchesIndustry;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2 mt-3">Discover Alumni</h1>
        <p className="text-muted-foreground text-lg">
          Connect with alumni based on AI-powered recommendations and shared
          interests.
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search alumni by name, company, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-background"
              >
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry === "all" ? "All Industries" : industry}
                  </option>
                ))}
              </select>
              <Button variant="outline">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alumni Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAlumni.map((alumni, index) => (
          <motion.div
            key={alumni.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={`h-full hover:shadow-lg transition-shadow ${
                alumni.source === "static" ? "border-red-500 border-2" : ""
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={alumni.avatar} alt={alumni.name} />
                      <AvatarFallback>
                        {alumni.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{alumni.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {alumni.position}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">
                      {alumni.matchScore}%
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Building className="h-4 w-4" />
                    <span>{alumni.company}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{alumni.location}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Award className="h-4 w-4" />
                    <span>Class of {alumni.graduationYear}</span>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {alumni.bio}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {alumni.skills.slice(0, 3).map((skill, skillIndex) => (
                      <Badge
                        key={skillIndex}
                        variant="secondary"
                        className="text-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                    {alumni.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{alumni.skills.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          alumni.availability === "open"
                            ? "bg-green-500"
                            : alumni.availability === "limited"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                      ></div>
                      <span className="text-xs text-muted-foreground capitalize">
                        {alumni.availability}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {alumni.connections} connections
                    </span>
                  </div>

                  <Button 
                    className="w-full"
                    disabled={hasPendingRequest(alumni.id) || hasAcceptedRequest(alumni.id)}
                    onClick={() => {
                      setSelectedAlumni(alumni);
                      setRequestModal(true);
                    }}
                  >
                    {hasAcceptedRequest(alumni.id) ? (
                      <>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Start Chat
                      </>
                    ) : hasPendingRequest(alumni.id) ? (
                      <>
                        <Clock className="h-4 w-4 mr-2" />
                        Pending
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Request
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Send Request Modal */}
      <AnimatePresence>
        {requestModal && selectedAlumni && (
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
                  <AvatarImage src={selectedAlumni.avatar} />
                  <AvatarFallback>
                    {selectedAlumni.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">Send Connection Request</h3>
                  <p className="text-sm text-muted-foreground">{selectedAlumni.name}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Message (optional)</label>
                  <textarea
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    placeholder={`Introduce yourself and why you'd like to connect with ${selectedAlumni.name}...`}
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

      {filteredAlumni.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No alumni found matching your criteria.
          </p>
        </div>
      )}
    </div>
  );
};
