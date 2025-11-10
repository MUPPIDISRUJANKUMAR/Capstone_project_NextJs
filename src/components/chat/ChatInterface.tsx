'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Sparkles } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'
import { Badge } from '../ui/badge'
import ReactMarkdown from 'react-markdown'

interface Message {
  id: string
  content: string
  sender: 'user' | 'ai' | 'other'
  timestamp: string
  senderName?: string
  avatar?: string
}

interface ChatInterfaceProps {
  title?: string
  type?: 'chat' | 'faq'
}

const buildWelcomeMessage = (type: 'chat' | 'faq'): Message => ({
  id: 'welcome',
  content: type === 'faq'
    ? "Hi! I'm your AI career assistant. Ask me anything about career paths, interview prep, or professional development!"
    : "Hey Alex! Thanks for connecting. I'd be happy to help with your career questions.",
  sender: type === 'faq' ? 'ai' : 'other',
  timestamp: new Date().toISOString(),
  senderName: type === 'faq' ? 'AI Assistant' : 'Sarah Rodriguez',
  avatar: type === 'faq' ? undefined : 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
})

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  title = "Chat",
  type = 'chat'
}) => {
  const storageKey = type === 'faq' ? 'chat-history:faq-assistant' : 'chat-history:direct-chat'
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem(storageKey)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed
          }
        }
      } catch (error) {
        console.error('Failed to load saved chat history', error)
      }
    }
    return [buildWelcomeMessage(type)]
  })
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const streamingIntervals = useRef<number[]>([])
  const [autoScroll, setAutoScroll] = useState(true)

  const defaultAssistantFallback = "I'm here to help with career-related questions. Could you try asking about internships, interviews, or professional growth?"

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  useEffect(() => {
    if (autoScroll) {
      scrollToBottom()
    }
  }, [messages, autoScroll])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(messages))
    } catch (error) {
      console.error('Failed to persist chat history', error)
    }
  }, [messages, storageKey])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed)
          return
        }
      }
    } catch (error) {
      console.error('Failed to refresh chat history', error)
    }
    setMessages([buildWelcomeMessage(type)])
  }, [storageKey, type])

  useEffect(() => {
    return () => {
      streamingIntervals.current.forEach(id => clearInterval(id))
      streamingIntervals.current = []
    }
  }, [])

  const streamAssistantMessage = (id: string, fullText: string) => {
    setAutoScroll(true)
    const targetText = fullText && fullText.trim().length > 0 ? fullText : defaultAssistantFallback

    if (targetText.length === 0) {
      setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, content: defaultAssistantFallback } : msg))
      setIsTyping(false)
      return
    }

    const chunkSize = Math.max(4, Math.floor(targetText.length / 120))
    let index = 0

    const intervalId = window.setInterval(() => {
      index = Math.min(targetText.length, index + chunkSize)
      const partial = targetText.slice(0, index)
      setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, content: partial } : msg))

      if (index >= targetText.length) {
        clearInterval(intervalId)
        streamingIntervals.current = streamingIntervals.current.filter(idVal => idVal !== intervalId)
        setIsTyping(false)
      }
    }, 20)

    streamingIntervals.current.push(intervalId)
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    setAutoScroll(true)

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: 'user',
      timestamp: new Date().toISOString(),
      senderName: 'You'
    }

    setMessages(prev => [...prev, userMessage])
    setNewMessage('')
    
    if (type === 'faq') {
      setIsTyping(true)
      const historyForLLM = [...messages, userMessage]
        .filter(msg => msg.sender === 'user' || msg.sender === 'ai')
        .slice(-15)
        .map(msg => ({
          role: msg.sender === 'ai' ? 'assistant' : 'user',
          content: msg.content,
        }))

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: historyForLLM })
        })

        if (!res.ok) {
          throw new Error('Failed to fetch response')
        }

        const data = await res.json()
        const reply = typeof data?.reply === 'string' ? data.reply.trim() : ''

        const aiMessageId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        const aiMessage: Message = {
          id: aiMessageId,
          content: '',
          sender: 'ai',
          timestamp: new Date().toISOString(),
          senderName: 'AI Assistant'
        }

        setMessages(prev => [...prev, aiMessage])
        streamAssistantMessage(aiMessageId, reply)
      } catch (error) {
        console.error('AI chat error', error)
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "I'm having trouble connecting right now. Please try again in a moment.",
          sender: 'ai',
          timestamp: new Date().toISOString(),
          senderName: 'AI Assistant'
        }
        setMessages(prev => [...prev, aiMessage])
        setIsTyping(false)
      }
    }
  }

  const handleScroll = () => {
    const container = messagesContainerRef.current
    if (!container) return
    const { scrollTop, scrollHeight, clientHeight } = container
    const atBottom = scrollHeight - (scrollTop + clientHeight) < 32
    setAutoScroll(atBottom)
  }

  const faqSuggestions = [
    "How do I prepare for technical interviews?",
    "What should I include in my resume?",
    "How do I network effectively?",
    "What career paths are available in tech?"
  ]

  const renderMessageContent = (message: Message) => {
    if (message.sender === 'ai') {
      return (
        <ReactMarkdown
          className="space-y-3 text-sm leading-relaxed break-words"
          components={{
            p: ({ children }) => <p className="text-sm leading-relaxed break-words last:mb-0">{children}</p>,
            ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 text-sm leading-relaxed">{children}</ol>,
            li: ({ children }) => <li className="break-words">{children}</li>,
            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
            a: ({ children, href }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2"
              >
                {children}
              </a>
            )
          }}
        >
          {message.content}
        </ReactMarkdown>
      )
    }

    return (
      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
        {message.content}
      </p>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4">
      <Card className="h-[600px] flex flex-col overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 justify-center">
            {type === 'faq' ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
            {title}
            {type === 'faq' && <Badge variant="secondary">AI Powered</Badge>}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0 min-h-0">
          {/* Messages */}
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex gap-3 ${
                    message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <Avatar className="w-8 h-8">
                    {message.sender === 'ai' ? (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                    ) : message.avatar ? (
                      <AvatarImage src={message.avatar} />
                    ) : (
                      <AvatarFallback>
                        {message.senderName?.split(' ').map(n => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div className={`max-w-full md:max-w-[70%] ${
                    message.sender === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    <div className={`inline-block px-4 py-2 rounded-lg break-words overflow-hidden ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : message.sender === 'ai'
                        ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-primary/20'
                        : 'bg-muted'
                    }`}>
                      {renderMessageContent(message)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <Avatar className="w-8 h-8">
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                </Avatar>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* FAQ Suggestions */}
          {type === 'faq' && messages.length <= 2 && (
            <div className="p-4 border-t">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Try asking:</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {faqSuggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-left justify-start h-auto py-2 px-3"
                    onClick={() => setNewMessage(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
