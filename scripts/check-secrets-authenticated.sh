#!/bin/bash

# Script to check Firebase App Hosting secrets after authentication
# Run this after: firebase login --reauth

PROJECT_ID="studio-2120461843-5ad32"

echo "🔍 Checking Firebase App Hosting Configuration..."
echo ""

# Check Firebase authentication
echo "1. Checking Firebase authentication..."
if firebase projects:list &>/dev/null; then
  echo "   ✅ Firebase CLI authenticated"
else
  echo "   ❌ Not authenticated. Run: firebase login --reauth"
  exit 1
fi

echo ""
echo "2. Listing App Hosting backends..."
BACKENDS=$(firebase apphosting:backends:list --project="$PROJECT_ID" 2>/dev/null)
if [ $? -eq 0 ]; then
  echo "$BACKENDS"
else
  echo "   ⚠️  Could not list backends"
fi

echo ""
echo "3. Checking Google Cloud Secret Manager..."
if gcloud secrets list --project="$PROJECT_ID" &>/dev/null; then
  echo "   ✅ Google Cloud authenticated"
  echo ""
  echo "   Required secrets:"
  
  # Check each required secret
  REQUIRED_SECRETS=("google-client-secret" "microsoft-client-secret")
  
  for secret in "${REQUIRED_SECRETS[@]}"; do
    if gcloud secrets describe "$secret" --project="$PROJECT_ID" &>/dev/null; then
      echo "   ✅ $secret - EXISTS"
      # Get version info (but not the actual secret value)
      VERSION=$(gcloud secrets versions list "$secret" --project="$PROJECT_ID" --limit=1 --format="value(name)" 2>/dev/null)
      if [ -n "$VERSION" ]; then
        echo "      Latest version: $VERSION"
      fi
    else
      echo "   ❌ $secret - MISSING"
    fi
  done
else
  echo "   ⚠️  Google Cloud not authenticated. Run: gcloud auth login"
  echo "   Or check secrets manually at:"
  echo "   https://console.cloud.google.com/security/secret-manager?project=$PROJECT_ID"
fi

echo ""
echo "4. Checking App Hosting environment variables..."
echo "   (This requires checking the backend configuration)"
echo "   Visit: https://console.firebase.google.com/project/$PROJECT_ID/apphosting"
echo ""

echo "✅ Check complete!"
echo ""
echo "If secrets are missing, create them with:"
echo "  echo -n 'SECRET_VALUE' | gcloud secrets create SECRET_NAME --project=$PROJECT_ID --data-file=-"
