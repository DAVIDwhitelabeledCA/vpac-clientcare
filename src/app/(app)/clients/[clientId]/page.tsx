'use client';

import { useMemo } from 'react';
import { ArrowLeft, User } from 'lucide-react';
import Link from 'next/link';

import { allClientsData } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import ClientProfile from '@/components/client/client-profile';
import ClientAppointments from '@/components/client/client-appointments';
import ClientCarePlan from '@/components/client/client-care-plan';
import ClientRecords from '@/components/client/client-records';
import ClientDocuments from '@/components/client/client-documents';

export default function ClientDetailPage({
  params,
}: {
  params: { clientId: string };
}) {
  const { clientId } = params;

  const client = useMemo(() => {
    return allClientsData.find((c) => c.clientId === clientId);
  }, [clientId]);

  if (!client) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 text-center">
        <h2 className="text-2xl font-bold">Client not found</h2>
        <p>The client with ID &quot;{clientId}&quot; could not be found.</p>
        <Button asChild>
          <Link href="/clients">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Clients
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/clients">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to All Clients</span>
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{client.name}</h2>
            <p className="text-muted-foreground">{client.email}</p>
          </div>
        </div>
      </div>
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="care-plan">Care Plan</TabsTrigger>
          <TabsTrigger value="records">Records</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <ClientProfile client={client} />
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <ClientAppointments clientEmail={client.email} />
        </TabsContent>

        <TabsContent value="care-plan" className="space-y-4">
          <ClientCarePlan clientEmail={client.email} />
        </TabsContent>

        <TabsContent value="records" className="space-y-4">
          <ClientRecords clientEmail={client.email} />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <ClientDocuments clientEmail={client.email} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
