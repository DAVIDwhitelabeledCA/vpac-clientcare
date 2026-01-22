'use client';

import { FirebaseUI } from '@/components/firebase-ui';

export default function ClientLoginPage() {
  return (
    <>
      <FirebaseUI 
        redirectPath="/client"
        title="Client Portal Login"
        description="Access your medical records and information"
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
