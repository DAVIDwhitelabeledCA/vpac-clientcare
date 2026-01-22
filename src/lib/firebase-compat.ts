/**
 * Firebase Compat API wrapper for FirebaseUI
 * FirebaseUI requires the compat API, so we create a compat wrapper
 * that works with our modular Firebase v11 setup
 */

import { Auth } from 'firebase/auth';
import * as firebaseCompat from 'firebase/compat/app';
import 'firebase/compat/auth';

let compatApp: firebaseCompat.default.app.App | null = null;
let compatAuth: firebaseCompat.default.auth.Auth | null = null;

export function getCompatAuth(modularAuth: Auth): firebaseCompat.default.auth.Auth {
  // If we already have a compat auth instance, return it
  if (compatAuth) {
    return compatAuth;
  }

  // Initialize compat app if needed
  if (!compatApp) {
    // Get the app from the modular auth instance
    const app = modularAuth.app;
    
    // Initialize compat app with the same config
    compatApp = firebaseCompat.default.initializeApp(app.options, `compat-${app.name}`);
  }

  // Get compat auth
  compatAuth = firebaseCompat.default.auth(compatApp);
  
  return compatAuth;
}
