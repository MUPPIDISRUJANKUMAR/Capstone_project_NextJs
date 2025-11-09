"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../../src/contexts/AuthContext";
import { FirebaseChatInterface } from "../../src/components/chat/FirebaseChatInterface";
import { UserListWithRequests } from "../../src/components/chat/UserListWithRequests";
import { Navbar } from "../../src/components/layout/Navbar";
import { Sidebar } from "../../src/components/layout/Sidebar";
import { NotificationCenter } from "../../src/components/notifications/NotificationCenter";
import { MessageSquare } from "lucide-react";

export default function ChatPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [alumni, setAlumni] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch alumni from Firestore
  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const response = await fetch('/api/users?role=alumni');
        const data = await response.json();
        
        if (response.ok) {
          setAlumni(data.users || []);
        } else {
          // If Firebase is not configured, show mock data for testing
          console.warn('Firebase not configured, using mock data');
          setAlumni([
            {
              id: "mock-alumni-1",
              name: "Sarah Rodriguez (Demo)",
              role: "Software Engineer @ Google",
              avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
              email: "sarah.rodriguez@alumni.university.edu"
            },
            {
              id: "mock-alumni-2", 
              name: "James Park (Demo)",
              role: "Product Manager @ Microsoft",
              avatar: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=150&h=150&fit=crop&crop=face",
              email: "james.park@alumni.university.edu"
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching alumni:', error);
        // Show mock data on error
        setAlumni([
          {
            id: "mock-alumni-1",
            name: "Sarah Rodriguez (Demo)",
            role: "Software Engineer @ Google",
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
            email: "sarah.rodriguez@alumni.university.edu"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchAlumni();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  const handleViewChange = (view: string) => {
    router.push(`/${view}`);
  };

  const handleSessionStart = (sessionId: string) => {
    setActiveSession(sessionId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        onToggleMobileSidebar={() => setMobileSidebarOpen(!isMobileSidebarOpen)}
      />
      <div className="flex">
        <Sidebar
          currentView="chat"
          isMobileSidebarOpen={isMobileSidebarOpen}
          onCloseMobileSidebar={() => setMobileSidebarOpen(false)}
        />
        <main className="flex-1">
          <div className="pt-5 px-6 pb-6 lg:pt-6 lg:px-8 lg:pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1">
                {loading ? (
                  <div className="flex items-center justify-center h-[400px] border rounded-lg bg-muted/20">
                    <div className="text-center space-y-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-sm text-muted-foreground">Loading alumni...</p>
                    </div>
                  </div>
                ) : (
                  <UserListWithRequests
                    users={alumni}
                    onSessionStart={handleSessionStart}
                  />
                )}
              </div>
              <div className="lg:col-span-2">
                {activeSession ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-green-800">
                        ✓ Active Chat Session
                      </p>
                      <p className="text-xs text-green-600">
                        You're now connected via an accepted request
                      </p>
                    </div>
                    <FirebaseChatInterface
                      title="Chat Session"
                      type="chat"
                      sessionId={activeSession}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[600px] border rounded-lg bg-muted/20">
                    <div className="text-center space-y-3">
                      <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">No Active Chat Session</h3>
                        <p className="text-sm text-muted-foreground">
                          Send a request to connect with alumni, or wait for your requests to be accepted
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
