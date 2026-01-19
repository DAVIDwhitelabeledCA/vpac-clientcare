'use client';

import { useEffect } from 'react';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';

/**
 * Component that ensures the user document exists in Firestore
 * and creates it with default values if it doesn't exist.
 */
export function UserInitializer() {
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userDoc } = useDoc(userDocRef);

  useEffect(() => {
    if (!firestore || !user || userDoc !== null) return;

    // User document doesn't exist, create it
    const createUserDoc = async () => {
      try {
        const userDocRef = doc(firestore, 'users', user.uid);
        const existingDoc = await getDoc(userDocRef);
        
        if (!existingDoc.exists()) {
          // Extract name from user displayName or email
          const displayName = user.displayName || '';
          const nameParts = displayName.split(' ') || [];
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          await setDoc(userDocRef, {
            id: user.uid,
            email: user.email || '',
            firstName: firstName || 'User',
            lastName: lastName || '',
            role: 'staff', // Default to staff role
          });
        }
      } catch (error) {
        console.error('Error creating user document:', error);
      }
    };

    createUserDoc();
  }, [firestore, user, userDoc]);

  return null; // This component doesn't render anything
}
