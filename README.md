# CampusConnect

CampusConnect is a modern, feature-rich platform designed to connect students and alumni. It provides a space for mentorship, career advice, job opportunities, and social networking within a university community.

## Live Demo

[Link to Live Demo](https://capstone-project-next-js.vercel.app/auth/login)

## Features

- **Authentication:** Secure user registration and login with email verification.
- **User Roles:** Distinct roles for students, alumni, and admins, each with different permissions.
- **Profile Management:** Users can create and edit their profiles, including bio, skills, interests, and more.
- **Alumni Discovery:** Students can search for and connect with alumni based on various criteria.
- **Mentorship Requests:** Students can send mentorship, internship, or career advice requests to alumni.
- **Job Board:** Alumni can post job opportunities, and students can browse and apply for them.
- **Real-time Chat:** Users can communicate with each other in real-time.
- **Notifications:** Users receive notifications for important events, such as new messages or mentorship requests.
- **Events:** Admins can create and manage events, and users can register for them.
- **Dark Mode:** The application supports both light and dark themes.

## Technologies Used

- **Frontend:**
  - [Next.js](https://nextjs.org/) - React framework for server-side rendering and static site generation.
  - [TypeScript](https://www.typescriptlang.org/) - Typed superset of JavaScript.
  - [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework.
  - [Framer Motion](https://www.framer.com/motion/) - A library for animations.
  - [React Query](https://tanstack.com/query/v4) - For data fetching and state management.
- **Backend:**
  - [Firebase](https://firebase.google.com/) - For authentication, Firestore database, and hosting.
- **UI Components:**
  - [shadcn/ui](https://ui.shadcn.com/) - A collection of re-usable UI components.
  - [Radix UI](https://www.radix-ui.com/) - For building accessible design systems.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v18.x or later)
- npm or yarn

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/your_username/your_project_name.git
    ```
2.  Install NPM packages
    ```sh
    npm install
    ```
3.  Set up your environment variables. Create a `.env.local` file in the root of the project and add the following variables:
    ```
    NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
    ```
4.  Run the development server
    ```sh
    npm run dev
    ```

## Project Structure

The project uses Next.js 13+ App Router structure:

```
.
├── app/                    # Next.js App Router directory
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes (users, events, jobs)
│   ├── auth/              # Authentication pages (login, register)
│   ├── chat/              # Chat/messaging pages
│   ├── dashboard/         # Main dashboard pages
│   ├── discover/          # Alumni discovery pages
│   ├── editprofile/       # Profile editing pages
│   ├── events/            # Events pages
│   ├── faq/               # FAQ/AI assistant pages
│   ├── jobboard/          # Job board pages
│   ├── layout.tsx         # Root layout component
│   ├── myrequests/        # Mentorship requests pages
│   ├── notifications/     # Notifications pages
│   ├── page.tsx           # Home page (redirects to login)
│   ├── profile/           # Profile pages
│   ├── providers.tsx      # Global providers wrapper
│   ├── settings/          # Settings pages
│   └── student/           # Student-specific pages
├── src/
│   ├── components/        # React components
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── chat/
│   │   ├── dashboard/
│   │   ├── discover/
│   │   ├── events/
│   │   ├── jobboard/
│   │   ├── layout/
│   │   ├── myrequests/
│   │   ├── notifications/
│   │   ├── profile/
│   │   ├── settings/
│   │   └── ui/
│   ├── contexts/          # React contexts
│   ├── lib/               # Helper functions and Firebase configuration
│   ├── types/             # TypeScript type definitions
│   └── index.css          # Global styles
├── public/                # Static assets
└── styles/                # Global styles (legacy)
```

## License

Distributed under the MIT License. See `LICENSE` for more information.
