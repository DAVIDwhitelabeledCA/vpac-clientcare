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
echo "GOOGLE_CLIENT_ID=1015941417156-g9valupsuktf1e7s10vthc4u057n3p01.apps.googleusercontent.com"
echo "GOOGLE_CLIENT_SECRET=<set via Secret Manager: google-client-secret>"
echo "GOOGLE_REDIRECT_URI=https://app.vpac.ca/api/auth/google/callback"
echo ""

# Microsoft OAuth
echo "MICROSOFT_CLIENT_ID=ba35162a-4866-4333-8001-494c91b49f25"
echo "MICROSOFT_CLIENT_SECRET=<set via Secret Manager: microsoft-client-secret>"
echo "MICROSOFT_TENANT_ID=common"
echo "MICROSOFT_REDIRECT_URI=https://app.vpac.ca/api/auth/microsoft/callback"
echo ""

# OpenPhone
echo "OPENPHONE_API_KEY=7ghvjT0qojWqvqZKrjFqrYIqd4K67Lh7"
echo "OPENPHONE_API_BASE=https://api.openphone.com/v1"
echo ""

# Application URL
echo "NEXT_PUBLIC_APP_URL=https://app.vpac.ca"
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
