#!/bin/bash

# Script to delete multiple Firebase App Hosting backends
# Usage: ./scripts/delete-apphosting-backends.sh [backend1] [backend2] ...
# Or run without arguments to see a list and interactively choose

PROJECT_ID="studio-2120461843-5ad32"

echo "Firebase App Hosting Backend Deletion Script"
echo "Project: $PROJECT_ID"
echo ""

# List all backends
echo "Current backends:"
firebase apphosting:backends:list --project $PROJECT_ID
echo ""

# If backends are provided as arguments, delete them
if [ $# -gt 0 ]; then
    echo "Deleting specified backends..."
    for BACKEND_ID in "$@"; do
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "Deleting backend: $BACKEND_ID"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        
        # Determine location from backend name (you may need to adjust this)
        # For now, try us-central1 first, then us-east4
        firebase apphosting:backends:delete "$BACKEND_ID" --project $PROJECT_ID --location us-central1 --force 2>&1 || \
        firebase apphosting:backends:delete "$BACKEND_ID" --project $PROJECT_ID --location us-east4 --force 2>&1
        
        if [ $? -eq 0 ]; then
            echo "✅ Successfully deleted: $BACKEND_ID"
        else
            echo "❌ Failed to delete: $BACKEND_ID (may already be deleted or in a different location)"
        fi
    done
    echo ""
    echo "Done!"
else
    echo "Usage: $0 [backend1] [backend2] ..."
    echo ""
    echo "Example:"
    echo "  $0 vpac-client-care-demo vpac-clientcare-1"
    echo ""
    echo "Or to delete all except the primary backend (vpac-clientcare):"
    echo "  $0 vpac-client-care-demo vpac-clientcare-1"
    echo ""
    echo "Available backends from your project:"
    firebase apphosting:backends:list --project $PROJECT_ID | grep -E "^│ " | awk -F'│' '{print "  - " $2}' | sed 's/^  -  /  - /' | sed 's/^  - $//'
fi
