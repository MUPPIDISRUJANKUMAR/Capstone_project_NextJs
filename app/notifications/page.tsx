'use client'

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../../src/contexts/AuthContext";
import NotificationsPage from "../../src/components/notifications/NotificationsPage";
import { Navbar } from "../../src/components/layout/Navbar";
import { Sidebar } from "../../src/components/layout/Sidebar";
import { Notifications } from "../../src/components/notifications/Notifications";

export default function NotificationsPageRoute() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        onToggleMobileSidebar={() => setMobileSidebarOpen(!isMobileSidebarOpen)} 
      />
      <div className="flex">
        <Sidebar 
          currentView="notifications" 
          isMobileSidebarOpen={isMobileSidebarOpen}
          onCloseMobileSidebar={() => setMobileSidebarOpen(false)}
        />
        <main className="flex-1">
          <div className="pt-5 px-6 pb-6 lg:pt-6 lg:px-8 lg:pb-8">
            <NotificationsPage />
          </div>
        </main>
        {isAuthenticated && <Notifications />}
      </div>
    </div>
  );
}
