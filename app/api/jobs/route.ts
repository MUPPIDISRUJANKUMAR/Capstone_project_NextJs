import { NextResponse } from 'next/server'
import { collection, getDocs, addDoc, query, orderBy } from 'firebase/firestore'
import { db } from '../../../src/lib/firebase'

export async function GET() {
  if (!db) {
    return NextResponse.json({ error: 'Database not available' }, { status: 500 })
  }

  try {
    const jobsRef = collection(db, 'jobs')
    const q = query(jobsRef, orderBy('postedAt', 'desc'))
    const snapshot = await getDocs(q)
    const jobs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return NextResponse.json({ jobs })
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  if (!db) {
    return NextResponse.json({ error: 'Database not available' }, { status: 500 })
  }

  try {
    const body = await request.json()
    const jobsRef = collection(db, 'jobs')
    const docRef = await addDoc(jobsRef, {
      ...body,
      postedAt: new Date().toISOString()
    })
    
    return NextResponse.json({ 
      message: 'Job posted successfully',
      id: docRef.id 
    })
  } catch (error) {
    console.error('Error posting job:', error)
    return NextResponse.json(
      { error: 'Failed to post job' },
      { status: 500 }
    )
  }
}
