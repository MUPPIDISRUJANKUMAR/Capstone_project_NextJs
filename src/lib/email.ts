import { google } from 'googleapis';
import nodemailer from 'nodemailer';

// OAuth2 configuration
const OAuth2 = google.auth.OAuth2;

// Normalize env vars to support both UPPERCASE and lowercase names
const ENV = {
  GMAIL_USER: process.env.GMAIL_USER || process.env.gmail_user,
  CLIENT_ID: process.env.CLIENT_ID || process.env.client_id,
  CLIENT_SECRET: process.env.CLIENT_SECRET || process.env.client_secret,
  REFRESH_TOKEN: process.env.REFRESH_TOKEN || process.env.refresh_token,
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
};

const oauth2Client = new OAuth2(
  ENV.CLIENT_ID,
  ENV.CLIENT_SECRET,
  'https://developers.google.com/oauthplayground' // Redirect URL
);

oauth2Client.setCredentials({
  refresh_token: ENV.REFRESH_TOKEN,
});

// Email sending function
export async function sendEmail({ to, subject, text, html }: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  try {
    // Get access token
    const accessTokenResponse = await oauth2Client.getAccessToken();
    const accessToken = accessTokenResponse.token;

    if (!accessToken) {
      throw new Error('Failed to get access token');
    }

    // Create Nodemailer transporter with OAuth2
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: ENV.GMAIL_USER as string,
        clientId: ENV.CLIENT_ID as string,
        clientSecret: ENV.CLIENT_SECRET as string,
        refreshToken: ENV.REFRESH_TOKEN as string,
        accessToken: accessToken
      }
    });

    // Verify transporter configuration
    await transporter.verify();

    // Send email
    const mailOptions = {
      from: ENV.GMAIL_USER,
      to,
      subject,
      text,
      html: html || text
    };

    const result = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: result.messageId,
      response: result.response
    };

  } catch (error) {
    console.error('Error sending email:', error);
    const msg = (error as any)?.message || 'Unknown error';
    throw new Error(`Failed to send email: ${msg}`);
  }
}

// Template functions for different notification types
export const emailTemplates = {
  chatRequest: (fromUserName: string, message: string) => ({
    subject: 'New Chat Request - CampusConnect',
    text: `You have received a new chat request from ${fromUserName}.\n\nMessage: ${message}\n\nPlease log in to your CampusConnect account to accept or decline this request.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Chat Request</h2>
        <p>You have received a new chat request from <strong>${fromUserName}</strong>.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        </div>
        <p>Please log in to your CampusConnect account to accept or decline this request.</p>
        <div style="margin-top: 30px;">
          <a href="${ENV.APP_URL}/notifications" 
             style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View Notifications
          </a>
        </div>
      </div>
    `
  }),

  requestAccepted: (toUserName: string, sessionId: string) => ({
    subject: 'Chat Request Accepted - CampusConnect',
    text: `Great news! Your chat request has been accepted. You can now start the conversation.\n\nSession ID: ${sessionId}\n\nLog in to begin your chat session.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">Chat Request Accepted!</h2>
        <p>Great news! Your chat request has been accepted.</p>
        <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #c3e6cb;">
          <p><strong>Session Details:</strong></p>
          <p>Session ID: ${sessionId}</p>
        </div>
        <p>Click the button below to start your conversation:</p>
        <div style="margin-top: 30px;">
          <a href="${ENV.APP_URL}/chat" 
             style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Start Chat Session
          </a>
        </div>
      </div>
    `
  }),

  requestDeclined: (toUserName: string) => ({
    subject: 'Chat Request Update - CampusConnect',
    text: `Your chat request has been declined. Don't worry - there are many other alumni available to connect with!\n\nLog in to send new requests.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">Chat Request Update</h2>
        <p>Your chat request has been declined.</p>
        <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #f5c6cb;">
          <p>Don't worry! There are many other alumni available to connect with.</p>
        </div>
        <p>Log in to browse and send new requests:</p>
        <div style="margin-top: 30px;">
          <a href="${ENV.APP_URL}/chat" 
             style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Find More Alumni
          </a>
        </div>
      </div>
    `
  })
};
