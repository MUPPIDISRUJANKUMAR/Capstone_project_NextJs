# Email Integration Setup Guide

## 🎯 **Overview**

Your CampusConnect application now includes **email notifications** alongside the existing in-app notification system. Emails are sent using Gmail OAuth2 authentication with Nodemailer.

## ✅ **Features Added**

### **Dual Notification System**
- 🔔 **In-app notifications** (existing)
- 📧 **Email notifications** (new)
- ✅ **Automatic fallback** - continues working even if email fails

### **Email Notification Types**
| Action | In-App Notification | Email Notification |
|--------|-------------------|-------------------|
| Chat request sent | ✅ | ✅ |
| Request accepted | ✅ | ✅ |
| Request declined | ✅ | ✅ |

## 🔧 **Setup Instructions**

### **1. Google Cloud Console Setup**

1. **Enable Gmail API**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Select your project
   - Enable "Gmail API"

2. **Create OAuth2 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Select "Web application"
   - Add authorized redirect URI: `https://developers.google.com/oauthplayground`

3. **Get Refresh Token**
   - Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground)
   - Click "Settings" (gear icon) → Check "Use your own OAuth credentials"
   - Enter your Client ID and Client Secret
   - In "Step 1", select "Gmail API v1" → "https://mail.google.com/"
   - Click "Authorize APIs" and complete Google authentication
   - In "Step 2", you'll get an authorization code → Exchange it for tokens
   - Copy the **refresh token**

### **2. Environment Variables**

Add these to your `.env.local` file:

```env
# Gmail OAuth2 Configuration
GMAIL_USER=your-gmail-account@gmail.com
CLIENT_ID=your_google_oauth_client_id
CLIENT_SECRET=your_google_oauth_client_secret
REFRESH_TOKEN=your_google_oauth_refresh_token

# Application URL (for email links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **3. Install Dependencies**

```bash
npm install nodemailer googleapis
```

## 📁 **Files Created/Modified**

### **New Files**
- `src/lib/email.ts` - Email utility with OAuth2 setup
- `app/api/email/route.ts` - Email API endpoint
- `src/components/email/EmailTest.tsx` - Test component
- `.env.example` - Environment variables template
- `EMAIL_SETUP_GUIDE.md` - This guide

### **Modified Files**
- `app/api/chat-requests/route.ts` - Added email notifications

## 🧪 **Testing Email Functionality**

### **Using the Email Test Component**

1. Import the test component in any page:
```tsx
import { EmailTest } from '@/components/email/EmailTest';

export default function TestPage() {
  return <EmailTest />;
}
```

2. **Check Configuration**
   - Click "Check Email Configuration"
   - Should show: "Email service is configured!"

3. **Send Test Email**
   - Click "Fill Test Data" for quick testing
   - Enter your email address
   - Click "Send Email"

### **API Testing**

```bash
# Check configuration
curl http://localhost:3000/api/email

# Send email
curl -X POST http://localhost:3000/api/email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "text": "This is a test email"
  }'
```

## 📧 **Email Templates**

The system includes professional email templates:

### **Chat Request Email**
- Subject: "New Chat Request - CampusConnect"
- Includes sender name and message
- Call-to-action button to view notifications

### **Request Accepted Email**
- Subject: "Chat Request Accepted - CampusConnect"
- Session details included
- Direct button to start chat

### **Request Declined Email**
- Subject: "Chat Request Update - CampusConnect"
- Friendly messaging
- Button to find more alumni

## 🔐 **Security Features**

- ✅ **OAuth2 authentication** - No password storage
- ✅ **Environment variables** - Credentials not in code
- ✅ **Error handling** - Graceful fallback to in-app only
- ✅ **Input validation** - Email format verification
- ✅ **Rate limiting awareness** - Handles Gmail limits

## 🚨 **Troubleshooting**

### **Common Issues**

1. **"invalid_grant" error**
   - Your refresh token has expired
   - Generate a new refresh token from OAuth playground

2. **"unauthorized_client" error**
   - Check your CLIENT_ID and CLIENT_SECRET
   - Ensure redirect URI matches: `https://developers.google.com/oauthplayground`

3. **Email not sending**
   - Check Gmail API is enabled
   - Verify all environment variables are set
   - Check console logs for detailed errors

### **Debug Mode**

Add this to your email API for debugging:
```javascript
console.log('Environment check:', {
  GMAIL_USER: process.env.GMAIL_USER ? '✅' : '❌',
  CLIENT_ID: process.env.CLIENT_ID ? '✅' : '❌',
  CLIENT_SECRET: process.env.CLIENT_SECRET ? '✅' : '❌',
  REFRESH_TOKEN: process.env.REFRESH_TOKEN ? '✅' : '❌'
});
```

## 📊 **How It Works**

### **Flow Diagram**
```
User Action → API Route → In-App Notification ✅
                          ↓
                      Email Function ✅
                          ↓
                      Gmail OAuth2 ✅
                          ↓
                      User's Email ✅
```

### **Error Handling**
- If email fails → In-app notification still works
- OAuth2 errors → Logged but don't crash the app
- Network issues → Automatic retry logic in Nodemailer

## 🎯 **Production Considerations**

1. **Use a dedicated Gmail account** for the application
2. **Monitor Gmail sending limits** (100 emails/day for standard accounts)
3. **Consider Google Workspace** for higher limits
4. **Set up domain verification** for better deliverability
5. **Monitor error logs** for failed email attempts

## ✅ **Testing Checklist**

- [ ] Gmail API enabled in Google Cloud Console
- [ ] OAuth2 credentials created
- [ ] Refresh token generated
- [ ] Environment variables configured
- [ ] Email configuration check passes
- [ ] Test email sends successfully
- [ ] Chat request triggers email notification
- [ ] Accept/decline actions send emails
- [ ] In-app notifications still work when email fails

Your dual notification system is now ready! 🚀
