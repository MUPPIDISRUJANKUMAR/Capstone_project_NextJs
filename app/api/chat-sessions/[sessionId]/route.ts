import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '../../../../src/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// GET - Fetch chat session messages
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    
    // Find the chat session by requestId (sessionId in this context)
    const sessionSnapshot = await adminDb.collection('chatSessions')
      .where('requestId', '==', sessionId)
      .limit(1)
      .get();

    if (sessionSnapshot.empty) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const sessionDoc = sessionSnapshot.docs[0];
    const sessionData = sessionDoc.data();

    // Check if session has expired
    if (sessionData.expiresAt && sessionData.expiresAt.toDate() < new Date()) {
      return NextResponse.json({ error: 'Session expired' }, { status: 410 });
    }

    return NextResponse.json({
      sessionId: sessionDoc.id,
      messages: sessionData.messages || [],
      participants: sessionData.participantIds,
      expiresAt: sessionData.expiresAt?.toDate()
    });
  } catch (error) {
    console.error('Error fetching chat session:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Send a message in the chat session
export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const { message, senderId, senderName } = await request.json();

    if (!message || !senderId) {
      return NextResponse.json({ error: 'Message and sender ID required' }, { status: 400 });
    }

    // Find the chat session
    const sessionSnapshot = await adminDb.collection('chatSessions')
      .where('requestId', '==', sessionId)
      .limit(1)
      .get();

    if (sessionSnapshot.empty) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const sessionDoc = sessionSnapshot.docs[0];
    const sessionData = sessionDoc.data();

    // Check if session has expired
    if (sessionData.expiresAt && sessionData.expiresAt.toDate() < new Date()) {
      return NextResponse.json({ error: 'Session expired' }, { status: 410 });
    }

    // Check if sender is a participant
    if (!sessionData.participantIds.includes(senderId)) {
      return NextResponse.json({ error: 'Not authorized to send messages in this session' }, { status: 403 });
    }

    // Add the message
    const newMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: message,
      senderId,
      senderName: senderName || 'Unknown User',
      timestamp: Timestamp.now(),
      type: 'text'
    };

    await adminDb.collection('chatSessions').doc(sessionDoc.id).update({
      messages: [...(sessionData.messages || []), newMessage],
      lastMessage: Timestamp.now()
    });

    return NextResponse.json({
      success: true,
      message: newMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
