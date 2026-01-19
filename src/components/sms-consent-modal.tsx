'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import Link from 'next/link';

interface SMSConsentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SMSConsentModal({ open, onOpenChange }: SMSConsentModalProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const [consentChecked, setConsentChecked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userDoc } = useDoc(userDocRef);

  const handleSave = async () => {
    if (!firestore || !user || !userDocRef) return;

    setIsSaving(true);
    try {
      await updateDoc(userDocRef, {
        smsConsent: consentChecked,
        smsConsentDate: consentChecked ? new Date().toISOString() : null,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error saving SMS consent:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Don't allow closing without making a choice
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && (userDoc?.smsConsent === undefined || userDoc?.smsConsent === null)) {
      // Don't allow closing if consent hasn't been set
      return;
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Text Message Updates</DialogTitle>
          <DialogDescription>
            Stay informed about your appointments and important updates.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="sms-consent"
              checked={consentChecked}
              onCheckedChange={(checked) => setConsentChecked(checked === true)}
              className="mt-1"
            />
            <label
              htmlFor="sms-consent"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              I would like to receive updates by text
            </label>
          </div>
          
          <p className="text-sm text-muted-foreground pl-7">
            We'll be sending you booking reminders from VPAC. Message and data rates may apply. 
            Message frequency varies. At any time you can text HELP for help or STOP to opt out.
          </p>
          
          <p className="text-sm text-muted-foreground pl-7">
            <Link 
              href="/privacy-policy" 
              className="underline hover:text-foreground"
              target="_blank"
            >
              Privacy Policy
            </Link>
          </p>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              setConsentChecked(false);
              handleSave();
            }}
            disabled={isSaving}
          >
            Decline
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !consentChecked}
          >
            {isSaving ? 'Saving...' : 'Accept'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
