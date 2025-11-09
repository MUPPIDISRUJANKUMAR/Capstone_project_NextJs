"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../../../src/contexts/AuthContext";
import { FirebaseChatInterface } from "../../../src/components/chat/FirebaseChatInterface";
import { Navbar } from "../../../src/components/layout/Navbar";
import { Sidebar } from "../../../src/components/layout/Sidebar";
import { Notifications } from "../../../src/components/notifications/Notifications";
import { Card, CardHeader, CardTitle, CardContent } from "../../../src/components/ui/card";
import { Input } from "../../../src/components/ui/input";
import { Button } from "../../../src/components/ui/button";
import { Lock, AlertCircle } from "lucide-react";

interface PageProps {
  params: {
    sessionId: string;
  };
}

export default function ChatSessionPage({ params }: PageProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sessionPassword, setSessionPassword] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const { sessionId } = params;

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

  const handleVerifySession = async () => {
    if (!sessionPassword.trim()) return;

    setIsVerifying(true);
    setVerificationError("");

    try {
      const response = await fetch('/api/verify-test-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          password: sessionPassword
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setIsVerified(true);
      } else {
        setVerificationError(data.message || 'Verification failed');
      }
    } catch (error) {
      setVerificationError('Network error. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isVerified) {
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
          <main className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-md p-6">
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2">
                    <Lock className="h-5 w-5" />
                    Join Secure Chat Session
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Session ID: <code className="bg-muted px-2 py-1 rounded">{sessionId}</code>
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Enter Session Password
                    </label>
                    <Input
                      type="password"
                      value={sessionPassword}
                      onChange={(e) => setSessionPassword(e.target.value)}
                      placeholder="Password from email invitation"
                      className="w-full"
                    />
                  </div>
                  
                  {verificationError && (
                    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                      <AlertCircle className="h-4 w-4" />
                      {verificationError}
                    </div>
                  )}
                  
                  <Button
                    onClick={handleVerifySession}
                    disabled={!sessionPassword.trim() || isVerifying}
                    className="w-full"
                  >
                    {isVerifying ? "Verifying..." : "Join Session"}
                  </Button>
                  
                  <div className="text-center text-xs text-muted-foreground">
                    <p>Check your email for the session password</p>
                    <p>or contact the person who invited you</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
          {isAuthenticated && <Notifications />}
        </div>
      </div>
    );
  }

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
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm font-medium text-green-800">
                  ✓ Verified Session: {sessionId}
                </p>
                <p className="text-xs text-green-600">
                  You're now in a secure chat session
                </p>
              </div>
              <FirebaseChatInterface
                title="Secure Chat Session"
                type="chat"
                sessionId={sessionId}
              />
            </div>
          </div>
        </main>
        {isAuthenticated && <Notifications />}
      </div>
    </div>
  );
}
