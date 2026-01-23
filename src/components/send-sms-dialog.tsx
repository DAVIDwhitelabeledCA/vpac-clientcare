'use client';

import { useState } from 'react';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface SendSMSDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId?: string;
  clientName: string;
  clientPhone?: string;
}

export function SendSMSDialog({
  open,
  onOpenChange,
  clientId,
  clientName,
  clientPhone,
}: SendSMSDialogProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a message',
        variant: 'destructive',
      });
      return;
    }

    if (!clientPhone) {
      toast({
        title: 'Error',
        description: 'Client phone number is not available',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to send SMS',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    try {
      const idToken = await user.getIdToken();
      
      // Ensure phone number is in E.164 format (starts with +)
      let formattedPhone = clientPhone.trim().replace(/\s+/g, '');
      if (!formattedPhone.startsWith('+')) {
        // If it starts with 1 and is 11 digits, it's already a North American number
        if (formattedPhone.startsWith('1') && /^1\d{10}$/.test(formattedPhone)) {
          formattedPhone = '+' + formattedPhone;
        } else if (/^\d{10}$/.test(formattedPhone)) {
          // 10 digits - assume North American number without country code
          formattedPhone = '+1' + formattedPhone;
        } else {
          // Try to add + prefix
          formattedPhone = '+' + formattedPhone.replace(/^\+/, '');
        }
      }

      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          clientId,
          phoneNumber: formattedPhone,
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send SMS');
      }

      toast({
        title: 'SMS Sent',
        description: `Message sent to ${clientName} successfully`,
      });

      setMessage('');
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error sending SMS:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send SMS',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send SMS to {clientName}</DialogTitle>
          <DialogDescription>
            {clientPhone ? (
              <>Send a text message to {clientPhone}</>
            ) : (
              <>Phone number not available for this client</>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              disabled={!clientPhone || isSending}
            />
            <p className="text-xs text-muted-foreground">
              {message.length} characters
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={!clientPhone || isSending}>
            {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send SMS
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
