"use client"

import React, { createContext, useContext, useMemo, useState, useCallback } from "react"

export type ChatSessionType = "chat" | "faq"

export interface ChatMessage {
  id: string
  content: string
  sender: "user" | "ai" | "other"
  timestamp: string
  senderName?: string
  avatar?: string
}

const buildWelcomeMessage = (type: ChatSessionType): ChatMessage => ({
  id: "welcome",
  content:
    type === "faq"
      ? "Hi! I'm your AI career assistant. Ask me anything about career paths, interview prep, or professional development!"
      : "Hey Alex! Thanks for connecting. I'd be happy to help with your career questions.",
  sender: type === "faq" ? "ai" : "other",
  timestamp: new Date().toISOString(),
  senderName: type === "faq" ? "AI Assistant" : "Sarah Rodriguez",
  avatar:
    type === "faq"
      ? undefined
      : "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
})

const INITIAL_STATE: Record<ChatSessionType, ChatMessage[]> = {
  chat: [buildWelcomeMessage("chat")],
  faq: [buildWelcomeMessage("faq")],
}

type MessagesUpdater = ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])

interface ChatContextValue {
  getMessages: (type: ChatSessionType) => ChatMessage[]
  setMessages: (type: ChatSessionType, updater: MessagesUpdater) => void
  resetMessages: (type: ChatSessionType) => void
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined)

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chatHistories, setChatHistories] = useState<Record<ChatSessionType, ChatMessage[]>>(INITIAL_STATE)

  const getMessages = useCallback(
    (type: ChatSessionType) => {
      const history = chatHistories[type]
      if (history && history.length > 0) return history
      return [buildWelcomeMessage(type)]
    },
    [chatHistories]
  )

  const setMessages = useCallback((type: ChatSessionType, updater: MessagesUpdater) => {
    setChatHistories(prev => {
      const current = prev[type] && prev[type].length > 0 ? prev[type] : [buildWelcomeMessage(type)]
      const next = typeof updater === "function" ? (updater as (prev: ChatMessage[]) => ChatMessage[])(current) : updater
      const sanitized = next && next.length > 0 ? next : [buildWelcomeMessage(type)]
      return {
        ...prev,
        [type]: sanitized,
      }
    })
  }, [])

  const resetMessages = useCallback((type: ChatSessionType) => {
    setChatHistories(prev => ({
      ...prev,
      [type]: [buildWelcomeMessage(type)],
    }))
  }, [])

  const value = useMemo(
    () => ({
      getMessages,
      setMessages,
      resetMessages,
    }),
    [getMessages, setMessages, resetMessages]
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export const useChatHistory = (type: ChatSessionType) => {
  const ctx = useContext(ChatContext)
  if (!ctx) {
    throw new Error("useChatHistory must be used within a ChatProvider")
  }

  const messages = ctx.getMessages(type)

  const updateMessages = useCallback(
    (updater: MessagesUpdater) => ctx.setMessages(type, updater),
    [ctx, type]
  )

  const resetMessages = useCallback(() => ctx.resetMessages(type), [ctx, type])

  return {
    messages,
    setMessages: updateMessages,
    resetMessages,
  }
}

export { buildWelcomeMessage }
