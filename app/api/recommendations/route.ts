import { NextResponse } from 'next/server'
import { adminDb } from '../../../src/lib/firebaseAdmin'
import type { AIMatch, User } from '../../../src/types'

type GeminiResponse = {
  // flexible: we'll attempt to parse JSON from the model output
  text?: string
}

/**
 * GET /api/recommendations?studentId=...
 * Behavior:
 * 1. Load the student profile
 * 2. Query alumni whose skills overlap with the student's interests (array-contains-any)
 * 3. If GEMINI_API_KEY + GEMINI_MODEL available, send a compact candidate list to Gemini to re-rank and return top 20
 * 4. Otherwise fall back to a local heuristic ranking
 */
export async function GET(request: Request) {

  try {
    const url = new URL(request.url)
    const studentId = url.searchParams.get('studentId')
    if (!studentId) {
      return NextResponse.json({ error: 'studentId query parameter required' }, { status: 400 })
    }

    // Load student doc (by doc id or fallback to 'id' field) using admin DB
    let student: User | null = null
    if (!adminDb) return NextResponse.json({ error: 'Admin DB not initialized' }, { status: 500 })
    const studentDoc = await adminDb.collection('users').doc(studentId).get()
    if (studentDoc.exists) {
      student = studentDoc.data() as User
    } else {
      const studentQSnap = await adminDb.collection('users').where('id', '==', studentId).limit(1).get()
      if (!studentQSnap.empty) student = studentQSnap.docs[0].data() as User
    }

    if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

    const studentInterests = (student.interests || []).map((i: string) => i.toLowerCase())

  // Fetch blocked alumni for this student (admin)
  const blockedSnap = await adminDb.collection('alumni_recommendation_blocks').where('studentId', '==', studentId).get()
  const blockedSet = new Set(blockedSnap.docs.map((d: any) => (d.data() as any).alumniId))

    // If student has interests, prefer a targeted query for alumni whose skills contain any of those interests
    let alumniDocs: any[] = []
    if (studentInterests.length > 0) {
      // Admin query: skills array contains any of the student's interests
      const snap = await adminDb.collection('users').where('role', '==', 'alumni').where('skills', 'array-contains-any', studentInterests.slice(0, 10)).limit(200).get()
      alumniDocs = snap.docs.map((d: any) => d.data())
    }

    if (!alumniDocs || alumniDocs.length === 0) {
      const alumniSnap = await adminDb.collection('users').where('role', '==', 'alumni').get()
      alumniDocs = alumniSnap.docs.map((d: any) => d.data())
    }

    // Build compact candidate list and exclude blocked IDs
    const candidates = (alumniDocs as User[])
      .filter(a => a && a.id && !blockedSet.has(a.id))
      .map(a => ({
        id: a.id,
        name: a.name,
        position: a.position || '',
        company: a.company || '',
        skills: (a.skills || []).slice(0, 20),
        interests: (a.interests || []).slice(0, 10),
        bio: a.bio || '',
      }))

    // If no candidates, return empty
    if (!candidates.length) return NextResponse.json({ matches: [] })

    // If Gemini is configured, prepare a prompt and call it to re-rank candidates
  const geminiKey = process.env.GEMINI_API_KEY
  const geminiModel = process.env.GEMINI_MODEL

    const localScore = (cand: any) => {
      const studentSkills = (student.skills || []).map((s: string) => s.toLowerCase())
      const candSkills = (cand.skills || []).map((s: string) => s.toLowerCase())
      const shared = candSkills.filter((s: string) => studentSkills.includes(s)).length
      let score = 50 + shared * 5
      return Math.min(100, score)
    }

    let finalMatches: AIMatch[] = []

    if (geminiKey && geminiModel) {
      try {
        // Build a compact prompt for re-ranking. Keep it concise to avoid large payloads.
  // Per new requirement: pick up to 20 alumni candidates to send to Gemini
        const maxCandidates = 20
        const cands = candidates.slice(0, maxCandidates)
        // Prepare compact JSON payloads for student and candidates to send to the LLM
        const studentSummary = JSON.stringify({
          id: student.id,
          name: student.name || '',
          position: student.position || '',
          skills: (student.skills || []).slice(0, 20),
          interests: (student.interests || []).slice(0, 20),
          goals: student.goals || '',
          industry: student.industry || '',
        })

        const candidateList = cands.map(c => ({ id: c.id, name: c.name, position: c.position, company: c.company, skills: c.skills.slice(0, 20), interests: c.interests.slice(0, 10), bio: (c.bio || '').slice(0, 200) }))
        const candidatesJson = JSON.stringify(candidateList)

  const prompt = `You are an assistant whose job is to re-rank alumni candidates for a student.\n\nINPUTS:\nSTUDENT_JSON=${studentSummary}\nCANDIDATES_JSON=${candidatesJson}\n\nTASK:\n- Re-rank the provided candidates (exactly the candidates in CANDIDATES_JSON) by best overall fit for this student considering skills, interests, goals, position and industry.\n- Return a JSON array (only valid JSON, no extra text) of up to 10 objects in descending order of fit. Each object must have the fields:\n  - id: the candidate id (must match an id in CANDIDATES_JSON)\n  - score: integer 0-100 (higher is better)\n  - reasons: array of up to 4 short phrases (each <= 10 words) explaining why this candidate is a good match.\n\nRESPONSE FORMAT EXAMPLE:\n[ {"id":"alumni123","score":95,"reasons":["3 shared skills: react, node","Same industry: fintech","Mentoring experience"] }, ... ]\n\nReturn ONLY the JSON array. Do not include any commentary, headings, or explanation.`

        const body = {
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.0,
            maxOutputTokens: 3000,
          },
        }

        // Compose endpoint using Gemini "generateContent" path (required for Gemini 1.5/2.x models)
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent?key=${encodeURIComponent(geminiKey)}`

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        })

        const resJson = await res.json()

        // Extract text output from common response shapes
        let outputText: string | undefined
        if (resJson?.candidates && Array.isArray(resJson.candidates) && resJson.candidates[0]) {
          const candidate = resJson.candidates[0]
          if (candidate?.content?.parts && Array.isArray(candidate.content.parts)) {
            outputText = candidate.content.parts
              .map((part: any) => part.text || (Array.isArray(part.content)?part.content.join(''):'') || '')
              .join('')
          }
          if (!outputText && typeof candidate.output === 'string') outputText = candidate.output
          if (!outputText && typeof candidate.text === 'string') outputText = candidate.text
        }
        if (!outputText && resJson?.text) outputText = resJson.text

        // Attempt to find JSON substring in outputText (handle arrays or objects)
        if (outputText) {
          const extractBetween = (startChar: string, endChar: string) => {
            const first = outputText.indexOf(startChar)
            const last = outputText.lastIndexOf(endChar)
            if (first !== -1 && last !== -1 && last > first) return outputText.substring(first, last + 1)
            return null
          }

          // Prefer arrays first (model asked to return an array), then objects
          const jsonSub = extractBetween('[', ']') || extractBetween('{', '}')
          if (jsonSub) {
            try {
              const parsed = JSON.parse(jsonSub)
              // parsed expected to be an array or an object containing an array under known keys
              let list: any[] = []
              if (Array.isArray(parsed)) list = parsed
              else if (Array.isArray(parsed.top_matches)) list = parsed.top_matches
              else if (Array.isArray(parsed.results)) list = parsed.results

              const validateGeminiItem = (it: any) => {
                if (!it || typeof it !== 'object') return false
                if (typeof it.id !== 'string' || !it.id.trim()) return false
                const s = Number(it.score)
                if (Number.isNaN(s) || !isFinite(s)) return false
                if (s < 0 || s > 100) return false
                if (it.reasons !== undefined) {
                  if (!Array.isArray(it.reasons)) return false
                  if (it.reasons.length > 4) return false
                  for (const r of it.reasons) if (typeof r !== 'string') return false
                }
                return true
              }

              const rawList = list.filter((i: any) => validateGeminiItem(i)).slice(0, 10)
              if (rawList.length > 0) {
                finalMatches = rawList.map(item => {
                  const cand = candidates.find((c: any) => c.id === item.id)
                  const alumniObj = cand ? (cand as unknown as User) : ({ id: item.id, name: item.name || '', position: item.position || '', company: item.company || '', skills: item.skills || [], email: '', avatar: '', role: 'alumni' } as unknown as User)
                  const score = Math.round(Math.max(0, Math.min(100, Number(item.score))))
                  const reasons = Array.isArray(item.reasons) ? item.reasons.map(String).slice(0, 4) : []
                  return {
                    alumni: alumniObj,
                    matchScore: score,
                    reasons,
                    sharedSkills: ((cand?.skills || []) as string[]).filter((s: string) => (student.skills || []).map((x: string) => x.toLowerCase()).includes((s || '').toLowerCase())),
                    industryMatch: false,
                  } as AIMatch
                }).slice(0, 10)
              }
            } catch (err) {
              console.error('DEBUG: Failed to parse Gemini response', err)
              // swallow parsing errors; we rely on heuristic fallback below
            }
          }
        }
      } catch (err) {
        // swallow Gemini errors; fallback will run below
        console.error('DEBUG: Gemini API call failed', err)
      }
    }

    // If Gemini did not produce a ranking, do local heuristic ranking
    if (!finalMatches || finalMatches.length === 0) {
      // Local heuristic: compute scores and return top 10
      finalMatches = candidates.map(c => ({
        alumni: c as unknown as User,
        matchScore: localScore(c),
        reasons: [],
        sharedSkills: (c.skills || []).filter((s: string) => (student.skills || []).map((x: string) => x.toLowerCase()).includes((s || '').toLowerCase())),
        industryMatch: false,
      } as AIMatch)).sort((a, b) => b.matchScore - a.matchScore).slice(0, 10)
    }

    // Return up to 10 ranked matches
    return NextResponse.json({ matches: finalMatches.slice(0, 10) })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to compute recommendations' }, { status: 500 })
  }
}
