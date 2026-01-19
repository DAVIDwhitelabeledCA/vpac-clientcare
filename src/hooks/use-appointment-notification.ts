'use client';

import { useState } from 'react';
import { useFirestore } from '@/firebase';
import {
  sendAppointmentNotification,
  prepareAppointmentRecipients,
  type AppointmentNotification,
} from '@/lib/notification-service';
import { useToast } from '@/hooks/use-toast';

export function useAppointmentNotification() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);

  const sendNotification = async (notification: AppointmentNotification) => {
    if (!firestore) {
      toast({
        title: 'Error',
        description: 'Firestore not available',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    try {
      const result = await sendAppointmentNotification(firestore, notification);

      if (result.errors && result.errors.length > 0) {
        toast({
          title: 'Notification Sent with Errors',
          description: result.errors.join(', '),
          variant: 'destructive',
        });
      } else {
        const messages = [];
        if (result.clientSent) {
          messages.push('Client notified');
        }
        if (result.treatmentContactSent) {
          messages.push('Treatment center contact notified');
        }

        toast({
          title: 'Notifications Sent',
          description: messages.join(' and ') || 'No notifications sent',
        });
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to send notification',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const checkTreatmentContact = async (clientId: string) => {
    if (!firestore) return null;

    try {
      const { treatmentRecipient } = await prepareAppointmentRecipients(firestore, {
        clientId,
        clientName: '', // Not needed for checking
        appointmentDate: '',
        appointmentTime: '',
        staffName: '',
      });

      return treatmentRecipient;
    } catch (error) {
      console.error('Error checking treatment contact:', error);
      return null;
    }
  };

  return {
    sendNotification,
    checkTreatmentContact,
    isSending,
  };
}
