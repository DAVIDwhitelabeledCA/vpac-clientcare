#!/bin/bash
# Script to grant Firebase App Hosting access to secrets using Firebase CLI

PROJECT_ID="studio-2120461843-5ad32"
BACKEND_ID="vpac-client-care-demo"
SECRETS=("google-client-secret" "microsoft-client-secret")

echo "Granting Firebase App Hosting access to secrets..."
echo "Project: $PROJECT_ID"
echo "Backend: $BACKEND_ID"
echo "Secrets: ${SECRETS[*]}"
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
  echo "❌ Firebase CLI not found. Please install it: npm install -g firebase-tools"
  exit 1
fi

# Check if authenticated
if ! firebase projects:list &> /dev/null; then
  echo "❌ Not authenticated with Firebase. Please run: firebase login"
  exit 1
fi

# Grant access to secrets
# The correct syntax is: firebase apphosting:secrets:grantaccess -b BACKEND_ID SECRET_NAME1,SECRET_NAME2
SECRET_LIST=$(IFS=','; echo "${SECRETS[*]}")

echo "Running command: firebase apphosting:secrets:grantaccess -b $BACKEND_ID $SECRET_LIST"
echo ""

firebase apphosting:secrets:grantaccess \
  --backend="$BACKEND_ID" \
  --project="$PROJECT_ID" \
  "$SECRET_LIST"

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Successfully granted Firebase App Hosting access to secrets"
else
  echo ""
  echo "❌ Failed to grant access. You may need to use the gcloud method instead."
  echo "Run: ./scripts/grant-secret-access.sh"
  exit 1
fi
