#!/bin/bash

# Script to set Firebase App Hosting environment variables using Firebase REST API
# This requires authentication and proper permissions

PROJECT_ID="studio-2120461843-5ad32"
BACKEND_ID="vpac-clientcare"
REGION="us-central1"

echo "Setting Firebase App Hosting environment variables..."
echo "Backend: $BACKEND_ID"
echo "Project: $PROJECT_ID"
echo ""

# Check if user is authenticated
if ! firebase projects:list &>/dev/null; then
    echo "❌ Error: Not authenticated with Firebase. Please run: firebase login"
    exit 1
fi

# Get access token
ACCESS_TOKEN=$(gcloud auth print-access-token 2>/dev/null || firebase login:ci 2>/dev/null)

if [ -z "$ACCESS_TOKEN" ]; then
    echo "❌ Error: Could not get access token. Please ensure you're logged in."
    exit 1
fi

# Set environment variables using Firebase REST API
# Note: This uses the Firebase App Hosting API
API_URL="https://firebaseapphosting.googleapis.com/v1beta/projects/$PROJECT_ID/locations/$REGION/backends/$BACKEND_ID"

echo "⚠️  Note: Firebase App Hosting environment variables must be set through the Firebase Console."
echo "   The REST API for setting env vars is not publicly documented."
echo ""
echo "👉 Please set these manually at:"
echo "   https://console.firebase.google.com/project/$PROJECT_ID/apphosting/$BACKEND_ID/environment-variables"
echo ""
echo "Environment variables to set:"
echo "=========================================="

# Format similar to functions:config:set for reference
cat << EOF
firebase.project_id="studio-2120461843-5ad32"
firebase.api_key="AIzaSyBCskj140uBcMCywLzqoPOG7dF7jtIsbn8"
firebase.auth_domain="studio-2120461843-5ad32.firebaseapp.com"
firebase.app_id="1:1015941417156:web:2b3a2fcc320cc94be16191"
firebase.messaging_sender_id="1015941417156"
firebase.storage_bucket="studio-2120461843-5ad32.firebasestorage.app"

google.client_id="1015941417156-g9valupsuktf1e7s10vthc4u057n3p01.apps.googleusercontent.com"
google.client_secret="<use Secret Manager: google-client-secret>"
google.redirect_uri="https://app.vpac.ca/api/auth/google/callback"

microsoft.client_id="ba35162a-4866-4333-8001-494c91b49f25"
microsoft.client_secret="<use Secret Manager: microsoft-client-secret>"
microsoft.tenant_id="common"
microsoft.redirect_uri="https://app.vpac.ca/api/auth/microsoft/callback"

openphone.api_key="7ghvjT0qojWqvqZKrjFqrYIqd4K67Lh7"
openphone.api_base="https://api.openphone.com/v1"

app.url="https://app.vpac.ca"
EOF

echo ""
echo "=========================================="
echo ""
echo "⚠️  IMPORTANT: These must be set in Firebase Console, not via CLI."
echo "   The firebase functions:config:set command only works for Cloud Functions."
