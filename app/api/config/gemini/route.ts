import { NextResponse } from 'next/server'

export async function GET() {
  const hasKey = Boolean(process.env.GEMINI_API_KEY)
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

  return NextResponse.json({ hasKey, model })
}
