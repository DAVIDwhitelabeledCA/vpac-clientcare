#!/bin/bash
# Script to grant Firebase App Hosting access to secrets in Secret Manager

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

# Grant access to each secret
for secret in "${SECRETS[@]}"; do
  echo "Granting access to: $secret"
  
  # Method 1: Using Firebase CLI (if available)
  if firebase apphosting:secrets:grantaccess --help &> /dev/null; then
    firebase apphosting:secrets:grantaccess "$BACKEND_ID" "$secret" --project="$PROJECT_ID"
    
    if [ $? -eq 0 ]; then
      echo "✅ Successfully granted access to $secret via Firebase CLI"
    else
      echo "⚠️  Firebase CLI method failed, trying gcloud method..."
      grant_via_gcloud "$secret"
    fi
  else
    # Method 2: Using gcloud (fallback)
    echo "Using gcloud method for $secret..."
    grant_via_gcloud "$secret"
  fi
  
  echo ""
done

echo "✅ Completed granting access to all secrets"

# Function to grant access via gcloud
grant_via_gcloud() {
  local secret_name=$1
  
  # Check if gcloud is installed
  if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI not found. Please install Google Cloud SDK"
    return 1
  fi
  
  # Get the App Hosting service account
  # The service account format is: service-PROJECT_NUMBER@gcp-sa-apphosting.iam.gserviceaccount.com
  # We can find it by looking for the App Hosting service agent role
  SERVICE_ACCOUNT=$(gcloud projects get-iam-policy "$PROJECT_ID" \
    --flatten="bindings[].members" \
    --filter="bindings.role:roles/apphosting.serviceAgent" \
    --format="value(bindings.members[0])" 2>/dev/null)
  
  if [ -z "$SERVICE_ACCOUNT" ]; then
    # Try alternative method: construct the service account email
    PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format="value(projectNumber)" 2>/dev/null)
    if [ -n "$PROJECT_NUMBER" ]; then
      SERVICE_ACCOUNT="service-${PROJECT_NUMBER}@gcp-sa-apphosting.iam.gserviceaccount.com"
    else
      echo "❌ Could not determine App Hosting service account"
      return 1
    fi
  fi
  
  echo "Using service account: $SERVICE_ACCOUNT"
  
  # Grant secret accessor role
  gcloud secrets add-iam-policy-binding "$secret_name" \
    --project="$PROJECT_ID" \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor"
  
  if [ $? -eq 0 ]; then
    echo "✅ Successfully granted access to $secret_name via gcloud"
    return 0
  else
    echo "❌ Failed to grant access to $secret_name"
    return 1
  fi
}
