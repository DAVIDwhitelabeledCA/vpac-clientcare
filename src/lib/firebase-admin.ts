import { initializeApp, getApps, cert, App, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let adminApp: App | null = null;

// Get project ID from environment or use default
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 
                   process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 
                   'studio-2120461843-5ad32';

export function getAdminApp(): App {
  if (adminApp) {
    return adminApp;
  }

  if (getApps().length > 0) {
    adminApp = getApps()[0];
    return adminApp;
  }

  try {
    // First, try with service account if available (for local development)
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccount) {
      try {
        const serviceAccountJson = JSON.parse(serviceAccount);
        adminApp = initializeApp({
          projectId: PROJECT_ID,
          credential: cert(serviceAccountJson),
        });
        return adminApp;
      } catch (parseError) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', parseError);
        // Fall through to try other methods
      }
    }

    // Try with service account key file path
    const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (serviceAccountPath) {
      try {
        const serviceAccount = require(serviceAccountPath);
        adminApp = initializeApp({
          projectId: PROJECT_ID,
          credential: cert(serviceAccount),
        });
        return adminApp;
      } catch (fileError) {
        console.error('Failed to load service account from file:', fileError);
        // Fall through
      }
    }

    // Try to initialize with Application Default Credentials
    // This works when gcloud auth application-default login has been run
    try {
      adminApp = initializeApp({
        projectId: PROJECT_ID,
        credential: applicationDefault(),
      });
      console.log('Firebase Admin initialized with Application Default Credentials');
      return adminApp;
    } catch (adcError: any) {
      console.error('ADC initialization failed, trying without explicit credential:', adcError.message);
      // If ADC fails, try without explicit credential (for Firebase App Hosting)
      try {
        adminApp = initializeApp({
          projectId: PROJECT_ID,
        });
        console.log('Firebase Admin initialized without explicit credential');
        return adminApp;
      } catch (finalError: any) {
        console.error('All initialization methods failed. Final error:', finalError.message);
        throw adcError; // Throw the ADC error as it's more informative
      }
    }
  } catch (e: any) {
    const errorMessage = e.message || 'Unknown error';
    console.error('Firebase Admin initialization failed:', errorMessage);
    console.error('Full error:', e);
    
    // Provide helpful error message
    const fullErrorMessage = `Firebase Admin initialization failed: ${errorMessage}

To fix this, you need to set up Firebase Admin credentials. Choose one of these options:

1. Set GOOGLE_APPLICATION_CREDENTIALS environment variable:
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"

2. Set FIREBASE_SERVICE_ACCOUNT environment variable with the JSON content:
   export FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'

3. Use Application Default Credentials (gcloud CLI):
   gcloud auth application-default login
   gcloud auth application-default set-quota-project ${PROJECT_ID}

Project ID: ${PROJECT_ID}`;
    
    throw new Error(fullErrorMessage);
  }
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getAdminFirestore() {
  return getFirestore(getAdminApp());
}
