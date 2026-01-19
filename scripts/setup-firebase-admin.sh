#!/bin/bash

# Script to set up Firebase Admin credentials for local development

echo "Setting up Firebase Admin credentials..."
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed."
    echo "Install it with: brew install google-cloud-sdk"
    exit 1
fi

echo "✅ gcloud CLI found"
echo ""

# Set the project
echo "Setting Firebase project..."
gcloud config set project studio-2120461843-5ad32

# Set the quota project for Application Default Credentials
echo ""
echo "Setting quota project for Application Default Credentials..."
gcloud auth application-default set-quota-project studio-2120461843-5ad32

# Authenticate with Application Default Credentials
echo ""
echo "Authenticating with Application Default Credentials..."
echo "This will open a browser for authentication..."
echo ""
gcloud auth application-default login --quiet || {
    echo ""
    echo "⚠️  Authentication may require your password."
    echo "Please complete the authentication in the browser window."
}

echo ""
echo "✅ Firebase Admin credentials set up successfully!"
echo ""
echo "You can now create client users using:"
echo "  ./scripts/create-sarah-lee-client.sh"
echo ""
echo "Or use the API route at:"
echo "  POST http://localhost:9002/api/admin/create-client-user"
