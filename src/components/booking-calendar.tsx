'use client';

import * as React from 'react';
import {
  Calendar as CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
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
import { Card } from '@/components/ui/card';

const timeSlots = [
  '09:00', '09:15', '09:30', '09:45',
  '10:00', '10:15', '10:30', '10:45',
  '11:00', '11:15', '11:30', '11:45',
  '13:00', '13:15', '13:30', '13:45',
  '14:00', '14:15', '14:30', '14:45',
  '15:00', '15:15', '15:30', '15:45',
];

export function BookingCalendar() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null);
  const [isBooking, setIsBooking] = React.useState(false);
  const [isConfirmed, setIsConfirmed] = React.useState(false);
  const { toast } = useToast();

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setIsBooking(true);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    // API call to book appointment would go here
    setIsBooking(false);
    setIsConfirmed(true);
    toast({
      title: 'Appointment Confirmed!',
      description: `Your meeting is set for ${date?.toLocaleDateString()} at ${selectedTime}.`,
    });
    setTimeout(() => {
        setIsConfirmed(false);
        setSelectedTime(null);
    }, 2000);
  };

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
      <div className="md:col-span-2">
        <Card className="rounded-lg shadow-lg">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
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
        <h3 className="mb-4 text-lg font-semibold">
          Available Slots for{' '}
          {date ? date.toLocaleDateString() : 'selected date'}
        </h3>
        <div className="grid grid-cols-2 gap-2 max-h-[420px] overflow-y-auto pr-2">
          {timeSlots.map((time) => (
            <Button
              key={time}
              variant="outline"
              onClick={() => handleTimeSelect(time)}
              className="w-full"
            >
              {time}
            </Button>
          ))}
        </div>
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
          <form onSubmit={handleConfirmBooking} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" required />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" required />
            </div>
            <Button type="submit" className="w-full">
              Confirm Booking
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={isConfirmed} onOpenChange={setIsConfirmed}>
        <DialogContent className="sm:max-w-md items-center justify-center text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-green-600" />
            </div>
            <DialogHeader>
                <DialogTitle className="text-2xl">Booking Confirmed!</DialogTitle>
                <DialogDescription>
                A confirmation has been sent to your email.
                </DialogDescription>
            </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
