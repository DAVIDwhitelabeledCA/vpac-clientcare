'use client';

import { BookingCalendar } from '@/components/booking-calendar';
import { useUser } from '@/firebase';
import { Logo } from '@/components/icons';

export default function ClientBookAppointmentPage() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Logo className="h-10 w-10 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Book an Appointment</h2>
        <p className="text-muted-foreground">
          Schedule a regular appointment with your doctor or request an urgent appointment.
        </p>
      </div>
      {user ? (
        <BookingCalendar clientId={user.uid} clientEmail={user.email || undefined} />
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Please log in to book an appointment.</p>
        </div>
      )}
    </div>
  );
}
