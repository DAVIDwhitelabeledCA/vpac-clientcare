import * as crypto from 'crypto';
import * as fs from 'fs';

/**
 * Helper functions for Microsoft OAuth authentication
 * Supports both client secret and certificate-based authentication
 */

interface MicrosoftAuthConfig {
  clientId: string;
  tenantId: string;
  clientSecret?: string;
  certificatePath?: string;
  certificateKeyPath?: string;
  certificatePfxPath?: string;
  certificatePassword?: string;
}

/**
 * Create a JWT assertion for certificate-based authentication
 */
function createJwtAssertion(config: MicrosoftAuthConfig): string {
  if (!config.certificatePath || !config.certificateKeyPath) {
    throw new Error('Certificate path and key path are required for certificate authentication');
  }

  const cert = fs.readFileSync(config.certificatePath, 'utf8');
  const key = fs.readFileSync(config.certificateKeyPath, 'utf8');

  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: 'RS256',
    x5t: crypto.createHash('sha1').update(cert.replace(/-----BEGIN CERTIFICATE-----|-----END CERTIFICATE-----|\s/g, ''), 'base64').digest('base64url'),
  };

  const payload = {
    aud: `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`,
    exp: now + 3600, // 1 hour
    iss: config.clientId,
    jti: crypto.randomBytes(16).toString('hex'),
    nbf: now,
    sub: config.clientId,
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto.createSign('RSA-SHA256')
    .update(signatureInput)
    .sign(key, 'base64url');

  return `${signatureInput}.${signature}`;
}

/**
 * Get authentication parameters for Microsoft token request
 * Supports both client secret and certificate authentication
 */
export function getMicrosoftAuthParams(config: MicrosoftAuthConfig): {
  client_id: string;
  client_assertion_type?: string;
  client_assertion?: string;
  client_secret?: string;
} {
  // Prefer certificate if available
  if (config.certificatePath && config.certificateKeyPath) {
    const assertion = createJwtAssertion(config);
    return {
      client_id: config.clientId,
      client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      client_assertion: assertion,
    };
  }

  // Fall back to client secret
  if (config.clientSecret) {
    return {
      client_id: config.clientId,
      client_secret: config.clientSecret,
    };
  }

  throw new Error('Either client secret or certificate must be provided');
}

/**
 * Get Microsoft auth configuration from environment variables
 */
export function getMicrosoftAuthConfig(): MicrosoftAuthConfig {
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const tenantId = process.env.MICROSOFT_TENANT_ID || 'common';
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  
  const certificatePath = process.env.MICROSOFT_CERTIFICATE_PATH;
  const certificateKeyPath = process.env.MICROSOFT_CERTIFICATE_KEY_PATH;
  const certificatePfxPath = process.env.MICROSOFT_CERTIFICATE_PFX_PATH;
  const certificatePassword = process.env.MICROSOFT_CERTIFICATE_PASSWORD;

  if (!clientId) {
    throw new Error('MICROSOFT_CLIENT_ID is required');
  }

  // If PFX certificate is provided, extract PEM files
  if (certificatePfxPath) {
    // Note: In production, you'd want to extract PEM from PFX
    // For now, we'll require separate PEM files
    console.warn('PFX certificate support requires extraction to PEM format');
  }

  return {
    clientId,
    tenantId,
    clientSecret,
    certificatePath,
    certificateKeyPath,
    certificatePfxPath,
    certificatePassword,
  };
}
