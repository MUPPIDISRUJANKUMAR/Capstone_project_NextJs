'use client'

import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Home,
  Users,
  MessageSquare,
  Briefcase,
  Calendar,
  BarChart3,
  Settings,
  HelpCircle,
  UserCheck,
  Shield,
  User as UserIcon
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { cn } from '../../lib/utils'

interface SidebarProps {
  currentView: string
  isMobileSidebarOpen: boolean
  onCloseMobileSidebar: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, isMobileSidebarOpen, onCloseMobileSidebar }) => {
  const { user } = useAuth()
  const router = useRouter()
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        setIsLargeScreen(window.innerWidth >= 768);
      };
      handleResize(); // Set initial value
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const getMenuItems = () => {    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'profile', label: 'Profile', icon: UserIcon },
      { id: 'chat', label: 'Messages', icon: MessageSquare },
    ]

    let roleSpecificItems:any[] = [];

    switch (user?.role) {
      case 'student':
        roleSpecificItems = [
          { id: 'discover', label: 'Find Alumni', icon: Users },
          { id: 'myrequests', label: 'My Requests', icon: UserCheck },
          { id: 'jobboard', label: 'Job Board', icon: Briefcase },
          { id: 'events', label: 'Events', icon: Calendar },
          { id: 'faq', label: 'Ask AI', icon: HelpCircle },
        ]
        break;
      case 'alumni':
        roleSpecificItems = [
          { id: 'students', label: 'Students', icon: Users },
          { id: 'myrequests', label: 'Requests', icon: UserCheck },
          { id: 'jobboard', label: 'My Postings', icon: Briefcase },
          { id: 'events', label: 'Events', icon: Calendar },
        ]
        break;
      case 'admin':
        roleSpecificItems = [
          { id: 'users', label: 'Users', icon: Users },
          { id: 'verification', label: 'Verification', icon: Shield },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'events', label: 'Events', icon: Calendar },
          { id: 'moderation', label: 'Moderation', icon: Settings },
        ]
        break;
      default:
        break;
    }

    return [...baseItems, ...roleSpecificItems, { id: 'settings', label: 'Settings', icon: Settings }];
  }

  const menuItems = getMenuItems()

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: '-100%' },
  }

  return (
    <>
      {/* Backdrop for mobile sidebar */}
      {isMobileSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCloseMobileSidebar}
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
        />
      )}
      
      {/* Permanent sidebar for desktop, animated for mobile */}
      <AnimatePresence>
        {(isMobileSidebarOpen || isLargeScreen) && (
          <motion.aside 
            initial={!isLargeScreen ? "closed" : false}
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed md:sticky left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-background md:translate-x-0"
          >
            <div className="flex h-full flex-col">
              <div className="flex-1 overflow-y-auto py-6">
                <nav className="space-y-2 px-4">
                  {menuItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link href={`/${item.id}`} key={item.id} passHref legacyBehavior>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            router.push(`/${item.id}`);
                            onCloseMobileSidebar();
                          }}
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer',
                            currentView === item.id
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </motion.div>
                      </Link>
                    )
                  })}
                </nav>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}