# FirebaseUI Setup Guide

## Overview

We've integrated FirebaseUI Web to simplify OAuth authentication. FirebaseUI handles all the OAuth redirects, popups, and configuration automatically, making it much easier to set up and maintain.

## What Changed

1. **Installed FirebaseUI**: Added `firebaseui` package to dependencies
2. **Created FirebaseUI Component**: `src/components/firebase-ui.tsx` - A reusable component that handles authentication
3. **Updated Login Pages**: 
   - `/login` - Admin login
   - `/client-login` - Client login
   - Both now use FirebaseUI instead of custom forms

## Firebase Console Configuration

### 1. Enable Authentication Providers

Go to [Firebase Console → Authentication → Sign-in method](https://console.firebase.google.com/project/studio-2120461843-5ad32/authentication/providers)

Enable the following providers:

#### Email/Password
- ✅ Enable
- No additional configuration needed

#### Google
- ✅ Enable
- **Authorized domains**: Add your domains:
  - `app.vpac.ca`
  - `studio-2120461843-5ad32.firebaseapp.com`
  - `localhost` (for development)
- **OAuth redirect URIs**: FirebaseUI handles this automatically, but ensure these are in your Google Cloud Console:
  - `https://app.vpac.ca/__/auth/handler`
  - `https://studio-2120461843-5ad32.firebaseapp.com/__/auth/handler`
  - `http://localhost:9002/__/auth/handler` (for development)

### 2. Configure Authorized Domains

In Firebase Console → Authentication → Settings → Authorized domains:

Add:
- `app.vpac.ca`
- `studio-2120461843-5ad32.firebaseapp.com`
- `localhost` (automatically added)

### 3. Google Cloud Console Configuration

1. Go to [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials?project=studio-2120461843-5ad32)

2. Find your OAuth 2.0 Client ID (the one used for Firebase Authentication)

3. Add authorized JavaScript origins:
   - `https://app.vpac.ca`
   - `https://studio-2120461843-5ad32.firebaseapp.com`
   - `http://localhost:9002` (for development)

4. Add authorized redirect URIs:
   - `https://app.vpac.ca/__/auth/handler`
   - `https://studio-2120461843-5ad32.firebaseapp.com/__/auth/handler`
   - `http://localhost:9002/__/auth/handler` (for development)

## Benefits of FirebaseUI

1. **Simplified Configuration**: No need to manually handle OAuth callbacks
2. **Automatic Redirect Handling**: FirebaseUI manages all redirects
3. **Built-in UI**: Professional, accessible authentication UI
4. **Multiple Providers**: Easy to add more providers (Apple, Facebook, etc.)
5. **Error Handling**: Built-in error handling and user feedback
6. **Mobile Responsive**: Works great on all devices

## Current Supported Providers

- ✅ Email/Password
- ✅ Google Sign-In

## Adding More Providers

To add more providers (like Apple, Microsoft, etc.), update the `signInOptions` in `src/components/firebase-ui.tsx`:

```typescript
signInOptions: [
  {
    provider: 'password',
    requireDisplayName: false,
  },
  {
    provider: 'google.com',
    // ... existing config
  },
  {
    provider: 'apple.com', // Add Apple
  },
  // Add more providers here
],
```

## Installation

After pulling the changes, run:

```bash
npm install
```

This will install the `firebaseui` package.

## Testing

1. **Local Development**:
   ```bash
   npm run dev
   ```
   Visit `http://localhost:9002/login` and test authentication

2. **Production**:
   - Ensure all authorized domains are configured
   - Test on `https://app.vpac.ca/login`

## Troubleshooting

### "OAuth client not found"
- Check that Google OAuth is enabled in Firebase Console
- Verify the OAuth client ID is correct in Firebase project settings

### "Unauthorized domain"
- Add your domain to Firebase Console → Authentication → Settings → Authorized domains
- Add to Google Cloud Console → OAuth 2.0 Client → Authorized domains

### "Redirect URI mismatch"
- Ensure redirect URIs include `/__/auth/handler` (FirebaseUI's handler)
- Add to both Firebase Console and Google Cloud Console

## Notes

- FirebaseUI uses `/__/auth/handler` as the redirect endpoint (handled automatically)
- The component automatically handles sign-in state and redirects
- All authentication state is managed by Firebase Auth
- No custom OAuth callback routes needed anymore!
