'use client';

import { FirebaseUI } from '@/components/firebase-ui';

export default function LoginPage() {
  return (
    <>
      <FirebaseUI 
        redirectPath="/"
        title="Welcome Back"
        description="Sign in to access your account"
      />
      <div className="mt-6 flex flex-wrap gap-4 justify-center text-sm text-muted-foreground">
        <a 
          href="/privacy" 
          className="hover:text-foreground underline transition-colors"
        >
          Privacy Policy
        </a>
        <span>•</span>
        <a 
          href="/tos" 
          className="hover:text-foreground underline transition-colors"
        >
          Terms of Service
        </a>
        <span>•</span>
        <a 
          href="https://whitelabeled.ca" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-foreground underline transition-colors"
        >
          Whitelabeled.ca
        </a>
        <span>•</span>
        <a 
          href="https://vitalpathaddictionclinic.ca" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-foreground underline transition-colors"
        >
          Vital Path Addiction Clinic
        </a>
      </div>
    </>
  );
}
