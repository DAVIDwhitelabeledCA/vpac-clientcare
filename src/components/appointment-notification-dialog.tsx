'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppointmentNotification } from '@/hooks/use-appointment-notification';
import { Loader, MessageSquare, Users } from 'lucide-react';
import type { AppointmentNotification } from '@/lib/notification-service';

interface AppointmentNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notification: AppointmentNotification;
}

export function AppointmentNotificationDialog({
  open,
  onOpenChange,
  notification,
}: AppointmentNotificationDialogProps) {
  const { sendNotification, checkTreatmentContact, isSending } =
    useAppointmentNotification();
  const [hasTreatmentContact, setHasTreatmentContact] = useState(false);
  const [includeTreatmentContact, setIncludeTreatmentContact] = useState(true);
  const [customMessage, setCustomMessage] = useState('');

  useEffect(() => {
    if (open && notification.clientId) {
      checkTreatmentContact(notification.clientId).then((contact) => {
        setHasTreatmentContact(!!contact);
        setIncludeTreatmentContact(!!contact);
      });
    }
  }, [open, notification.clientId, checkTreatmentContact]);

  const handleSend = async () => {
    await sendNotification({
      ...notification,
      message: customMessage || notification.message,
    });
    onOpenChange(false);
    setCustomMessage('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Send Appointment Notification
          </DialogTitle>
          <DialogDescription>
            Send SMS notification to the client
            {hasTreatmentContact && ' and their treatment center contact'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Recipients</Label>
            <div className="space-y-2 rounded-md border p-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{notification.clientName}</span>
                <span className="text-xs text-muted-foreground">
                  {notification.clientPhone || 'No phone number'}
                </span>
              </div>
              {hasTreatmentContact && (
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="include-treatment"
                        checked={includeTreatmentContact}
                        onCheckedChange={(checked) =>
                          setIncludeTreatmentContact(checked === true)
                        }
                      />
                      <Label
                        htmlFor="include-treatment"
                        className="text-sm font-medium cursor-pointer"
                      >
                        Treatment Center Contact
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">
                      Will be notified automatically
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-message">Additional Message (Optional)</Label>
            <Textarea
              id="custom-message"
              placeholder="Add any additional information..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={3}
            />
          </div>

          <div className="rounded-md bg-muted p-3 text-sm">
            <p className="font-medium mb-1">Preview:</p>
            <p className="text-muted-foreground">
              Appointment with {notification.staffName} on {notification.appointmentDate} at{' '}
              {notification.appointmentTime}
              {customMessage && ` - ${customMessage}`}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSending || !notification.clientPhone}>
            {isSending ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <MessageSquare className="mr-2 h-4 w-4" />
                Send Notification
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
