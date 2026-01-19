# Creating Client Users

To create client users, you need Firebase Admin SDK credentials set up. Here are the options:

## Option 1: Using Application Default Credentials (Recommended for Local Development)

1. Install Google Cloud CLI if you haven't:
   ```bash
   brew install google-cloud-sdk  # macOS
   ```

2. Authenticate with Application Default Credentials:
   ```bash
   gcloud auth application-default login
   ```

3. Set the project:
   ```bash
   gcloud config set project studio-2120461843-5ad32
   ```

4. Now you can use the API route or script:
   ```bash
   ./scripts/create-sarah-lee-client.sh
   ```

## Option 2: Using Service Account Key File

1. Download a service account key from Firebase Console:
   - Go to https://console.firebase.google.com/project/studio-2120461843-5ad32/settings/serviceaccounts/adminsdk
   - Click "Generate New Private Key"
   - Save the JSON file

2. Set the environment variable:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-key.json"
   ```

3. Run the script:
   ```bash
   ./scripts/create-sarah-lee-client.sh
   ```

## Option 3: Using Environment Variable

1. Get your service account JSON (same as Option 2)

2. Set the environment variable with the JSON content:
   ```bash
   export FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"studio-2120461843-5ad32",...}'
   ```

3. Run the script:
   ```bash
   ./scripts/create-sarah-lee-client.sh
   ```

## Option 4: Using the TypeScript Script Directly

If you have credentials set up, you can run:

```bash
npx tsx scripts/create-client-user.ts
```

## Creating Sarah Lee's Account

Once credentials are set up, run:

```bash
./scripts/create-sarah-lee-client.sh
```

Or call the API directly:

```bash
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
```

## Account Details

- **Email**: sarah@email.com
- **Password**: Sarah123! (should be changed on first login)
- **Login URL**: http://localhost:9002/client-login
