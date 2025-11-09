'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { GraduationCap, Moon, Sun, User, LogOut, Settings, Bell, Menu } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useNotifications } from '../../contexts/NotificationContext'
import { Button } from '../ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { NotificationPanel } from '../notifications/NotificationPanel'
import Link from 'next/link'

interface NavbarProps {
  onToggleMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileSidebar }) => {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { unreadCount } = useNotifications()
  const router = useRouter()

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={onToggleMobileSidebar} className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
            <motion.div 
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
            >
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                CampusConnect
              </span>
            </motion.div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="relative"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Notifications */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  )}
                  <Bell className="h-4 w-4" />
                  <span className="sr-only">Notifications</span>
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content className="w-80 bg-background border rounded-lg shadow-lg p-1" align="end">
                <NotificationPanel />
              </DropdownMenu.Content>
            </DropdownMenu.Root>

            {/* User menu */}
            {user && (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name ? user.name.split(' ').map(n => n[0]).join('') : user.email ? user.email.substring(0, 2).toUpperCase() : 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content className="w-56 bg-background border rounded-lg shadow-lg p-1" align="end">
                  <DropdownMenu.Label className="px-2 py-1.5 text-sm font-semibold">
                    {user.name}
                  </DropdownMenu.Label>
                  <DropdownMenu.Separator className="h-px bg-border my-1" />
                  <DropdownMenu.Item 
                    onClick={() => handleNavigation('/profile')}
                    className="flex items-center px-2 py-2 text-sm rounded hover:bg-accent cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenu.Item>
                  <DropdownMenu.Item 
                    onClick={() => handleNavigation('/settings')}
                    className="flex items-center px-2 py-2 text-sm rounded hover:bg-accent cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="h-px bg-border my-1" />
                  <DropdownMenu.Item 
                    className="flex items-center px-2 py-2 text-sm rounded hover:bg-accent cursor-pointer text-destructive"
                    onClick={logout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  )
}