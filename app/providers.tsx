'use client'

import { AuthProvider } from "../src/contexts/AuthContext"
import { ThemeProvider } from "../src/contexts/ThemeContext"
import { NotificationProvider } from "../src/contexts/NotificationContext"
import { ToastProvider } from "../src/contexts/ToastContext"
import { ChatProvider } from "../src/contexts/ChatContext"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <ChatProvider>
              {children}
            </ChatProvider>
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </ToastProvider>
  )
}
