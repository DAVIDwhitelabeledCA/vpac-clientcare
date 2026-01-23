# Firebase Console Configuration Guide

This guide outlines all the changes you need to make in Firebase Console (and related services) to make this version work.

## 1. Firebase Authentication - Enable Sign-in Providers

**Location**: Firebase Console → Authentication → Sign-in method

Enable the following providers:

### ✅ Email/Password
- **Status**: Enable
- **Email link (passwordless sign-in)**: Optional (not required for this app)

### ✅ Google
- **Status**: Enable
- **Project support email**: Your email
- **Project public-facing name**: Your app name
- **Authorized domains**: 
  - `app.vpac.ca` (your production domain)
  - `localhost` (for local development)
  - Any other domains you use

### ✅ Apple
- **Status**: Enable
- **Services ID**: Your Apple Services ID
- **Apple Team ID**: Your Apple Team ID
- **Key ID**: Your Apple Key ID
- **Private Key**: Your Apple Private Key
- **Authorized domains**: Same as Google above

**Note**: Apple sign-in requires additional setup in Apple Developer Console. If you don't have this configured yet, you can disable it temporarily - the app will still work with Email/Password and Google.

---

## 2. Firebase App Hosting - Environment Variables

**Location**: Firebase Console → App Hosting → Your App → Environment Variables

Since you've removed environment variables from `apphosting.yaml`, you need to configure them in Firebase Console:

**Note**: The values below are based on your current `.env.local` file. To verify these match what's in Firebase Console:
- **Firebase Config**: Go to Firebase Console → Project Settings → General → Your apps → Web app
- **Google OAuth**: Go to Google Cloud Console → APIs & Services → Credentials
- **Microsoft OAuth**: Go to Azure Portal → Azure Active Directory → App registrations
- **Secrets**: Go to Google Cloud Console → Secret Manager (for secrets stored there)

### Firebase Configuration Variables

| Variable Name | Value | Availability |
|--------------|-------|--------------|
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `studio-2120461843-5ad32` | BUILD, RUNTIME |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyBCskj140uBcMCywLzqoPOG7dF7jtIsbn8` | BUILD, RUNTIME |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `studio-2120461843-5ad32.firebaseapp.com` *(default)* or `app.vpac.ca` *(if custom domain configured)* | BUILD, RUNTIME |

**Important**: This is NOT your App Hosting domain (`vpac-client-portal--studio-2120461843-5ad32.us-central1.hosted.app`). The Auth domain is used by Firebase Authentication for OAuth redirects, email verification, and password resets. Use the default Firebase domain unless you've specifically configured a custom domain in Firebase Authentication settings.
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:1015941417156:web:2b3a2fcc320cc94be16191` | BUILD, RUNTIME |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `1015941417156` | BUILD, RUNTIME |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `studio-2120461843-5ad32.firebasestorage.app` | BUILD, RUNTIME |
| `FIREBASE_PROJECT_ID` | `studio-2120461843-5ad32` | BUILD, RUNTIME |

### Google OAuth Variables

| Variable Name | Value | Availability |
|--------------|-------|--------------|
| `GOOGLE_CLIENT_ID` | `1015941417156-3mi2ika4tonvmtd1a9nicf8l5pseh93p.apps.googleusercontent.com` | BUILD, RUNTIME |
| `GOOGLE_CLIENT_SECRET` | *(Set as Secret)* | BUILD, RUNTIME |
| `GOOGLE_REDIRECT_URI` | `https://app.vpac.ca/api/auth/google/callback` | BUILD, RUNTIME |

**To set `GOOGLE_CLIENT_SECRET` as a secret:**
1. Go to Firebase Console → App Hosting → Your App → Secrets
2. Click "Add Secret"
3. Name: `google-client-secret`
4. Value: Your Google OAuth client secret (from Google Cloud Console)
5. Grant access to your App Hosting backend

**Note**: The secret name must match exactly: `google-client-secret` (lowercase with hyphens)

### Microsoft OAuth Variables

| Variable Name | Value | Availability |
|--------------|-------|--------------|
| `MICROSOFT_CLIENT_ID` | `e8c4c87a-3ad6-498c-8321-c0d580d3db9e` | BUILD, RUNTIME |
| `MICROSOFT_CLIENT_SECRET` | *(Set as Secret)* | BUILD, RUNTIME |
| `MICROSOFT_TENANT_ID` | `common` | BUILD, RUNTIME |
| `MICROSOFT_REDIRECT_URI` | `https://app.vpac.ca/api/auth/microsoft/callback` | BUILD, RUNTIME |

**To set `MICROSOFT_CLIENT_SECRET` as a secret:**
1. Go to Firebase Console → App Hosting → Your App → Secrets
2. Click "Add Secret"
3. Name: `microsoft-client-secret`
4. Value: Your Microsoft OAuth client secret (from Azure Portal)
5. Grant access to your App Hosting backend

**Note**: The secret name must match exactly: `microsoft-client-secret` (lowercase with hyphens)

### OpenPhone SMS Variables

| Variable Name | Value | Availability |
|--------------|-------|--------------|
| `OPENPHONE_API_KEY` | `7ghvjT0qojWqvqZKrjFqrYIqd4K67Lh7` | BUILD, RUNTIME |
| `OPENPHONE_API_BASE` | `https://api.openphone.com/v1` | BUILD, RUNTIME |
| `OPENPHONE_PHONE_NUMBER_ID` | *(Your OpenPhone phone number ID)* | BUILD, RUNTIME |

### Application URL

| Variable Name | Value | Availability |
|--------------|-------|--------------|
| `NEXT_PUBLIC_APP_URL` | `https://app.vpac.ca` | BUILD, RUNTIME |

### Optional: Firebase Service Account

If you need server-side Firebase Admin SDK access, you can optionally set:

| Variable Name | Type | Availability |
|--------------|------|--------------|
| `FIREBASE_SERVICE_ACCOUNT` | Secret (JSON string) | BUILD, RUNTIME |

**Note**: The app will try to use Application Default Credentials if this is not set, which should work on Firebase App Hosting.

---

## 3. Firestore Database

**Location**: Firebase Console → Firestore Database

### Deploy Security Rules

1. Go to Firebase Console → Firestore Database → Rules
2. Deploy the rules from `firestore.rules` in your project
3. Or run: `npx firebase-tools deploy --only firestore:rules`

### Deploy Indexes (if needed)

1. Go to Firebase Console → Firestore Database → Indexes
2. Deploy any required indexes
3. Or run: `npx firebase-tools deploy --only firestore:indexes`

---

## 4. Firebase Storage

**Location**: Firebase Console → Storage

### Create Storage Bucket (if not already created)

1. Go to Firebase Console → Storage
2. Click "Get Started" if you haven't set up Storage yet
3. Start in production mode (security rules will be configured separately)
4. Choose your storage location

### Storage Security Rules

The app uses Firebase Storage for document uploads. Make sure you have appropriate security rules configured.

---

## 5. Google Cloud Console - OAuth Configuration

**Location**: [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials

### Authorized Redirect URIs

For your Google OAuth Client ID (`1015941417156-3mi2ika4tonvmtd1a9nicf8l5pseh93p.apps.googleusercontent.com`), add these authorized redirect URIs:

- `https://app.vpac.ca/api/auth/google/callback` (Production)
- `http://localhost:9002/api/auth/google/callback` (Local development)

### Required APIs

Make sure these APIs are enabled:
- ✅ Google Calendar API
- ✅ Google Meet API (if using Google Meet links)

---

## 6. Microsoft Azure AD - OAuth Configuration

**Location**: [Azure Portal](https://portal.azure.com/) → Azure Active Directory → App registrations

### Redirect URIs

For your Microsoft App Registration (`e8c4c87a-3ad6-498c-8321-c0d580d3db9e`), add these redirect URIs:

- `https://app.vpac.ca/api/auth/microsoft/callback` (Production)
- `http://localhost:9002/api/auth/microsoft/callback` (Local development)

### API Permissions

Make sure these permissions are granted:
- ✅ `Calendars.ReadWrite` (Microsoft Graph)
- ✅ `OnlineMeetings.ReadWrite` (Microsoft Graph)

**Note**: These permissions require admin consent if your tenant requires it.

---

## 7. Firebase App Hosting - Domain Configuration

**Location**: Firebase Console → App Hosting → Your App → Domains

### Custom Domain

1. Add your custom domain: `app.vpac.ca`
2. Follow the DNS configuration instructions
3. Wait for SSL certificate provisioning

---

## Quick Checklist

- [ ] Enable Email/Password authentication
- [ ] Enable Google authentication
- [ ] Enable Apple authentication (optional)
- [ ] Configure all Firebase environment variables in App Hosting
- [ ] Set `google-client-secret` as a secret in App Hosting
- [ ] Set `microsoft-client-secret` as a secret in App Hosting
- [ ] Deploy Firestore security rules
- [ ] Deploy Firestore indexes (if needed)
- [ ] Set up Firebase Storage bucket
- [ ] Configure Google OAuth redirect URIs
- [ ] Enable Google Calendar API and Google Meet API
- [ ] Configure Microsoft OAuth redirect URIs
- [ ] Grant Microsoft Graph API permissions
- [ ] Configure custom domain in App Hosting

---

## Testing After Configuration

1. **Test Authentication**:
   - Try email/password login
   - Try Google sign-in
   - Try Apple sign-in (if enabled)

2. **Test OAuth Integrations**:
   - Connect Google Calendar in Settings
   - Connect Microsoft Calendar in Settings
   - Verify calendar events are created

3. **Test App Functionality**:
   - Create appointments
   - Send SMS notifications
   - Upload documents

---

## Troubleshooting

### Authentication Not Working
- Check that sign-in providers are enabled in Firebase Console
- Verify authorized domains include your production domain
- Check browser console for errors

### OAuth Callbacks Failing
- Verify redirect URIs match exactly in Google Cloud Console / Azure AD
- Check that environment variables are set correctly
- Verify secrets are properly configured in App Hosting

### Environment Variables Not Available
- Make sure variables are set for both BUILD and RUNTIME availability
- Check that secrets are granted access to your App Hosting backend
- Verify variable names match exactly (case-sensitive)

### Firestore Permission Errors
- Deploy security rules: `npx firebase-tools deploy --only firestore:rules`
- Check that user roles are set correctly in Firestore documents
- Verify authentication is working before accessing Firestore
