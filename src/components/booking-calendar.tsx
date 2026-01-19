'use client';

import * as React from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUser } from '@/firebase';

type BookingMode = 'regular' | 'urgent';

interface AvailableSlot {
  start: string;
  end: string;
  time: string;
}

interface BookingCalendarProps {
  clientId?: string;
  clientEmail?: string;
}

export function BookingCalendar({ clientId, clientEmail }: BookingCalendarProps = {}) {
  const { user } = useUser();
  const [mode, setMode] = React.useState<BookingMode>('regular');
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = React.useState<AvailableSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = React.useState(false);
  const [isBooking, setIsBooking] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isConfirmed, setIsConfirmed] = React.useState(false);
  const [doctorName, setDoctorName] = React.useState<string | null>(null);
  
  // Form fields for urgent booking - pre-fill with user info if available
  const [urgentName, setUrgentName] = React.useState('');
  const [urgentEmail, setUrgentEmail] = React.useState('');
  const [urgentPhone, setUrgentPhone] = React.useState('');
  const [urgentReason, setUrgentReason] = React.useState('');
  const [urgentErrors, setUrgentErrors] = React.useState<Record<string, string>>({});
  
  // Form fields for regular booking - pre-fill with user info if available
  const [regularName, setRegularName] = React.useState('');
  const [regularEmail, setRegularEmail] = React.useState('');
  
  // Pre-fill form fields when user is available
  React.useEffect(() => {
    if (user) {
      if (!urgentName && user.displayName) {
        setUrgentName(user.displayName);
      }
      if (!urgentEmail && user.email) {
        setUrgentEmail(user.email);
      }
      if (!regularName && user.displayName) {
        setRegularName(user.displayName);
      }
      if (!regularEmail && user.email) {
        setRegularEmail(user.email);
      }
    }
  }, [user, urgentName, urgentEmail, regularName, regularEmail]);
  
  const { toast } = useToast();

  // Fetch availability when date changes (regular mode only)
  React.useEffect(() => {
    if (mode === 'regular' && date && (clientId || clientEmail || user?.uid || user?.email)) {
      fetchAvailability();
    } else {
      setAvailableSlots([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, mode, clientId, clientEmail, user?.uid, user?.email]);

  const fetchAvailability = async () => {
    if (!date) return;
    
    // Don't fetch if we don't have client identification
    const finalClientId = clientId || user?.uid;
    const finalClientEmail = clientEmail || user?.email || '';
    
    if (!finalClientId && !finalClientEmail) {
      // Wait for user to be available
      return;
    }
    
    setIsLoadingSlots(true);
    try {
      const dateStr = date.toISOString().split('T')[0];
      
      // Build query params
      const params = new URLSearchParams({ date: dateStr });
      if (finalClientId) {
        params.append('clientId', finalClientId);
      }
      if (finalClientEmail) {
        params.append('clientEmail', finalClientEmail);
      }
      
      const response = await fetch(`/api/bookings/availability?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to fetch availability (${response.status})`);
      }
      
      const data = await response.json();
      setAvailableSlots(data.availableSlots || []);
      setDoctorName(data.doctorEmail || null);
    } catch (error: any) {
      console.error('Error fetching availability:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load available slots',
        variant: 'destructive',
      });
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setIsBooking(true);
  };

  const validateUrgentForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!urgentName.trim()) {
      errors.name = 'Name is required';
    }
    if (!urgentEmail.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(urgentEmail)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!urgentPhone.trim()) {
      errors.phone = 'Phone number is required';
    }
    if (!urgentReason.trim()) {
      errors.reason = 'Reason for urgent appointment is required';
    }
    
    setUrgentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUrgentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateUrgentForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Use provided clientId/clientEmail or fall back to logged-in user
      const finalClientId = clientId || user?.uid;
      const finalClientEmail = clientEmail || user?.email || '';
      
      const response = await fetch('/api/bookings/request-urgent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: finalClientId,
          clientName: urgentName,
          clientEmail: urgentEmail || finalClientEmail,
          clientPhone: urgentPhone,
          reason: urgentReason,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit urgent request');
      }

      setIsBooking(false);
      setIsConfirmed(true);
      toast({
        title: 'Request Submitted!',
        description: 'The on-call doctor will contact you to schedule your appointment.',
      });

      // Reset form
      setUrgentName('');
      setUrgentEmail('');
      setUrgentPhone('');
      setUrgentReason('');
      setUrgentErrors({});

      setTimeout(() => {
        setIsConfirmed(false);
      }, 3000);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit urgent request',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegularSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !selectedTime || !regularName || !regularEmail) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Find the selected slot
    const slot = availableSlots.find(s => s.time === selectedTime);
    if (!slot) {
      toast({
        title: 'Error',
        description: 'Selected time slot is no longer available',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Get doctor ID from availability response (we need to store it)
      const dateStr = date.toISOString().split('T')[0];
      
      // Use provided clientId/clientEmail or fall back to logged-in user
      const finalClientId = clientId || user?.uid;
      const finalClientEmail = clientEmail || user?.email || '';
      
      // Build query params for availability
      const params = new URLSearchParams({ date: dateStr });
      if (finalClientId) {
        params.append('clientId', finalClientId);
      }
      if (finalClientEmail) {
        params.append('clientEmail', finalClientEmail);
      }
      
      const availabilityResponse = await fetch(`/api/bookings/availability?${params.toString()}`);
      const availabilityData = await availabilityResponse.json();

      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: finalClientId,
          clientEmail: regularEmail || finalClientEmail,
          staffId: availabilityData.doctorId,
          startTime: slot.start,
          endTime: slot.end,
          reason: `Regular appointment requested by ${regularName}`,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create appointment');
      }

      setIsBooking(false);
      setIsConfirmed(true);
      toast({
        title: 'Appointment Confirmed!',
        description: `Your meeting is set for ${date?.toLocaleDateString()} at ${selectedTime}.`,
      });

      // Reset form
      setRegularName('');
      setRegularEmail('');
      setSelectedTime(null);

      setTimeout(() => {
        setIsConfirmed(false);
      }, 3000);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create appointment',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Booking Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Book an Appointment</CardTitle>
          <CardDescription>
            Choose between a regular appointment with your doctor or an urgent appointment request.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={mode} onValueChange={(value) => setMode(value as BookingMode)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="regular" id="regular" />
              <Label htmlFor="regular" className="cursor-pointer">
                Regular Appointment (with your assigned doctor)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="urgent" id="urgent" />
              <Label htmlFor="urgent" className="cursor-pointer">
                Urgent Appointment Request (on-call doctor will contact you)
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {mode === 'regular' ? (
        // Regular Booking Mode
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card className="rounded-lg shadow-lg">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                className="p-0"
                classNames={{
                  months: 'flex flex-col sm:flex-row',
                  month: 'space-y-4 p-4',
                  caption: 'flex justify-between pt-1 relative items-center px-4',
                  caption_label: 'text-lg font-medium',
                  nav_button_previous: 'absolute left-0',
                  nav_button_next: 'absolute right-0',
                  table: 'w-full border-collapse space-y-1',
                  head_row: 'flex',
                  head_cell:
                    'text-muted-foreground rounded-md w-full font-normal text-[0.8rem]',
                  row: 'flex w-full mt-2',
                  cell: 'h-12 w-12 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                  day: 'h-12 w-12 p-0 font-normal aria-selected:opacity-100 rounded-md',
                  day_selected:
                    'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                }}
                components={{
                  IconLeft: () => <ChevronLeft className="h-4 w-4" />,
                  IconRight: () => <ChevronRight className="h-4 w-4" />,
                }}
              />
            </Card>
          </div>

          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Available Slots
                </CardTitle>
                <CardDescription>
                  {doctorName ? `With ${doctorName.split('@')[0]}` : 'Select a date'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSlots ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 max-h-[420px] overflow-y-auto pr-2">
                    {availableSlots.map((slot) => (
                      <Button
                        key={slot.time}
                        variant={selectedTime === slot.time ? 'default' : 'outline'}
                        onClick={() => handleTimeSelect(slot.time)}
                        className="w-full"
                      >
                        {slot.time}
                      </Button>
                    ))}
                  </div>
                ) : date ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No available slots for this date.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Please select a date.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <Dialog open={isBooking} onOpenChange={setIsBooking}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Your Appointment</DialogTitle>
                <DialogDescription>
                  You are booking a 15-minute slot for {date?.toLocaleDateString()} at{' '}
                  {selectedTime}.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleRegularSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="regular-name">Full Name</Label>
                  <Input
                    id="regular-name"
                    value={regularName}
                    onChange={(e) => setRegularName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="regular-email">Email Address</Label>
                  <Input
                    id="regular-email"
                    type="email"
                    value={regularEmail}
                    onChange={(e) => setRegularEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        // Urgent Booking Mode
        <Card>
          <CardHeader>
            <CardTitle>Request Urgent Appointment</CardTitle>
            <CardDescription>
              Fill out the form below. The on-call doctor will contact you to schedule your appointment within the next 3 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUrgentSubmit} className="space-y-4">
              <div>
                <Label htmlFor="urgent-name">Full Name *</Label>
                <Input
                  id="urgent-name"
                  value={urgentName}
                  onChange={(e) => setUrgentName(e.target.value)}
                  required
                />
                {urgentErrors.name && (
                  <p className="text-sm text-destructive mt-1">{urgentErrors.name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="urgent-email">Email Address *</Label>
                <Input
                  id="urgent-email"
                  type="email"
                  value={urgentEmail}
                  onChange={(e) => setUrgentEmail(e.target.value)}
                  required
                />
                {urgentErrors.email && (
                  <p className="text-sm text-destructive mt-1">{urgentErrors.email}</p>
                )}
              </div>
              <div>
                <Label htmlFor="urgent-phone">Phone Number *</Label>
                <Input
                  id="urgent-phone"
                  type="tel"
                  value={urgentPhone}
                  onChange={(e) => setUrgentPhone(e.target.value)}
                  required
                />
                {urgentErrors.phone && (
                  <p className="text-sm text-destructive mt-1">{urgentErrors.phone}</p>
                )}
              </div>
              <div>
                <Label htmlFor="urgent-reason">Reason for Urgent Appointment *</Label>
                <textarea
                  id="urgent-reason"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={urgentReason}
                  onChange={(e) => setUrgentReason(e.target.value)}
                  required
                  placeholder="Please describe why this appointment is urgent..."
                />
                {urgentErrors.reason && (
                  <p className="text-sm text-destructive mt-1">{urgentErrors.reason}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Urgent Request'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Dialog open={isConfirmed} onOpenChange={setIsConfirmed}>
        <DialogContent className="sm:max-w-md items-center justify-center text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {mode === 'urgent' ? 'Request Submitted!' : 'Booking Confirmed!'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'urgent'
                ? 'The on-call doctor will contact you to schedule your appointment.'
                : 'A confirmation has been sent to your email.'}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
