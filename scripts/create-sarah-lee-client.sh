#!/bin/bash

# Script to create Sarah Lee's client account via API
# Make sure the dev server is running: npm run dev

echo "Creating Sarah Lee's client account..."
echo ""

curl -X POST http://localhost:9002/api/admin/create-client-user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sarah@email.com",
    "password": "Sarah123!",
    "firstName": "Sarah",
    "lastName": "Lee",
    "phone": "12505559876",
    "streetAddress": "100 Main St",
    "city": "Victoria",
    "province": "BC",
    "postal": "V8W1A1",
    "phn": "73210-9876",
    "addictionMedicine": "No",
    "treatmentClient": "No",
    "treatmentProvider": "N/A",
    "virtual": "YES",
    "planG": "Yes",
    "narcoticPrescriptions": "",
    "insuranceType": "Plan G",
    "insuranceMemberId": "Plan G",
    "insuranceGroupNo": "",
    "clinicDoctor": "doctor@email.com"
  }'

echo ""
echo ""
echo "Done! If successful, Sarah Lee can now log in at /client-login with:"
echo "  Email: sarah@email.com"
echo "  Password: Sarah123!"
