# How to Verify Secrets in Google Cloud Secret Manager

## Required Secrets

Based on `apphosting.yaml`, you need these secrets in Google Cloud Secret Manager:

1. **google-client-secret** - For Google OAuth client secret
2. **microsoft-client-secret** - For Microsoft OAuth client secret

## Method 1: Firebase Console (Easiest)

1. Go to [Firebase Console - App Hosting](https://console.firebase.google.com/project/studio-2120461843-5ad32/apphosting)
2. Select your backend: `vpac-client-care-demo` (or your active backend)
3. Go to **Environment Variables** or **Secrets** section
4. Check if these secrets are listed:
   - `google-client-secret`
   - `microsoft-client-secret`

## Method 2: Google Cloud Console

1. Go to [Google Cloud Console - Secret Manager](https://console.cloud.google.com/security/secret-manager?project=studio-2120461843-5ad32)
2. Check if these secrets exist:
   - `google-client-secret`
   - `microsoft-client-secret`

## Method 3: Using gcloud CLI

If you're authenticated with gcloud:

```bash
# List all secrets
gcloud secrets list --project=studio-2120461843-5ad32

# Check specific secret
gcloud secrets describe google-client-secret --project=studio-2120461843-5ad32
gcloud secrets describe microsoft-client-secret --project=studio-2120461843-5ad32
```

## Creating Missing Secrets

If a secret is missing, create it:

### Via Google Cloud Console:
1. Go to [Secret Manager](https://console.cloud.google.com/security/secret-manager?project=studio-2120461843-5ad32)
2. Click **CREATE SECRET**
3. Enter the secret name (e.g., `google-client-secret`)
4. Enter the secret value (your actual client secret)
5. Click **CREATE SECRET**

### Via gcloud CLI:

```bash
# Create google-client-secret
echo -n "YOUR_GOOGLE_CLIENT_SECRET" | gcloud secrets create google-client-secret \
  --project=studio-2120461843-5ad32 \
  --data-file=-

# Create microsoft-client-secret
echo -n "YOUR_MICROSOFT_CLIENT_SECRET" | gcloud secrets create microsoft-client-secret \
  --project=studio-2120461843-5ad32 \
  --data-file=-
```

## Granting Access to Firebase App Hosting

After creating secrets, ensure Firebase App Hosting service account has access:

```bash
# Get the App Hosting service account
SERVICE_ACCOUNT=$(gcloud projects get-iam-policy studio-2120461843-5ad32 \
  --flatten="bindings[].members" \
  --filter="bindings.role:roles/apphosting.serviceAgent" \
  --format="value(bindings.members[0])")

# Grant secret accessor role
gcloud secrets add-iam-policy-binding google-client-secret \
  --project=studio-2120461843-5ad32 \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding microsoft-client-secret \
  --project=studio-2120461843-5ad32 \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor"
```

## Current Secret Values

To get the current values from your `.env.local`:

- **Google Client Secret**: `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`
- **Microsoft Client Secret**: `ffc0b419-2ea6-44b7-aaef-3bf26658d87b`

⚠️ **Note**: These are the values that should be stored in Secret Manager.
