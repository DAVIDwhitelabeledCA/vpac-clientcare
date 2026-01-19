# Microsoft Azure Certificate Setup

Microsoft Azure App Registration may require certificate-based authentication instead of (or in addition to) client secrets for enhanced security.

## Quick Setup

### Option 1: Generate Self-Signed Certificate (Development)

Run the provided script:

```bash
./scripts/generate-microsoft-cert.sh
```

This creates:
- `microsoft-cert.pem` - Certificate file (upload to Azure)
- `microsoft-key.pem` - Private key file (keep secure!)

### Option 2: Use Existing Certificate

If you already have a certificate file (.cer, .pem, or .pfx), you can use that directly.

## Azure Portal Configuration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Select your app registration
4. Go to **Certificates & secrets**
5. Click **Certificates** tab
6. Click **Upload certificate**
7. Upload your `.cer` or `.pem` certificate file
8. Add a description (optional)
9. Click **Add**

## Environment Variables

Add to your `.env.local` file:

### For PEM Certificate (Recommended)

```bash
# Microsoft OAuth Credentials
MICROSOFT_CLIENT_ID=your-client-id
MICROSOFT_TENANT_ID=common  # or your tenant ID
MICROSOFT_REDIRECT_URI=http://localhost:9002/api/auth/microsoft/callback

# Certificate-based authentication
MICROSOFT_CERTIFICATE_PATH=/path/to/microsoft-cert.pem
MICROSOFT_CERTIFICATE_KEY_PATH=/path/to/microsoft-key.pem
```

### For PFX Certificate

```bash
MICROSOFT_CERTIFICATE_PFX_PATH=/path/to/certificate.pfx
MICROSOFT_CERTIFICATE_PASSWORD=your-pfx-password
```

### Fallback to Client Secret

If you prefer to use client secret instead (or as fallback):

```bash
MICROSOFT_CLIENT_SECRET=your-client-secret
```

**Note:** The system will automatically use certificate authentication if certificate paths are provided, otherwise it falls back to client secret.

## Security Notes

- ⚠️ **Never commit certificate files or private keys to git**
- ⚠️ **Keep private keys secure and restrict file permissions**
- ✅ Certificate files are automatically ignored by `.gitignore`
- ✅ Use strong passwords for PFX files
- ✅ Rotate certificates regularly in production

## How It Works

The system supports both authentication methods:

1. **Certificate Authentication** (Preferred)
   - Uses JWT assertion signed with private key
   - More secure for production environments
   - Required by some Azure AD configurations

2. **Client Secret Authentication** (Fallback)
   - Uses client secret in token request
   - Simpler setup for development
   - Less secure than certificates

The authentication helper (`src/lib/microsoft-auth.ts`) automatically selects the appropriate method based on available environment variables.
