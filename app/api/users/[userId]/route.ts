import { NextResponse } from 'next/server'
import { adminDb } from '../../../../src/lib/firebase-admin'

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  console.log('--- API Route: /api/users/[userId] GET request received ---');
  console.log('UserId:', params.userId);
  console.log('Checking adminDb:', adminDb ? 'Initialized' : 'Not initialized');

  if (!adminDb) {
    console.error('Firebase Admin database not initialized');
    return NextResponse.json({ 
      error: 'Admin database not available',
      message: 'Firebase Admin is not properly configured.',
    }, { status: 500 })
  }

  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    console.log('Fetching user with ID:', userId);

    const userDoc = await adminDb.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      console.log('User not found:', userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data() as any;
    
    console.log('Found user:', userData?.displayName || userData?.email);
    
    return NextResponse.json({
      id: userDoc.id,
      ...userData
    });
  } catch (error) {
    console.error('--- ERROR in /api/users/[userId] GET request ---');
    console.error(error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch user',
        message: error instanceof Error ? error.message : 'Unknown error',
      }, 
      { status: 500 }
    );
  }
}
