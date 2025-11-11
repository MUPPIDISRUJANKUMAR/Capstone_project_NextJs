'use client'

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../../src/contexts/AuthContext";
import { Navbar } from "../../src/components/layout/Navbar";
import { Sidebar } from "../../src/components/layout/Sidebar";
import { Notifications } from "../../src/components/notifications/Notifications";
import { Avatar, AvatarImage, AvatarFallback } from "../../src/components/ui/avatar";
import { Badge } from "../../src/components/ui/badge";
import { Button } from "../../src/components/ui/button";

export default function RequestPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [accepted, setAccepted] = useState<Array<{
    id: string;
    displayName: string;
    email: string;
    photoURL?: string;
    connectedAt: string;
  }>>([]);
  const [acceptedLoading, setAcceptedLoading] = useState(true);

  const [pending, setPending] = useState<Array<{
    requestId: string;
    id: string;
    displayName: string;
    email: string;
    photoURL?: string;
    requestedAt: string;
    message?: string;
  }>>([]);
  const [pendingLoading, setPendingLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
    } else if (user?.role !== 'alumni') {
      router.push("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  const loadAccepted = async () => {
    if (!user || user.role !== 'alumni') return;
    setAcceptedLoading(true);
    try {
      const res = await fetch(`/api/chat-requests?userId=${user.id}&status=approved&role=alumni`);
      const data = await res.json();
      if (!res.ok || !data.requests) {
        setAccepted([]);
        return;
      }
      const studentIds = Array.from(new Set(data.requests.map((r: any) => r.fromUserId)));
      const list: any[] = [];
      for (const sid of studentIds) {
        try {
          const ures = await fetch(`/api/users/${sid}`);
          if (!ures.ok) continue;
          const u = await ures.json();
          const req = data.requests.find((r: any) => r.fromUserId === sid);
          list.push({
            id: u.id,
            displayName: u.name || 'Student',
            email: u.email || '',
            photoURL: u.avatar,
            connectedAt: req?.updatedAt || req?.createdAt || new Date().toISOString(),
          });
        } catch {}
      }
      setAccepted(list);
    } catch {
      setAccepted([]);
    } finally {
      setAcceptedLoading(false);
    }
  };

  const loadPending = async () => {
    if (!user || user.role !== 'alumni') return;
    setPendingLoading(true);
    try {
      const res = await fetch(`/api/chat-requests?userId=${user.id}&status=pending&role=alumni`);
      const data = await res.json();
      if (!res.ok || !data.requests) {
        setPending([]);
        return;
      }
      const list: any[] = [];
      for (const r of data.requests as any[]) {
        const sid = r.fromUserId;
        try {
          const ures = await fetch(`/api/users/${sid}`);
          if (!ures.ok) continue;
          const u = await ures.json();
          list.push({
            requestId: r.id,
            id: u.id,
            displayName: u.name || 'Student',
            email: u.email || '',
            photoURL: u.avatar,
            requestedAt: r.createdAt || new Date().toISOString(),
            message: r.message,
          });
        } catch {}
      }
      setPending(list);
    } catch {
      setPending([]);
    } finally {
      setPendingLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadAccepted();
      loadPending();
    }
  }, [user?.id]);

  const handleApprove = async (requestId: string) => {
    try {
      await fetch('/api/chat-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', requestId }),
      });
    } finally {
      await Promise.all([loadAccepted(), loadPending()]);
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      await fetch('/api/chat-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'decline', requestId }),
      });
    } finally {
      await loadPending();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        onToggleMobileSidebar={() => setMobileSidebarOpen(!isMobileSidebarOpen)} 
      />
      <div className="flex">
        <Sidebar 
          currentView="request" 
          isMobileSidebarOpen={isMobileSidebarOpen}
          onCloseMobileSidebar={() => setMobileSidebarOpen(false)}
        />
        <main className="flex-1">
          <div className="pt-5 px-6 pb-6 lg:pt-6 lg:px-8 lg:pb-8">
            <h1 className="text-2xl font-bold mb-4">Requests</h1>
            <div className="space-y-8">
              <section>
                <h2 className="text-lg font-semibold mb-3">Accepted</h2>
                {acceptedLoading ? (
                  <div className="flex items-center justify-center h-24">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                  </div>
                ) : accepted.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No students connected yet.</p>
                ) : (
                  <div className="space-y-3">
                    {accepted.map((s) => (
                      <div key={s.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={s.photoURL} alt={s.displayName} />
                            <AvatarFallback>{s.displayName.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{s.displayName}</div>
                            <div className="text-xs text-muted-foreground">{s.email}</div>
                            <div className="text-xs text-muted-foreground">Connected {new Date(s.connectedAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Connected</Badge>
                          <Button size="sm" variant="outline">Message</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">Pending requests</h2>
                {pendingLoading ? (
                  <div className="flex items-center justify-center h-24">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                  </div>
                ) : pending.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No pending requests.</p>
                ) : (
                  <div className="space-y-3">
                    {pending.map((p) => (
                      <div key={p.requestId} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={p.photoURL} alt={p.displayName} />
                            <AvatarFallback>{p.displayName.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{p.displayName}</div>
                            <div className="text-xs text-muted-foreground">{p.email}</div>
                            {p.message && (
                              <div className="text-xs text-muted-foreground mt-1">“{p.message}”</div>
                            )}
                            <div className="text-xs text-muted-foreground">Requested {new Date(p.requestedAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" onClick={() => handleApprove(p.requestId)}>Approve</Button>
                          <Button size="sm" variant="outline" onClick={() => handleDecline(p.requestId)}>Decline</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </main>
        <Notifications />
      </div>
    </div>
  );
}
