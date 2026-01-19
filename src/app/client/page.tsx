'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import { Calendar, FileText, Stethoscope, User } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { appointmentsData, recordsData, carePlanData } from '@/lib/mock-data';

export default function ClientDashboard() {
  const { user } = useUser();
  const firestore = useFirestore();
  
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userDoc, isLoading } = useDoc(userDocRef);
  
  const client = useMemo(() => {
    if (!userDoc || !user) return null;
    // Only show if user is a client
    if (userDoc.role !== 'client') return null;
    
    // Build client object from Firestore data
    return {
      name: `${userDoc.firstName || ''} ${userDoc.lastName || ''}`.trim() || user.email || 'Client',
      email: userDoc.email || user.email || '',
      phone: userDoc.phone || '',
      streetAddress: userDoc.streetAddress || '',
      city: userDoc.city || '',
      province: userDoc.province || '',
      postal: userDoc.postal || '',
      nextMeeting: userDoc.nextMeeting || null,
      lastContact: userDoc.lastContact || null,
    };
  }, [userDoc, user]);

  const stats = useMemo(() => {
    if (!user?.email) return { appointments: 0, records: 0, carePlanTasks: 0 };
    
    const email = user.email.toLowerCase();
    return {
      appointments: appointmentsData.filter((a) => a.clientEmail?.toLowerCase() === email).length,
      records: recordsData.filter((r) => r.clientEmail?.toLowerCase() === email).length,
      carePlanTasks: carePlanData.filter((c) => c.clientEmail?.toLowerCase() === email).length,
    };
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <h2 className="text-2xl font-bold">Loading...</h2>
        <p className="text-muted-foreground">Loading your profile...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <h2 className="text-2xl font-bold">Welcome to Client Portal</h2>
        <p className="text-muted-foreground">
          {userDoc?.role !== 'client' 
            ? 'You do not have client access. Please contact support if you believe this is an error.'
            : 'Your profile is being set up. Please contact support if you need assistance.'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome back, {client.name}</h2>
        <p className="text-muted-foreground">
          Here's an overview of your medical information and records.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.appointments}</div>
            <p className="text-xs text-muted-foreground">
              Total appointments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medical Records</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.records}</div>
            <p className="text-xs text-muted-foreground">
              Available records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Care Plan Tasks</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.carePlanTasks}</div>
            <p className="text-xs text-muted-foreground">
              Active tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Complete</div>
            <p className="text-xs text-muted-foreground">
              Profile status
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and information access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/client/profile">
                <User className="mr-2 h-4 w-4" />
                Update Profile Information
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/client/appointments">
                <Calendar className="mr-2 h-4 w-4" />
                View Appointments
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/client/records">
                <Stethoscope className="mr-2 h-4 w-4" />
                View Medical Records
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>
              Your next scheduled visits
            </CardDescription>
          </CardHeader>
          <CardContent>
            {client.nextMeeting ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {new Date(client.nextMeeting).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(client.nextMeeting).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
                <p className="text-xs text-muted-foreground">
                  Last contact: {client.lastContact}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No upcoming appointments scheduled.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
