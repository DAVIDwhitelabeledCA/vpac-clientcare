#!/bin/bash

# Script to generate a self-signed certificate for Microsoft Azure App Registration
# This is for development/testing purposes

echo "Generating Microsoft Azure certificate for VPAC Client Care..."
echo ""

# Generate certificate and private key
openssl req -x509 -newkey rsa:2048 \
  -keyout microsoft-key.pem \
  -out microsoft-cert.pem \
  -days 365 \
  -nodes \
  -subj "/CN=VPAC-ClientCare/O=VPAC/C=US"

if [ $? -eq 0 ]; then
  echo "✓ Certificate generated successfully!"
  echo ""
  echo "Files created:"
  echo "  - microsoft-cert.pem (certificate - upload this to Azure)"
  echo "  - microsoft-key.pem (private key - keep this secure!)"
  echo ""
  echo "Next steps:"
  echo "1. Upload microsoft-cert.pem to Azure Portal:"
  echo "   Azure Portal > App Registrations > Your App > Certificates & secrets > Certificates > Upload certificate"
  echo ""
  echo "2. Add to .env.local:"
  echo "   MICROSOFT_CERTIFICATE_PATH=$(pwd)/microsoft-cert.pem"
  echo "   MICROSOFT_CERTIFICATE_KEY_PATH=$(pwd)/microsoft-key.pem"
  echo ""
  echo "⚠️  IMPORTANT: Keep microsoft-key.pem secure and never commit it to git!"
else
  echo "✗ Failed to generate certificate"
  exit 1
fi
