import { NextResponse } from 'next/server'

const systemPrompt = `You are Campus Connect's AI Career Assistant.\n\nYour mission:\n- Provide thoughtful, concise guidance on careers, internships, networking, and professional growth for college students and recent graduates.\n- Draw on general best practices, highlight actionable next steps, and suggest relevant campus resources or alumni connections when helpful.\n- If a question falls outside career-related topics (e.g., personal gossip, unrelated homework, medical or legal queries), respond briefly that you can only assist with career matters and encourage the student to contact an appropriate resource.\n- Keep responses professional yet encouraging, and avoid fabricating personal experiences.\n- When unsure, acknowledge the uncertainty and recommend where the student might find reliable information.\n`

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

const fallbackResponse = (messages: ChatMessage[]) => {
  const lastQuestion = [...messages].reverse().find(msg => msg.role === 'user')?.content
  if (lastQuestion) {
    return `I'm having trouble reaching the AI service right now, but here are a few next steps for "${lastQuestion.slice(0, 120)}":\n\n1. Break the goal into small, daily actions.\n2. Reach out to your campus career center for resources and practice.\n3. Connect with alumni on CampusConnect who have experience in this area.\n\nFeel free to ask again in a bit—I'll try to fetch a richer answer once the service is back.`
  }
  return "I'm having trouble reaching the AI service right now. Try again in a minute, or explore campus career resources and alumni mentors for immediate guidance."
}

export async function POST(request: Request) {
  let conversation: ChatMessage[] = []
  try {
    const body = await request.json()
    const messages: ChatMessage[] = Array.isArray(body?.messages) ? body.messages : []
    conversation = messages

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

    if (!GEMINI_API_KEY) {
      console.warn('[GeminiChat] Missing GEMINI_API_KEY; using fallback response')
      return NextResponse.json({ reply: fallbackResponse(messages) })
    }

    const modelsToTry = Array.from(new Set([GEMINI_MODEL, 'gemini-1.5-flash', 'gemini-pro']))
    let text = ''

    for (const model of modelsToTry) {
      try {
        const lastUserMessage = (() => {
          for (let i = trimmedMessages.length - 1; i >= 0; i--) {
            if (trimmedMessages[i].role === 'user') {
              return trimmedMessages[i].content?.slice(0, 80) || null
            }
          }
          return null
        })()

        console.log('[GeminiChat] Sending request', {
          model,
          messageCount: contents.length,
          lastUserMessage,
        })

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
            model
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

        const data = await response.json().catch(() => undefined)

        if (!response.ok) {
          console.error('[GeminiChat] Model request failed', {
            model,
            status: response.status,
            statusText: response.statusText,
            error: data?.error || data
          })
          continue
        }

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

        if (text) {
          console.log('[GeminiChat] Model succeeded', { model, length: text.length })
          break
        }

        console.warn('[GeminiChat] Empty response body from model', { model })
      } catch (error) {
        console.error('[GeminiChat] Fetch error for model', { model, error })
      }
    }

    if (!text) {
      text = fallbackResponse(messages)
    }

    return NextResponse.json({ reply: text })
  } catch (error) {
    console.error('Chat route error', error)
    return NextResponse.json({ reply: fallbackResponse(conversation) }, { status: 200 })
  }
}
