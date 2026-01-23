'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ExternalLink, Video } from 'lucide-react';

interface JoinCallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId?: string;
  clientId?: string;
  clientName: string;
}

interface AppointmentData {
  meetingLink?: string;
  startTime?: any;
  endTime?: any;
  status?: string;
}

export function JoinCallDialog({
  open,
  onOpenChange,
  appointmentId,
  clientId,
  clientName,
}: JoinCallDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [meetingLink, setMeetingLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch appointment if appointmentId is provided
  const appointmentDocRef = useMemoFirebase(() => {
    if (!firestore || !appointmentId) return null;
    return doc(firestore, 'appointments', appointmentId);
  }, [firestore, appointmentId]);

  const { data: appointment, isLoading: isLoadingAppointment } = useDoc<AppointmentData>(
    appointmentDocRef
  );

  // If no appointmentId, try to find appointment by clientId for today
  useEffect(() => {
    if (!open || appointmentId || !clientId || !firestore || !user) return;

    const findAppointment = async () => {
      setIsLoading(true);
      try {
        const { collection, query, where, getDocs, Timestamp } = await import('firebase/firestore');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const appointmentsRef = collection(firestore, 'appointments');
        const q = query(
          appointmentsRef,
          where('clientId', '==', clientId),
          where('startTime', '>=', Timestamp.fromDate(today)),
          where('startTime', '<', Timestamp.fromDate(tomorrow)),
          where('status', 'in', ['scheduled', 'confirmed'])
        );

        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const latestAppt = snapshot.docs[0];
          const apptData = latestAppt.data() as AppointmentData;
          setMeetingLink(apptData.meetingLink || null);
        } else {
          setMeetingLink(null);
        }
      } catch (error: any) {
        console.error('Error finding appointment:', error);
        toast({
          title: 'Error',
          description: 'Failed to find appointment',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    findAppointment();
  }, [open, appointmentId, clientId, firestore, user, toast]);

  // Update meeting link when appointment data loads
  useEffect(() => {
    if (appointment) {
      setMeetingLink(appointment.meetingLink || null);
    }
  }, [appointment]);

  const handleJoinCall = () => {
    if (meetingLink) {
      window.open(meetingLink, '_blank', 'noopener,noreferrer');
      onOpenChange(false);
    } else {
      toast({
        title: 'No Meeting Link',
        description: 'This appointment does not have a meeting link yet.',
        variant: 'destructive',
      });
    }
  };

  const isLoadingData = isLoading || isLoadingAppointment;
  const hasMeetingLink = !!meetingLink;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Join Call with {clientName}</DialogTitle>
          <DialogDescription>
            {isLoadingData ? (
              'Loading appointment details...'
            ) : hasMeetingLink ? (
              'Click the button below to join the virtual meeting'
            ) : (
              'No meeting link is available for this appointment yet.'
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoadingData ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : hasMeetingLink ? (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 bg-muted/50">
                <div className="flex items-center gap-2 text-sm">
                  <Video className="h-4 w-4 text-primary" />
                  <span className="font-medium">Meeting Link Ready</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  The meeting link will open in a new window
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border p-4 bg-muted/50">
              <p className="text-sm text-muted-foreground">
                The meeting link for this appointment has not been created yet.
                It will be generated automatically before the appointment time.
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            onClick={handleJoinCall}
            disabled={!hasMeetingLink || isLoadingData}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Join Call
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
