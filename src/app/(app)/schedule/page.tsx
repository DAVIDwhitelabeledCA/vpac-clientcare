'use client';

import { useState } from 'react';
import { AvailabilityCalendar } from '@/components/availability-calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { staffData } from '@/lib/mock-data';
import { useUser } from '@/firebase';

export default function SchedulePage() {
  const { user } = useUser();
  // Default to logged-in user's email if they are in staffData, otherwise default to first staff member
  const defaultStaff =
    staffData.find((s) => s.email === user?.email)?.email || staffData[0].email;
  const [selectedStaffEmail, setSelectedStaffEmail] = useState<string>(defaultStaff);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Schedule</h2>
          <p className="text-muted-foreground">
            Use the calendar below to define available appointment blocks for staff.
          </p>
        </div>
        <div className="w-full max-w-sm space-y-2">
          <Label htmlFor="staff-select">Select Staff Member</Label>
          <Select
            value={selectedStaffEmail}
            onValueChange={setSelectedStaffEmail}
          >
            <SelectTrigger id="staff-select">
              <SelectValue placeholder="Select a staff member" />
            </SelectTrigger>
            <SelectContent>
              {staffData.map((staff) => (
                <SelectItem key={staff.email} value={staff.email}>
                  {staff.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-8">
        <AvailabilityCalendar staffEmail={selectedStaffEmail} />
      </div>
    </div>
  );
}
