import { BookingCalendar } from '@/components/booking-calendar';
import { Logo } from '@/components/icons';

export default function BookAppointmentPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="mb-8 flex flex-col items-center text-center">
        <Logo />
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-4xl">
          Clarity Call
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Schedule your meeting with our team.
        </p>
      </header>
      <main>
        <BookingCalendar />
      </main>
    </div>
  );
}
