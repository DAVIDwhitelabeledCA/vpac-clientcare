#!/bin/bash

# Quick setup - just set the quota project and authenticate

PROJECT_ID="studio-2120461843-5ad32"

echo "Setting quota project..."
gcloud auth application-default set-quota-project $PROJECT_ID

echo ""
echo "Authenticating (this will open a browser)..."
gcloud auth application-default login

echo ""
echo "✅ Done! You can now create client users."
