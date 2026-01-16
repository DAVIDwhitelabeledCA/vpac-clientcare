'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, MessageSquare, Video, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { allClientsData, upcomingClientsData } from '@/lib/mock-data';

type Client = (typeof allClientsData)[0];

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const { toast } = useToast();

  const handleSearch = () => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    const results = allClientsData.filter((client) =>
      Object.values(client).some((value) =>
        String(value).toLowerCase().includes(lowercasedQuery)
      )
    );
    setSearchResults(results);
    if (results.length === 0) {
      toast({
        title: 'No results found',
        description: `Your search for "${searchQuery}" did not return any clients.`,
      });
    }
  };

  const handleTextClient = (client: Client) => {
    toast({
      title: 'SMS Feature (Quo Integration)',
      description: `This would open a modal to send an SMS to ${client.name}.`,
    });
  };

  const handleJoinCall = (client: Client) => {
    toast({
      title: 'Initiating Meeting',
      description: `This would open the virtual meeting link for ${client.name}.`,
    });
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Clients</h2>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Search All Clients</CardTitle>
            <CardDescription>
              Find any client in your records to view their detailed profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex w-full max-w-lg items-center space-x-2">
              <Input
                type="text"
                placeholder="Enter client name, email, phone, etc..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch}>
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {searchResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchResults.map((client) => {
                    const avatar = PlaceHolderImages.find(
                      (img) => img.id === client.avatarId
                    );
                    return (
                      <TableRow key={client.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={avatar?.imageUrl} />
                              <AvatarFallback>
                                {client.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{client.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell>{client.phone}</TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/clients/${client.clientId}`}>
                              View Profile{' '}
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Clients</CardTitle>
            <CardDescription>
              Clients with meetings scheduled for today.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingClientsData.length > 0 ? (
                  upcomingClientsData.map((client) => {
                    const avatar = PlaceHolderImages.find(
                      (img) => img.id === client.avatarId
                    );
                    return (
                      <TableRow key={client.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={avatar?.imageUrl} />
                              <AvatarFallback>
                                {client.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{client.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{client.time}</Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTextClient(client)}
                          >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            SMS
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleJoinCall(client)}
                          >
                            <Video className="mr-2 h-4 w-4" />
                            Join Call
                          </Button>
                          <Button asChild size="sm">
                            <Link href={`/clients/${client.clientId}`}>
                              View Profile
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      No upcoming meetings today.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
