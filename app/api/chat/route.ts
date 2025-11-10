import { NextResponse } from 'next/server'

const systemPrompt = `You are Campus Connect's AI Career Assistant.\n\nYour mission:\n- Provide thoughtful, concise guidance on careers, internships, networking, and professional growth for college students and recent graduates.\n- Draw on general best practices, highlight actionable next steps, and suggest relevant campus resources or alumni connections when helpful.\n- If a question falls outside career-related topics (e.g., personal gossip, unrelated homework, medical or legal queries), respond briefly that you can only assist with career matters and encourage the student to contact an appropriate resource.\n- Keep responses professional yet encouraging, and avoid fabricating personal experiences.\n- When unsure, acknowledge the uncertainty and recommend where the student might find reliable information.\n`

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

export async function POST(request: Request) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 })
  }

  try {
    const body = await request.json()
    const messages: ChatMessage[] = Array.isArray(body?.messages) ? body.messages : []

    if (messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 })
    }

    const trimmedMessages = messages.slice(-15)

    const contents = trimmedMessages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [
        {
          text: msg.content
        }
      ]
    }))

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        GEMINI_MODEL
      )}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          systemInstruction: {
            role: 'system',
            parts: [{ text: systemPrompt }]
          },
          contents,
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: undefined
          }
        })
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('Gemini chat error', data)
      return NextResponse.json({ error: 'Failed to generate response' }, { status: response.status })
    }

    let text = ''
    if (Array.isArray(data?.candidates)) {
      for (const candidate of data.candidates) {
        if (candidate?.content?.parts) {
          text = candidate.content.parts
            .map((part: { text?: string }) => part?.text || '')
            .join('')
            .trim()
        }
        if (text) break
      }
    }

    if (!text) {
      text = 'I can help with career-related topics. Could you rephrase or ask a different question?'
    }

    return NextResponse.json({ reply: text })
  } catch (error) {
    console.error('Chat route error', error)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
