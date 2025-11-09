import { NextResponse } from 'next/server'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../../src/lib/firebase'

export async function GET() {
  if (!db) {
    return NextResponse.json({ error: 'Database not available' }, { status: 500 })
  }

  try {
    const usersRef = collection(db, 'users')
    const snapshot = await getDocs(usersRef)
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
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
    // Add user creation logic here
    return NextResponse.json({ message: 'User created successfully' })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
