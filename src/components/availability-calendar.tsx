'use client';
import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const timeSlots = Array.from({ length: 24 * 2 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  return `${String(hour).padStart(2, '0')}:${minute}`;
});

interface AvailabilityCalendarProps {
  staffEmail: string;
}

export function AvailabilityCalendar({ staffEmail }: AvailabilityCalendarProps) {
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [dragMode, setDragMode] = useState<'select' | 'deselect' | null>(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const weekDates = useMemo(() => {
    const startOfWeek = new Date(currentWeek);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      return date;
    });
  }, [currentWeek]);

  useEffect(() => {
    // Simulate fetching appointments for the selected staff member and current week
    const newBookedSlots = new Set<string>();

    // This is a simulation. In a real app, you would fetch this from your database.
    if (staffEmail === 'kai@whitelabeled.ca') {
      const wednesday = weekDates[3]; // Wednesday
      if (wednesday) {
        const wednesdayDateString = wednesday.toISOString().split('T')[0];
        newBookedSlots.add(`${wednesdayDateString}-10:00`);
        newBookedSlots.add(`${wednesdayDateString}-10:30`);
      }
    }
    if (staffEmail === 'michele@email.com') {
      const friday = weekDates[5]; // Friday
      if (friday) {
        const fridayDateString = friday.toISOString().split('T')[0];
        newBookedSlots.add(`${fridayDateString}-14:00`);
      }
    }
    setBookedSlots(newBookedSlots);

    // We can also load saved availability here, for now we clear it
    setSelectedSlots(new Set());
  }, [staffEmail, currentWeek, weekDates]);

  const handleMouseDown = (slotId: string) => {
    if (bookedSlots.has(slotId)) return; // Can't select booked slots
    setIsSelecting(true);
    const mode = selectedSlots.has(slotId) ? 'deselect' : 'select';
    setDragMode(mode);

    setSelectedSlots((prev) => {
      const newSet = new Set(prev);
      if (mode === 'select') {
        newSet.add(slotId);
      } else {
        newSet.delete(slotId);
      }
      return newSet;
    });
  };

  const handleMouseEnter = (slotId: string) => {
    if (isSelecting && dragMode) {
      if (bookedSlots.has(slotId)) return; // Can't drag over booked slots
      setSelectedSlots((prev) => {
        const newSet = new Set(prev);
        if (dragMode === 'select') {
          newSet.add(slotId);
        } else {
          newSet.delete(slotId);
        }
        return newSet;
      });
    }
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
    setDragMode(null);
  };

  const changeWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + (direction === 'prev' ? -7 : 7));
      return newDate;
    });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <Card onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Set Staff Availability</CardTitle>
            <CardDescription>
              Click and drag to define when a staff member is free.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => changeWeek('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium text-center w-48">
              {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => changeWeek('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="flex" style={{ minWidth: '1000px' }}>
          <div className="w-20 shrink-0">
            {timeSlots.slice(16, 36).map((time, index) => (
              <div
                key={time}
                className="h-6 flex items-center justify-center text-xs text-muted-foreground"
              >
                {index % 2 === 0 ? time : ''}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 grow">
            {weekDates.map((date, dayIndex) => (
              <div key={dayIndex} className="text-center border-l">
                <div className="py-2 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
                  <p className="font-semibold text-sm">
                    {daysOfWeek[date.getDay()]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {date.getDate()}
                  </p>
                </div>
                <div>
                  {timeSlots.slice(16, 36).map((time) => {
                    const slotId = `${date.toISOString().split('T')[0]}-${time}`;
                    const isSelected = selectedSlots.has(slotId);
                    const isBooked = bookedSlots.has(slotId);
                    return (
                      <div
                        key={slotId}
                        onMouseDown={() => handleMouseDown(slotId)}
                        onMouseEnter={() => handleMouseEnter(slotId)}
                        className={cn(
                          'h-6 border-b border-r transition-colors',
                          isBooked
                            ? 'bg-destructive/70 cursor-not-allowed'
                            : isSelected
                            ? 'bg-primary cursor-pointer'
                            : 'hover:bg-primary/20 cursor-pointer',
                          time.endsWith('00') ? 'border-b-gray-300' : ''
                        )}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-6 flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm bg-primary" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm bg-destructive/70" />
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm border bg-background" />
          <span>Unavailable</span>
        </div>
      </CardFooter>
    </Card>
  );
}
