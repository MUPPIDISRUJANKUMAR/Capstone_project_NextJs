import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '../../../src/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    console.log('Chat requests API called');
    
    // Check if Firebase Admin is initialized
    if (!adminDb) {
      console.error('Firebase Admin not initialized');
      return NextResponse.json({ 
        error: 'Firebase Admin not available',
        message: 'Server configuration error. Please check Firebase Admin credentials.'
      }, { status: 500 });
    }

    const { action, requestId, fromUserId, toUserId, message } = await request.json();
    console.log('Request action:', action, 'from:', fromUserId, 'to:', toUserId);

    switch (action) {
      case 'send':
        // Send chat request
        const requestRef = await adminDb.collection('chatRequests').add({
          fromUserId,
          toUserId,
          message: message || 'Would like to start a conversation',
          status: 'pending',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });

        // Create notification for recipient
        await adminDb.collection('notifications').add({
          userId: toUserId,
          type: 'chat_request',
          title: 'New Chat Request',
          message: `Someone wants to connect with you`,
          requestId: requestRef.id,
          read: false,
          createdAt: Timestamp.now()
        });

        return NextResponse.json({
          success: true,
          requestId: requestRef.id,
          message: 'Chat request sent successfully'
        });

      case 'accept':
        // Accept chat request
        const acceptRef = adminDb.collection('chatRequests').doc(requestId);
        const requestDoc = await acceptRef.get();
        
        if (!requestDoc.exists) {
          return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        const requestData = requestDoc.data();
        if (!requestData) {
          return NextResponse.json({ error: 'Request data not found' }, { status: 404 });
        }
        
        // Update request status
        await acceptRef.update({
          status: 'accepted',
          updatedAt: Timestamp.now()
        });

        // Create chat session
        const sessionRef = await adminDb.collection('chatSessions').add({
          participantIds: [requestData.fromUserId, requestData.toUserId],
          requestId: requestId,
          createdAt: Timestamp.now(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          messages: []
        });

        // Create notifications for both users
        await adminDb.collection('notifications').add({
          userId: requestData.fromUserId,
          type: 'request_accepted',
          title: 'Chat Request Accepted',
          message: 'Your chat request was accepted! You can now start the conversation.',
          sessionId: sessionRef.id,
          read: false,
          createdAt: Timestamp.now()
        });

        await adminDb.collection('notifications').add({
          userId: requestData.toUserId,
          type: 'request_accepted_confirm',
          title: 'Request Accepted',
          message: 'You have accepted the chat request. The session is now ready.',
          sessionId: sessionRef.id,
          read: false,
          createdAt: Timestamp.now()
        });

        return NextResponse.json({
          success: true,
          sessionId: sessionRef.id,
          message: 'Chat request accepted'
        });

      case 'decline':
        // Decline chat request
        const declineRef = adminDb.collection('chatRequests').doc(requestId);
        const declineDoc = await declineRef.get();
        
        if (!declineDoc.exists) {
          return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        const declineData = declineDoc.data();
        if (!declineData) {
          return NextResponse.json({ error: 'Request data not found' }, { status: 404 });
        }
        
        // Update request status
        await declineRef.update({
          status: 'declined',
          updatedAt: Timestamp.now()
        });

        // Create notification for requester
        await adminDb.collection('notifications').add({
          userId: declineData.fromUserId,
          type: 'request_declined',
          title: 'Chat Request Declined',
          message: 'Your chat request was declined.',
          read: false,
          createdAt: Timestamp.now()
        });

        return NextResponse.json({
          success: true,
          message: 'Chat request declined'
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in chat requests API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('GET chat requests called');
    
    // Check if Firebase Admin is initialized
    if (!adminDb) {
      console.error('Firebase Admin not initialized');
      return NextResponse.json({ 
        error: 'Firebase Admin not available',
        message: 'Server configuration error. Please check Firebase Admin credentials.'
      }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    console.log('Fetching requests for user:', userId, 'status:', status);

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    let collectionRef = adminDb.collection('chatRequests');
    let query;
    
    if (status === 'sent') {
      query = collectionRef.where('fromUserId', '==', userId);
    } else if (status === 'received') {
      query = collectionRef.where('toUserId', '==', userId).where('status', '==', 'pending');
    } else {
      // Get all requests for this user (sent or received)
      query = collectionRef.where('fromUserId', '==', userId);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    const requests = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    }));

    console.log('Found requests:', requests.length);

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Error fetching chat requests:', error);
    return NextResponse.json({ 
      error: error.message,
      message: 'Failed to fetch chat requests'
    }, { status: 500 });
  }
}
