'use client';

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  appointmentsData,
  appointmentDetailsData,
  staffData,
} from '@/lib/mock-data';
import { Calendar, Info } from 'lucide-react';

interface ClientAppointmentsProps {
  clientEmail: string;
}

export default function ClientAppointments({
  clientEmail,
}: ClientAppointmentsProps) {
  const clientAppointments = useMemo(() => {
    return appointmentsData
      .filter((appt) => appt.clientEmail === clientEmail)
      .map((appt) => {
        const details = appointmentDetailsData.find(
          (d) => d.appointmentId === appt.id
        );
        const staff = staffData.find((s) => s.email === appt.staffEmail);
        return {
          ...appt,
          reason: details?.reason || 'N/A',
          staffName: staff?.name || 'Unknown',
        };
      });
  }, [clientEmail]);

  if (clientAppointments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Appointments Found</CardTitle>
          <CardDescription>
            This client does not have any appointment history.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Calendar /> Appointment History
        </CardTitle>
        <CardDescription>
          A log of all past and upcoming appointments for this client.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientAppointments.map((appt) => (
              <TableRow key={appt.id}>
                <TableCell>{appt.date}</TableCell>
                <TableCell>{appt.staffName}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {appt.reason}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      appt.status === 'Confirmed'
                        ? 'default'
                        : appt.status === 'Cancelled'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {appt.status || 'N/A'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
