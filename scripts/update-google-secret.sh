#!/bin/bash
# Script to update Google OAuth client secret in Google Cloud Secret Manager

PROJECT_ID="studio-2120461843-5ad32"
SECRET_NAME="google-client-secret"
NEW_SECRET="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"

echo "Updating Google OAuth client secret in Secret Manager..."
echo "Project: $PROJECT_ID"
echo "Secret: $SECRET_NAME"

# Check if authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
  echo "❌ Not authenticated. Please run: gcloud auth login"
  exit 1
fi

# Update the secret
echo -n "$NEW_SECRET" | gcloud secrets versions add "$SECRET_NAME" \
  --project="$PROJECT_ID" \
  --data-file=-

if [ $? -eq 0 ]; then
  echo "✅ Successfully updated $SECRET_NAME"
  echo ""
  echo "The new secret version has been added. Firebase App Hosting will use the latest version automatically."
else
  echo "❌ Failed to update secret"
  exit 1
fi
