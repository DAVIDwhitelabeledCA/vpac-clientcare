# Deployment Guide

## Firebase App Hosting Deployment

This project uses **Firebase App Hosting** (not traditional Firebase Hosting) because it's a Next.js application.

### Current Backend Status

Your backend is already configured:
- **Backend Name**: `vpac-clientcare`
- **Repository**: `DAVIDwhitelabeledCA-vpac-clientcare`
- **URL**: https://app.vpac.ca (primary) / https://vpac-clientcare--studio-2120461843-5ad32.us-central1.hosted.app (fallback)
- **Region**: us-central1

### Deployment Methods

#### Option 1: Automatic Deployment via GitHub (Recommended)

Firebase App Hosting automatically deploys when you push to your GitHub repository:

1. **Push your changes to GitHub:**
   ```bash
   git add .
   git commit -m "Deploy to Firebase App Hosting"
   git push origin main
   ```

2. **Firebase will automatically:**
   - Build your Next.js app
   - Deploy to App Hosting
   - Update your live URL

#### Option 2: Manual Deployment via Firebase CLI

1. **Build your app:**
   ```bash
   npm run build
   ```

2. **Deploy via Firebase CLI:**
   ```bash
   firebase apphosting:backends:deploy vpac-clientcare
   ```

   Or if you need to specify a build:
   ```bash
   firebase apphosting:backends:deploy vpac-clientcare --build-id <build-id>
   ```

#### Option 3: Deploy via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/project/studio-2120461843-5ad32/apphosting)
2. Select your backend: `vpac-clientcare`
3. Click "Deploy" or trigger a new build from GitHub

### Environment Variables

**Important**: Set environment variables in Firebase App Hosting:

1. Go to Firebase Console → App Hosting → Your Backend → Environment Variables
2. Add all variables from your `.env.local`:
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_SERVICE_ACCOUNT` (full JSON string)
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET` (Secret Manager: `google-client-secret`)
   - `MICROSOFT_CLIENT_ID`
   - `MICROSOFT_CLIENT_SECRET` (Secret Manager: `microsoft-client-secret`)
   - `MICROSOFT_TENANT_ID`
   - `OPENPHONE_API_KEY`
   - `OPENPHONE_PHONE_NUMBER_ID`
   - `NEXT_PUBLIC_APP_URL` (your production URL, `https://app.vpac.ca`)

### What's Already Deployed

✅ **Firestore Rules** - Deployed  
✅ **Storage Rules** - Deployed  
✅ **Firestore Indexes** - Configured  
✅ **App Hosting Backend** - Configured and linked to GitHub

### Next Steps

1. **Set Environment Variables** in Firebase Console (critical!)
2. **Push to GitHub** to trigger automatic deployment
3. **Monitor deployment** in Firebase Console
4. **Test your live URL**: https://app.vpac.ca (fallback: https://vpac-clientcare--studio-2120461843-5ad32.us-central1.hosted.app)

### Troubleshooting

- **Build failures**: Check Firebase Console → App Hosting → Builds for error logs
- **Environment variables**: Ensure all required variables are set in App Hosting settings
- **API errors**: Verify Firebase Admin SDK credentials are correctly configured

### Useful Commands

```bash
# List backends
firebase apphosting:backends:list

# Get backend details
firebase apphosting:backends:get vpac-clientcare

# View build logs
firebase apphosting:builds:list vpac-clientcare

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage
```
