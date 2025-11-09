'use client'

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../../src/contexts/AuthContext";
import { StudentDashboard } from "../../src/components/dashboard/StudentDashboard";
import { Navbar } from "../../src/components/layout/Navbar";
import { Sidebar } from "../../src/components/layout/Sidebar";
import { Notifications } from "../../src/components/notifications/Notifications";

export default function StudentPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
    } else if (user?.role !== 'student') {
      router.push("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'student') {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        onToggleMobileSidebar={() => setMobileSidebarOpen(!isMobileSidebarOpen)} 
      />
      <div className="flex">
        <Sidebar 
          currentView="student" 
          isMobileSidebarOpen={isMobileSidebarOpen}
          onCloseMobileSidebar={() => setMobileSidebarOpen(false)}
        />
        <main className="flex-1">
          <div className="pt-5 px-6 pb-6 lg:pt-6 lg:px-8 lg:pb-8">
            <StudentDashboard />
          </div>
        </main>
        <Notifications />
      </div>
    </div>
  );
}
