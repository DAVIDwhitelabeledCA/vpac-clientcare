#!/bin/bash

# Script to check if required secrets exist in Google Cloud Secret Manager
# Usage: ./scripts/check-secrets.sh

PROJECT_ID="studio-2120461843-5ad32"

echo "Checking secrets in Google Cloud Secret Manager for project: $PROJECT_ID"
echo ""

# Required secrets based on apphosting.yaml
REQUIRED_SECRETS=(
  "google-client-secret"
  "microsoft-client-secret"
  "firebase-service-account"
)

echo "Required secrets:"
for secret in "${REQUIRED_SECRETS[@]}"; do
  echo "  - $secret"
done
echo ""

# Check if gcloud is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &>/dev/null; then
  echo "⚠️  WARNING: Not authenticated with gcloud"
  echo "   Run: gcloud auth login"
  echo ""
fi

# List all secrets
echo "Checking existing secrets..."
echo ""

EXISTING_SECRETS=$(gcloud secrets list --project="$PROJECT_ID" --format="value(name)" 2>/dev/null | sed 's|projects/.*/secrets/||')

if [ -z "$EXISTING_SECRETS" ]; then
  echo "❌ Could not retrieve secrets list. Please check:"
  echo "   1. You're authenticated: gcloud auth login"
  echo "   2. You have permissions: gcloud projects get-iam-policy $PROJECT_ID"
  echo ""
  echo "Alternatively, check in Firebase Console:"
  echo "   https://console.firebase.google.com/project/$PROJECT_ID/apphosting"
  exit 1
fi

echo "Existing secrets in Secret Manager:"
echo "$EXISTING_SECRETS" | while read -r secret; do
  echo "  ✓ $secret"
done
echo ""

# Check each required secret
MISSING_SECRETS=()
for secret in "${REQUIRED_SECRETS[@]}"; do
  if echo "$EXISTING_SECRETS" | grep -q "^${secret}$"; then
    echo "✅ $secret - EXISTS"
  else
    echo "❌ $secret - MISSING"
    MISSING_SECRETS+=("$secret")
  fi
done

echo ""

if [ ${#MISSING_SECRETS[@]} -eq 0 ]; then
  echo "✅ All required secrets are present!"
else
  echo "⚠️  Missing secrets:"
  for secret in "${MISSING_SECRETS[@]}"; do
    echo "   - $secret"
  done
  echo ""
  echo "To create a secret, run:"
  echo "  gcloud secrets create $secret --project=$PROJECT_ID"
  echo ""
  echo "Or set it via Firebase Console:"
  echo "  https://console.firebase.google.com/project/$PROJECT_ID/apphosting"
fi
