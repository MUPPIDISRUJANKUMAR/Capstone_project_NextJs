import { NextResponse } from 'next/server'
import { collection, getDocs, addDoc, query, orderBy } from 'firebase/firestore'
import { db } from '../../../src/lib/firebase'

export async function GET() {
  if (!db) {
    return NextResponse.json({ error: 'Database not available' }, { status: 500 })
  }

  try {
    const eventsRef = collection(db, 'events')
    const q = query(eventsRef, orderBy('date', 'desc'))
    const snapshot = await getDocs(q)
    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return NextResponse.json({ events })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
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
    const eventsRef = collection(db, 'events')
    const docRef = await addDoc(eventsRef, {
      ...body,
      createdAt: new Date().toISOString()
    })
    
    return NextResponse.json({ 
      message: 'Event created successfully',
      id: docRef.id 
    })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}
