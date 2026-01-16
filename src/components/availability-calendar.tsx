'use client';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const timeSlots = Array.from({ length: 24 * 2 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  return `${String(hour).padStart(2, '0')}:${minute}`;
});

export function AvailabilityCalendar() {
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
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

  const handleMouseDown = (slotId: string) => {
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
    setCurrentWeek(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + (direction === 'prev' ? -7 : 7));
      return newDate;
    });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' }).format(date);
  }

  return (
    <Card onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Set Your Availability</CardTitle>
                    <CardDescription>Click and drag to define when you're free.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => changeWeek('prev')}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="font-medium text-center w-48">
                        {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
                    </span>
                    <Button variant="outline" size="icon" onClick={() => changeWeek('next')}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="flex" style={{minWidth: '1000px'}}>
          <div className="w-20 shrink-0">
            {timeSlots.slice(16, 36).map((time, index) => (
              <div key={time} className="h-6 flex items-center justify-center text-xs text-muted-foreground">
                {index % 2 === 0 ? time : ''}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 grow">
            {weekDates.map((date, dayIndex) => (
              <div key={dayIndex} className="text-center border-l">
                <div className="py-2 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
                  <p className="font-semibold text-sm">{daysOfWeek[date.getDay()]}</p>
                  <p className="text-xs text-muted-foreground">{date.getDate()}</p>
                </div>
                <div>
                  {timeSlots.slice(16, 36).map((time) => {
                    const slotId = `${date.toISOString().split('T')[0]}-${time}`;
                    const isSelected = selectedSlots.has(slotId);
                    return (
                      <div
                        key={slotId}
                        onMouseDown={() => handleMouseDown(slotId)}
                        onMouseEnter={() => handleMouseEnter(slotId)}
                        className={cn(
                          'h-6 border-b border-r cursor-pointer transition-colors',
                          isSelected ? 'bg-primary' : 'hover:bg-primary/20',
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
    </Card>
  );
}
