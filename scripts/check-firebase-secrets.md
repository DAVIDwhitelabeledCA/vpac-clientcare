# Firebase Console - Secrets Verification Checklist

## Direct Links to Check Secrets

### 1. Firebase App Hosting Environment Variables
**URL**: https://console.firebase.google.com/project/studio-2120461843-5ad32/apphosting

**Steps**:
1. Click on your backend (likely `vpac-client-care-demo`)
2. Go to **Environment Variables** or **Configuration** tab
3. Look for secrets section or environment variables

### 2. Google Cloud Secret Manager
**URL**: https://console.cloud.google.com/security/secret-manager?project=studio-2120461843-5ad32

**What to check**:
- ✅ `google-client-secret` should exist
- ✅ `microsoft-client-secret` should exist

## Required Secrets (from apphosting.yaml)

| Secret Name | Environment Variable | Status |
|------------|---------------------|--------|
| `google-client-secret` | `GOOGLE_CLIENT_SECRET` | ⚠️ **CHECK** |
| `microsoft-client-secret` | `MICROSOFT_CLIENT_SECRET` | ⚠️ **CHECK** |

## Expected Values

If you need to create these secrets, use these values:

- **google-client-secret**: `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`
- **microsoft-client-secret**: `ffc0b419-2ea6-44b7-aaef-3bf26658d87b`

## Quick Verification Steps

1. **Open Secret Manager**: https://console.cloud.google.com/security/secret-manager?project=studio-2120461843-5ad32
2. **Search for**: `google-client-secret` and `microsoft-client-secret`
3. **If missing**: Create them using the values above

## Alternative: Check via App Hosting Config

1. **Open App Hosting**: https://console.firebase.google.com/project/studio-2120461843-5ad32/apphosting
2. **Select backend**: `vpac-client-care-demo`
3. **Check Environment Variables section**
4. **Look for**: Variables that reference secrets (should show `secret: google-client-secret` format)
