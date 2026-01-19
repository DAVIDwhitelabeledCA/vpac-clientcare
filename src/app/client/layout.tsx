'use client';

import ClientSidebarNav from '@/components/layout/client-sidebar-nav';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/icons';
import { UserInitializer } from '@/components/user-initializer';
import { SMSConsentModal } from '@/components/sms-consent-modal';
import { doc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';

function ClientAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const [showConsentModal, setShowConsentModal] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userDoc, isLoading: isUserDocLoading } = useDoc(userDocRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/client-login');
    }
  }, [user, isUserLoading, router]);

  // Check if we need to show consent modal
  useEffect(() => {
    if (!isUserDocLoading && userDoc && user && userDoc.role === 'client') {
      // Show modal if consent hasn't been set (undefined or null)
      if (userDoc.smsConsent === undefined || userDoc.smsConsent === null) {
        setShowConsentModal(true);
      }
    }
  }, [userDoc, isUserDocLoading, user]);

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Logo className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <UserInitializer />
      <SMSConsentModal 
        open={showConsentModal} 
        onOpenChange={setShowConsentModal}
      />
      {children}
    </>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientAuthGuard>
      <SidebarProvider>
        <Sidebar>
          <ClientSidebarNav />
        </Sidebar>
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </ClientAuthGuard>
  );
}
