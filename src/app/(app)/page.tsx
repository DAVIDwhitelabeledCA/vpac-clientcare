'use client';

import {
  Activity,
  ArrowUpRight,
  CalendarClock,
  Clock,
  MessageSquare,
  User,
  Video,
  Phone,
  Mail,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { useEffect, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useToast } from '@/hooks/use-toast';
import { upcomingClientsData } from '@/lib/mock-data';
import { useUser } from '@/firebase';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { CreateAppointmentDialog } from '@/components/create-appointment-dialog';

interface PendingUrgentRequest {
  id: string;
  clientId: string | null;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string;
  reason: string;
  requestedAt: string;
}

export default function Dashboard() {
  const { user } = useUser();
  const { toast } = useToast();
  const [chartData, setChartData] = useState<
    { day: string; appointments: number }[]
  >([]);
  const [pendingUrgent, setPendingUrgent] = useState<PendingUrgentRequest[]>([]);
  const [isLoadingUrgent, setIsLoadingUrgent] = useState(false);
  const [assigningAppointmentId, setAssigningAppointmentId] = useState<string | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [assignDate, setAssignDate] = useState<Date | undefined>(new Date());
  const [assignTime, setAssignTime] = useState('');
  const [isSubmittingAssignment, setIsSubmittingAssignment] = useState(false);

  useEffect(() => {
    setChartData([
      { day: 'Mon', appointments: Math.floor(Math.random() * 10) },
      { day: 'Tue', appointments: Math.floor(Math.random() * 10) },
      { day: 'Wed', appointments: Math.floor(Math.random() * 10) },
      { day: 'Thu', appointments: Math.floor(Math.random() * 10) },
      { day: 'Fri', appointments: Math.floor(Math.random() * 10) },
    ]);
  }, []);

  // Fetch pending urgent requests
  useEffect(() => {
    if (user) {
      fetchPendingUrgent();
      // Refresh every 30 seconds
      const interval = setInterval(fetchPendingUrgent, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Create Microsoft Teams meetings for next 3 days when admin logs in
  useEffect(() => {
    const createBatchMeetings = async () => {
      if (!user) return;

      try {
        const idToken = await user.getIdToken();
        const response = await fetch('/api/appointments/create-microsoft-meetings', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.summary?.created > 0) {
            const microsoftCount = data.summary.microsoft || 0;
            const googleCount = data.summary.google || 0;
            let description = `Created ${data.summary.created} meeting${data.summary.created !== 1 ? 's' : ''} for the next 3 days`;
            if (microsoftCount > 0 && googleCount > 0) {
              description += ` (${microsoftCount} Teams, ${googleCount} Google Meet)`;
            } else if (microsoftCount > 0) {
              description += ` (${microsoftCount} Teams)`;
            } else if (googleCount > 0) {
              description += ` (${googleCount} Google Meet)`;
            }
            toast({
              title: 'Meetings Created',
              description,
            });
          }
        }
      } catch (error) {
        // Silently fail - don't interrupt user experience
        console.error('Failed to create batch meetings:', error);
      }
    };

    // Run once when admin logs in (with a small delay to ensure user is loaded)
    // The API endpoint will check if user is admin/staff
    if (user) {
      const timer = setTimeout(createBatchMeetings, 2000);
      return () => clearTimeout(timer);
    }
  }, [user, toast]);

  const fetchPendingUrgent = async () => {
    if (!user) return;
    
    setIsLoadingUrgent(true);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/bookings/pending-urgent', {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || 'Failed to fetch pending urgent requests';
        const errorDetails = errorData.details || errorData.hint || '';
        
        // Show user-friendly error message
        if (response.status === 503) {
          console.error('Server configuration error:', errorMessage, errorDetails);
          toast({
            variant: 'destructive',
            title: 'Server Configuration Error',
            description: 'Firebase Admin SDK is not properly configured. This feature requires server-side setup.',
          });
        } else {
          throw new Error(errorMessage);
        }
        return;
      }

      const data = await response.json();
      setPendingUrgent(data.pendingRequests || []);
    } catch (error) {
      console.error('Error fetching pending urgent requests:', error);
    } finally {
      setIsLoadingUrgent(false);
    }
  };

  const handleAssignTimeSlot = (appointmentId: string) => {
    setAssigningAppointmentId(appointmentId);
    setAssignDate(new Date());
    setAssignTime('');
    setIsAssignDialogOpen(true);
  };

  const handleSubmitAssignment = async () => {
    if (!assigningAppointmentId || !assignDate || !assignTime || !user) {
      toast({
        title: 'Error',
        description: 'Please select both date and time',
        variant: 'destructive',
      });
      return;
    }

    // Parse time (HH:MM format)
    const [hours, minutes] = assignTime.split(':').map(Number);
    const startTime = new Date(assignDate);
    startTime.setHours(hours, minutes, 0, 0);
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + 15); // 15-minute appointment

    setIsSubmittingAssignment(true);
    try {
      const idToken = await user.getIdToken();
      
      // Get current user's staff ID (assuming they're assigning to themselves)
      const response = await fetch('/api/bookings/assign-urgent', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId: assigningAppointmentId,
          staffId: user.uid, // Assign to current user (on-call doctor)
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to assign appointment');
      }

      toast({
        title: 'Appointment Assigned',
        description: 'The client has been notified of their appointment time.',
      });

      setIsAssignDialogOpen(false);
      setAssigningAppointmentId(null);
      fetchPendingUrgent(); // Refresh the list
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign appointment',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingAssignment(false);
    }
  };

  // Generate time slots (8 AM to 5 PM, 15-minute increments)
  const timeSlots = Array.from({ length: 36 }, (_, i) => {
    const hour = 8 + Math.floor(i / 4);
    const minute = (i % 4) * 15;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  });

  const handleTextClient = (clientName: string) => {
    toast({
      title: 'SMS Feature (Quo Integration)',
      description: `This would open a modal to send an SMS to ${clientName}.`,
    });
  };

  const handleJoinCall = (clientName: string) => {
    toast({
      title: 'Initiating Meeting',
      description: `This would open the virtual meeting link for ${clientName}.`,
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today&apos;s Appointments
              </CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {upcomingClientsData.length}
              </div>
              <p className="text-xs text-muted-foreground">
                +2 from yesterday
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Next Available Slot
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2:15 PM</div>
              <p className="text-xs text-muted-foreground">Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Weekly Activity
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+53%</div>
              <p className="text-xs text-muted-foreground">
                than last week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Go to Schedule
              </CardTitle>
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button size="sm" asChild>
                <Link href="/schedule">Set Availability</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Urgent Appointment Requested Section */}
        {pendingUrgent.length > 0 && (
          <Card className="border-orange-200 dark:border-orange-900">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <CardTitle>Urgent Appointment Requested</CardTitle>
              </div>
              <CardDescription>
                Pending urgent appointment requests requiring time slot assignment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingUrgent.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {request.clientName}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {request.clientPhone && (
                            <a
                              href={`tel:${request.clientPhone}`}
                              className="flex items-center gap-1 text-sm text-primary hover:underline"
                            >
                              <Phone className="h-3 w-3" />
                              {request.clientPhone}
                            </a>
                          )}
                          {request.clientEmail && (
                            <a
                              href={`mailto:${request.clientEmail}`}
                              className="flex items-center gap-1 text-sm text-primary hover:underline"
                            >
                              <Mail className="h-3 w-3" />
                              {request.clientEmail}
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={request.reason}>
                          {request.reason}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(request.requestedAt).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => handleAssignTimeSlot(request.id)}
                        >
                          Assign Time Slot
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>
                  Here are the appointments scheduled for today.
                </CardDescription>
              </div>
              <div className="ml-auto flex gap-2">
                <CreateAppointmentDialog onSuccess={() => {
                  // Refresh appointments if needed
                  fetchPendingUrgent();
                }} />
                <Button asChild size="sm" className="gap-1">
                <Link href="/clients">
                  View All
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingClientsData.length > 0 ? (
                    upcomingClientsData.map((appt) => {
                      const avatar = PlaceHolderImages.find(
                        (img) => img.id === appt.avatarId
                      );
                      return (
                        <TableRow key={appt.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarImage
                                  src={avatar?.imageUrl}
                                  alt="Avatar"
                                  data-ai-hint={avatar?.imageHint}
                                />
                                <AvatarFallback>
                                  {appt.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="font-medium">{appt.name}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{appt.time}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="outline">
                                  Actions
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleJoinCall(appt.name)}
                                >
                                  <Video className="mr-2 h-4 w-4" />
                                  <span>Join Call</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleTextClient(appt.name)}
                                >
                                  <MessageSquare className="mr-2 h-4 w-4" />
                                  <span>SMS Client</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/clients/${appt.clientId}`}>
                                    <User className="mr-2 h-4 w-4" />
                                    <span>View Profile</span>
                                  </Link>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        No upcoming appointments today.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Appointments This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <XAxis
                    dataKey="day"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Bar
                    dataKey="appointments"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Assign Time Slot Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Time Slot</DialogTitle>
            <DialogDescription>
              Select a date and time for this urgent appointment (next 3 days).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    {assignDate ? format(assignDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={assignDate}
                    onSelect={setAssignDate}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const maxDate = new Date();
                      maxDate.setDate(maxDate.getDate() + 3);
                      return date < today || date > maxDate;
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto">
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    variant={assignTime === time ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAssignTime(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
            <Button
              onClick={handleSubmitAssignment}
              className="w-full"
              disabled={!assignDate || !assignTime || isSubmittingAssignment}
            >
              {isSubmittingAssignment ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                'Assign Appointment'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
