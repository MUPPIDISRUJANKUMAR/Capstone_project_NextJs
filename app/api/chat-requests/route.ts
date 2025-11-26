import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '../../../src/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { sendEmail, emailTemplates } from '../../../src/lib/email';

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

        // Send email notification
        try {
          // Get recipient's email from Firestore
          const recipientDoc = await adminDb.collection('users').doc(toUserId).get();
          const recipientData = recipientDoc.data();
          
          // Get sender's name
          const senderDoc = await adminDb.collection('users').doc(fromUserId).get();
          const senderData = senderDoc.data();
          
          if (recipientData?.email && senderData?.displayName) {
            const emailContent = emailTemplates.chatRequest(senderData.displayName, message || 'Would like to start a conversation');
            await sendEmail({
              to: recipientData.email,
              subject: emailContent.subject,
              text: emailContent.text,
              html: emailContent.html
            });
            console.log('Email notification sent to:', recipientData.email);
          }
        } catch (emailError) {
          console.error('Failed to send email notification:', emailError);
          // Continue with the request even if email fails
        }

        return NextResponse.json({
          success: true,
          requestId: requestRef.id,
          message: 'Chat request sent successfully'
        });

      case 'accept':
      case 'approve':
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

        // Send email notifications for accepted request
        try {
          // Get user details for emails
          const [requesterDoc, accepterDoc] = await Promise.all([
            adminDb.collection('users').doc(requestData.fromUserId).get(),
            adminDb.collection('users').doc(requestData.toUserId).get()
          ]);
          
          const requesterData = requesterDoc.data();
          const accepterData = accepterDoc.data();
          
          // Send email to requester
          if (requesterData?.email) {
            const emailContent = emailTemplates.requestAccepted(requesterData.displayName || 'User', sessionRef.id);
            await sendEmail({
              to: requesterData.email,
              subject: emailContent.subject,
              text: emailContent.text,
              html: emailContent.html
            });
            console.log('Acceptance email sent to requester:', requesterData.email);
          }
        } catch (emailError) {
          console.error('Failed to send acceptance email:', emailError);
          // Continue even if email fails
        }

        return NextResponse.json({
          success: true,
          sessionId: sessionRef.id,
          message: 'Chat request accepted'
        });

      case 'decline':
      case 'disapprove':
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

        // Send email notification for declined request
        try {
          // Get requester's details for email
          const requesterDoc = await adminDb.collection('users').doc(declineData.fromUserId).get();
          const requesterData = requesterDoc.data();
          
          if (requesterData?.email) {
            const emailContent = emailTemplates.requestDeclined(requesterData.displayName || 'User');
            await sendEmail({
              to: requesterData.email,
              subject: emailContent.subject,
              text: emailContent.text,
              html: emailContent.html
            });
            console.log('Decline email sent to requester:', requesterData.email);
          }
        } catch (emailError) {
          console.error('Failed to send decline email:', emailError);
          // Continue even if email fails
        }

        return NextResponse.json({
          success: true,
          message: 'Chat request declined'
        });

    }

  } catch (error) {
    console.error('Error in chat requests API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const role = searchParams.get('role');
  const rawStatus = searchParams.get('status');

  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Firebase Admin not available' }, { status: 500 });
    }

    let status = rawStatus || undefined;
    if (status === 'approved') status = 'accepted';

    let query: FirebaseFirestore.Query = adminDb.collection('chatRequests');

    if (userId && status) {
      if (status === 'sent') {
        query = query.where('fromUserId', '==', userId);
      } else if (status === 'received') {
        query = query.where('toUserId', '==', userId);
      } else if (['accepted', 'declined', 'pending'].includes(status)) {
        if (role === 'alumni') {
          query = query.where('toUserId', '==', userId).where('status', '==', status);
        } else if (role === 'student') {
          query = query.where('fromUserId', '==', userId).where('status', '==', status);
        } else {
          const [asSenderSnap, asRecipientSnap] = await Promise.all([
            adminDb.collection('chatRequests').where('fromUserId', '==', userId).where('status', '==', status).get(),
            adminDb.collection('chatRequests').where('toUserId', '==', userId).where('status', '==', status).get(),
          ]);
          const combined = [
            ...asSenderSnap.docs.map(d => ({ id: d.id, ...d.data() })),
            ...asRecipientSnap.docs.map(d => ({ id: d.id, ...d.data() })),
          ];
          return NextResponse.json({ requests: combined });
        }
      } else {
        return NextResponse.json({ requests: [] });
      }
    } else if (userId) {
      query = query.where('toUserId', '==', userId).where('status', '==', 'pending');
    } else {
      return NextResponse.json({ requests: [] });
    }

    const snapshot = await query.get();
    const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Error fetching chat requests:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
