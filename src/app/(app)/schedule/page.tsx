import { AvailabilityCalendar } from '@/components/availability-calendar';

export default function SchedulePage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">My Schedule</h2>
      </div>
      <p className="text-muted-foreground">
        Use the calendar below to define your available appointment blocks.
        Clients will be able to book 15-minute slots within these times.
      </p>
      <div className="mt-8">
        <AvailabilityCalendar />
      </div>
    </div>
  );
}
