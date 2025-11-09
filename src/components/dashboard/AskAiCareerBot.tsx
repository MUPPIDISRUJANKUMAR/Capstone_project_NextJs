'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

export const AskAiCareerBot: React.FC = () => {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAsk = () => {
    if (!query) return
    setLoading(true)
    setResponse('')
    setTimeout(() => {
      setResponse(`Of course, I can help with "${query}". Here is some advice...`)
      setLoading(false)
    }, 1500)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Ask AI Career Bot
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., How to prepare for a technical interview?"
          />
          <Button onClick={handleAsk} disabled={loading}>
            {loading ? 'Thinking...' : 'Ask'}
          </Button>
        </div>
        {response && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-accent/50 border rounded-lg text-sm"
          >
            {response}
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
