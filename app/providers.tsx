'use client'

import { AuthProvider } from "../src/contexts/AuthContext"
import { ThemeProvider } from "../src/contexts/ThemeContext"
import { NotificationProvider } from "../src/contexts/NotificationContext"
import { ToastProvider } from "../src/contexts/ToastContext"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </ToastProvider>
  )
}
