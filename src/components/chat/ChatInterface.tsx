'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Sparkles } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'
import { Badge } from '../ui/badge'

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

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  title = "Chat",
  type = 'chat'
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: type === 'faq' 
        ? "Hi! I'm your AI career assistant. Ask me anything about career paths, interview prep, or professional development!" 
        : "Hey Alex! Thanks for connecting. I'd be happy to help with your career questions.",
      sender: type === 'faq' ? 'ai' : 'other',
      timestamp: new Date().toISOString(),
      senderName: type === 'faq' ? 'AI Assistant' : 'Sarah Rodriguez',
      avatar: type === 'faq' ? undefined : 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    }
  ])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

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
      
      setTimeout(() => {
        const aiResponse = getAIResponse(newMessage)
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: aiResponse,
          sender: 'ai',
          timestamp: new Date().toISOString(),
          senderName: 'AI Assistant'
        }
        setMessages(prev => [...prev, aiMessage])
        setIsTyping(false)
      }, 1500)
    }
  }

  const getAIResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase()
    
    if (lowerQuestion.includes('interview') || lowerQuestion.includes('prepare')) {
      return "Here are some key interview preparation tips:\n\n1. Research the company thoroughly\n2. Practice common behavioral questions using the STAR method\n3. Prepare specific examples of your achievements\n4. Have thoughtful questions ready about the role and company\n5. Practice technical skills if applicable\n\nWould you like me to elaborate on any of these areas?"
    }
    
    if (lowerQuestion.includes('resume') || lowerQuestion.includes('cv')) {
      return "For a strong resume:\n\n1. Keep it concise (1-2 pages for students)\n2. Use action verbs and quantify achievements\n3. Tailor it to each job application\n4. Include relevant projects and coursework\n5. Get it reviewed by career services or mentors\n\nI can help you with specific sections if you'd like!"
    }
    
    if (lowerQuestion.includes('network') || lowerQuestion.includes('connect')) {
      return "Networking tips for students:\n\n1. Start with your university's alumni network\n2. Attend industry events and career fairs\n3. Join professional associations in your field\n4. Use LinkedIn to connect with professionals\n5. Follow up with meaningful conversations\n\nRemember: networking is about building genuine relationships, not just collecting contacts!"
    }
    
    if (lowerQuestion.includes('career') || lowerQuestion.includes('path')) {
      return "Exploring career paths:\n\n1. Identify your interests, skills, and values\n2. Research different roles and industries\n3. Conduct informational interviews\n4. Try internships or job shadowing\n5. Consider your long-term goals\n\nWhat field or industry interests you most? I can provide more specific guidance!"
    }
    
    return "That's a great question! While I can provide general guidance on careers, interviews, networking, and professional development, you might also want to connect with alumni in your specific field for more detailed insights. Is there a particular aspect of your career journey you'd like to focus on?"
  }

  const faqSuggestions = [
    "How do I prepare for technical interviews?",
    "What should I include in my resume?",
    "How do I network effectively?",
    "What career paths are available in tech?"
  ]

  return (
    <div className="max-w-5xl mx-auto h-full">
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 justify-center">
            {type === 'faq' ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
            {title}
            {type === 'faq' && <Badge variant="secondary">AI Powered</Badge>}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                  
                  <div className={`max-w-[70%] ${
                    message.sender === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    <div className={`inline-block px-4 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : message.sender === 'ai'
                        ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-primary/20'
                        : 'bg-muted'
                    }`}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
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
