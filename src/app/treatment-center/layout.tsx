'use client';

import TreatmentCenterSidebarNav from '@/components/layout/treatment-center-sidebar-nav';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/icons';
import { UserInitializer } from '@/components/user-initializer';

function TreatmentCenterAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/treatment-center-login');
      return;
    }

    // Check if user has treatment center access
    const checkAccess = async () => {
      if (!firestore || !user?.email) {
        setIsCheckingAccess(false);
        return;
      }

      try {
        // Check if this email is used as a treatmentEmail for any clients
        const usersRef = collection(firestore, 'users');
        const treatmentCenterQuery = query(
          usersRef,
          where('role', '==', 'client'),
          where('treatmentClient', '==', 'Yes'),
          where('treatmentEmail', '==', user.email),
          limit(1)
        );
        
        const snapshot = await getDocs(treatmentCenterQuery);
        const hasTreatmentCenterAccess = !snapshot.empty;
        
        setHasAccess(hasTreatmentCenterAccess);
        
        if (!hasTreatmentCenterAccess) {
          // User doesn't have access, redirect after a moment
          setTimeout(() => {
            router.replace('/treatment-center-login');
          }, 2000);
        }
      } catch (error) {
        console.error('Error checking treatment center access:', error);
        setHasAccess(false);
      } finally {
        setIsCheckingAccess(false);
      }
    };

    if (user) {
      checkAccess();
    }
  }, [user, isUserLoading, firestore, router]);

  if (isUserLoading || isCheckingAccess || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Logo className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground">
            You do not have access to the treatment center portal.
          </p>
          <p className="text-sm text-muted-foreground">
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <UserInitializer />
      {children}
    </>
  );
}

export default function TreatmentCenterLayout({ children }: { children: React.ReactNode }) {
  return (
    <TreatmentCenterAuthGuard>
      <SidebarProvider>
        <Sidebar>
          <TreatmentCenterSidebarNav />
        </Sidebar>
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </TreatmentCenterAuthGuard>
  );
}
