import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '../../../src/lib/firebase-admin';

// Demo alumni accounts for testing
const demoAlumni = [
  {
    email: 'sarah.rodriguez@alumni.university.edu',
    password: 'demo123456',
    name: 'Sarah Rodriguez',
    role: 'alumni',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    bio: 'Software Engineer at Google with 5 years of experience in full-stack development.',
    graduationYear: '2019',
    major: 'Computer Science'
  },
  {
    email: 'james.park@alumni.university.edu',
    password: 'demo123456',
    name: 'James Park',
    role: 'alumni',
    avatar: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=150&h=150&fit=crop&crop=face',
    bio: 'Product Manager at Microsoft specializing in AI and machine learning products.',
    graduationYear: '2018',
    major: 'Business Administration'
  }
];

export async function POST() {
  if (!adminAuth || !adminDb) {
    return NextResponse.json({ 
      error: 'Firebase Admin not available',
      message: 'Please configure Firebase Admin credentials first'
    }, { status: 500 });
  }

  try {
    const results: Array<{
      email: string;
      name: string;
      uid?: string;
      status: 'created' | 'already_exists' | 'error';
      error?: string;
    }> = [];
    
    for (const alumni of demoAlumni) {
      try {
        // Create user in Firebase Auth
        const userRecord = await adminAuth.createUser({
          email: alumni.email,
          password: alumni.password,
          displayName: alumni.name,
          emailVerified: true // Auto-verify for demo
        });

        // Create user profile in Firestore
        await adminDb.collection('users').doc(userRecord.uid).set({
          id: userRecord.uid,
          email: alumni.email,
          name: alumni.name,
          role: alumni.role,
          avatar: alumni.avatar,
          bio: alumni.bio,
          graduationYear: alumni.graduationYear,
          major: alumni.major,
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        results.push({
          email: alumni.email,
          name: alumni.name,
          uid: userRecord.uid,
          status: 'created'
        });

        console.log(`✅ Created alumni account: ${alumni.email}`);
      } catch (error: any) {
        if (error.code === 'auth/email-already-exists') {
          results.push({
            email: alumni.email,
            name: alumni.name,
            status: 'already_exists'
          });
          console.log(`ℹ️ Alumni account already exists: ${alumni.email}`);
        } else {
          results.push({
            email: alumni.email,
            name: alumni.name,
            status: 'error',
            error: error.message
          });
          console.error(`❌ Error creating ${alumni.email}:`, error);
        }
      }
    }

    return NextResponse.json({
      message: 'Alumni setup completed',
      results,
      demoAccounts: demoAlumni.map(a => ({
        email: a.email,
        password: a.password,
        name: a.name
      }))
    });

  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ 
      error: 'Setup failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to create demo alumni accounts',
    demoAccounts: demoAlumni.map(a => ({
      email: a.email,
      password: a.password,
      name: a.name
    }))
  });
}
