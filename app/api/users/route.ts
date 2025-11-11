import { NextResponse } from 'next/server'
import { adminDb } from '../../../src/lib/firebase-admin'

export async function GET(request: Request) {
  console.log('--- API Route: /api/users GET request received ---');
  console.log('Checking adminDb:', adminDb ? 'Initialized' : 'Not initialized');

  if (!adminDb) {
    console.error('Firebase Admin database not initialized');
    console.log('🔧 Firebase Admin Setup Required:');
    console.log('1. Make sure FIREBASE_ADMIN_CLIENT_EMAIL is set');
    console.log('2. Make sure FIREBASE_ADMIN_PRIVATE_KEY is set');
    console.log('3. Make sure NEXT_PUBLIC_FIREBASE_PROJECT_ID is set');
    return NextResponse.json({ 
      error: 'Admin database not available',
      message: 'Firebase Admin is not properly configured. Please check environment variables.',
      users: [] // Return empty array as fallback
    }, { status: 500 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')

    console.log('Fetching users with role:', role);
    console.log('Using adminDb for user fetching.');

    let usersQuery = adminDb.collection('users')
    
    // If role is specified, filter by role
    if (role) {
      usersQuery = usersQuery.where('role', '==', role) as any
    }

    const snapshot = await usersQuery.get()
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    console.log('Found users:', users.length);
    
    return NextResponse.json({ users })
  } catch (error) {
    console.error('--- ERROR in /api/users GET request ---');
    console.error(error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch users',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  console.log('--- API Route: /api/users POST request received ---');
  console.log('Checking adminDb:', adminDb ? 'Initialized' : 'Not initialized');

  if (!adminDb) {
    console.error('Firebase Admin database not initialized');
    return NextResponse.json({ 
      error: 'Admin database not available',
      message: 'Firebase Admin is not properly configured. Please check environment variables.'
    }, { status: 500 })
  }

  try {
    const body = await request.json()
    // Add user creation logic here
    console.log('Using adminDb for user creation.');
    return NextResponse.json({ message: 'User created successfully' })
  } catch (error) {
    console.error('--- ERROR in /api/users POST request ---');
    console.error(error);
    return NextResponse.json(
      { 
        error: 'Failed to create user',
        details: error
      },
      { status: 500 }
    )
  }
}
