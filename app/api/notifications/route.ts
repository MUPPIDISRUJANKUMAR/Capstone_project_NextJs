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

    console.log('Notifications GET userId:', userId);

    let snapshot;
    try {
      snapshot = await adminDb
        .collection('notifications')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();
    } catch (e: any) {
      if (e?.code === 9 || (typeof e?.message === 'string' && e.message.includes('FAILED_PRECONDITION'))) {
        snapshot = await adminDb
          .collection('notifications')
          .where('userId', '==', userId)
          .get();
      } else {
        throw e;
      }
    }

    console.log('Notifications snapshot size:', snapshot.size);

    if (snapshot.size === 0) {
      const fallback = await adminDb
        .collection('notifications')
        .where('userId', '==', userId)
        .get();
      snapshot = fallback;
      console.log('Notifications fallback size:', snapshot.size);
    }

    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data() as any).createdAt?.toDate?.() ?? (doc.data() as any).createdAt
    }));

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: (error as any).message }, { status: 500 });
  }
}

// POST - Mark notification as read
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, action, userId } = body;

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
    return NextResponse.json({ error: (error as any).message }, { status: 500 });
  }
}
