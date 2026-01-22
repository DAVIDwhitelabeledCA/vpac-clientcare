'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/icons';

interface FirebaseUIProps {
  redirectPath?: string;
  title?: string;
  description?: string;
}

export function FirebaseUI({ 
  redirectPath = '/',
  title = 'Welcome',
  description = 'Sign in to continue'
}: FirebaseUIProps) {
  const uiRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (isUserLoading || !auth) return;

    // If user is already signed in, redirect
    if (user) {
      router.replace(redirectPath);
      return;
    }

    // Initialize FirebaseUI with compat mode
    let ui: any = null;
    const initFirebaseUI = async () => {
      try {
        // Import FirebaseUI and compat helper
        const firebaseui = await import('firebaseui');
        const { getCompatAuth } = await import('@/lib/firebase-compat');
        
        // Get compat auth instance for FirebaseUI
        const compatAuthInstance = getCompatAuth(auth);

        // Check if FirebaseUI is already initialized
        ui = firebaseui.auth.AuthUI.getInstance();
        if (!ui) {
          ui = new firebaseui.auth.AuthUI(compatAuthInstance);
        }

        // Configure FirebaseUI
        const uiConfig = {
          signInFlow: 'popup' as const,
          signInSuccessUrl: redirectPath,
          signInOptions: [
            {
              provider: 'password' as const,
              requireDisplayName: false,
            },
            {
              provider: 'google.com' as const,
              scopes: [
                'https://www.googleapis.com/auth/calendar.readonly',
                'https://www.googleapis.com/auth/calendar.events',
              ],
              customParameters: {
                prompt: 'select_account',
              },
            },
          ],
          tosUrl: '/tos',
          privacyPolicyUrl: '/privacy',
          credentialHelper: firebaseui.auth.CredentialHelper.GOOGLE_YOLO,
          callbacks: {
            signInSuccessWithAuthResult: (authResult: any, redirectUrl: string) => {
              // User successfully signed in
              // Return false to prevent redirect (we'll handle it with router)
              router.push(redirectPath);
              return false;
            },
          },
        };

        // Start FirebaseUI
        if (uiRef.current) {
          ui.start(uiRef.current, uiConfig);
        }
      } catch (error) {
        console.error('Error initializing FirebaseUI:', error);
      }
    };

    initFirebaseUI();

    // Cleanup function
    return () => {
      if (ui) {
        try {
          ui.reset();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [auth, redirectPath, user, isUserLoading, router]);

  // Redirect when user signs in
  useEffect(() => {
    if (user && !isUserLoading) {
      router.replace(redirectPath);
    }
  }, [user, isUserLoading, router, redirectPath]);

  if (isUserLoading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Logo className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
          <Logo />
        </div>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={uiRef} id="firebaseui-auth-container" />
      </CardContent>
    </Card>
  );
}
