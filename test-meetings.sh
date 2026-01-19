#!/bin/bash

# Test script for batch meeting creation
# Usage: ./test-meetings.sh YOUR_FIREBASE_ID_TOKEN

TOKEN=$1
BASE_URL="http://localhost:9002"

if [ -z "$TOKEN" ]; then
  echo "Usage: ./test-meetings.sh YOUR_FIREBASE_ID_TOKEN"
  echo ""
  echo "To get your token:"
  echo "1. Log in at http://localhost:9002/login"
  echo "2. Open browser console (F12)"
  echo "3. Run: firebase.auth().currentUser.getIdToken().then(console.log)"
  exit 1
fi

echo "Testing batch meeting creation endpoint..."
echo ""

response=$(curl -s -X POST "$BASE_URL/api/appointments/create-microsoft-meetings" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Response:"
echo "$response" | jq '.' 2>/dev/null || echo "$response"
echo ""

# Check for success
if echo "$response" | grep -q '"success":true'; then
  echo "✅ Success! Check the summary above for meeting creation details."
else
  echo "❌ Error occurred. Check the response above for details."
fi
