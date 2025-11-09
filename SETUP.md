# CampusConnect Setup Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.local.example` to `.env.local`
   - Add your Firebase configuration
   - (Optional) Add Gmail OAuth credentials for email functionality

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   Or double-click `start-dev.bat` on Windows

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## Environment Variables

Create a `.env.local` file with the following:

### Required (Firebase)
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Optional (Email functionality)
```
GMAIL_USER=your_gmail_address@gmail.com
CLIENT_ID=your_oauth_client_id
CLIENT_SECRET=your_oauth_client_secret
REFRESH_TOKEN=your_oauth_refresh_token
```

## Available Scripts

- `npm run dev` - Start development server (Next.js)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run server` - Start custom Express server (with Socket.io)

## Project Structure

This is a standard Next.js 13+ App Router application:

- `app/` - Next.js App Router pages and API routes
- `src/components/` - Reusable React components
- `src/lib/` - Utility functions and configurations
- `src/types/` - TypeScript type definitions

## Features

- User authentication (Firebase)
- Student and alumni profiles
- Real-time chat functionality
- Job board
- Events management
- Mentorship requests
- Dark mode support

## Development Notes

- The application uses standard Next.js development server
- Custom Express server is available via `npm run server` if needed
- Socket.io functionality requires the custom server
- Email features require Gmail OAuth setup
