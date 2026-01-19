'use client';

import { useMemo } from 'react';
import { useUser } from '@/firebase';
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
import { Calendar } from 'lucide-react';

export default function ClientAppointmentsPage() {
  const { user } = useUser();

  const clientAppointments = useMemo(() => {
    if (!user?.email) return [];
    
    const email = user.email.toLowerCase();
    return appointmentsData
      .filter((appt) => appt.clientEmail?.toLowerCase() === email)
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
      })
      .sort((a, b) => {
        // Sort by date, most recent first
        const dateA = new Date(`${a.date} ${a.time || ''}`).getTime();
        const dateB = new Date(`${b.date} ${b.time || ''}`).getTime();
        return dateB - dateA;
      });
  }, [user]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Appointments</h2>
        <p className="text-muted-foreground">
          View your appointment history and upcoming appointments.
        </p>
      </div>

      {clientAppointments.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Appointments Found</CardTitle>
            <CardDescription>
              You do not have any appointment history.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Calendar /> Appointment History
            </CardTitle>
            <CardDescription>
              A log of all past and upcoming appointments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientAppointments.map((appt) => (
                  <TableRow key={appt.id}>
                    <TableCell>{appt.date}</TableCell>
                    <TableCell>
                      {appt.time && typeof appt.time === 'string' && appt.time.length < 10
                        ? appt.time
                        : appt.time
                        ? new Date(appt.time).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })
                        : 'N/A'}
                    </TableCell>
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
                        {appt.status || 'Pending'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
