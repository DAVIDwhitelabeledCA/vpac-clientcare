'use client';

import {
  Activity,
  ArrowUpRight,
  CalendarClock,
  Clock,
  MessageSquare,
  User,
  Video,
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
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useToast } from '@/hooks/use-toast';
import { upcomingClientsData } from '@/lib/mock-data';

export default function Dashboard() {
  const { toast } = useToast();
  const [chartData, setChartData] = useState<
    { day: string; appointments: number }[]
  >([]);

  useEffect(() => {
    setChartData([
      { day: 'Mon', appointments: Math.floor(Math.random() * 10) },
      { day: 'Tue', appointments: Math.floor(Math.random() * 10) },
      { day: 'Wed', appointments: Math.floor(Math.random() * 10) },
      { day: 'Thu', appointments: Math.floor(Math.random() * 10) },
      { day: 'Fri', appointments: Math.floor(Math.random() * 10) },
    ]);
  }, []);

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
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>
                  Here are the appointments scheduled for today.
                </CardDescription>
              </div>
              <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="/clients">
                  View All
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
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
    </div>
  );
}
