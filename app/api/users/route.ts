import { NextResponse } from 'next/server'
import { collection, getDocs, query, where, Query } from 'firebase/firestore'
import { db } from '../../../src/lib/firebase'

export async function GET(request: Request) {
  if (!db) {
    console.error('Firebase database not initialized');
    return NextResponse.json({ 
      error: 'Database not available',
      message: 'Firebase is not properly configured. Please check environment variables.'
    }, { status: 500 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')

    console.log('Fetching users with role:', role);

    let usersQuery: Query = collection(db, 'users')
    
    // If role is specified, filter by role
    if (role) {
      usersQuery = query(usersQuery, where('role', '==', role))
    }

    const snapshot = await getDocs(usersQuery)
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    console.log('Found users:', users.length);
    
    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch users',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
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
