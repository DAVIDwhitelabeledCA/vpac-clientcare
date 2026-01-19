#!/bin/bash

# Script to set Firebase App Hosting environment variables
# Note: Firebase App Hosting doesn't support CLI commands for setting env vars
# This script provides the values you need to set manually in Firebase Console
# OR you can use the Firebase Console API if you have the proper permissions

BACKEND_ID="vpac-clientcare"
PROJECT_ID="studio-2120461843-5ad32"

echo "=========================================="
echo "Firebase App Hosting Environment Variables"
echo "=========================================="
echo ""
echo "Backend: $BACKEND_ID"
echo "Project: $PROJECT_ID"
echo ""
echo "⚠️  IMPORTANT: Firebase App Hosting doesn't support CLI commands for setting environment variables."
echo "You must set these in Firebase Console:"
echo ""
echo "👉 Go to: https://console.firebase.google.com/project/$PROJECT_ID/apphosting/$BACKEND_ID/environment-variables"
echo ""
echo "=========================================="
echo "Environment Variables to Set:"
echo "=========================================="
echo ""

# Firebase Configuration
echo "NEXT_PUBLIC_FIREBASE_PROJECT_ID=studio-2120461843-5ad32"
echo "NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBCskj140uBcMCywLzqoPOG7dF7jtIsbn8"
echo "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=studio-2120461843-5ad32.firebaseapp.com"
echo "NEXT_PUBLIC_FIREBASE_APP_ID=1:1015941417156:web:2b3a2fcc320cc94be16191"
echo "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1015941417156"
echo "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=studio-2120461843-5ad32.firebasestorage.app"
echo "FIREBASE_PROJECT_ID=studio-2120461843-5ad32"
echo ""

# Google OAuth
echo "GOOGLE_CLIENT_ID=1015941417156-4inhugshr0o1st1nj58dtjp8roap8rpt.apps.googleusercontent.com"
echo "GOOGLE_CLIENT_SECRET=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"
echo "GOOGLE_REDIRECT_URI=https://vpac-clientcare--studio-2120461843-5ad32.us-central1.hosted.app/api/auth/google/callback"
echo ""

# Microsoft OAuth
echo "MICROSOFT_CLIENT_ID=e8c4c87a-3ad6-498c-8321-c0d580d3db9e"
echo "MICROSOFT_CLIENT_SECRET=f91ffa64-3fc1-438b-af95-9b32d0b74518"
echo "MICROSOFT_TENANT_ID=common"
echo "MICROSOFT_REDIRECT_URI=https://vpac-clientcare--studio-2120461843-5ad32.us-central1.hosted.app/api/auth/microsoft/callback"
echo ""

# OpenPhone
echo "OPENPHONE_API_KEY=7ghvjT0qojWqvqZKrjFqrYIqd4K67Lh7"
echo "OPENPHONE_API_BASE=https://api.openphone.com/v1"
echo ""

# Application URL
echo "NEXT_PUBLIC_APP_URL=https://vpac-clientcare--studio-2120461843-5ad32.us-central1.hosted.app"
echo ""

# Firebase Service Account (needs to be set manually with full JSON)
echo "FIREBASE_SERVICE_ACCOUNT=<Set manually with full JSON string from .env.local>"
echo ""
echo "=========================================="
echo ""
echo "Alternative: If you want to use Cloud Functions config (for Cloud Functions only):"
echo "  firebase functions:config:set firebase.project_id=\"studio-2120461843-5ad32\""
echo "  firebase functions:config:set google.client_id=\"1015941417156-4inhugshr0o1st1nj58dtjp8roap8rpt.apps.googleusercontent.com\""
echo "  # etc..."
echo ""
echo "But note: This only works for Cloud Functions, NOT for App Hosting!"
