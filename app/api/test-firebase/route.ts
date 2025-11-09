import { NextResponse } from 'next/server';
import { db } from '../../../src/lib/firebase';
import { adminDb } from '../../../src/lib/firebase-admin';

export async function GET() {
  console.log('Testing Firebase configuration...');
  
  // Check client-side Firebase
  console.log('Client Firebase DB:', db ? 'Available' : 'Not available');
  console.log('Firebase Config:', {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Missing',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'Set' : 'Missing',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'Set' : 'Missing',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? 'Set' : 'Missing',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? 'Set' : 'Missing',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? 'Set' : 'Missing',
  });

  // Check server-side Firebase Admin
  console.log('Admin Firebase DB:', adminDb ? 'Available' : 'Not available');
  console.log('Admin Config:', {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'Set' : 'Missing',
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL ? 'Set' : 'Missing',
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY ? 'Set' : 'Missing',
  });

  return NextResponse.json({
    clientFirebase: db ? 'Available' : 'Not available',
    adminFirebase: adminDb ? 'Available' : 'Not available',
    config: {
      clientSide: {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Missing',
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'Set' : 'Missing',
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'Set' : 'Missing',
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? 'Set' : 'Missing',
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? 'Set' : 'Missing',
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? 'Set' : 'Missing',
      },
      serverSide: {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'Set' : 'Missing',
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL ? 'Set' : 'Missing',
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY ? 'Set' : 'Missing',
      }
    }
  });
}
