'use client';

import { useMemo, useState } from 'react';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Users, CheckCircle2, XCircle, Loader } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function TreatmentCenterDashboard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [updatingClients, setUpdatingClients] = useState<Set<string>>(new Set());

  // Get treatment provider email from user document
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  // Query clients for this treatment center
  // We'll identify treatment centers by matching their email with treatmentEmail field
  const clientsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.email) return null;
    
    // Query clients where treatmentEmail matches the logged-in user's email
    return query(
      collection(firestore, 'users'),
      where('role', '==', 'client'),
      where('treatmentClient', '==', 'Yes'),
      where('treatmentEmail', '==', user.email)
    );
  }, [firestore, user?.email]);

  const { data: clients, isLoading } = useCollection(clientsQuery);

  const handleToggleClientStatus = async (clientId: string, currentStatus: boolean) => {
    if (!firestore) return;

    setUpdatingClients((prev) => new Set(prev).add(clientId));

    try {
      const clientDocRef = doc(firestore, 'users', clientId);
      await updateDoc(clientDocRef, {
        treatmentClientActive: !currentStatus,
      });

      toast({
        title: 'Client Status Updated',
        description: `Client status has been ${!currentStatus ? 'activated' : 'deactivated'}.`,
      });
    } catch (error) {
      console.error('Error updating client status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update client status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingClients((prev) => {
        const next = new Set(prev);
        next.delete(clientId);
        return next;
      });
    }
  };

  const activeClientsCount = useMemo(() => {
    return clients?.filter((c: any) => c.treatmentClientActive !== false).length || 0;
  }, [clients]);

  const totalClientsCount = clients?.length || 0;

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <h2 className="text-2xl font-bold">Loading...</h2>
        <p className="text-muted-foreground">Loading your clients...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Treatment Center Dashboard</h2>
        <p className="text-muted-foreground">
          Manage and confirm client status. No medical information is displayed.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClientsCount}</div>
            <p className="text-xs text-muted-foreground">
              Clients assigned to your center
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeClientsCount}</div>
            <p className="text-xs text-muted-foreground">
              Currently active clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Clients</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClientsCount - activeClientsCount}</div>
            <p className="text-xs text-muted-foreground">
              Clients no longer active
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client Status Management</CardTitle>
          <CardDescription>
            Confirm which clients are still active at your treatment center. 
            Only basic information is shown - no medical details are displayed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!clients || clients.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No clients found for your treatment center.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Contact Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client: any) => {
                  const isActive = client.treatmentClientActive !== false;
                  const isUpdating = updatingClients.has(client.id);
                  
                  return (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">
                        {client.firstName} {client.lastName}
                      </TableCell>
                      <TableCell>{client.phone || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={isActive ? 'default' : 'secondary'}>
                          {isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Label htmlFor={`status-${client.id}`} className="text-sm">
                            {isActive ? 'Active' : 'Inactive'}
                          </Label>
                          {isUpdating ? (
                            <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
                          ) : (
                            <Switch
                              id={`status-${client.id}`}
                              checked={isActive}
                              onCheckedChange={() => handleToggleClientStatus(client.id, isActive)}
                              disabled={isUpdating}
                            />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
