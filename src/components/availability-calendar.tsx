'use client';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Save, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import {
  useFirestore,
  useUser,
  useCollection,
  useMemoFirebase,
  setDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from '@/firebase';
import { collection, query, where, Timestamp, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  getGoogleCalendarAvailability,
  getMicrosoftCalendarAvailability,
} from '@/lib/calendar-api';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const timeSlots = Array.from({ length: 24 * 2 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  return `${String(hour).padStart(2, '0')}:${minute}`;
});

interface AvailabilityCalendarProps {
  staffEmail: string;
  staffId?: string; // Firebase user ID of the staff member
}

interface AvailabilityBlock {
  id: string;
  staffId: string;
  startTime: string;
  endTime: string;
}

interface CalendarBusySlot {
  start: string;
  end: string;
  summary?: string;
}

export function AvailabilityCalendar({ staffEmail, staffId }: AvailabilityCalendarProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
  const [externalCalendarConflicts, setExternalCalendarConflicts] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [dragMode, setDragMode] = useState<'select' | 'deselect' | null>(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingExternal, setIsLoadingExternal] = useState(false);

  // Use the logged-in user's ID if staffId is not provided
  const targetStaffId = staffId || user?.uid || '';

  const weekDates = useMemo(() => {
    const startOfWeek = new Date(currentWeek);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      return date;
    });
  }, [currentWeek]);

  // Calculate week start and end times for queries
  const weekStart = useMemo(() => {
    return weekDates[0];
  }, [weekDates]);

  const weekEnd = useMemo(() => {
    const end = new Date(weekDates[6]);
    end.setHours(23, 59, 59, 999);
    return end;
  }, [weekDates]);

  // Load availability blocks from Firestore
  const availabilityQuery = useMemoFirebase(() => {
    if (!firestore || !targetStaffId) return null;
    return query(
      collection(firestore, 'users', targetStaffId, 'availability_blocks'),
      where('startTime', '>=', Timestamp.fromDate(weekStart)),
      where('startTime', '<=', Timestamp.fromDate(weekEnd))
    );
  }, [firestore, targetStaffId, weekStart, weekEnd]);

  const { data: availabilityBlocks, isLoading: isLoadingAvailability } = useCollection<AvailabilityBlock>(
    availabilityQuery
  );

  // Load appointments for this staff member
  const appointmentsQuery = useMemoFirebase(() => {
    if (!firestore || !targetStaffId) return null;
    return query(
      collection(firestore, 'appointments'),
      where('staffId', '==', targetStaffId),
      where('startTime', '>=', Timestamp.fromDate(weekStart)),
      where('startTime', '<=', Timestamp.fromDate(weekEnd))
    );
  }, [firestore, targetStaffId, weekStart, weekEnd]);

  const { data: appointments } = useCollection<{
    startTime: Timestamp;
    endTime: Timestamp;
    status: string;
  }>(appointmentsQuery);

  // Load integrations to check for calendar connections
  const integrationsQuery = useMemoFirebase(() => {
    if (!firestore || !targetStaffId) return null;
    return collection(firestore, 'users', targetStaffId, 'integrations');
  }, [firestore, targetStaffId]);

  const { data: integrations } = useCollection<{
    service: string;
    googleEmail?: string;
    microsoftEmail?: string;
  }>(integrationsQuery);

  // Convert availability blocks to slot IDs
  useEffect(() => {
    if (!availabilityBlocks) return;

    const slots = new Set<string>();
    availabilityBlocks.forEach((block) => {
      const start = new Date(block.startTime);
      const end = new Date(block.endTime);

      // Generate slot IDs for each 30-minute interval in the block
      let current = new Date(start);
      while (current < end) {
        const dateStr = current.toISOString().split('T')[0];
        const timeStr = `${String(current.getHours()).padStart(2, '0')}:${String(current.getMinutes()).padStart(2, '0')}`;
        slots.add(`${dateStr}-${timeStr}`);
        current.setMinutes(current.getMinutes() + 30);
      }
    });

    setSelectedSlots(slots);
  }, [availabilityBlocks]);

  // Convert appointments to booked slot IDs
  useEffect(() => {
    if (!appointments) return;

    const slots = new Set<string>();
    appointments.forEach((appt) => {
      if (appt.status === 'cancelled') return;

      const start = appt.startTime.toDate();
      const end = appt.endTime.toDate();

      let current = new Date(start);
      while (current < end) {
        const dateStr = current.toISOString().split('T')[0];
        const timeStr = `${String(current.getHours()).padStart(2, '0')}:${String(current.getMinutes()).padStart(2, '0')}`;
        slots.add(`${dateStr}-${timeStr}`);
        current.setMinutes(current.getMinutes() + 30);
      }
    });

    setBookedSlots(slots);
  }, [appointments]);

  // Check external calendars for conflicts
  const checkExternalCalendars = useCallback(async () => {
    if (!user || !targetStaffId) return;

    const hasGoogle = integrations?.some((int) => int.service === 'google-meet');
    const hasMicrosoft = integrations?.some((int) => int.service === 'microsoft-teams');

    if (!hasGoogle && !hasMicrosoft) {
      setExternalCalendarConflicts(new Set());
      return;
    }

    setIsLoadingExternal(true);
    const conflicts = new Set<string>();

    try {
      const startTimeISO = weekStart.toISOString();
      const endTimeISO = weekEnd.toISOString();

      if (hasGoogle) {
        try {
          const googleData = await getGoogleCalendarAvailability(startTimeISO, endTimeISO);
          googleData.busySlots.forEach((slot) => {
            const start = new Date(slot.start);
            const end = new Date(slot.end);
            let current = new Date(start);
            while (current < end) {
              const dateStr = current.toISOString().split('T')[0];
              const timeStr = `${String(current.getHours()).padStart(2, '0')}:${String(current.getMinutes()).padStart(2, '0')}`;
              conflicts.add(`${dateStr}-${timeStr}`);
              current.setMinutes(current.getMinutes() + 30);
            }
          });
        } catch (error) {
          console.error('Error fetching Google Calendar:', error);
        }
      }

      if (hasMicrosoft) {
        try {
          const microsoftData = await getMicrosoftCalendarAvailability(startTimeISO, endTimeISO);
          microsoftData.busySlots.forEach((slot) => {
            const start = new Date(slot.start);
            const end = new Date(slot.end);
            let current = new Date(start);
            while (current < end) {
              const dateStr = current.toISOString().split('T')[0];
              const timeStr = `${String(current.getHours()).padStart(2, '0')}:${String(current.getMinutes()).padStart(2, '0')}`;
              conflicts.add(`${dateStr}-${timeStr}`);
              current.setMinutes(current.getMinutes() + 30);
            }
          });
        } catch (error) {
          console.error('Error fetching Microsoft Calendar:', error);
        }
      }
    } catch (error) {
      console.error('Error checking external calendars:', error);
    } finally {
      setIsLoadingExternal(false);
      setExternalCalendarConflicts(conflicts);
    }
  }, [user, targetStaffId, integrations, weekStart, weekEnd]);

  // Check external calendars when week or integrations change
  useEffect(() => {
    checkExternalCalendars();
  }, [checkExternalCalendars]);

  const handleMouseDown = (slotId: string) => {
    if (bookedSlots.has(slotId) || externalCalendarConflicts.has(slotId)) return;
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
      if (bookedSlots.has(slotId) || externalCalendarConflicts.has(slotId)) return;
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

  const handleSave = async () => {
    if (!firestore || !targetStaffId) {
      toast({
        title: 'Error',
        description: 'Unable to save: missing staff information.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      // Get existing blocks for this week to delete
      const existingBlocks = availabilityBlocks || [];

      // Group selected slots into continuous blocks
      const slotArray = Array.from(selectedSlots).sort();
      const blocks: Array<{ start: Date; end: Date }> = [];

      for (const slotId of slotArray) {
        const [dateStr, timeStr] = slotId.split('-');
        const [hours, minutes] = timeStr.split(':').map(Number);
        const slotTime = new Date(dateStr);
        slotTime.setHours(hours, minutes, 0, 0);

        if (blocks.length === 0) {
          blocks.push({ start: slotTime, end: new Date(slotTime.getTime() + 30 * 60 * 1000) });
        } else {
          const lastBlock = blocks[blocks.length - 1];
          const expectedNext = new Date(lastBlock.end);

          if (slotTime.getTime() === expectedNext.getTime()) {
            // Continue the current block
            lastBlock.end = new Date(slotTime.getTime() + 30 * 60 * 1000);
          } else {
            // Start a new block
            blocks.push({ start: slotTime, end: new Date(slotTime.getTime() + 30 * 60 * 1000) });
          }
        }
      }

      // Delete existing blocks for this week
      for (const block of existingBlocks) {
        const blockRef = doc(firestore, 'users', targetStaffId, 'availability_blocks', block.id);
        deleteDocumentNonBlocking(blockRef);
      }

      // Create new blocks
      const availabilityCollection = collection(firestore, 'users', targetStaffId, 'availability_blocks');
      for (const block of blocks) {
        setDocumentNonBlocking(
          doc(availabilityCollection),
          {
            staffId: targetStaffId,
            startTime: Timestamp.fromDate(block.start),
            endTime: Timestamp.fromDate(block.end),
          },
          {}
        );
      }

      toast({
        title: 'Success',
        description: 'Availability saved successfully.',
      });
    } catch (error: any) {
      console.error('Error saving availability:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save availability.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
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
              Click and drag to define when a staff member is free. Conflicts from connected calendars are shown in orange.
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
            <Button
              onClick={handleSave}
              disabled={isSaving || isLoadingAvailability}
              className="ml-4"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {isLoadingExternal && (
          <div className="mb-4 text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking external calendars...
          </div>
        )}
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
                    const hasConflict = externalCalendarConflicts.has(slotId);
                    return (
                      <div
                        key={slotId}
                        onMouseDown={() => handleMouseDown(slotId)}
                        onMouseEnter={() => handleMouseEnter(slotId)}
                        className={cn(
                          'h-6 border-b border-r transition-colors',
                          isBooked
                            ? 'bg-destructive/70 cursor-not-allowed'
                            : hasConflict
                            ? 'bg-orange-500/30 cursor-not-allowed'
                            : isSelected
                            ? 'bg-primary cursor-pointer'
                            : 'hover:bg-primary/20 cursor-pointer',
                          time.endsWith('00') ? 'border-b-gray-300' : ''
                        )}
                        title={
                          isBooked
                            ? 'Booked appointment'
                            : hasConflict
                            ? 'Conflict with external calendar'
                            : isSelected
                            ? 'Available'
                            : 'Unavailable'
                        }
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
          <div className="w-4 h-4 rounded-sm bg-orange-500/30" />
          <span>Calendar Conflict</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm border bg-background" />
          <span>Unavailable</span>
        </div>
      </CardFooter>
    </Card>
  );
}
