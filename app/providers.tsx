'use client'

import { useEffect } from "react"
import { AuthProvider } from "../src/contexts/AuthContext"
import { ThemeProvider } from "../src/contexts/ThemeContext"
import { NotificationProvider } from "../src/contexts/NotificationContext"
import { ToastProvider } from "../src/contexts/ToastContext"
import { ChatProvider } from "../src/contexts/ChatContext"

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const checkGeminiConfig = async () => {
      try {
        const res = await fetch('/api/config/gemini')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        console.log(
          '[Gemini] Configuration:',
          data.hasKey ? 'API key present' : 'API key missing',
          '| model =',
          data.model || 'gemini-2.5-flash'
        )
      } catch (error) {
        console.warn('[Gemini] Unable to verify configuration', error)
      }
    }

    checkGeminiConfig()
  }, [])

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
