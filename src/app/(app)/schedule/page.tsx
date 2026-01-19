'use client';

import { AvailabilityCalendar } from '@/components/availability-calendar';
import { useUser } from '@/firebase';

export default function SchedulePage() {
  const { user } = useUser();

  if (!user) {
    return null;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Schedule</h2>
          <p className="text-muted-foreground">
            Define your available appointment blocks. Connect your Google or Microsoft calendar in Settings to see conflicts.
          </p>
        </div>
      </div>
      <div className="mt-8">
        <AvailabilityCalendar staffEmail={user.email || ''} staffId={user.uid} />
      </div>
    </div>
  );
}
