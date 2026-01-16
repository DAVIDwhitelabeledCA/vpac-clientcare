'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { toast } from '@/hooks/use-toast';

function handleAuthError(error: any) {
  console.error('Authentication error:', error);
  let title = 'An error occurred';
  let description = 'Something went wrong during authentication.';

  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/operation-not-allowed':
        title = 'Sign-in method disabled';
        description =
          'This sign-in method is not enabled. Please contact an administrator.';
        break;
      case 'auth/popup-closed-by-user':
        // This error occurs when the user closes the sign-in popup.
        // It's a normal user action, so we don't need to show an error toast.
        return;
      case 'auth/cancelled-popup-request':
        // This can happen if the user clicks the sign-in button multiple times.
        // We can safely ignore it.
        return;
      default:
        title = 'Authentication Failed';
        description = error.message;
        break;
    }
  }

  toast({
    variant: 'destructive',
    title: title,
    description: description,
  });
}

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  // CRITICAL: Call signInAnonymously directly. Do NOT use 'await signInAnonymously(...)'.
  signInAnonymously(authInstance).catch(handleAuthError);
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(
  authInstance: Auth,
  email: string,
  password: string
): void {
  // CRITICAL: Call createUserWithEmailAndPassword directly. Do NOT use 'await createUserWithEmailAndPassword(...)'.
  createUserWithEmailAndPassword(authInstance, email, password).catch(
    handleAuthError
  );
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(
  authInstance: Auth,
  email: string,
  password: string
): void {
  // CRITICAL: Call signInWithEmailAndPassword directly. Do NOT use 'await signInWithEmailAndPassword(...)'.
  signInWithEmailAndPassword(authInstance, email, password).catch(
    handleAuthError
  );
}

/** Initiate Google sign-in (non-blocking). */
export function initiateGoogleSignIn(authInstance: Auth): void {
  const provider = new GoogleAuthProvider();
  // CRITICAL: Call signInWithPopup directly. Do NOT use 'await signInWithPopup(...)'.
  signInWithPopup(authInstance, provider).catch(handleAuthError);
}

/** Initiate Apple sign-in (non-blocking). */
export function initiateAppleSignIn(authInstance: Auth): void {
  const provider = new OAuthProvider('apple.com');
  // CRITICAL: Call signInWithPopup directly. Do NOT use 'await signInWithPopup(...)'.
  signInWithPopup(authInstance, provider).catch(handleAuthError);
}
