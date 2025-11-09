import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

let adminDb: admin.firestore.Firestore | null = null;
let adminAuth: admin.auth.Auth | null = null;
let adminStorage: admin.storage.Storage | null = null;

// Check if Firebase Admin is already initialized
if (!getApps().length) {
  try {
    // Initialize Firebase Admin with service account key
    const serviceAccount = {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    console.log('🔍 Checking Firebase Admin credentials:');
    console.log('  Project ID:', serviceAccount.projectId ? '✅ Set' : '❌ Missing');
    console.log('  Client Email:', serviceAccount.clientEmail ? '✅ Set' : '❌ Missing');
    console.log('  Private Key:', serviceAccount.privateKey ? '✅ Set' : '❌ Missing');

    if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      });
      
      // Only export services if Firebase is properly initialized
      adminDb = admin.firestore();
      adminAuth = admin.auth();
      adminStorage = admin.storage();
      
      console.log('✅ Firebase Admin initialized successfully');
    } else {
      console.warn('⚠️ Firebase Admin credentials not fully configured.');
      console.warn('📋 To fix this, add these to your .env.local:');
      console.warn('   FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com');
      console.warn('   FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYOUR_KEY\\n-----END PRIVATE KEY-----\\n"');
      console.warn('🔗 Get credentials from: Firebase Console → Project Settings → Service Accounts');
    }
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error);
  }
} else {
  // Firebase Admin is already initialized, get the services
  adminDb = admin.firestore();
  adminAuth = admin.auth();
  adminStorage = admin.storage();
}

export { adminDb, adminAuth, adminStorage };
