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
  google.client_id="1015941417156-g9valupsuktf1e7s10vthc4u057n3p01.apps.googleusercontent.com" \
  google.client_secret="${GOOGLE_CLIENT_SECRET}" \
  google.redirect_uri="https://app.vpac.ca/api/auth/google/callback" \
  \
  microsoft.client_id="ba35162a-4866-4333-8001-494c91b49f25" \
  microsoft.client_secret="${MICROSOFT_CLIENT_SECRET}" \
  microsoft.tenant_id="common" \
  microsoft.redirect_uri="https://app.vpac.ca/api/auth/microsoft/callback" \
  \
  openphone.api_key="7ghvjT0qojWqvqZKrjFqrYIqd4K67Lh7" \
  openphone.api_base="https://api.openphone.com/v1" \
  \
  app.url="https://app.vpac.ca"

echo ""
echo "✅ Cloud Functions config set successfully!"
echo ""
echo "⚠️  IMPORTANT NOTES:"
echo "   1. This config is for Cloud Functions only"
echo "   2. App Hosting cannot directly access Cloud Functions config"
echo "   3. You'll need to access these in your code using: functions.config().firebase.project_id"
echo ""
echo "To verify, run: firebase functions:config:get"
