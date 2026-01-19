# VPAC Client Care - Healthcare Management System

A comprehensive healthcare client management and appointment booking system built with Next.js 15, React 19, TypeScript, Firebase, and Tailwind CSS.

## Overview

VPAC Client Care is a full-featured healthcare management platform designed for medical practices to manage clients, appointments, care plans, medical records, and documents. The system supports multiple user roles (staff, clients, office assistants) with role-based access control and includes integrated calendar management with Google Calendar/Meet and Microsoft Calendar/Teams support.

## Key Features

### 🔐 Authentication & User Management
- **Multi-role system**: Staff, clients, and office assistants with role-based permissions
- **Firebase Authentication**: Secure email/password and OAuth authentication
- **User profiles**: Comprehensive client profiles with medical information, insurance details, and contact information
- **Auto-initialization**: User documents automatically created on first login

### 📅 Appointment Booking System
- **Regular Appointments**: Clients can book appointments with their assigned doctor
  - View available time slots based on doctor's schedule
  - Real-time availability checking
  - Automatic conflict detection
- **Urgent Appointments**: On-demand urgent appointment requests
  - Clients submit requests with required reason
  - On-call doctors manually assign time slots
  - Dashboard integration for staff to manage pending requests
  - Automatic notification system

### 📊 Staff Dashboard
- **Upcoming Appointments**: View today's scheduled appointments
- **Urgent Appointment Requests**: Dedicated section for managing pending urgent requests
  - Patient contact information (clickable phone/email)
  - Request timestamp and reason
  - One-click time slot assignment
- **Weekly Activity**: Visual charts and statistics
- **Quick Actions**: Join calls, send SMS, view client profiles

### 🗓️ Calendar Integration
- **Google Calendar & Meet**: 
  - OAuth integration for calendar access
  - Automatic availability sync
  - Google Meet link generation
- **Microsoft Calendar & Teams**:
  - Microsoft Graph API integration
  - Teams meeting link creation
  - Calendar conflict detection
- **Availability Management**: Staff can set their availability blocks
- **External Calendar Sync**: Automatically detects conflicts from external calendars

### 📱 Client Portal
- **Personal Dashboard**: Overview of appointments, records, and care plan
- **Book Appointments**: Easy-to-use booking interface
  - Regular appointment booking with assigned doctor
  - Urgent appointment request form
- **Appointment History**: View past and upcoming appointments
- **Medical Records**: Access to medical records and documents
- **Care Plan**: View and track care plan tasks
- **Profile Management**: Update personal information

### 📋 Care Management
- **Care Plans**: Structured care plan tasks with status tracking
- **Medical Records**: Secure storage and retrieval of medical records
- **Documents**: Document management with template support
- **Task Tracking**: Track completion status and dates

### 💬 Communication & Notifications
- **OpenPhone SMS Integration**: Send SMS notifications to clients
- **Appointment Confirmations**: Automated confirmation requests via SMS
- **Reminders**: Automated appointment reminders
- **Meeting Links**: Automatic generation of Google Meet/Teams links

### 🔒 Security & Permissions
- **Firestore Security Rules**: Comprehensive role-based access control
- **Data Isolation**: Users can only access their own data
- **Staff Permissions**: Staff can view their assigned clients
- **Office Assistant Access**: Full administrative access for office assistants

## Technology Stack

- **Frontend Framework**: Next.js 15 with App Router
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Firebase (Authentication, Firestore, Admin SDK)
- **Calendar APIs**: Google Calendar API, Microsoft Graph API
- **Calendar Integration**: Google Meet, Microsoft Teams
- **SMS**: OpenPhone API

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── (app)/                    # Staff portal routes
│   │   ├── page.tsx              # Main dashboard
│   │   ├── clients/              # Client management
│   │   ├── schedule/             # Availability management
│   │   ├── settings/             # Calendar integrations
│   │   └── team/                  # Team management
│   ├── client/                    # Client portal routes
│   │   ├── page.tsx               # Client dashboard
│   │   ├── book/                  # Book appointments
│   │   ├── appointments/          # Appointment history
│   │   ├── profile/               # Profile management
│   │   ├── records/               # Medical records
│   │   ├── care-plan/             # Care plan
│   │   └── documents/             # Documents
│   ├── api/                       # API routes
│   │   ├── bookings/              # Appointment booking endpoints
│   │   ├── auth/                   # OAuth authentication
│   │   ├── calendar/               # Calendar integration
│   │   └── appointments/           # Appointment management
│   └── book/                      # Public booking page
├── components/                    # React components
│   ├── booking-calendar.tsx       # Appointment booking UI
│   ├── availability-calendar.tsx  # Staff availability management
│   ├── client/                    # Client-specific components
│   ├── layout/                    # Layout components
│   └── ui/                        # shadcn/ui components
├── firebase/                      # Firebase configuration
│   ├── config.ts                  # Firebase client config
│   ├── provider.tsx               # Firebase context provider
│   └── firestore/                 # Firestore hooks
├── lib/                           # Utility libraries
│   ├── firebase-admin.ts          # Firebase Admin SDK
│   ├── booking-helpers.ts         # Booking logic
│   ├── calendar-api.ts            # Calendar API utilities
│   └── openphone-api.ts           # SMS integration
└── hooks/                         # Custom React hooks
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Authentication and Firestore enabled
- Google Cloud project (for Google Calendar integration)
- Microsoft Azure app registration (for Microsoft Calendar integration)
- OpenPhone account (for SMS notifications)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vpac-clientcare
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```bash
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   FIREBASE_PROJECT_ID=your-project-id

   # Firebase Admin SDK (choose one method)
   # Option 1: Service Account JSON file path
   GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
   # Option 2: Service Account JSON content
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}

   # Google OAuth (for Calendar/Meet integration)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:9002/api/auth/google/callback

   # Microsoft OAuth (for Calendar/Teams integration)
   MICROSOFT_CLIENT_ID=your-microsoft-client-id
   MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
   MICROSOFT_TENANT_ID=common
   MICROSOFT_REDIRECT_URI=http://localhost:9002/api/auth/microsoft/callback

   # OpenPhone SMS Integration
   OPENPHONE_API_KEY=your-openphone-api-key
   OPENPHONE_PHONE_NUMBER_ID=your-phone-number-id
   OPENPHONE_API_BASE=https://api.openphone.com/v1

   # Application URL
   NEXT_PUBLIC_APP_URL=http://localhost:9002

   # Optional: Scheduler secret (for scheduled job endpoints)
   SCHEDULER_SECRET=your-random-secret-key
   ```

4. **Set up Firebase**
   
   - Deploy Firestore security rules:
     ```bash
     npx firebase-tools deploy --only firestore:rules
     ```
   
   - Deploy Firestore indexes:
     ```bash
     npx firebase-tools deploy --only firestore:indexes
     ```

5. **Set up Firebase Admin SDK**
   
   Choose one of these methods:
   
   **Option A: Application Default Credentials (Recommended for local dev)**
   ```bash
   gcloud auth application-default login
   gcloud config set project your-project-id
   ```
   
   **Option B: Service Account Key File**
   - Download service account key from Firebase Console
   - Set `GOOGLE_APPLICATION_CREDENTIALS` environment variable
   
   **Option C: Service Account JSON in Environment Variable**
   - Set `FIREBASE_SERVICE_ACCOUNT` with the full JSON content

6. **Run the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:9002`

## User Roles

### Staff
- View and manage assigned clients
- Set availability schedule
- View and manage appointments
- Connect Google/Microsoft calendars
- Assign urgent appointment time slots

### Clients
- View personal dashboard
- Book appointments with assigned doctor
- Request urgent appointments
- View appointment history
- Access medical records and documents
- View and track care plan

### Office Assistants
- Full administrative access
- Manage all clients and appointments
- Create and manage user accounts
- Access all system features

## API Endpoints

### Booking Endpoints
- `GET /api/bookings/availability` - Get available time slots for a client's assigned doctor
- `POST /api/bookings/create` - Create a regular appointment
- `POST /api/bookings/request-urgent` - Submit an urgent appointment request
- `GET /api/bookings/pending-urgent` - Get pending urgent requests (staff only)
- `POST /api/bookings/assign-urgent` - Assign time slot to urgent request (staff only)

### Authentication Endpoints
- `GET /api/auth/google/authorize` - Initiate Google OAuth flow
- `GET /api/auth/google/callback` - Handle Google OAuth callback
- `GET /api/auth/google/refresh` - Refresh Google access token
- `GET /api/auth/microsoft/authorize` - Initiate Microsoft OAuth flow
- `GET /api/auth/microsoft/callback` - Handle Microsoft OAuth callback

### Calendar Endpoints
- `GET /api/calendar/google/availability` - Get Google Calendar busy slots
- `POST /api/calendar/google/meet-link` - Create Google Calendar event with Meet link
- `GET /api/calendar/microsoft/availability` - Get Microsoft Calendar busy slots

## Security Considerations

- **No Hardcoded Secrets**: All API keys, secrets, and credentials are stored in environment variables. **Never commit secrets to the repository.**
- **Firestore Security Rules**: Comprehensive role-based access control
- **OAuth Token Storage**: OAuth tokens stored securely in Firestore with user-specific access
- **Input Validation**: All API endpoints validate input and sanitize data
- **Error Handling**: Sensitive error information is not exposed to clients
- **Environment Variables**: All sensitive configuration is loaded from environment variables:
  - Firebase API keys and project IDs
  - OAuth client IDs and secrets
  - OpenPhone API credentials
  - Firebase Admin SDK credentials

### Important Security Notes

1. **Never commit `.env.local`** - This file is gitignored and contains all your secrets
2. **Setup Scripts** - The scripts in `/scripts` directory may contain default values for one-time setup, but should use environment variables when available
3. **Production Deployment** - Always set environment variables in your hosting platform's secure environment variable settings
4. **API Keys** - Rotate API keys regularly and use different keys for development and production

## Deployment

### Firebase App Hosting

This project is configured for Firebase App Hosting. To deploy:

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase**
   ```bash
   npx firebase-tools deploy
   ```

3. **Set environment variables** in Firebase Console under App Hosting settings

### Environment Variables for Production

Ensure all environment variables are set in your hosting platform:
- Firebase configuration variables
- OAuth client IDs and secrets
- OpenPhone API credentials
- Firebase Admin SDK credentials (via service account or ADC)

## Contributing

1. Create a feature branch
2. Make your changes
3. Ensure all tests pass
4. Submit a pull request

## License

[Your License Here]

## Support

For issues and questions, please contact [your support email] or create an issue in the repository.
