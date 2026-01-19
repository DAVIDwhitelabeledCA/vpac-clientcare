#!/bin/bash

# Script to set Firebase Cloud Functions environment config
# This uses the firebase functions:config:set command format
# Note: This is for Cloud Functions, not App Hosting

echo "Setting Firebase Cloud Functions environment config..."
echo ""

firebase functions:config:set \
  app.firebase_project_id="studio-2120461843-5ad32" \
  app.firebase_api_key="AIzaSyBCskj140uBcMCywLzqoPOG7dF7jtIsbn8" \
  app.firebase_auth_domain="studio-2120461843-5ad32.firebaseapp.com" \
  app.firebase_app_id="1:1015941417156:web:2b3a2fcc320cc94be16191" \
  app.firebase_messaging_sender_id="1015941417156" \
  app.firebase_storage_bucket="studio-2120461843-5ad32.firebasestorage.app" \
  app.firebase_project_id_server="studio-2120461843-5ad32" \
  \
  google.client_id="1015941417156-4inhugshr0o1st1nj58dtjp8roap8rpt.apps.googleusercontent.com" \
  google.client_secret="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" \
  google.redirect_uri="https://vpac-clientcare--studio-2120461843-5ad32.us-central1.hosted.app/api/auth/google/callback" \
  \
  microsoft.client_id="e8c4c87a-3ad6-498c-8321-c0d580d3db9e" \
  microsoft.client_secret="f91ffa64-3fc1-438b-af95-9b32d0b74518" \
  microsoft.tenant_id="common" \
  microsoft.redirect_uri="https://vpac-clientcare--studio-2120461843-5ad32.us-central1.hosted.app/api/auth/microsoft/callback" \
  \
  openphone.api_key="7ghvjT0qojWqvqZKrjFqrYIqd4K67Lh7" \
  openphone.api_base="https://api.openphone.com/v1" \
  \
  app.url="https://vpac-clientcare--studio-2120461843-5ad32.us-central1.hosted.app"

echo ""
echo "✅ Cloud Functions config set successfully!"
echo ""
echo "⚠️  IMPORTANT NOTES:"
echo "   1. This config is for Cloud Functions only"
echo "   2. App Hosting cannot directly access Cloud Functions config"
echo "   3. You'll need to access these in your code using: functions.config().firebase.project_id"
echo ""
echo "To verify, run: firebase functions:config:get"
