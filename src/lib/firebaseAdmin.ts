import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

let adminDb: any = null

try {
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

  if (privateKey && clientEmail && projectId) {
    // privateKey may include literal \n sequences
    const normalizedKey = privateKey.includes('-----BEGIN') ? privateKey : privateKey.replace(/\\n/g, '\n')
    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: normalizedKey,
        }),
      })
    }
    adminDb = getFirestore()
    console.debug('DEBUG: Firebase Admin initialized', { projectId })
  } else {
    console.warn('DEBUG: Firebase Admin credentials missing; adminDb not initialized')
  }
} catch (err) {
  console.error('DEBUG: Failed to initialize Firebase Admin', err)
}

export { adminDb }
