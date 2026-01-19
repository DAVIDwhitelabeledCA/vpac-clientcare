'use client';

import { useMemo, useState } from 'react';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, updateDoc } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Users, Search, Loader } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function TreatmentCenterClientsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingClients, setUpdatingClients] = useState<Set<string>>(new Set());

  // Query clients for this treatment center
  const clientsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.email) return null;
    
    return query(
      collection(firestore, 'users'),
      where('role', '==', 'client'),
      where('treatmentClient', '==', 'Yes'),
      where('treatmentEmail', '==', user.email)
    );
  }, [firestore, user?.email]);

  const { data: clients, isLoading } = useCollection(clientsQuery);

  const filteredClients = useMemo(() => {
    if (!clients || !searchQuery) return clients;
    
    const query = searchQuery.toLowerCase();
    return clients.filter((client: any) => {
      const fullName = `${client.firstName || ''} ${client.lastName || ''}`.toLowerCase();
      const phone = (client.phone || '').toLowerCase();
      return fullName.includes(query) || phone.includes(query);
    });
  }, [clients, searchQuery]);

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
        description: `Client has been marked as ${!currentStatus ? 'active' : 'inactive'}.`,
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
        <h2 className="text-3xl font-bold tracking-tight">My Clients</h2>
        <p className="text-muted-foreground">
          Search and manage client status. Medical information is not displayed.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client List</CardTitle>
          <CardDescription>
            Confirm which clients are still active. Only basic contact information is shown.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {!filteredClients || filteredClients.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery
                  ? 'No clients found matching your search.'
                  : 'No clients found for your treatment center.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client: any) => {
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
                          {isUpdating ? (
                            <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
                          ) : (
                            <Switch
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
