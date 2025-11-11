import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '../../../src/lib/email';

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    const requiredEnvVars = ['GMAIL_USER', 'CLIENT_ID', 'CLIENT_SECRET', 'REFRESH_TOKEN'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('Missing environment variables:', missingVars);
      return NextResponse.json({ 
        error: 'Server configuration error', 
        message: 'Email service not properly configured' 
      }, { status: 500 });
    }

    const { to, subject, text, html } = await request.json();

    // Validate required fields
    if (!to || !subject || !text) {
      return NextResponse.json({ 
        error: 'Missing required fields', 
        message: 'to, subject, and text are required' 
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json({ 
        error: 'Invalid email format', 
        message: 'Please provide a valid email address' 
      }, { status: 400 });
    }

    // Send email
    const result = await sendEmail({ to, subject, text, html });

    return NextResponse.json({ 
      success: true, 
      message: 'Email sent successfully',
      messageId: result.messageId,
      data: result
    });

  } catch (error) {
    console.error('Email API error:', error);
    
    // Handle specific OAuth2 errors
    if (error.message.includes('invalid_grant') || error.message.includes('unauthorized_client')) {
      return NextResponse.json({ 
        error: 'Authentication failed', 
        message: 'Gmail OAuth credentials are invalid or expired. Please refresh your tokens.' 
      }, { status: 401 });
    }

    // Handle rate limiting
    if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
      return NextResponse.json({ 
        error: 'Service unavailable', 
        message: 'Email service is temporarily unavailable. Please try again later.' 
      }, { status: 503 });
    }

    return NextResponse.json({ 
      error: 'Failed to send email', 
      message: error.message 
    }, { status: 500 });
  }
}

// GET endpoint for testing email configuration
export async function GET(request: NextRequest) {
  try {
    const requiredEnvVars = ['GMAIL_USER', 'CLIENT_ID', 'CLIENT_SECRET', 'REFRESH_TOKEN'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      return NextResponse.json({ 
        configured: false, 
        missing: missingVars,
        message: 'Email service not configured' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      configured: true, 
      message: 'Email service is properly configured',
      gmailUser: process.env.GMAIL_USER
    });

  } catch (error) {
    return NextResponse.json({ 
      configured: false, 
      error: error.message 
    }, { status: 500 });
  }
}
