import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '../../../src/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// GET - Fetch user notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Check if adminDb is initialized
    if (!adminDb) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const snapshot = await adminDb.collection('notifications')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }));

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Mark notification as read
export async function POST(request: NextRequest) {
  try {
    const { notificationId, action } = await request.json();

    // Check if adminDb is initialized
    if (!adminDb) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    if (action === 'mark_read') {
      await adminDb.collection('notifications').doc(notificationId).update({
        read: true,
        readAt: Timestamp.now()
      });

      return NextResponse.json({ success: true });
    }

    if (action === 'mark_all_read') {
      const { userId } = await request.json();
      
      // Check if adminDb is initialized
      if (!adminDb) {
        return NextResponse.json({ error: 'Database not available' }, { status: 500 });
      }
      
      const batch = adminDb.batch();
      const snapshot = await adminDb.collection('notifications')
        .where('userId', '==', userId)
        .where('read', '==', false)
        .get();

      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          read: true,
          readAt: Timestamp.now()
        });
      });

      await batch.commit();

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
